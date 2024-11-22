import { App, Plugin, PluginSettingTab, Setting, TFile, TAbstractFile, Modal, normalizePath } from 'obsidian';
import TamagotchiPlugin from './main';

export interface TamagotchiSettings {
   petName: string;
   jumpHeight: number;
   jumpFrequency: number;
   hungerInterval: number;
   wordCountGoal: number;
   imageSettings: {
       happy: string;
       hungry: string;
       dead: string;
       fed: string;
       annoyed: string;
       tripping: string;
       kissing: string;
       laugh: string;
       heart: string;
       background: string;
   };
}

export const DEFAULT_SETTINGS: TamagotchiSettings = {
   petName: 'Tamagotchi',
   jumpHeight: 30,
   jumpFrequency: 0.002,
   hungerInterval: 12,
   wordCountGoal: 200,
   imageSettings: {
       happy: '',
       hungry: '',
       dead: '',
       fed: '',
       annoyed: '',
       tripping: '',
       kissing: '',
       laugh: '',
       heart: '',
       background: ''
   }
};

export class TamagotchiSettingTab extends PluginSettingTab {
    plugin: TamagotchiPlugin;

    constructor(app: App, plugin: TamagotchiPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    async createImageFileSetting(containerEl: HTMLElement, key: keyof TamagotchiSettings['imageSettings'], name: string, desc: string) {
        let textComponent: any;
        const setting = new Setting(containerEl)
            .setName(name)
            .setDesc(desc)
            .addText(text => {
                textComponent = text;
                return text
                    .setValue(this.plugin.settings.imageSettings[key])
                    .setPlaceholder('Path to image in vault');
            })
            .addButton(button => button
                .setButtonText('Choose')
                .onClick(async () => {
                    const modal = new ImageSelectorModal(this.app, async (file: TFile) => {
                        const path = normalizePath(file.path);
                        this.plugin.settings.imageSettings[key] = path;
                        await this.plugin.saveSettings();
                        textComponent.setValue(path);
                        if (this.plugin.view) {
                            this.plugin.view.updateVisuals();
                        }
                    });
                    modal.open();
                }));
    }

    display(): void {
        const {containerEl} = this;
        containerEl.empty();

        // Original settings
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

        // Image settings section
        containerEl.createEl('h2', {text: 'Pet Images'});
        containerEl.createEl('p', {
            text: 'Select images from your vault for different pet states. Images should be PNG or JPG format.'
        });

        // Create settings for each image type
        this.createImageFileSetting(containerEl, 'happy', 'Happy State Image', 'Image shown when pet is happy');
        this.createImageFileSetting(containerEl, 'hungry', 'Hungry State Image', 'Image shown when pet is hungry');
        this.createImageFileSetting(containerEl, 'dead', 'Dead State Image', 'Image shown when pet dies');
        this.createImageFileSetting(containerEl, 'fed', 'Fed State Image', 'Image shown right after feeding');
        this.createImageFileSetting(containerEl, 'annoyed', 'Annoyed State Image', 'Image shown when pet is annoyed');
        this.createImageFileSetting(containerEl, 'tripping', 'Tripping State Image', 'Image shown when pet is tripping');
        this.createImageFileSetting(containerEl, 'kissing', 'Kissing State Image', 'Image shown when pet is kissing');
        this.createImageFileSetting(containerEl, 'laugh', 'Laughing State Image', 'Image shown when pet is laughing');
        this.createImageFileSetting(containerEl, 'heart', 'Heart Image', 'Image used for score hearts');
        this.createImageFileSetting(containerEl, 'background', 'Background Image', 'Background image for the pet container');

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
