[Français](README.md) | English

# 🧢 **Hubcap**
[![Version](https://img.shields.io/github/v/release/Altansar69/hubcap-add?label=Version&color=blue)](../../releases/latest) ![Millennium](https://img.shields.io/badge/Millennium-Lua%20plugin-purple) ![OS](https://img.shields.io/badge/OS-Windows-green)

> [!WARNING]
> **Unofficial project: read before using**
>
> - **I am not affiliated with Valve, Hubcap or Millennium.** This plugin is a personal project, neither endorsed nor sponsored by them.
> - **Steam**, its name, its visuals and **all rights to the platform belong to Valve**. Games remain the property of their publishers.
> - **Using this plugin may not be allowed** by Steam’s terms of service: **action against your account cannot be ruled out**.
> - You use it **at your own risk**. The software is provided **“as is”, without any warranty**.

**Hubcap** is a [Millennium](https://steambrew.app/) plugin that adds an **“Add to my library”** button right on a game’s Steam store page, next to the page’s other buttons. One click, and the game shows up in your library instantly, without going through another tool.

DLC unlock the same way, your Hubcap key is set in Millennium’s settings, and the interface speaks your Steam language.

## ✨ Features

### On the store page
- **Add to my library**: downloads the game’s script and manifests from [hubcapmanifest.com](https://hubcapmanifest.com), then installs them in the right places (HubcapTool’s Lua folder and Steam’s `depotcache`). The game shows up right away, no Steam restart needed.
- **Remove from my library**: if the game is already added, the button turns red and removes the script and its manifests.
- **Unlock the DLC**: on a game you already own that has DLC, the button only offers the DLC. They go into a separate file (`<appid>-dlc.lua`) and can be removed the same way, without touching the game.
- **Extra protection**: before adding, the plugin reads the game’s page; if it uses third-party protection (Denuvo…), a dialog warns you that a separate fix will be needed after installing.
- **A Steam-styled button**, aligned with the page’s other buttons (CS.RIN.RU Enhanced, SteamDB…), showing its live state: “Adding…”, “Added”, or the error in plain words.
- **Readable error messages**: invalid key, daily quota reached, game not available yet, HubcapTool not installed, corrupted download.

### In Millennium’s settings
- **Your Hubcap key**: paste it, save, and it is written to HubcapTool’s `config.yaml`. Only its first and last 4 characters are shown back.
- **Daily quota**: “Today: X / Y downloads”, read straight from your Hubcap account.
- **Install status**: the plugin tells you whether HubcapTool is ready or needs to be run once first.

### Languages
The interface follows Steam’s language: **English, French, German, Spanish (Spain and Latin America), Italian, Portuguese (Portugal and Brazil), Russian, Polish, Dutch, Danish, Swedish, Norwegian, Finnish, Czech, Hungarian, Romanian, Bulgarian, Greek, Turkish, Ukrainian, Japanese, Korean, Chinese (Simplified and Traditional), Thai, Vietnamese and Indonesian**.

## 🔨 Installation

1. Install [Millennium](https://steambrew.app/) if you haven’t already.
2. Install **HubcapTool** and run it **once**: it creates `<Steam>\config\hubcaptools\config.yaml`, which the plugin needs.
3. From the **[latest release](../../releases/latest)** (Releases page), download `hubcap-add.zip` (not “Source code”).
4. Extract the archive into `<Steam>\millennium\plugins\`: you should end up with `<Steam>\millennium\plugins\hubcap-add\plugin.json`.
5. In Steam: **Millennium → Plugins**, enable **Hubcap**, then restart Steam.
6. In the plugin’s settings, paste your **Hubcap API key** (on [hubcapmanifest.com](https://hubcapmanifest.com), under *API Keys*) and save.
7. Open a game’s store page: the **Add to my library** button shows up next to the others. You’re all set!

**Updating**: download the new archive, extract it to the same place replacing the files, then restart Steam. Your key is kept (it lives in HubcapTool’s `config.yaml`, not in the plugin).

## ❓ FAQ and notes

- **Windows only.** The plugin relies on PowerShell and Steam’s Windows paths.
- **The button doesn’t show up?** It only appears on `store.steampowered.com/app/…` pages. On a game you already own with no DLC, there is nothing to add, so no button.
- **“Run hubcaptools once”**: HubcapTool’s `config.yaml` can’t be found. Run HubcapTool, then reload the page.
- **“Invalid Hubcap key”** or **“Daily quota reached”**: check your key and quota in the plugin’s settings; the quota resets daily on Hubcap’s side.
- **“Game not available yet”**: Hubcap doesn’t have this game’s files yet. Try again later.
- **The game doesn’t appear in your library?** It is normally hot-loaded. If it isn’t, fully restart Steam (right-click the tray icon → Exit).
- **Connections**: only `hubcapmanifest.com` (downloads and quota, with your key) and the Steam store API (protection detection).
- **Uninstalling**: disable **Hubcap** in Millennium, then delete the `<Steam>\millennium\plugins\hubcap-add` folder. Games already added stay in HubcapTool’s Lua folder: remove them with the button before uninstalling if you no longer want them.
- **Found a bug?** Open an [issue](../../issues) with the game’s page and the message shown on the button.

## 📖 Project layout

- `plugin.json`: plugin declaration for Millennium.
- `.millennium/Dist/webkit.js`: the button injected on store pages.
- `.millennium/Dist/index.js`: the settings panel (key and quota).
- `backend/main.lua`: the Lua backend called by the interface (config reading, game state, starting downloads).
- `backend/scripts/download_lua.ps1`: downloading, extracting and installing Hubcap files.

## 🔢 Versioning

This project follows [semantic versioning](https://semver.org/). Each version has an **x.y.z** number, set in `plugin.json`, which is also its GitHub tag (`v1.2.0`…).

## 🤝 Credits

- [Altansar69](https://github.com/Altansar69) - created the project
- [Millennium](https://github.com/SteamClientHomebrew/Millennium) - the plugin framework for Steam
- [Hubcap](https://hubcapmanifest.com) - manifest and quota API
