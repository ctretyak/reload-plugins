# Reload Plugins (Obsidian plugin)

Automatically reload a selected Obsidian plugin on a schedule.

## Features

-   **Auto-reload**: reload a target plugin every N minutes.
-   **Manual reload command**: run **Reload target plugin now** from the command palette.
-   **Reload delay**: optional delay (in seconds) between disable → enable.
-   **Debug mode**: optional logs to the developer console.

## Settings

Open **Settings → Community plugins → Reload Plugins**:

-   **Target plugin**: which plugin to reload.
-   **Reload interval (minutes)**: how often to run the reload loop.
-   **Reload delay (seconds)**: delay between disabling and enabling (useful for plugins that need a short cooldown).
-   **Enabled**: turn scheduled reload on/off.
-   **Debug mode**: log plugin actions to console.

## How it works

On each tick the plugin:

-   Checks whether the target plugin is enabled.
-   If enabled: disables it, waits `reloadDelay`, then enables it.
-   If disabled: just enables it.

## Installation

### Community plugins (recommended)

Once published to the community list: install via **Settings → Community plugins**.

### Manual install (development / testing)

Copy these files into your vault:

`<Vault>/.obsidian/plugins/reload-plugins/`

-   `manifest.json`
-   `main.js`
-   `styles.css` (optional)

Then reload Obsidian and enable **Reload Plugins**.

## Development

Requirements: Node.js (18+ recommended), npm.

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Privacy & security

-   **No network requests**.
-   **No telemetry**.
-   Only interacts with Obsidian’s plugin manager (enable/disable) for the selected plugin.

## Releasing (Obsidian community)

-   Update `manifest.json` version and `versions.json`.
-   Create a GitHub release tag that matches the version (no leading `v`).
-   Attach `manifest.json`, `main.js`, and `styles.css` (if present) as release assets.
-   Follow Obsidian’s plugin submission guide: `https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines`.
