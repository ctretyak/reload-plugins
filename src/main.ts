import { Notice, Plugin } from "obsidian";
import {
	// eslint-disable-next-line obsidianmd/sample-names
	DEFAULT_SETTINGS,
	// eslint-disable-next-line obsidianmd/sample-names
	ReloadPluginsSettings,
	// eslint-disable-next-line obsidianmd/sample-names
	ReloadPluginsSettingTab,
} from "./settings";

export default class ReloadPluginsPlugin extends Plugin {
	settings: ReloadPluginsSettings;
	private reloadIntervalId: number | null = null;

	async onload() {
		await this.loadSettings();

		this.debugLog("Plugin loaded", {
			targetPluginId: this.settings.targetPluginId,
			reloadInterval: this.settings.reloadInterval,
			reloadDelay: this.settings.reloadDelay,
			enabled: this.settings.enabled,
		});

		this.addSettingTab(new ReloadPluginsSettingTab(this.app, this));

		this.addCommand({
			id: "reload-target-plugin",
			name: "Reload target plugin now",
			callback: () => {
				void this.reloadTargetPlugin();
			},
		});

		this.restartReloadInterval();
	}

	onunload() {
		this.debugLog("Plugin unloading");
		this.stopReloadInterval();
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<ReloadPluginsSettings>
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	restartReloadInterval() {
		this.stopReloadInterval();

		if (!this.settings.enabled || !this.settings.targetPluginId) {
			this.debugLog("Interval not started", {
				enabled: this.settings.enabled,
				targetPluginId: this.settings.targetPluginId,
			});
			return;
		}

		const intervalMs = this.settings.reloadInterval * 60 * 1000;
		this.reloadIntervalId = window.setInterval(() => {
			void this.reloadTargetPlugin();
		}, intervalMs);

		// Required for proper cleanup when plugin is disabled
		// eslint-disable-next-line obsidianmd/no-sample-code
		this.registerInterval(this.reloadIntervalId);
		this.debugLog("Reload interval started", {
			intervalMs,
			intervalMinutes: this.settings.reloadInterval,
			targetPluginId: this.settings.targetPluginId,
		});
	}

	stopReloadInterval() {
		if (this.reloadIntervalId !== null) {
			window.clearInterval(this.reloadIntervalId);
			this.debugLog("Reload interval stopped");
			this.reloadIntervalId = null;
		}
	}

	// eslint-disable-next-line obsidianmd/sample-names
	debugLog(message: string, data?: Record<string, unknown>) {
		if (this.settings.debugMode) {
			const logData = data ? ` ${JSON.stringify(data)}` : "";
			// eslint-disable-next-line no-console, obsidianmd/no-sample-code
			console.log(`[Reload Plugins] ${message}${logData}`);
		}
	}

	async reloadTargetPlugin() {
		if (!this.settings.targetPluginId) {
			this.debugLog("Reload skipped: no target plugin ID");
			return;
		}

		this.debugLog("Starting plugin reload", {
			targetPluginId: this.settings.targetPluginId,
		});

		// @ts-expect-error - plugins.enabledPlugins exists but not in type definitions
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		const enabledPlugins = this.app.plugins.enabledPlugins as
			| Set<string>
			| undefined;
		const isEnabled =
			enabledPlugins?.has(this.settings.targetPluginId) ?? false;

		this.debugLog("Plugin status check", {
			targetPluginId: this.settings.targetPluginId,
			isEnabled,
		});

		try {
			if (isEnabled) {
				this.debugLog("Disabling plugin", {
					targetPluginId: this.settings.targetPluginId,
				});
				// @ts-expect-error - disablePlugin exists but not in type definitions
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
				await this.app.plugins.disablePlugin(
					this.settings.targetPluginId
				);
				this.debugLog("Plugin disabled", {
					targetPluginId: this.settings.targetPluginId,
				});

				if (this.settings.reloadDelay > 0) {
					const delayMs = this.settings.reloadDelay * 1000;
					this.debugLog("Waiting delay", {
						delaySeconds: this.settings.reloadDelay,
						delayMs,
					});
					await new Promise<void>((resolve) => {
						window.setTimeout(resolve, delayMs);
					});
					this.debugLog("Delay completed");
				}
			}

			this.debugLog("Enabling plugin", {
				targetPluginId: this.settings.targetPluginId,
			});
			// @ts-expect-error - enablePlugin exists but not in type definitions
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
			await this.app.plugins.enablePlugin(this.settings.targetPluginId);
			this.debugLog("Plugin reload completed", {
				targetPluginId: this.settings.targetPluginId,
			});
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			this.debugLog("Plugin reload failed", {
				targetPluginId: this.settings.targetPluginId,
				error: errorMessage,
			});
			new Notice(`Failed to reload plugin: ${errorMessage}`);
		}
	}
}
