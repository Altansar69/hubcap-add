local logger = require("logger")
local millennium = require("millennium")
local ffi = require("ffi")
local json = require("json")
local settings = require("settings")
local fs = require("fs")

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

-- Games Steam splits into separate apps, each with its own licence
-- (e.g. Black Ops II campaign / multiplayer / zombies). Adding or removing
-- one member also adds or removes the others. Checked against Steam appinfo:
-- every companion pulls its depots from the main app (depotfromapp).
local LINKED_APPS = {
    { "202970", "202990", "212910" }, -- CoD Black Ops II: campaign, multiplayer, zombies
    { "42700", "42710" },             -- CoD Black Ops: campaign, multiplayer
    { "10180", "10190" },             -- CoD Modern Warfare 2 (2009): campaign, multiplayer
    { "115300", "42680", "42690" },   -- CoD Modern Warfare 3 (2011): store page, campaign, multiplayer
    { "209160", "209170" },           -- CoD Ghosts: campaign, multiplayer
}

local function with_linked_apps(app_id)
    for _, group in ipairs(LINKED_APPS) do
        for _, member in ipairs(group) do
            if member == app_id then
                local ids = { app_id }
                for _, other in ipairs(group) do
                    if other ~= app_id then ids[#ids + 1] = other end
                end
                return ids
            end
        end
    end
    return { app_id }
end

-- Runs the helper for the app and its linked apps. Succeeds when at least one
-- of them worked; a linked app Hubcap doesn't have doesn't fail the whole call.
local function run_for_group(app_id, extra_args)
    local ids = with_linked_apps(app_id)
    if #ids == 1 then return run_powershell("-AppId " .. quote(app_id) .. extra_args) end

    local done, first_error = {}, nil
    for _, id in ipairs(ids) do
        local ok, result = pcall(json.decode, run_powershell("-AppId " .. quote(id) .. extra_args))
        if ok and type(result) == "table" and result.success then
            done[#done + 1] = id
        elseif first_error == nil then
            first_error = (ok and type(result) == "table" and result.error) or "Helper returned invalid output."
        end
    end
    if #done == 0 then return json.encode({ success = false, error = first_error }) end
    return json.encode({ success = true, appId = app_id, apps = done })
end

function AddGame(payload)
    local app_id = app_id_from_payload(payload)
    if app_id == nil then
        return '{"success":false,"error":"Invalid Steam app id"}'
    end
    return run_for_group(app_id, "")
end

function DeleteGame(payload)
    local app_id = app_id_from_payload(payload)
    if app_id == nil then
        return '{"success":false,"error":"Invalid Steam app id"}'
    end
    return run_for_group(app_id, " -DeleteLua -DeleteManifest")
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
    -- a DLC is a keyless addappid(<id>) for another app; header comments
    -- such as "-- Total DLCs: 0" don't count
    for line in file:lines() do
        local keyless = line:match("^%s*addappid%(%s*(%d+)%s*%)")
        if keyless and keyless ~= app_id then
            found = true
            break
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
    -- HubcapTools loads <appid>_dlc.lua; <appid>-dlc.lua is the old (ignored) name
    local dlc_exists = file_exists(config.HubcapLuaDir .. "\\" .. app_id .. "_dlc.lua")
        or file_exists(config.HubcapLuaDir .. "\\" .. app_id .. "-dlc.lua")
        or has_dlc_section(path, app_id)

    return '{"success":true,"appId":"' .. app_id .. '","exists":' .. tostring(file_exists(path)) ..
        ',"dlcExists":' .. tostring(dlc_exists) .. '}'
end

function GetUsage()
    return run_powershell("-UserStats")
end

-- Games added through the plugin: every <appid>.lua in the hubcap-lua folder
function ListAddedGames()
    local lines = read_config_lines()
    local dir = resolve_lua_dir(lines and parse_config(lines).HubcapLuaDir or "")
    local ok, entries = pcall(fs.list, dir)
    if not ok or type(entries) ~= "table" then
        return json.encode({ success = true, apps = {} })
    end
    local apps, names = {}, {}
    for _, entry in ipairs(entries) do
        local name = tostring(entry.name or entry.path or ""):match("([^/\\]+)$") or ""
        names[name] = true
        local id = name:match("^(%d+)%.lua$")
        if id and entry.is_file ~= false then apps[#apps + 1] = id end
    end
    -- same rule as CheckLua: a DLC file, or DLC entries inside the game's own script
    -- also covers owned games whose DLC were unlocked (a DLC file but no game script)
    local dlc_unlocked, seen = {}, {}
    for name in pairs(names) do
        local id = name:match("^(%d+)_dlc%.lua$") or name:match("^(%d+)%-dlc%.lua$")
        if id and not seen[id] then seen[id] = true; dlc_unlocked[#dlc_unlocked + 1] = id end
    end
    for _, id in ipairs(apps) do
        if not seen[id] and has_dlc_section(dir .. "\\" .. id .. ".lua", id) then
            seen[id] = true
            dlc_unlocked[#dlc_unlocked + 1] = id
        end
    end
    return json.encode({ success = true, apps = apps, dlcUnlocked = dlc_unlocked })
end

-- Scalar HubcapTools settings editable from the Millennium panel.
local TOOL_SETTINGS = {
    AutoUpdate = "bool", DisableFamilyShareLock = "bool", PlayNotOwnedGames = "bool",
    UseWhitelist = "bool", AutoFilterList = "bool", DlcAutoUnlockUseWhitelist = "bool",
    HubcapTicketFetch = "bool", HubcapTicketSpoof = "bool", HubcapLuaDir = "string",
    Notifications = "bool", NotifyInit = "bool", ToastsErrorOnly = "bool",
    AchievementsLanguage = "word", AchievementsMaxAgeDays = "int", SteamAPIKey = "string",
    FakeEmail = "string", FakeWalletBalance = "int", ["CloudSave.Enabled"] = "bool",
    DepotKeysFile = "string", AppTokensFile = "string",
    ["RemoteApi.Enabled"] = "bool", ["RemoteApi.Port"] = "int", ["RemoteApi.BindAddress"] = "string",
    ["RemoteApi.Token"] = "string", ["RemoteApi.Tls"] = "bool",
    LogLevel = "int", LogTimestamped = "bool", ExtendedLogging = "bool", LogCategories = "string",
}

local function read_yaml_scalar(raw)
    raw = tostring(raw or ""):match("^%s*(.-)%s*$") or ""
    if raw:sub(1, 1) == "'" and raw:sub(-1) == "'" and #raw >= 2 then
        return (raw:sub(2, -2):gsub("''", "'"))
    end
    if raw:sub(1, 1) == '"' and raw:sub(-1) == '"' and #raw >= 2 then
        return (raw:sub(2, -2):gsub('\\(.)', "%1"))
    end
    return (raw:gsub("%s+#.*$", ""))
end

local function render_setting(kind, value)
    if kind == "bool" then
        if value == true or value == "yes" or value == "true" or value == 1 then return "yes" end
        return "no"
    end
    if kind == "int" then
        local number = tonumber(value)
        if number == nil or number < 0 or number ~= math.floor(number) then return nil end
        return string.format("%d", number)
    end
    value = tostring(value or ""):match("^%s*(.-)%s*$")
    if value:find("[\r\n]") then return nil end
    if kind == "word" then
        if not value:match("^[%w_]+$") then return nil end
        return value
    end
    -- single-quoted YAML: no escape sequences, so Windows paths stay intact
    return "'" .. value:gsub("'", "''") .. "'"
end

-- A key's block = the indented (or "- ") lines right after "Key:".
local function is_block_line(line)
    line = line:gsub("\r$", "")
    return line:match("^%s+%S") ~= nil or line:match("^%-") ~= nil
end

local function key_pattern(key)
    return "^" .. key:gsub("%.", "%%.") .. "%s*:"
end

-- Replaces the "Key: ..." line and its block with new_lines (first one is the key line).
local function write_config_lines(key, new_lines)
    local lines, path, err = read_config_lines()
    if lines == nil then return false, err end

    local pattern = key_pattern(key)
    local out, replaced, index = {}, false, 1
    while index <= #lines do
        local line = lines[index]
        if not replaced and line:match(pattern) then
            for _, new_line in ipairs(new_lines) do out[#out + 1] = new_line end
            replaced = true
            index = index + 1
            while index <= #lines and is_block_line(lines[index]) do index = index + 1 end
        else
            out[#out + 1] = line
            index = index + 1
        end
    end
    if not replaced then
        for _, new_line in ipairs(new_lines) do out[#out + 1] = new_line end
    end
    lines = out

    -- keep the file's own line endings (HubcapTools writes LF)
    local eol = "\n"
    local source = io.open(path, "rb")
    if source ~= nil then
        if (source:read(4096) or ""):find("\r\n", 1, true) then eol = "\r\n" end
        source:close()
    end
    for index, line in ipairs(lines) do lines[index] = line:gsub("\r$", "") end

    local file, open_err = io.open(path, "wb")
    if file == nil then return false, open_err or "cannot write config" end
    file:write(table.concat(lines, eol) .. eol)
    file:close()
    return true, nil
end

local function write_config_value(key, rendered)
    return write_config_lines(key, { key .. ": " .. rendered })
end

---------------------------------------------------------------------------
-- List / map HubcapTools settings.
--   ids        - list of numbers               Key:\n  - 440
--   num_map    - number -> number              Key:\n  440: 730
--   str_map    - number -> text                Key:\n  440: 'Name'
--   status     - { AppId = n, Title = text }   Key:\n  AppId: 0\n  Title: ''
--   dlc_map    - parent -> { dlc -> name }     Key:\n  440:\n    441: 'DLC'
--   owner_map  - account -> list of ids        Key:\n  1234:\n    - 440
---------------------------------------------------------------------------
local TOOL_LISTS = {
    AppIds = "ids", AdditionalApps = "ids", AdditionalDepots = "ids", AdditionalPackages = "ids",
    AdditionalAppsDLC = "ids", UnlockPreload = "ids", KeepUpdates = "ids", FakeOffline = "ids",
    LegacyFakeAppIds = "ids", BlockedSteamIds = "ids", SteamStubBlacklist = "ids",
    TicketSpoofBlacklist = "ids", EosDeviceIdApps = "ids", EosAntiCheatBypassApps = "ids",
    DlcAutoUnlockWhitelist = "ids", DlcAutoUnlockBlacklist = "ids", PluginTraceApps = "ids",
    AppTokens = "num_map", FakeAppIds = "num_map", SubscriptionTimestamps = "num_map",
    PlaytimeOverrides = "num_map", GameTitles = "str_map", LegacyCDKeys = "str_map",
    IdleStatus = "status", UnownedStatus = "status", DlcData = "dlc_map", DenuvoGames = "owner_map",
}

local function indent_of(line) return #(line:match("^(%s*)")) end

-- Parses an indented YAML block (lists and maps, nested at most twice).
local function parse_yaml_block(block, first, last)
    local base = nil
    local list, map, order = {}, {}, {}
    local index = first
    while index <= last do
        local line = block[index]
        local indent = indent_of(line)
        if base == nil then base = indent end
        local item = line:match("^%s*%-%s*(.-)%s*$")
        if item ~= nil and indent == base then
            list[#list + 1] = read_yaml_scalar(item)
            index = index + 1
        else
            local key, value = line:match("^%s*([^:#]-)%s*:%s*(.-)%s*$")
            index = index + 1
            if key ~= nil and indent == base then
                key = read_yaml_scalar(key)
                if value ~= "" and value:sub(1, 1) ~= "#" then
                    map[key] = read_yaml_scalar(value)
                else
                    local child_first = index
                    while index <= last and indent_of(block[index]) > base do index = index + 1 end
                    map[key] = parse_yaml_block(block, child_first, index - 1)
                end
                order[#order + 1] = key
            end
        end
    end
    if #list > 0 then return list end
    local ordered = {}
    for _, key in ipairs(order) do ordered[#ordered + 1] = { key, map[key] } end
    return ordered
end

-- Returns the block of a list setting as { { key, value }... } or { item... }.
local function read_list_setting(lines, key)
    local pattern = key_pattern(key)
    for index, line in ipairs(lines) do
        if line:match(pattern) then
            local inline = line:match(":%s*(.-)%s*$") or ""
            local block, cursor = {}, index + 1
            while cursor <= #lines and is_block_line(lines[cursor]) do
                local entry = lines[cursor]:gsub("\r$", "")
                if not entry:match("^%s*#") then block[#block + 1] = entry end
                cursor = cursor + 1
            end
            if #block == 0 then
                -- flow style "Key: [1, 2]" or empty
                local items = {}
                for value in (inline:match("^%[(.*)%]$") or ""):gmatch("[^,]+") do
                    items[#items + 1] = read_yaml_scalar(value)
                end
                return items
            end
            return parse_yaml_block(block, 1, #block)
        end
    end
    return {}
end

local function to_entries(kind, parsed)
    -- normalise to plain JSON-friendly shapes for the panel
    if kind == "ids" then
        local ids = {}
        for _, value in ipairs(parsed) do
            if type(value) == "string" then ids[#ids + 1] = value end
        end
        return ids
    end
    local entries = {}
    for _, pair in ipairs(parsed) do
        if type(pair) == "table" and pair[1] ~= nil then
            local key, value = pair[1], pair[2]
            if kind == "dlc_map" and type(value) == "table" then
                for _, dlc in ipairs(value) do
                    if type(dlc) == "table" then entries[#entries + 1] = { key, dlc[1], tostring(dlc[2] or "") } end
                end
            elseif kind == "owner_map" and type(value) == "table" then
                local ids = {}
                for _, id in ipairs(value) do if type(id) == "string" then ids[#ids + 1] = id end end
                entries[#entries + 1] = { key, table.concat(ids, ", ") }
            elseif type(value) ~= "table" then
                entries[#entries + 1] = { key, value }
            end
        end
    end
    return entries
end

local function quote_text(value)
    return "'" .. tostring(value):gsub("'", "''") .. "'"
end

local function digits(value)
    value = tostring(value or ""):match("^%s*(.-)%s*$")
    return value:match("^%d+$")
end

-- Validates the panel's entries and renders the YAML block, or returns nil, error.
local function render_list(key, kind, entries)
    if type(entries) ~= "table" then return nil, "Invalid value" end
    local out = { key .. ":" }
    for position, entry in ipairs(entries) do
        local where = "line " .. position .. ": "
        if kind == "ids" then
            local id = digits(entry)
            if id == nil then return nil, where .. "not a number" end
            out[#out + 1] = "  - " .. id
        elseif type(entry) ~= "table" then
            return nil, where .. "invalid entry"
        elseif kind == "num_map" then
            local id, value = digits(entry[1]), digits(entry[2])
            if id == nil or value == nil then return nil, where .. "expected <number> = <number>" end
            out[#out + 1] = "  " .. id .. ": " .. value
        elseif kind == "str_map" then
            local id, value = digits(entry[1]), tostring(entry[2] or "")
            if id == nil or value:find("[\r\n]") then return nil, where .. "expected <number> = <text>" end
            out[#out + 1] = "  " .. id .. ": " .. quote_text(value)
        elseif kind == "status" then
            local name, value = tostring(entry[1] or ""), entry[2]
            if name == "AppId" then
                value = digits(value)
                if value == nil then return nil, "AppId: not a number" end
                out[#out + 1] = "  AppId: " .. value
            elseif name == "Title" then
                value = tostring(value or "")
                if value:find("[\r\n]") then return nil, "Title: invalid text" end
                out[#out + 1] = "  Title: " .. quote_text(value)
            end
        end
    end
    if kind == "dlc_map" then
        local parents, by_parent = {}, {}
        for position, entry in ipairs(entries) do
            local parent, dlc, name = digits(entry[1]), digits(entry[2]), tostring(entry[3] or "")
            if type(entry) ~= "table" or parent == nil or dlc == nil or name:find("[\r\n]") then
                return nil, "line " .. position .. ": expected <game> / <dlc> = <name>"
            end
            if by_parent[parent] == nil then
                by_parent[parent] = {}
                parents[#parents + 1] = parent
            end
            table.insert(by_parent[parent], "    " .. dlc .. ": " .. quote_text(name))
        end
        for _, parent in ipairs(parents) do
            out[#out + 1] = "  " .. parent .. ":"
            for _, line in ipairs(by_parent[parent]) do out[#out + 1] = line end
        end
    elseif kind == "owner_map" then
        for position, entry in ipairs(entries) do
            local owner = type(entry) == "table" and digits(entry[1])
            if not owner then return nil, "line " .. position .. ": expected <account> = <id>, <id>" end
            out[#out + 1] = "  " .. owner .. ":"
            for id in tostring(entry[2] or ""):gmatch("[^,%s]+") do
                if not id:match("^%d+$") then return nil, "line " .. position .. ": " .. id .. " is not a number" end
                out[#out + 1] = "    - " .. id
            end
        end
    end
    return out, nil
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

    local ok, err = write_config_value("HubcapApiKey", '"' .. key:gsub('[\\"]', "\\%0") .. '"')
    if not ok then
        return '{"success":false,"error":"' .. json_escape(err) .. '"}'
    end
    return '{"success":true}'
end

function GetToolSettings()
    local lines, _, err = read_config_lines()
    if lines == nil then return json.encode({ success = false, error = err }) end
    local values = {}
    for _, line in ipairs(lines) do
        local key, raw = line:match("^([%w%.]+)%s*:%s*(.-)%s*$")
        local kind = key and TOOL_SETTINGS[key]
        if kind ~= nil then
            local value = read_yaml_scalar(raw)
            if kind == "bool" then
                values[key] = value:lower() == "yes" or value:lower() == "true"
            elseif kind == "int" then
                values[key] = tonumber(value) or 0
            else
                values[key] = value
            end
        end
    end
    return json.encode({ success = true, values = values })
end

-- Millennium passes the callable's named arguments either as one table
-- or as positional values (key, value) depending on its version.
function SetToolSetting(key, value)
    if type(key) == "table" then
        key, value = key.key, key.value
    end
    key = tostring(key or "")
    local kind = TOOL_SETTINGS[key]
    if kind == nil then return json.encode({ success = false, error = "Unknown setting " .. key }) end
    local rendered = render_setting(kind, value)
    if rendered == nil then return json.encode({ success = false, error = "Invalid value" }) end
    local ok, err = write_config_value(key, rendered)
    return json.encode({ success = ok, error = err })
end

function GetToolLists()
    local lines, _, err = read_config_lines()
    if lines == nil then return json.encode({ success = false, error = err }) end
    local lists = {}
    for key, kind in pairs(TOOL_LISTS) do
        local ok, parsed = pcall(read_list_setting, lines, key)
        lists[key] = { kind = kind, entries = ok and to_entries(kind, parsed) or {} }
    end
    return json.encode({ success = true, lists = lists })
end

-- entries arrives as a JSON string so arrays survive the IPC untouched
function SetToolList(key, entries)
    if type(key) == "table" then key, entries = key.key, key.entries end
    key = tostring(key or "")
    local kind = TOOL_LISTS[key]
    if kind == nil then return json.encode({ success = false, error = "Unknown setting " .. key }) end
    if type(entries) == "string" then
        local ok, decoded = pcall(json.decode, entries)
        if not ok then return json.encode({ success = false, error = "Invalid value" }) end
        entries = decoded
    end
    local rendered, render_err = render_list(key, kind, entries or {})
    if rendered == nil then return json.encode({ success = false, error = render_err }) end
    local ok, err = write_config_lines(key, rendered)
    return json.encode({ success = ok, error = err })
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
    ListAddedGames = ListAddedGames,
    GetConfig = GetConfig,
    SetApiKey = SetApiKey,
    GetToolSettings = GetToolSettings,
    SetToolSetting = SetToolSetting,
    GetToolLists = GetToolLists,
    SetToolList = SetToolList,
    GetSettings = GetSettings,
    SaveSettings = SaveSettings,
}