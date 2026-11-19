Français | [English](README_en.md)

# 🧢 **Hubcap**
[![Version](https://img.shields.io/github/v/release/Altansar69/hubcap-add?label=Version&color=blue)](../../releases/latest) ![Millennium](https://img.shields.io/badge/Millennium-plugin%20Lua-purple) ![OS](https://img.shields.io/badge/OS-Windows-green)

> [!WARNING]
> **Projet non officiel : à lire avant toute utilisation**
>
> - **Je ne suis affilié ni à Valve, ni à Hubcap, ni à Millennium.** Ce plugin est un projet personnel, ni approuvé ni sponsorisé par eux.
> - **Steam**, son nom, ses visuels et **tous les droits sur la plateforme appartiennent à Valve**. Les jeux restent la propriété de leurs éditeurs.
> - **L’utilisation de ce plugin n’est pas forcément autorisée** par les conditions d’utilisation de Steam : **une sanction sur ton compte n’est pas à exclure**.
> - Tu l’utilises **à tes risques et périls**. Le logiciel est fourni **« tel quel », sans aucune garantie**.

**Hubcap** est un plugin [Millennium](https://steambrew.app/) qui ajoute un bouton **« Ajouter à ma bibliothèque »** directement sur la page magasin des jeux Steam, à côté des autres boutons de la page. Un clic, et le jeu apparaît dans ta bibliothèque instantanément, sans passer par un autre logiciel.

Les DLC se débloquent de la même façon, ta clé Hubcap se règle dans les options de Millennium, et l’interface parle la langue de ton Steam.

## ✨ Fonctionnalités

### Sur la page magasin
- **Ajouter à ma bibliothèque** : télécharge depuis [hubcapmanifest.com](https://hubcapmanifest.com) le script et les manifestes du jeu, puis les installe aux bons endroits (dossier Lua de HubcapTool et `depotcache` de Steam). Le jeu apparaît aussitôt, sans redémarrer Steam.
- **Retirer de ma bibliothèque** : si le jeu est déjà ajouté, le bouton passe au rouge et retire le script et ses manifestes.
- **Débloquer les DLC** : sur un jeu que tu possèdes déjà et qui a des DLC, le bouton propose uniquement les DLC. Ils vont dans un fichier séparé (`<appid>-dlc.lua`) et peuvent être retirés de la même façon, sans toucher au jeu.
- **Protection supplémentaire** : avant l’ajout, le plugin lit la page du jeu ; s’il utilise une protection tierce (Denuvo…), une fenêtre te prévient qu’il faudra appliquer un correctif séparément après l’installation.
- **Un bouton aux couleurs de Steam**, aligné avec les autres boutons de la page (CS.RIN.RU Enhanced, SteamDB…), avec son état en direct : « Ajout… », « Ajouté », ou l’erreur en clair.
- **Messages d’erreur lisibles** : clé invalide, quota du jour atteint, jeu pas encore disponible, HubcapTool pas installé, téléchargement corrompu.

### Dans les options de Millennium
- **Ta clé Hubcap** : colle-la, enregistre, elle est écrite dans le `config.yaml` de HubcapTool. Seuls ses 4 premiers et 4 derniers caractères sont réaffichés.
- **Quota du jour** : « Aujourd’hui : X / Y téléchargements », lu directement sur ton compte Hubcap.
- **État de l’installation** : le plugin te dit si HubcapTool est prêt ou s’il faut le lancer une première fois.

### Langues
L’interface suit la langue de Steam : **français, anglais, allemand, espagnol (Espagne et Amérique latine), italien, portugais (Portugal et Brésil), russe, polonais, néerlandais, danois, suédois, norvégien, finnois, tchèque, hongrois, roumain, bulgare, grec, turc, ukrainien, japonais, coréen, chinois (simplifié et traditionnel), thaï, vietnamien et indonésien**.

## 🔨 Installation

1. Installe [Millennium](https://steambrew.app/) si ce n’est pas déjà fait.
2. Installe **HubcapTool** et lance-le **une première fois** : il crée `<Steam>\config\hubcaptools\config.yaml`, dont le plugin a besoin.
3. Sur la **[dernière version](../../releases/latest)** (page Releases), télécharge `hubcap-add.zip` (pas « Source code »).
4. Extrais l’archive dans `<Steam>\millennium\plugins\` : tu dois obtenir `<Steam>\millennium\plugins\hubcap-add\plugin.json`.
5. Dans Steam : **Millennium → Plugins**, active **Hubcap**, puis redémarre Steam.
6. Dans les options du plugin, colle ta **clé API Hubcap** (sur [hubcapmanifest.com](https://hubcapmanifest.com), rubrique *API Keys*) et enregistre.
7. Ouvre la page magasin d’un jeu : le bouton **Ajouter à ma bibliothèque** apparaît à côté des autres. C’est parti !

**Mise à jour** : télécharge la nouvelle archive et extrais-la au même endroit en remplaçant les fichiers, puis redémarre Steam. Ta clé est conservée (elle est dans le `config.yaml` de HubcapTool, pas dans le plugin).

## ❓ FAQ et remarques

- **Windows uniquement.** Le plugin s’appuie sur PowerShell et sur les chemins Windows de Steam.
- **Le bouton n’apparaît pas ?** Il n’est affiché que sur les pages `store.steampowered.com/app/…`. Sur un jeu que tu possèdes déjà et qui n’a pas de DLC, il n’y a rien à ajouter, donc pas de bouton.
- **« Lance hubcaptools une fois »** : le fichier `config.yaml` de HubcapTool est introuvable. Lance HubcapTool, puis recharge la page.
- **« Clé Hubcap invalide »** ou **« Quota du jour atteint »** : vérifie ta clé et ton quota dans les options du plugin ; le quota se réinitialise chaque jour côté Hubcap.
- **« Jeu pas encore disponible »** : Hubcap n’a pas encore les fichiers de ce jeu. Réessaie plus tard.
- **Le jeu n’apparaît pas dans la bibliothèque ?** Il est normalement ajouté à chaud. Si ce n’est pas le cas, redémarre complètement Steam (clic droit sur l’icône → Quitter).
- **Connexions** : uniquement `hubcapmanifest.com` (téléchargements et quota, avec ta clé) et l’API du magasin Steam (détection des protections).
- **Désinstaller** : désactive **Hubcap** dans Millennium, puis supprime le dossier `<Steam>\millennium\plugins\hubcap-add`. Les jeux déjà ajoutés restent dans le dossier Lua de HubcapTool : retire-les avec le bouton avant de désinstaller si tu ne les veux plus.
- **Un bug ?** Ouvre une [issue](../../issues) avec la page du jeu concerné et le message affiché sur le bouton.

## 📖 Structure du projet

- `plugin.json` : déclaration du plugin pour Millennium.
- `.millennium/Dist/webkit.js` : le bouton injecté sur les pages du magasin.
- `.millennium/Dist/index.js` : le panneau des options (clé et quota).
- `backend/main.lua` : le backend Lua appelé par l’interface (lecture de la config, état du jeu, lancement des téléchargements).
- `backend/scripts/download_lua.ps1` : téléchargement, extraction et installation des fichiers Hubcap.

## 🔢 Versionnage

Ce projet suit un schéma de [versionnement sémantique](https://semver.org/). Chaque version porte un numéro **x.y.z**, indiqué dans `plugin.json`, qui est aussi son étiquette GitHub (`v1.2.0`…).

## 🤝 Crédits

- [Altansar69](https://github.com/Altansar69) - a créé le projet
- [Millennium](https://github.com/SteamClientHomebrew/Millennium) - le framework de plugins pour Steam
- [Hubcap](https://hubcapmanifest.com) - API des manifestes et quotas
