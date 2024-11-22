import { Plugin, FileStats, Vault, ItemView, WorkspaceLeaf, View, TFile, TAbstractFile, Modal } from 'obsidian';
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

export default class TamagotchiPlugin extends Plugin {
    data: TamagotchiData;
    view: TamagotchiView;
    settings: TamagotchiSettings;
    daily_stats: DailyStats;

    async onload() {
        console.log('Loading Tamagotchi plugin');

        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        this.addSettingTab(new TamagotchiSettingTab(this.app, this));

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
            (leaf) => (this.view = new TamagotchiView(leaf, this))
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
    };


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

        // If it's past 8 UTC or 16 UTC, check if we've been fed today after that time
        if ((currentHour >= 8 && currentHour < 16) || currentHour >= 16) {
            // If we're in a different day or fed before the current period
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
            if (fileStats.mtime > new Date(today).getTime()) {
                const content = await this.app.vault.cachedRead(file);
                const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
                todayTotal += wordCount;
            }
        }

        if (this.daily_stats.date !== today) {
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
           }

           await this.saveData(this.data);
           if (this.view) {
               this.view.updateVisuals();
           }
       }
   }
}

    // Add jump animation on feed
    async feedPet() {
        if (this.isHungry()) {
            this.data.lastFed = Date.now();
            this.data.score++; // Only increment score on successful feed
            this.data.isJumping = true;
            this.data.jumpEndTime = Date.now() + 5000; // 5 second jump duration
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
            position: 125, // Center position
            isJumping: false,
            jumpEndTime: 0,
            currentMood: 'happy',
            moodEndTime: 0,
            hungerLevel: 0
        };

        // Reset daily stats
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

    updateScore() {
        if (!this.scoreEl) return;

        this.scoreEl.empty();
        this.scoreEl.addClass('hearts-container');

        for (let i = 0; i < this.plugin.data.score; i++) {
            const heartContainer = this.scoreEl.createDiv('heart-container');
            const heartImg = heartContainer.createEl('img', {
                cls: 'heart-img'
            });

            const heartPath = this.plugin.settings.imageSettings.heart;
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
                    const progress = (now - (this.plugin.data.jumpEndTime - 5000)) / 5000; // 0 to 1
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

    async getImagePath(imageName: string): Promise<string> {
        const imageSettings = this.plugin.settings.imageSettings;
        const imageKey = imageName.replace('tamagotchi_', '').replace('.png', '') as keyof typeof imageSettings;
        const imagePath = imageSettings[imageKey];

        if (!imagePath) {
            console.warn(`No image set for ${imageKey} state`);
            return '';
        }

        try {
            const file = this.app.vault.getAbstractFileByPath(imagePath);
            if (file instanceof TFile) {
                return this.app.vault.getResourcePath(file);
            }
        } catch (error) {
            console.error('Error loading image:', error);
        }
        return '';
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        container.addClass('tamagotchi-container');

        const petContainer = container.createDiv('tamagotchi-pet-container');
        const backgroundPath = this.plugin.settings.imageSettings.background;
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

        const initialDataUrl = await this.getImagePath('tamagotchi_happy.png');
        if (initialDataUrl) {
            this.petImg.src = initialDataUrl;
        }

        this.statusEl = container.createDiv('tamagotchi-status');

        const controls = container.createDiv('tamagotchi-controls');
        const feedButton = controls.createEl('button', { text: 'Feed' });
        feedButton.onclick = () => this.plugin.feedPet();

        if (!this.plugin.data.isAlive) {
            const restartButton = controls.createEl('button', { text: 'Restart' });
            restartButton.onclick = () => this.plugin.resetPet();
        }

        const progressContainer = container.createDiv('progress-container');
        const progressBar = progressContainer.createEl('progress', {
            cls: 'writing-progress',
            attr: { max: this.plugin.settings.wordCountGoal, value: '0' }
        });
        progressBar.style.width = '100%';
        const progressLabel = progressContainer.createDiv('progress-label');

        let baseWordCount = 0;
        const updateProgress = async () => {
            const activeFile = this.app.workspace.getActiveFile();
            if (activeFile) {
                if (this.plugin.isHungry()) {
                    const dailyWords = await this.plugin.updateDailyStats();
                    if (!baseWordCount) baseWordCount = dailyWords;
                    const progress = Math.min(dailyWords - baseWordCount, this.plugin.settings.wordCountGoal);
                    progressBar.value = progress;
                    progressBar.classList.remove('complete');
                    progressLabel.textContent = `${progress}/${this.plugin.settings.wordCountGoal} words`;

                    if (progress >= this.plugin.settings.wordCountGoal) {
                        await this.plugin.feedPet();
                        baseWordCount = 0;
                        progressBar.classList.add('complete');
                        progressLabel.textContent = "Tamagotchi has been fed!";
                        setTimeout(() => {
                            progressLabel.textContent = `${Math.max(0, this.plugin.settings.wordCountGoal)}/${this.plugin.settings.wordCountGoal} words`;
                        }, 5000);
                    }
                } else {
                    progressBar.value = this.plugin.settings.wordCountGoal;
                    progressBar.classList.add('complete');
                    progressLabel.textContent = `${this.plugin.settings.wordCountGoal}/${this.plugin.settings.wordCountGoal} words`;
                }
            }
        };

        this.registerEvent(
            this.app.workspace.on("editor-change", updateProgress)
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

        let stateKey: keyof TamagotchiSettings['imageSettings'] = 'happy';
        let status = `${this.plugin.data.name} is happy 😊`;

        if (!this.plugin.data.isAlive) {
            stateKey = 'dead';
            status = `${this.plugin.data.name} is no longer with us 😢`;
        } else if (this.plugin.data.currentMood === 'hungry' || this.plugin.isHungry()) {
            stateKey = 'hungry';
        } else if (Date.now() - this.plugin.data.lastFed < 5000) {
            stateKey = 'fed';
            setTimeout(() => {
                this.plugin.data.currentMood = 'happy';
                this.updateVisuals();
            }, 5000);
        } else if (this.plugin.data.currentMood !== 'happy') {
            // Validate that currentMood is a valid key
            const isValidMood = (mood: string): mood is keyof TamagotchiSettings['imageSettings'] => {
                return mood in this.plugin.settings.imageSettings;
            };

            if (isValidMood(this.plugin.data.currentMood)) {
                stateKey = this.plugin.data.currentMood;
            }
        }

        const imagePath = this.plugin.settings.imageSettings[stateKey];
        if (imagePath) {
            const file = this.app.vault.getAbstractFileByPath(imagePath);
            if (file instanceof TFile) {
                this.petImg.src = this.app.vault.getResourcePath(file);
            }
        }

        //if (this.statusEl instanceof HTMLElement) {
        //    this.statusEl.textContent = status;
        //}
    }

    async onClose() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}
