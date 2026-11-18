local logger = require("logger")
local millennium = require("millennium")
local ffi = require("ffi")
local json = require("json")
local settings = require("settings")

ffi.cdef[[
typedef unsigned long DWORD;
typedef int BOOL;
typedef unsigned short WORD;
typedef unsigned short WCHAR;
typedef void* HANDLE;
typedef struct _STARTUPINFOW {
  DWORD cb;
  WCHAR* lpReserved;
  WCHAR* lpDesktop;
  WCHAR* lpTitle;
  DWORD dwX;
  DWORD dwY;
  DWORD dwXSize;
  DWORD dwYSize;
  DWORD dwXCountChars;
  DWORD dwYCountChars;
  DWORD dwFillAttribute;
  DWORD dwFlags;
  WORD wShowWindow;
  WORD cbReserved2;
  void* lpReserved2;
  HANDLE hStdInput;
  HANDLE hStdOutput;
  HANDLE hStdError;
} STARTUPINFOW;
typedef struct _PROCESS_INFORMATION {
  HANDLE hProcess;
  HANDLE hThread;
  DWORD dwProcessId;
  DWORD dwThreadId;
} PROCESS_INFORMATION;
BOOL CreateProcessW(WCHAR* lpApplicationName, WCHAR* lpCommandLine, void* lpProcessAttributes, void* lpThreadAttributes, BOOL bInheritHandles, DWORD dwCreationFlags, void* lpEnvironment, WCHAR* lpCurrentDirectory, STARTUPINFOW* lpStartupInfo, PROCESS_INFORMATION* lpProcessInformation);
DWORD WaitForSingleObject(HANDLE hHandle, DWORD dwMilliseconds);
BOOL CloseHandle(HANDLE hObject);
BOOL GetExitCodeProcess(HANDLE hProcess, DWORD* lpExitCode);
]]

local function quote(value)
    value = tostring(value or "")
    value = value:gsub("\\", "\\\\")
    value = value:gsub('"', '\\"')
    return '"' .. value .. '"'
end

local function cmd_quote(value)
    return '"' .. tostring(value or "") .. '"'
end

local function cmd_escape(value)
    return (tostring(value or "")):gsub('"', '^"')
end

local function to_wide(value)
    value = tostring(value or "")
    local buffer = ffi.new("WCHAR[?]", #value + 1)
    for index = 1, #value do
        buffer[index - 1] = value:byte(index)
    end
    buffer[#value] = 0
    return buffer
end

local function run_hidden_command(command)
    local startup = ffi.new("STARTUPINFOW")
    local process = ffi.new("PROCESS_INFORMATION")
    startup.cb = ffi.sizeof(startup)

    local command_w = to_wide(command)
    local create_no_window = 0x08000000
    local ok = ffi.C.CreateProcessW(nil, command_w, nil, nil, 0, create_no_window, nil, nil, startup, process)
    if ok == 0 then
        return false, "Failed to start hidden process"
    end

    ffi.C.WaitForSingleObject(process.hProcess, 0xFFFFFFFF)
    local exit_code = ffi.new("DWORD[1]")
    ffi.C.GetExitCodeProcess(process.hProcess, exit_code)
    ffi.C.CloseHandle(process.hThread)
    ffi.C.CloseHandle(process.hProcess)

    return tonumber(exit_code[0]) == 0, "exit " .. tostring(tonumber(exit_code[0]))
end

local function json_escape(value)
    value = tostring(value or "")
    value = value:gsub("\\", "\\\\")
    value = value:gsub('"', '\\"')
    value = value:gsub("\r", "\\r")
    value = value:gsub("\n", "\\n")
    return value
end

local function plugin_root()
    local source = debug.getinfo(1, "S").source:gsub("^@", "")
    return source:match("^(.*)[/\\]backend[/\\]main%.lua$") or "."
end

local function steam_root()
    local root = plugin_root()
    return root:match("^(.*)[/\\]millennium[/\\]plugins[/\\][^/\\]+$") or "C:\\Program Files (x86)\\Steam"
end

local function config_path()
    return steam_root() .. "\\config\\hubcaptools\\config.yaml"
end

local function unquote_yaml(value)
    value = tostring(value or ""):match("^%s*(.-)%s*$") or ""
    local first = value:sub(1, 1)
    local last = value:sub(-1)
    if (first == '"' and last == '"') or (first == "'" and last == "'") then
        value = value:sub(2, -2)
    end
    return value:gsub("\\\\", "\\")
end

local function read_config_lines()
    local path = config_path()
    local file = io.open(path, "r")
    if file == nil then
        return nil, path, "HubcapTool config.yaml not found at " .. path
    end

    local lines = {}
    for line in file:lines() do
        lines[#lines + 1] = line
    end
    file:close()
    return lines, path, nil
end

local function parse_config(lines)
    local config = { configPath = config_path() }
    for _, line in ipairs(lines) do
        local key, value = line:match("^%s*(HubcapApiKey)%s*:%s*(.-)%s*$")
        if key ~= nil then config[key] = unquote_yaml(value) end
        key, value = line:match("^%s*(HubcapLuaDir)%s*:%s*(.-)%s*$")
        if key ~= nil then config[key] = unquote_yaml(value) end
    end
    return config
end

-- Same rules as HubcapTools: empty -> <Steam>\config\hubcap-lua,
-- relative path -> resolved against the Steam folder, absolute path used as-is.
local function resolve_lua_dir(value)
    value = tostring(value or "")
    if value:sub(1, 1) == "#" then value = "" end
    if value == "" then
        return steam_root() .. "\\config\\hubcap-lua"
    end
    if value:match("^%a:[/\\]") or value:match("^[/\\][/\\]") then
        return value
    end
    return steam_root() .. "\\" .. value:gsub("^%.[/\\]", "")
end

local function read_hubcap_config()
    local lines, path, err = read_config_lines()
    if lines == nil then return nil, err end
    local config = parse_config(lines)
    if config.HubcapApiKey == nil or config.HubcapApiKey == "" then
        return nil, "HubcapApiKey is missing in " .. path
    end
    config.HubcapLuaDir = resolve_lua_dir(config.HubcapLuaDir)
    return config, nil
end

local function app_id_from_payload(payload)
    local app_id = nil
    if type(payload) == "table" then
        app_id = payload.app_id or payload.appId or payload[1]
    else
        app_id = payload
    end
    return tostring(app_id or ""):match("^(%d+)$")
end

local function file_exists(path)
    local file = io.open(path, "rb")
    if file ~= nil then
        file:close()
        return true
    end
    return false
end

local function run_powershell(args)
    local script = plugin_root() .. "\\backend\\scripts\\download_lua.ps1"
    local temp_base = os.getenv("TEMP") or os.getenv("TMP") or plugin_root()
    local stamp = tostring(os.time()) .. "-" .. tostring(math.random(100000, 999999))
    local output_path = temp_base .. "\\hubcapplugin-" .. stamp .. ".out"
    local error_path = temp_base .. "\\hubcapplugin-" .. stamp .. ".err"
    local powershell_command = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File " ..
        cmd_quote(script) .. " " .. args .. " > " .. cmd_quote(output_path) .. " 2> " .. cmd_quote(error_path)
    local command = 'cmd.exe /S /C "' .. cmd_escape(powershell_command) .. '"'

    local ok, reason = run_hidden_command(command)

    local output = ""
    local output_file = io.open(output_path, "r")
    if output_file ~= nil then
        output = output_file:read("*a") or ""
        output_file:close()
        os.remove(output_path)
    end

    local error_output = ""
    local error_file = io.open(error_path, "r")
    if error_file ~= nil then
        error_output = error_file:read("*a") or ""
        error_file:close()
        os.remove(error_path)
    end

    if error_output ~= "" then
        logger:error("helper stderr: " .. error_output:sub(1, 300):gsub("%c", " "))
    end

    if not ok then
        logger:error("Hubcap command failed: " .. tostring(reason) .. " | out: " .. output:sub(1, 300):gsub("%c", " "))
    end

    if output ~= "" then return output end
    if error_output ~= "" then
        return '{"success":false,"error":"' .. json_escape(error_output) .. '"}'
    end
    return '{"success":false,"error":"Helper returned no output."}'
end

function Ping()
    logger:info("webkit ping")
    return '{"success":true}'
end

function AddGame(payload)
    local app_id = app_id_from_payload(payload)
    if app_id == nil then
        return '{"success":false,"error":"Invalid Steam app id"}'
    end
    return run_powershell("-AppId " .. quote(app_id))
end

function DeleteGame(payload)
    local app_id = app_id_from_payload(payload)
    if app_id == nil then
        return '{"success":false,"error":"Invalid Steam app id"}'
    end
    return run_powershell("-AppId " .. quote(app_id) .. " -DeleteLua -DeleteManifest")
end

function AddDlc(payload)
    local app_id = app_id_from_payload(payload)
    if app_id == nil then
        return '{"success":false,"error":"Invalid Steam app id"}'
    end
    return run_powershell("-AppId " .. quote(app_id) .. " -DlcOnly")
end

function DeleteDlc(payload)
    local app_id = app_id_from_payload(payload)
    if app_id == nil then
        return '{"success":false,"error":"Invalid Steam app id"}'
    end
    return run_powershell("-AppId " .. quote(app_id) .. " -DeleteDlc")
end

local function has_dlc_section(path, app_id)
    local file = io.open(path, "r")
    if file == nil then return false end
    local found = false
    for line in file:lines() do
        local marker = line:match("^%s*%-%-%s*(.+)$")
        if marker then
            if marker:upper():find("DLC", 1, true) then
                found = true
                break
            end
        else
            local keyless = line:match("^%s*addappid%(%s*(%d+)%s*%)")
            if keyless and keyless ~= app_id then
                found = true
                break
            end
        end
    end
    file:close()
    return found
end
function CheckLua(payload)
    local app_id = app_id_from_payload(payload)
    if app_id == nil then
        return '{"success":false,"error":"Invalid Steam app id"}'
    end

    local config = read_hubcap_config()
    if config == nil then
        return '{"success":true,"appId":"' .. app_id .. '","exists":false,"dlcExists":false}'
    end

    local path = config.HubcapLuaDir .. "\\" .. app_id .. ".lua"
    local dlc_path = config.HubcapLuaDir .. "\\" .. app_id .. "-dlc.lua"
    local dlc_exists = file_exists(dlc_path) or has_dlc_section(path, app_id)

    return '{"success":true,"appId":"' .. app_id .. '","exists":' .. tostring(file_exists(path)) ..
        ',"dlcExists":' .. tostring(dlc_exists) .. '}'
end

function GetUsage()
    return run_powershell("-UserStats")
end

function GetConfig()
    local lines, path, err = read_config_lines()
    if lines == nil then
        return '{"success":false,"error":"' .. json_escape(err) .. '"}'
    end

    local config = parse_config(lines)
    local key = config.HubcapApiKey or ""
    local masked = ""
    if #key > 8 then
        masked = key:sub(1, 4) .. "..." .. key:sub(-4)
    elseif #key > 0 then
        masked = key
    end

    return '{"success":true,"apiKeySet":' .. tostring(key ~= "") .. ',"apiKeyMasked":"' ..
        json_escape(masked) .. '","configPath":"' .. json_escape(path) .. '"}'
end

function SetApiKey(payload)
    local key = nil
    if type(payload) == "table" then
        key = payload.apiKey or payload[1]
    else
        key = payload
    end
    key = tostring(key or ""):match("^%s*(.-)%s*$")
    if key == "" then
        return '{"success":false,"error":"Empty key"}'
    end

    local lines, path, err = read_config_lines()
    if lines == nil then
        return '{"success":false,"error":"' .. json_escape(err) .. '"}'
    end

    local out = {}
    local replaced = false
    for _, line in ipairs(lines) do
        if line:match("^%s*HubcapApiKey%s*:") then
            out[#out + 1] = 'HubcapApiKey: "' .. key:gsub('"', '\\"') .. '"'
            replaced = true
        else
            out[#out + 1] = line
        end
    end
    if not replaced then
        out[#out + 1] = 'HubcapApiKey: "' .. key .. '"'
    end

    local file, open_err = io.open(path, "w")
    if file == nil then
        return '{"success":false,"error":"' .. json_escape(open_err or "cannot write config") .. '"}'
    end
    file:write(table.concat(out, "\r\n") .. "\r\n")
    file:close()

    return '{"success":true}'
end

function GetSettings()
    local ok, result = pcall(function()
        return json.encode({ success = true, data = settings.load() })
    end)
    if not ok then return json.encode({ success = false, error = tostring(result) }) end
    return result
end

function SaveSettings(settings_json)
    local ok, result = pcall(function()
        local parsed = json.decode(settings_json)
        if type(parsed) ~= "table" then
            return json.encode({ success = false, error = "Invalid settings" })
        end
        return json.encode({ success = settings.save(settings.merge_defaults(parsed)) })
    end)
    if not ok then return json.encode({ success = false, error = tostring(result) }) end
    return result
end

local function on_load()
    logger:info("Hubcap Add Game loaded")
    millennium.ready()
end

local function on_unload()
    logger:info("Hubcap Add Game unloaded")
end

return {
    on_load = on_load,
    on_unload = on_unload,
    Ping = Ping,
    AddGame = AddGame,
    DeleteGame = DeleteGame,
    AddDlc = AddDlc,
    DeleteDlc = DeleteDlc,
    CheckLua = CheckLua,
    GetUsage = GetUsage,
    GetConfig = GetConfig,
    SetApiKey = SetApiKey,
    GetSettings = GetSettings,
    SaveSettings = SaveSettings,
}