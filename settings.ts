import { App, Plugin, PluginSettingTab, Setting, TFile, TFolder, TAbstractFile, Modal, normalizePath } from 'obsidian';
import TamagotchiPlugin from './main';

export interface TamagotchiSettings {
   petName: string;
   jumpHeight: number;
   jumpFrequency: number;
   hungerInterval: number;
   wordCountGoal: number;
   characterFolder: string;
   backgroundImage: string;
}

export const DEFAULT_SETTINGS: TamagotchiSettings = {
   petName: 'Tamagotchi',
   jumpHeight: 30,
   jumpFrequency: 0.002,
   hungerInterval: 12,
   wordCountGoal: 200,
   characterFolder: '',
   backgroundImage: ''
};

export class TamagotchiSettingTab extends PluginSettingTab {
    plugin: TamagotchiPlugin;

    constructor(app: App, plugin: TamagotchiPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName('Pet Name')
            .setDesc('Name your pet')
            .addText(text => text
                .setValue(this.plugin.settings.petName)
                .onChange(async (value) => {
                    this.plugin.settings.petName = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Word Count Goal')
            .setDesc('Words needed to feed pet')
            .addText(text => text
                .setValue(this.plugin.settings.wordCountGoal.toString())
                .onChange(async (value) => {
                    const numValue = parseInt(value) || 200;
                    this.plugin.settings.wordCountGoal = numValue;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Character Folder')
            .setDesc('Select folder containing character emotion images')
            .addText(text => text
                .setValue(this.plugin.settings.characterFolder)
                .setPlaceholder('Path to character folder'))
            .addButton(button => button
                .setButtonText('Choose')
                .onClick(() => {
                    const modal = new FolderSelectorModal(this.app, async (folderPath: string) => {
                        this.plugin.settings.characterFolder = folderPath;
                        await this.plugin.saveSettings();
                        await this.plugin.loadCharacterImages();
                        if (this.plugin.view) {
                            this.plugin.view.updateVisuals();
                        }
                    });
                    modal.open();
                }));

        new Setting(containerEl)
            .setName('Background Image')
            .setDesc('Select background image')
            .addText(text => text
                .setValue(this.plugin.settings.backgroundImage)
                .setPlaceholder('Path to background image'))
            .addButton(button => button
                .setButtonText('Choose')
                .onClick(() => {
                    const modal = new ImageSelectorModal(this.app, async (file: TFile) => {
                        this.plugin.settings.backgroundImage = file.path;
                        await this.plugin.saveSettings();
                        if (this.plugin.view) {
                            this.plugin.view.updateVisuals();
                        }
                    });
                    modal.open();
                }));
    }
}

class FolderSelectorModal extends Modal {
    onChoose: (folderPath: string) => void;

    constructor(app: App, onChoose: (folderPath: string) => void) {
        super(app);
        this.onChoose = onChoose;
    }

    onOpen() {
        const {contentEl} = this;
        contentEl.empty();

        contentEl.createEl('h2', {text: 'Choose Character Folder'});

        const container = contentEl.createDiv();
        container.style.maxHeight = '400px';
        container.style.overflowY = 'auto';

        const createFolderList = (folder: TFolder, level = 0) => {
            const folderDiv = container.createDiv();
            folderDiv.style.paddingLeft = `${level * 20}px`;
            folderDiv.style.cursor = 'pointer';
            folderDiv.style.padding = '5px';
            folderDiv.style.borderRadius = '4px';
            folderDiv.textContent = folder.name;

            folderDiv.addEventListener('mouseover', () => {
                folderDiv.style.backgroundColor = 'var(--background-modifier-hover)';
            });
            folderDiv.addEventListener('mouseout', () => {
                folderDiv.style.backgroundColor = '';
            });
            folderDiv.addEventListener('click', () => {
                this.onChoose(folder.path);
                this.close();
            });

            folder.children
                .filter(child => child instanceof TFolder)
                .forEach(subfolder => createFolderList(subfolder as TFolder, level + 1));
        };

        const rootFolder = this.app.vault.getRoot();
        createFolderList(rootFolder);
    }

    onClose() {
        const {contentEl} = this;
        contentEl.empty();
    }
}

class ImageSelectorModal extends Modal {
    onChoose: (file: TFile) => void;
    files: TFile[];

    constructor(app: App, onChoose: (file: TFile) => void) {
        super(app);
        this.onChoose = onChoose;
        this.files = this.getImageFiles();
    }

    getImageFiles(): TFile[] {
        return this.app.vault.getFiles().filter(file =>
            file.extension.toLowerCase() === 'png' ||
            file.extension.toLowerCase() === 'jpg' ||
            file.extension.toLowerCase() === 'jpeg'
        );
    }

    onOpen() {
        const {contentEl} = this;
        contentEl.empty();

        contentEl.createEl('h2', {text: 'Choose an Image'});

        const container = contentEl.createDiv('image-grid');
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(100px, 1fr))';
        container.style.gap = '10px';
        container.style.padding = '10px';
        container.style.maxHeight = '400px';
        container.style.overflowY = 'auto';

        for (const file of this.files) {
            const imageContainer = container.createDiv('image-container');
            imageContainer.style.cursor = 'pointer';
            imageContainer.style.border = '1px solid var(--background-modifier-border)';
            imageContainer.style.borderRadius = '4px';
            imageContainer.style.padding = '5px';

            const img = imageContainer.createEl('img', {
                attr: {
                    src: this.app.vault.getResourcePath(file),
                    alt: file.basename
                }
            });
            img.style.width = '100%';
            img.style.height = 'auto';
            img.style.objectFit = 'contain';

            const label = imageContainer.createDiv();
            label.style.textAlign = 'center';
            label.style.fontSize = '0.8em';
            label.style.marginTop = '5px';
            label.textContent = file.basename;

            imageContainer.addEventListener('click', () => {
                this.onChoose(file);
                this.close();
            });
        }
    }

    onClose() {
        const {contentEl} = this;
        contentEl.empty();
    }
}
