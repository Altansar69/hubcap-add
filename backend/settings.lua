local json = require("json")
local logger = require("logger")
local millennium = require("millennium")
local fs = require("fs")

local M = {}

M.DEFAULTS = {
    showOnOwned = false,
    highlightLibrary = true,
    highlightColor = "#5ec26a",
    dlcUnlockedColor = "#b37cff",
    dlcAvailableColor = "#ff9f43",
    highlightDlcUnlocked = true,
    highlightDlcAvailable = true,
    menuRemove = true,
    menuDlc = true,
}

local function get_dir()
    local appdata = os.getenv("APPDATA")
    if appdata and appdata ~= "" then
        return fs.join(appdata, "HubcapAdd")
    end
    return millennium.get_install_path()
end

local function get_path()
    return fs.join(get_dir(), "settings.json")
end

function M.merge_defaults(settings)
    local result = {}
    for k, v in pairs(M.DEFAULTS) do
        if settings[k] ~= nil and type(settings[k]) == type(v) then
            result[k] = settings[k]
        else
            result[k] = v
        end
    end
    return result
end

function M.load()
    local file = io.open(get_path(), "r")
    if not file then return M.merge_defaults({}) end
    local content = file:read("*a")
    file:close()
    local ok, parsed = pcall(json.decode, content)
    if not ok or type(parsed) ~= "table" then
        return M.merge_defaults({})
    end
    return M.merge_defaults(parsed)
end

function M.save(settings)
    local ok, err = pcall(function()
        local dir = get_dir()
        if not fs.is_directory(dir) then fs.create_directories(dir) end
        local file, open_err = io.open(get_path(), "w")
        if not file then error(open_err or "unknown") end
        file:write(json.encode(settings))
        file:close()
    end)
    if not ok then
        logger:error("Failed to write settings: " .. tostring(err))
        return false
    end
    return true
end

return M