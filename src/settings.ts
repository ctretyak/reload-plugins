import { App, DropdownComponent, PluginSettingTab, Setting } from "obsidian";
import ReloadPluginsPlugin from "./main";

// eslint-disable-next-line obsidianmd/sample-names
export interface ReloadPluginsSettings {
	targetPluginId: string;
	reloadInterval: number;
	reloadDelay: number;
	enabled: boolean;
	debugMode: boolean;
}

// eslint-disable-next-line obsidianmd/sample-names
export const DEFAULT_SETTINGS: ReloadPluginsSettings = {
	targetPluginId: "",
	reloadInterval: 1,
	reloadDelay: 0.1,
	enabled: false,
	debugMode: false,
};

export class ReloadPluginsSettingTab extends PluginSettingTab {
	plugin: ReloadPluginsPlugin;

	constructor(app: App, plugin: ReloadPluginsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		// @ts-expect-error - plugins.plugins exists but not in type definitions
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
		const plugins = Object.keys(this.app.plugins.plugins || {}).filter(
			(id: string) => id !== "reload-plugins"
		);

		new Setting(containerEl)
			.setName("Target plugin")
			.setDesc("Select the plugin to reload")
			.addDropdown((dropdown: DropdownComponent) => {
				dropdown.addOption("", "None");
				plugins.forEach((id: string) => {
					// @ts-expect-error - plugins.plugins exists but not in type definitions
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
					const plugin = this.app.plugins.plugins?.[id];
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
					const name = plugin?.manifest?.name || id;
					// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
					dropdown.addOption(id, name);
				});
				dropdown.setValue(this.plugin.settings.targetPluginId);
				dropdown.onChange(async (value) => {
					this.plugin.settings.targetPluginId = value;
					await this.plugin.saveSettings();
					this.plugin.restartReloadInterval();
				});
			});

		new Setting(containerEl)
			.setName("Reload interval (minutes)")
			.setDesc("How often to reload the target plugin")
			.addText((text) =>
				text
					.setPlaceholder("1")
					.setValue(this.plugin.settings.reloadInterval.toString())
					.onChange(async (value) => {
						const numValue = parseInt(value);
						if (!isNaN(numValue) && numValue > 0) {
							this.plugin.settings.reloadInterval = numValue;
							await this.plugin.saveSettings();
							this.plugin.restartReloadInterval();
						}
					})
			);

		new Setting(containerEl)
			.setName("Reload delay (seconds)")
			.setDesc("Delay between disabling and enabling the plugin")
			.addText((text) =>
				text
					.setPlaceholder("0.1")
					.setValue(this.plugin.settings.reloadDelay.toString())
					.onChange(async (value) => {
						const numValue = parseFloat(value);
						if (!isNaN(numValue) && numValue >= 0) {
							this.plugin.settings.reloadDelay = numValue;
							await this.plugin.saveSettings();
						}
					})
			);

		new Setting(containerEl)
			.setName("Enabled")
			.setDesc("Enable automatic plugin reloading")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enabled)
					.onChange(async (value) => {
						this.plugin.settings.enabled = value;
						await this.plugin.saveSettings();
						this.plugin.restartReloadInterval();
					})
			);

		new Setting(containerEl)
			.setName("Debug mode")
			.setDesc("Output debug information to console")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.debugMode)
					.onChange(async (value) => {
						this.plugin.settings.debugMode = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
