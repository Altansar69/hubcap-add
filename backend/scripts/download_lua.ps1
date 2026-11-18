param(
    [string]$AppId,
    [switch]$CheckLua,
    [switch]$DeleteLua,
    [switch]$UserStats,
    [switch]$DeleteManifest,
    [switch]$DlcOnly,
    [switch]$DeleteDlc
)

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Write-JsonAndExit {
    param([hashtable]$Payload, [int]$Code = 0)
    $Payload | ConvertTo-Json -Compress -Depth 6
    exit $Code
}

function Get-SteamRoot {
    if ($env:Steam -and (Test-Path -LiteralPath $env:Steam)) {
        return (Resolve-Path -LiteralPath $env:Steam).Path
    }

    foreach ($path in @("HKCU:\Software\Valve\Steam", "HKLM:\SOFTWARE\WOW6432Node\Valve\Steam", "HKLM:\SOFTWARE\Valve\Steam")) {
        try {
            $installPath = (Get-ItemProperty -LiteralPath $path -ErrorAction Stop).SteamPath
            if ($installPath -and (Test-Path -LiteralPath $installPath)) {
                return (Resolve-Path -LiteralPath $installPath).Path
            }
        } catch {}
    }

    $fallback = Join-Path ${env:ProgramFiles(x86)} "Steam"
    if ($fallback -and (Test-Path -LiteralPath $fallback)) {
        return (Resolve-Path -LiteralPath $fallback).Path
    }

    throw "Steam folder not found."
}

function Read-HubcapConfig {
    param([string]$ConfigPath)

    if (-not (Test-Path -LiteralPath $ConfigPath)) {
        throw "HubcapTool config.yaml not found at $ConfigPath"
    }

    $config = @{ HubcapApiKey = $null; HubcapLuaDir = $null }

    foreach ($line in Get-Content -LiteralPath $ConfigPath) {
        if ($line -match '^\s*(HubcapApiKey|HubcapLuaDir)\s*:\s*(.*?)\s*$') {
            $value = $Matches[2].Trim()
            if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
                $value = $value.Substring(1, $value.Length - 2)
            }
            $config[$Matches[1]] = $value
        }
    }

    if ([string]::IsNullOrWhiteSpace($config.HubcapApiKey)) { throw "HubcapApiKey is missing in $ConfigPath" }
    if ([string]::IsNullOrWhiteSpace($config.HubcapLuaDir)) { throw "HubcapLuaDir is missing in $ConfigPath" }

    return $config
}

function Get-ManifestFiles {
    param([string]$Directory)
    if (-not (Test-Path -LiteralPath $Directory)) { return @() }
    return @(Get-ChildItem -LiteralPath $Directory -Recurse -File -Filter "*.manifest")
}

function Remove-IfExists {
    param([string]$Path)
    if ($Path -and (Test-Path -LiteralPath $Path)) { Remove-Item -LiteralPath $Path -Recurse -Force }
}

function Remove-EmptyDirectory {
    param([string]$Path)
    if ($Path -and (Test-Path -LiteralPath $Path)) {
        $hasChildren = @(Get-ChildItem -LiteralPath $Path -Force -ErrorAction SilentlyContinue).Count -gt 0
        if (-not $hasChildren) { Remove-Item -LiteralPath $Path -Force }
    }
}

function Remove-ManifestsForDepots {
    param([string[]]$Depots, [string]$ManifestDir)

    $removed = @()
    foreach ($depot in $Depots) {
        Get-ChildItem -LiteralPath $ManifestDir -File -Filter "$depot`_*.manifest" -ErrorAction SilentlyContinue | ForEach-Object {
            Remove-Item -LiteralPath $_.FullName -Force
            $removed += $_.FullName
        }
    }
    return $removed
}

function Split-LuaSections {
    param([string]$Path, [string]$AppId)

    $base = New-Object System.Collections.Generic.List[string]
    $dlc = New-Object System.Collections.Generic.List[string]
    $depots = @()
    $inDlc = $false

    foreach ($line in Get-Content -LiteralPath $Path) {
        $isMarker = $false

        if ($line -match '^\s*--\s*(.+)$') {
            $isMarker = $true
            $marker = $Matches[1]
            if ($marker -match '(?i)\bDLC\b') { $inDlc = $true }
            elseif ($marker -match '^[A-Z]') { $inDlc = $false }
        }

        if (-not $isMarker -and $line -match '^\s*addappid\(\s*(\d+)\s*\)') {
            if ($Matches[1] -ne $AppId) { $inDlc = $true }
        }

        if ($inDlc) {
            $dlc.Add($line)
            if ($line -match 'setManifestid\(\s*(\d+)') { $depots += $Matches[1] }
        } else {
            $base.Add($line)
        }
    }

    return @{ Base = $base; Dlc = $dlc; Depots = $depots }
}

function Get-HttpErrorMessage {
    param([object]$ErrorRecord)

    $statusCode = $null
    $responseText = $null

    try {
        if ($ErrorRecord.Exception.Response) {
            $statusCode = [int]$ErrorRecord.Exception.Response.StatusCode
            $stream = $ErrorRecord.Exception.Response.GetResponseStream()
            if ($stream) {
                $reader = [System.IO.StreamReader]::new($stream)
                $responseText = $reader.ReadToEnd()
                $reader.Dispose()
            }
        }
    } catch {}

    switch ($statusCode) {
        401 { return "Invalid Hubcap API key or unauthorized access." }
        403 { return "Hubcap rejected this request." }
        404 { return "Hubcap does not have this file for this app yet." }
        429 { return "Hubcap rate limit or daily limit reached. Try again later." }
        500 { return "Hubcap server error. Try again later." }
        502 { return "Hubcap gateway error. Try again later." }
        503 { return "Hubcap service unavailable. Try again later." }
        504 { return "Hubcap request timed out. Try again later." }
    }

    if ($responseText) {
        try {
            $json = $responseText | ConvertFrom-Json
            foreach ($field in @("detail", "error", "message")) {
                if ($json.$field) { return "Hubcap error: $($json.$field)" }
            }
        } catch {}
    }

    return $ErrorRecord.Exception.Message
}

try {
    $steamRoot = Get-SteamRoot
    $configPath = Join-Path $steamRoot "config\hubcaptools\config.yaml"
    $config = Read-HubcapConfig -ConfigPath $configPath
    $luaDir = [Environment]::ExpandEnvironmentVariables($config.HubcapLuaDir)

    if ($UserStats) {
        try {
            $payload = Invoke-RestMethod -Uri "https://hubcapmanifest.com/api/v1/user/stats" -Headers @{ Authorization = "Bearer $($config.HubcapApiKey)" } -Method Get
            Write-JsonAndExit @{
                success = $true
                dailyUsage = $payload.daily_usage
                dailyLimit = $payload.daily_limit
                canMakeRequests = $payload.can_make_requests
            }
        } catch {
            throw (Get-HttpErrorMessage -ErrorRecord $_)
        }
    }

    if ($AppId -notmatch '^\d+$') { throw "Invalid Steam app id: $AppId" }

    New-Item -ItemType Directory -Force -Path $luaDir | Out-Null
    $directLuaPath = Join-Path $luaDir "$AppId.lua"
    $dlcLuaPath = Join-Path $luaDir "$AppId-dlc.lua"
    $manifestDir = Join-Path $steamRoot "depotcache"
    $manifestMarkerPath = Join-Path (Join-Path $steamRoot "config") "hubcapplugin-manifest-$AppId.txt"

    if ($CheckLua) {
        $hasDlcInMain = $false
        if (Test-Path -LiteralPath $directLuaPath) {
            $parts = Split-LuaSections -Path $directLuaPath -AppId $AppId
            $hasDlcInMain = $parts.Depots.Count -gt 0
        }
        $dlcExists = (Test-Path -LiteralPath $dlcLuaPath) -or $hasDlcInMain
        Write-JsonAndExit @{ success = $true; appId = $AppId; exists = (Test-Path -LiteralPath $directLuaPath); dlcExists = $dlcExists }
    }

    if ($DeleteLua) {
        $existed = Test-Path -LiteralPath $directLuaPath
        if ($existed) { Remove-Item -LiteralPath $directLuaPath -Force }
        if (Test-Path -LiteralPath $manifestMarkerPath) { Remove-Item -LiteralPath $manifestMarkerPath -Force }
        Write-JsonAndExit @{ success = $true; appId = $AppId; removed = $existed; exists = $false }
    }

    if ($DeleteManifest) {
        if (Test-Path -LiteralPath $manifestMarkerPath) {
            foreach ($line in Get-Content -LiteralPath $manifestMarkerPath) {
                if ($line -match '^file=(.+)$') {
                    $path = $Matches[1]
                    if ($path -and (Test-Path -LiteralPath $path)) { Remove-Item -LiteralPath $path -Force }
                }
            }
            Remove-Item -LiteralPath $manifestMarkerPath -Force
        }
        Write-JsonAndExit @{ success = $true; appId = $AppId }
    }

    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) "HubcapPlugin"
    $downloadDir = Join-Path $tempRoot "$AppId-$timestamp-$([guid]::NewGuid().ToString('N'))"
    New-Item -ItemType Directory -Force -Path $downloadDir | Out-Null
    $extractDir = Join-Path $downloadDir "extracted"

    if ($DeleteDlc) {
        $removed = @()

        if (Test-Path -LiteralPath $directLuaPath) {
            $parts = Split-LuaSections -Path $directLuaPath -AppId $AppId
            if ($parts.Depots.Count -gt 0) {
                $removed += Remove-ManifestsForDepots -Depots $parts.Depots -ManifestDir $manifestDir
                Set-Content -LiteralPath $directLuaPath -Value $parts.Base -Encoding UTF8
            }
        }

        if (Test-Path -LiteralPath $dlcLuaPath) {
            $dlcParts = Split-LuaSections -Path $dlcLuaPath -AppId $AppId
            $removed += Remove-ManifestsForDepots -Depots $dlcParts.Depots -ManifestDir $manifestDir
            Remove-Item -LiteralPath $dlcLuaPath -Force
        }

        Remove-IfExists -Path $downloadDir
        Remove-EmptyDirectory -Path $tempRoot
        Write-JsonAndExit @{ success = $true; appId = $AppId; removed = $removed.Count; exists = $false }
    }

    if ($DlcOnly) {
        $zipPath = Join-Path $downloadDir "$AppId.zip"
        try {
            Invoke-WebRequest -Uri "https://hubcapmanifest.com/api/v1/manifest/$AppId" -Headers @{ Authorization = "Bearer $($config.HubcapApiKey)" } -OutFile $zipPath -UseBasicParsing
        } catch {
            throw (Get-HttpErrorMessage -ErrorRecord $_)
        }

        New-Item -ItemType Directory -Force -Path $manifestDir | Out-Null
        New-Item -ItemType Directory -Force -Path $extractDir | Out-Null
        Expand-Archive -LiteralPath $zipPath -DestinationPath $extractDir -Force

        $luaFile = Get-ChildItem -LiteralPath $extractDir -Recurse -File -Filter "*.lua" | Select-Object -First 1
        if (-not $luaFile) { throw "Downloaded ZIP did not contain a .lua file." }

        $parts = Split-LuaSections -Path $luaFile.FullName -AppId $AppId

        if ($parts.Depots.Count -eq 0) { throw "This game has no DLC depot." }

        Set-Content -LiteralPath $dlcLuaPath -Value $parts.Dlc -Encoding UTF8

        $copied = @()
        foreach ($depot in $parts.Depots) {
            Get-ChildItem -LiteralPath $extractDir -Recurse -File -Filter "$depot`_*.manifest" -ErrorAction SilentlyContinue | ForEach-Object {
                $destination = Join-Path $manifestDir $_.Name
                Copy-Item -LiteralPath $_.FullName -Destination $destination -Force
                $copied += $destination
            }
        }

        if ($copied.Count -eq 0) { throw "No DLC manifest found in the archive." }

        Remove-IfExists -Path $downloadDir
        Remove-EmptyDirectory -Path $tempRoot
        Write-JsonAndExit @{ success = $true; appId = $AppId; dlcLua = $dlcLuaPath; manifestFiles = $copied }
    }

    $rawDownload = Join-Path $downloadDir "$AppId.download"
    $zipPath = Join-Path $downloadDir "$AppId.zip"

    try {
        Invoke-WebRequest -Uri "https://hubcapmanifest.com/api/v1/manifest/$AppId" -Headers @{ Authorization = "Bearer $($config.HubcapApiKey)" } -OutFile $rawDownload -UseBasicParsing
    } catch {
        throw (Get-HttpErrorMessage -ErrorRecord $_)
    }

    $bytes = [System.IO.File]::ReadAllBytes($rawDownload)
    if ($bytes.Length -lt 4 -or $bytes[0] -ne 0x50 -or $bytes[1] -ne 0x4B) {
        throw "Hubcap manifest response was not a ZIP file."
    }

    Move-Item -LiteralPath $rawDownload -Destination $zipPath -Force
    New-Item -ItemType Directory -Force -Path $manifestDir | Out-Null
    New-Item -ItemType Directory -Force -Path $extractDir | Out-Null
    Expand-Archive -LiteralPath $zipPath -DestinationPath $extractDir -Force

    $copiedLua = @()
    foreach ($file in @(Get-ChildItem -LiteralPath $extractDir -Recurse -File -Filter "*.lua")) {
        $destination = Join-Path $luaDir $file.Name
        Copy-Item -LiteralPath $file.FullName -Destination $destination -Force
        $copiedLua += $destination
    }

    $copiedManifests = @()
    foreach ($file in Get-ManifestFiles -Directory $extractDir) {
        $destination = Join-Path $manifestDir $file.Name
        Copy-Item -LiteralPath $file.FullName -Destination $destination -Force
        $copiedManifests += $destination
    }

    if ($copiedLua.Count -eq 0) { throw "Downloaded ZIP did not contain a .lua file." }
    if ($copiedManifests.Count -eq 0) { throw "Downloaded ZIP did not contain a .manifest file." }

    Remove-IfExists -Path $manifestMarkerPath
    Remove-IfExists -Path $downloadDir
    Remove-EmptyDirectory -Path $tempRoot

    Write-JsonAndExit @{ success = $true; appId = $AppId; luaFiles = $copiedLua; manifestFiles = $copiedManifests }
} catch {
    Remove-IfExists -Path $downloadDir
    Remove-EmptyDirectory -Path $tempRoot
    Write-JsonAndExit @{ success = $false; error = $_.Exception.Message } 1
}