// main.ts
import { Plugin, FileStats, Vault, ItemView, WorkspaceLeaf, View, TFile, TFolder, TAbstractFile, Modal } from 'obsidian';
import { TamagotchiSettings, DEFAULT_SETTINGS, TamagotchiSettingTab } from './settings';

const VIEW_TYPE = 'tamagotchi-view';

interface DailyStats {
   date: string;
   startCount: number;
   currentCount: number;
   files: Record<string, {wordCount: number, lastUpdated: number}>;
}

interface TamagotchiData {
   lastFed: number;
   isAlive: boolean;
   name: string;
   score: number;
   direction: 'left' | 'right';
   position: number;
   isJumping: boolean;
   jumpEndTime: number;
   currentMood: string;
   moodEndTime: number;
   hungerLevel: number;
}

interface CharacterImages {
    [key: string]: string;
}

export default class TamagotchiPlugin extends Plugin {
    data: TamagotchiData;
    view: TamagotchiView;
    settings: TamagotchiSettings;
    daily_stats: DailyStats;
    characterImages: CharacterImages = {};


    async loadCharacterImages() {
        try {
            this.characterImages = {};
            console.log("Loading images from folder:", this.settings.characterFolder);

            if (!this.settings.characterFolder) {
                console.log("No character folder path set in settings");
                return;
            }

            const folder = this.app.vault.getAbstractFileByPath(this.settings.characterFolder);
            if (!folder) {
                console.log("Could not find character folder");
                return;
            }

            if (!(folder instanceof TFolder)) {
                console.log("Path exists but is not a folder");
                return;
            }

            const files = folder.children
                .filter(file =>
                    file instanceof TFile &&
                    ['png', 'jpg', 'jpeg'].includes(file.extension.toLowerCase())
                ) as TFile[];

            console.log("Found image files:", files.map(f => f.path));

            for (const file of files) {
                const emotion = file.basename.toLowerCase();
                this.characterImages[emotion] = file.path;
            }
        } catch (error) {
            console.error('Error loading character images:', error);
        }
    }


    async onload() {
        console.log('Loading Tamagotchi plugin');

        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        this.addSettingTab(new TamagotchiSettingTab(this.app, this));

        // Wait for images to load before proceeding
        await this.loadCharacterImages();
        if (Object.keys(this.characterImages).length === 0) {
            console.error('No character images were loaded');
            // Retry once
            await this.loadCharacterImages();
        }

        const savedData = await this.loadData();
        this.data = {
            lastFed: Date.now(),
            isAlive: true,
            name: 'Tamagotchi',
            score: 0,
            direction: 'right',
            position: 125,
            isJumping: false,
            jumpEndTime: 0,
            currentMood: 'happy',
            moodEndTime: 0,
            hungerLevel: 0,
            ...savedData
        };

        this.daily_stats = {
            date: new Date().toDateString(),
            startCount: 0,
            currentCount: 0,
            files: {}
        };

        this.registerView(
            VIEW_TYPE,
            (leaf) => {
                this.view = new TamagotchiView(leaf, this);
                // If no images, trigger load but don't await
                if (Object.keys(this.characterImages).length === 0) {
                    this.loadCharacterImages();
                }
                return this.view;
            }
        );


        this.addRibbonIcon('heart', 'Open Tamagotchi', () => {
            this.activateView();
        });

        await this.checkPetStatus();

        this.registerInterval(
            window.setInterval(() => {
                this.checkPetStatus();
            }, 60000)
        );
    }

    async saveSettings() {
        await this.saveData(this.settings);
        if (this.view) {
            this.view.updateVisuals();
        }
    }

    async activateView() {
        const { workspace } = this.app;

        let leaf: WorkspaceLeaf;
        const leaves = workspace.getLeavesOfType(VIEW_TYPE);

        if (leaves.length > 0) {
            leaf = leaves[0];
        } else {
            leaf = workspace.getRightLeaf(false);
            await leaf.setViewState({ type: VIEW_TYPE });
        }

        workspace.revealLeaf(leaf);
    }

    getCurrentUTCHour(): number {
        return new Date().getUTCHours();
    }

    isHungry(): boolean {
        const currentHour = this.getCurrentUTCHour();
        const lastFedDate = new Date(this.data.lastFed);
        const lastFedDay = lastFedDate.getUTCDate();
        const currentDay = new Date().getUTCDate();

        if ((currentHour >= 8 && currentHour < 16) || currentHour >= 16) {
            if (currentDay > lastFedDay ||
                (currentDay === lastFedDay && lastFedDate.getUTCHours() <
                    (currentHour >= 16 ? 16 : 8))) {
                return true;
            }
        }

        return false;
    }

    async updateDailyStats() {
        const today = new Date().toDateString();
        const files = this.app.vault.getMarkdownFiles();
        let todayTotal = 0;

        for (const file of files) {
            const fileStats = file.stat;
            const todayStart = new Date(today);  // Get start of today
            if (fileStats.mtime > todayStart.getTime()) {
                const content = await this.app.vault.cachedRead(file);
                const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
                todayTotal += wordCount;
            }
        }

        if (this.daily_stats.date !== today) {
            // It's a new day, reset stats
            this.daily_stats = {
                date: today,
                startCount: todayTotal,
                currentCount: todayTotal,
                files: {}
            };
        } else {
            this.daily_stats.currentCount = todayTotal;
        }

        return todayTotal - this.daily_stats.startCount;
    }

    async checkPetStatus() {
        if (this.data.isAlive) {
            const hoursSinceLastFed = (Date.now() - this.data.lastFed) / (1000 * 60 * 60);
            const hungerIncrements = Math.floor(hoursSinceLastFed / this.settings.hungerInterval);

            if (hungerIncrements >= 1) {
                this.data.hungerLevel = hungerIncrements;
                this.data.currentMood = 'hungry';

                if (hungerIncrements >= 2) {
                    this.data.isAlive = false;
                    this.data.currentMood = 'dead';

                    // Immediately update the view when pet dies
                    if (this.view) {
                        await this.view.reopenView();
                    }
                }

                await this.saveData(this.data);
                if (this.view) {
                    this.view.updateVisuals();
                }
            }
        }
    }


    async feedPet() {
        if (this.isHungry()) {
            this.data.lastFed = Date.now();
            this.data.score++;
            this.data.isJumping = true;
            this.data.jumpEndTime = Date.now() + 5000;
            await this.saveData(this.data);
            if (this.view) {
                this.view.updateVisuals();
                this.view.updateScore();
            }
        }
    }

    async resetPet() {
        this.data = {
            lastFed: Date.now(),
            isAlive: true,
            name: this.settings.petName,
            score: 0,
            direction: 'right',
            position: 125,
            isJumping: false,
            jumpEndTime: 0,
            currentMood: 'happy',
            moodEndTime: 0,
            hungerLevel: 0
        };

        this.daily_stats = {
            date: new Date().toDateString(),
            startCount: 0,
            currentCount: 0,
            files: {}
        };

        await this.saveData(this.data);
        if (this.view) {
            await this.view.reopenView();
        }
    }
}

class TamagotchiView extends ItemView {
    plugin: TamagotchiPlugin;
    petEl: HTMLElement | null = null;
    petImg: HTMLImageElement | null = null;
    animationFrame: number;
    statusEl: HTMLElement | null = null;
    scoreEl: HTMLElement | null = null;
    lastPauseTime: number = 0;
    pauseDuration: number = 0;
    lastMoodCheck: number = 0;
    lastJumpCheck: number = 0;
    baseWordCount: number = 0;
    progressBar: HTMLProgressElement | null = null;
    progressLabel: HTMLElement | null = null;

    constructor(leaf: WorkspaceLeaf, plugin: TamagotchiPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string {
        return VIEW_TYPE;
    }

    getDisplayText(): string {
        return "Tamagotchi Pet";
    }

    getIcon(): string {
        return "heart";
    }

    async getImagePath(emotion: string): Promise<string> {
        try {
            const emotionKey = emotion.replace('tamagotchi_', '').replace('.png', '').toLowerCase();
            let imagePath = this.plugin.characterImages[emotionKey];

            if (!imagePath) {
                console.warn(`No image found for ${emotionKey} state`);

                if (this.plugin.data.isAlive === false) {
                    imagePath = this.plugin.characterImages['dead'] ||
                            Object.values(this.plugin.characterImages)[0];
                } else {
                    imagePath = this.plugin.characterImages['happy'] ||
                            Object.values(this.plugin.characterImages)[0];
                }

                if (!imagePath) {
                    console.error('No fallback images available');
                    return '';
                }
            }

            const file = this.app.vault.getAbstractFileByPath(imagePath);
            if (file instanceof TFile) {
                return this.app.vault.getResourcePath(file);
            }
        } catch (error) {
            console.error('Error loading image:', error);
        }
        return '';
    }

    updateScore() {
        if (!this.scoreEl) return;

        this.scoreEl.empty();
        this.scoreEl.addClass('hearts-container');

        for (let i = 0; i < this.plugin.data.score; i++) {
            const heartContainer = this.scoreEl.createDiv('heart-container');
            const heartImg = heartContainer.createEl('img', {
                cls: 'heart-img'
            });

            const heartPath = this.plugin.characterImages['heart'];
            if (heartPath) {
                const file = this.app.vault.getAbstractFileByPath(heartPath);
                if (file instanceof TFile) {
                    heartImg.src = this.app.vault.getResourcePath(file);
                }
            }
        }
    }

    shouldPause(): boolean {
        const now = Date.now();
        if (now - this.lastPauseTime > (this.pauseDuration + 1000)) {
            if (Math.random() < 0.15) {
                this.lastPauseTime = now;
                this.pauseDuration = Math.random() * 4000 + 500;
                return true;
            }
        }
        return now - this.lastPauseTime < this.pauseDuration;
    }

    checkRandomMood() {
        const now = Date.now();
        if (now - this.lastMoodCheck > (15000 + Math.random() * 20000)) {
            this.lastMoodCheck = now;
            if (Math.random() < 0.4 && !this.plugin.data.isJumping && this.plugin.data.currentMood === 'happy') {
                const moods = ['annoyed', 'tripping', 'kissing', 'laugh'];
                const newMood = moods[Math.floor(Math.random() * moods.length)];
                this.plugin.data.currentMood = newMood;
                this.plugin.data.moodEndTime = now + 2000;
                this.updateVisuals();
            }
        }
    }

    checkRandomJump() {
        const now = Date.now();
        if (now - this.lastJumpCheck > (18000 + Math.random() * 42000)) {
            this.lastJumpCheck = now;
            if (Math.random() < 0.35 && !this.plugin.data.isJumping && this.plugin.data.currentMood === 'happy') {
                this.plugin.data.isJumping = true;
                this.plugin.data.jumpEndTime = now + 1500;
            }
        }
    }

    checkRandomTurn() {
        if (Math.random() < 0.01) {
            this.plugin.data.direction = this.plugin.data.direction === 'left' ? 'right' : 'left';
            if (this.petEl) {
                if (this.plugin.data.direction === 'left') {
                    this.petEl.classList.add('flip-left');
                } else {
                    this.petEl.classList.remove('flip-left');
                }
            }
        }
    }

    startAnimation() {
        if (!this.petEl) return;

        const animate = () => {
            if (this.petEl && this.plugin.data.isAlive) {
                const now = Date.now();

                this.checkRandomMood();
                this.checkRandomJump();

                if (this.plugin.data.isJumping && now < this.plugin.data.jumpEndTime) {
                    const baseBottom = 20;
                    const progress = (now - (this.plugin.data.jumpEndTime - 5000)) / 5000;
                    const jumpHeight = Math.abs(Math.sin(progress * Math.PI * 6)) * 30;
                    this.petEl.style.bottom = `${baseBottom + jumpHeight}px`;
                } else if (this.plugin.data.isJumping) {
                    this.plugin.data.isJumping = false;
                    this.petEl.style.bottom = '20px';
                }

                if (now > this.plugin.data.moodEndTime && this.plugin.data.currentMood !== 'happy') {
                    this.plugin.data.currentMood = 'happy';
                    this.updateVisuals();
                }

                if (!this.shouldPause()) {
                    this.checkRandomTurn();

                    if (this.plugin.data.direction === 'right') {
                        this.plugin.data.position += 0.5;
                        if (this.plugin.data.position > 230) {
                            this.plugin.data.position = 230;
                            this.plugin.data.direction = 'left';
                            this.petEl.classList.add('flip-left');
                        }
                    } else {
                        this.plugin.data.position -= 0.5;
                        if (this.plugin.data.position < 0) {
                            this.plugin.data.position = 0;
                            this.plugin.data.direction = 'right';
                            this.petEl.classList.remove('flip-left');
                        }
                    }
                    this.petEl.style.left = `${this.plugin.data.position}px`;
                }
            }

            this.animationFrame = requestAnimationFrame(animate);
        };

        animate();
    }

    async onOpen() {
        if (Object.keys(this.plugin.characterImages).length === 0) {
            await this.plugin.loadCharacterImages();
        }

        const container = this.containerEl.children[1];
        container.empty();
        container.addClass('tamagotchi-container');

        const petContainer = container.createDiv('tamagotchi-pet-container');
        const backgroundPath = this.plugin.settings.backgroundImage;
        if (backgroundPath) {
            const file = this.app.vault.getAbstractFileByPath(backgroundPath);
            if (file instanceof TFile) {
                const backgroundUrl = this.app.vault.getResourcePath(file);
                petContainer.style.backgroundImage = `url('${backgroundUrl}')`;
                petContainer.style.backgroundSize = 'cover';
                petContainer.style.backgroundPosition = 'center';
            }
        }

        this.scoreEl = container.createDiv('hearts-container');
        this.updateScore();

        this.petEl = petContainer.createDiv('tamagotchi-pet');
        this.petImg = this.petEl.createEl('img', {
            cls: 'tamagotchi-pet-img'
        });

        // Add status element
        // this.statusEl = container.createDiv('tamagotchi-status');

        const initialState = !this.plugin.data.isAlive ? 'dead' : 'happy';
        const initialDataUrl = await this.getImagePath(initialState);
        if (initialDataUrl) {
            this.petImg.src = initialDataUrl;
        }

        const controls = container.createDiv('tamagotchi-controls');
        if (!this.plugin.data.isAlive) {
            const restartButton = controls.createEl('button', { text: 'Restart' });
            restartButton.onclick = () => this.plugin.resetPet();
        }

        const progressContainer = container.createDiv('progress-container');
        this.progressBar = progressContainer.createEl('progress', {
            cls: 'writing-progress',
            attr: { max: this.plugin.settings.wordCountGoal, value: '0' }
        });
        this.progressBar.style.width = '100%';
        this.progressLabel = progressContainer.createDiv('progress-label');

        // Initialize base word count
        const initialWords = await this.plugin.updateDailyStats();
        this.baseWordCount = initialWords;

        const updateProgress = async () => {
            if (!this.progressBar || !this.progressLabel) return;

            try {
                const activeFile = this.app.workspace.getActiveFile();
                if (activeFile) {
                    const dailyWords = await this.plugin.updateDailyStats();
                    const progress = Math.max(0, dailyWords - this.baseWordCount);

                    console.log('Current progress:', {
                        dailyWords,
                        baseWordCount: this.baseWordCount,
                        progress
                    });

                    this.progressBar.value = progress;
                    this.progressBar.classList.remove('complete');
                    this.progressLabel.textContent = `${progress}/${this.plugin.settings.wordCountGoal} words`;

                    if (progress >= this.plugin.settings.wordCountGoal && this.plugin.isHungry()) {
                        await this.plugin.feedPet();
                        this.baseWordCount = dailyWords; // Reset base after feeding
                        this.progressBar.classList.add('complete');
                        this.progressLabel.textContent = "Tamagotchi has been fed!";

                        // Update pet's mood immediately
                        this.plugin.data.currentMood = 'fed';
                        await this.updateVisuals();

                        setTimeout(async () => {
                            if (this.progressBar && this.progressLabel) {
                                this.progressLabel.textContent = `0/${this.plugin.settings.wordCountGoal} words`;
                                this.progressBar.value = 0;
                                this.progressBar.classList.remove('complete');
                            }
                            if (this.plugin.data.isAlive) {
                                this.plugin.data.currentMood = 'happy';
                                await this.updateVisuals();
                            }
                        }, 5000);
                    }
                }
            } catch (error) {
                console.error('Error updating progress:', error);
            }
        };

        // Register events for updates
        this.registerInterval(
            window.setInterval(() => {
                this.updateVisuals();
            }, 1000)
        );

        this.registerEvent(
            this.app.workspace.on("editor-change", updateProgress)
        );
        this.registerEvent(
            this.app.vault.on("modify", updateProgress)
        );

        await updateProgress();
        this.startAnimation();
        await this.updateVisuals();
    }

    async reopenView() {
        await this.onOpen();
    }

    async updateVisuals() {
        if (!this.petImg || !this.statusEl) return;

        try {
            let stateKey = 'happy';
            let status = `${this.plugin.data.name} is happy 😊`;

            if (!this.plugin.data.isAlive) {
                stateKey = 'dead';
                status = `${this.plugin.data.name} is no longer with us 😢`;
            } else if (this.plugin.data.currentMood === 'hungry' || this.plugin.isHungry()) {
                stateKey = 'hungry';
                status = `${this.plugin.data.name} is hungry 🍽`;
            } else if (this.plugin.data.currentMood === 'fed') {
                stateKey = 'fed';
                status = `${this.plugin.data.name} is eating 😋`;
            } else {
                stateKey = this.plugin.data.currentMood;
                status = `${this.plugin.data.name} is ${this.plugin.data.currentMood} 😊`;
            }

            const imagePath = await this.getImagePath(stateKey);
            if (imagePath) {
                this.petImg.src = imagePath;
            }

            this.statusEl.textContent = status;
        } catch (error) {
            console.error('Error updating visuals:', error);
        }
    }

    async onClose() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}
