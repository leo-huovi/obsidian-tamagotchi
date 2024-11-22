var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => TamagotchiPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian2 = require("obsidian");

// settings.ts
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  petName: "Tamagotchi",
  jumpHeight: 30,
  jumpFrequency: 2e-3,
  hungerInterval: 12,
  wordCountGoal: 200,
  imageSettings: {
    happy: "",
    hungry: "",
    dead: "",
    fed: "",
    annoyed: "",
    tripping: "",
    kissing: "",
    laugh: "",
    heart: "",
    background: ""
  }
};
var TamagotchiSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  createImageFileSetting(containerEl, key, name, desc) {
    return __async(this, null, function* () {
      let textComponent;
      const setting = new import_obsidian.Setting(containerEl).setName(name).setDesc(desc).addText((text) => {
        textComponent = text;
        return text.setValue(this.plugin.settings.imageSettings[key]).setPlaceholder("Path to image in vault");
      }).addButton((button) => button.setButtonText("Choose").onClick(() => __async(this, null, function* () {
        const modal = new ImageSelectorModal(this.app, (file) => __async(this, null, function* () {
          const path = (0, import_obsidian.normalizePath)(file.path);
          this.plugin.settings.imageSettings[key] = path;
          yield this.plugin.saveSettings();
          textComponent.setValue(path);
          if (this.plugin.view) {
            this.plugin.view.updateVisuals();
          }
        }));
        modal.open();
      })));
    });
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName("Word Count Goal").setDesc("Words needed to feed pet").addText((text) => text.setValue(this.plugin.settings.wordCountGoal.toString()).onChange((value) => __async(this, null, function* () {
      const numValue = parseInt(value) || 200;
      this.plugin.settings.wordCountGoal = numValue;
      yield this.plugin.saveSettings();
    })));
    containerEl.createEl("h2", { text: "Pet Images" });
    containerEl.createEl("p", {
      text: "Select images from your vault for different pet states. Images should be PNG or JPG format."
    });
    this.createImageFileSetting(containerEl, "happy", "Happy State Image", "Image shown when pet is happy");
    this.createImageFileSetting(containerEl, "hungry", "Hungry State Image", "Image shown when pet is hungry");
    this.createImageFileSetting(containerEl, "dead", "Dead State Image", "Image shown when pet dies");
    this.createImageFileSetting(containerEl, "fed", "Fed State Image", "Image shown right after feeding");
    this.createImageFileSetting(containerEl, "annoyed", "Annoyed State Image", "Image shown when pet is annoyed");
    this.createImageFileSetting(containerEl, "tripping", "Tripping State Image", "Image shown when pet is tripping");
    this.createImageFileSetting(containerEl, "kissing", "Kissing State Image", "Image shown when pet is kissing");
    this.createImageFileSetting(containerEl, "laugh", "Laughing State Image", "Image shown when pet is laughing");
    this.createImageFileSetting(containerEl, "heart", "Heart Image", "Image used for score hearts");
    this.createImageFileSetting(containerEl, "background", "Background Image", "Background image for the pet container");
  }
};
var ImageSelectorModal = class extends import_obsidian.Modal {
  constructor(app, onChoose) {
    super(app);
    this.onChoose = onChoose;
    this.files = this.getImageFiles();
  }
  getImageFiles() {
    return this.app.vault.getFiles().filter(
      (file) => file.extension.toLowerCase() === "png" || file.extension.toLowerCase() === "jpg" || file.extension.toLowerCase() === "jpeg"
    );
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Choose an Image" });
    const container = contentEl.createDiv("image-grid");
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(auto-fill, minmax(100px, 1fr))";
    container.style.gap = "10px";
    container.style.padding = "10px";
    container.style.maxHeight = "400px";
    container.style.overflowY = "auto";
    for (const file of this.files) {
      const imageContainer = container.createDiv("image-container");
      imageContainer.style.cursor = "pointer";
      imageContainer.style.border = "1px solid var(--background-modifier-border)";
      imageContainer.style.borderRadius = "4px";
      imageContainer.style.padding = "5px";
      const img = imageContainer.createEl("img", {
        attr: {
          src: this.app.vault.getResourcePath(file),
          alt: file.basename
        }
      });
      img.style.width = "100%";
      img.style.height = "auto";
      img.style.objectFit = "contain";
      const label = imageContainer.createDiv();
      label.style.textAlign = "center";
      label.style.fontSize = "0.8em";
      label.style.marginTop = "5px";
      label.textContent = file.basename;
      imageContainer.addEventListener("click", () => {
        this.onChoose(file);
        this.close();
      });
    }
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
};

// main.ts
var VIEW_TYPE = "tamagotchi-view";
var TamagotchiPlugin = class extends import_obsidian2.Plugin {
  onload() {
    return __async(this, null, function* () {
      console.log("Loading Tamagotchi plugin");
      this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
      this.addSettingTab(new TamagotchiSettingTab(this.app, this));
      const savedData = yield this.loadData();
      this.data = __spreadValues({
        lastFed: Date.now(),
        isAlive: true,
        name: "Tamagotchi",
        score: 0,
        direction: "right",
        position: 125,
        isJumping: false,
        jumpEndTime: 0,
        currentMood: "happy",
        moodEndTime: 0,
        hungerLevel: 0
      }, savedData);
      this.daily_stats = {
        date: new Date().toDateString(),
        startCount: 0,
        currentCount: 0,
        files: {}
      };
      this.registerView(
        VIEW_TYPE,
        (leaf) => this.view = new TamagotchiView(leaf, this)
      );
      this.addRibbonIcon("heart", "Open Tamagotchi", () => {
        this.activateView();
      });
      yield this.checkPetStatus();
      this.registerInterval(
        window.setInterval(() => {
          this.checkPetStatus();
        }, 6e4)
      );
    });
  }
  saveSettings() {
    return __async(this, null, function* () {
      yield this.saveData(this.settings);
      if (this.view) {
        this.view.updateVisuals();
      }
    });
  }
  activateView() {
    return __async(this, null, function* () {
      const { workspace } = this.app;
      let leaf;
      const leaves = workspace.getLeavesOfType(VIEW_TYPE);
      if (leaves.length > 0) {
        leaf = leaves[0];
      } else {
        leaf = workspace.getRightLeaf(false);
        yield leaf.setViewState({ type: VIEW_TYPE });
      }
      workspace.revealLeaf(leaf);
    });
  }
  getCurrentUTCHour() {
    return new Date().getUTCHours();
  }
  isHungry() {
    const currentHour = this.getCurrentUTCHour();
    const lastFedDate = new Date(this.data.lastFed);
    const lastFedDay = lastFedDate.getUTCDate();
    const currentDay = new Date().getUTCDate();
    if (currentHour >= 8 && currentHour < 16 || currentHour >= 16) {
      if (currentDay > lastFedDay || currentDay === lastFedDay && lastFedDate.getUTCHours() < (currentHour >= 16 ? 16 : 8)) {
        return true;
      }
    }
    return false;
  }
  updateDailyStats() {
    return __async(this, null, function* () {
      const today = new Date().toDateString();
      const files = this.app.vault.getMarkdownFiles();
      let todayTotal = 0;
      for (const file of files) {
        const fileStats = file.stat;
        if (fileStats.mtime > new Date(today).getTime()) {
          const content = yield this.app.vault.cachedRead(file);
          const wordCount = content.split(/\s+/).filter((word) => word.length > 0).length;
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
    });
  }
  checkPetStatus() {
    return __async(this, null, function* () {
      if (this.data.isAlive) {
        const hoursSinceLastFed = (Date.now() - this.data.lastFed) / (1e3 * 60 * 60);
        const hungerIncrements = Math.floor(hoursSinceLastFed / this.settings.hungerInterval);
        if (hungerIncrements >= 1) {
          this.data.hungerLevel = hungerIncrements;
          this.data.currentMood = "hungry";
          if (hungerIncrements >= 2) {
            this.data.isAlive = false;
            this.data.currentMood = "dead";
          }
          yield this.saveData(this.data);
          if (this.view) {
            this.view.updateVisuals();
          }
        }
      }
    });
  }
  // Add jump animation on feed
  feedPet() {
    return __async(this, null, function* () {
      if (this.isHungry()) {
        this.data.lastFed = Date.now();
        this.data.score++;
        this.data.isJumping = true;
        this.data.jumpEndTime = Date.now() + 5e3;
        yield this.saveData(this.data);
        if (this.view) {
          this.view.updateVisuals();
          this.view.updateScore();
        }
      }
    });
  }
  resetPet() {
    return __async(this, null, function* () {
      this.data = {
        lastFed: Date.now(),
        isAlive: true,
        name: this.settings.petName,
        score: 0,
        direction: "right",
        position: 125,
        // Center position
        isJumping: false,
        jumpEndTime: 0,
        currentMood: "happy",
        moodEndTime: 0,
        hungerLevel: 0
      };
      this.daily_stats = {
        date: new Date().toDateString(),
        startCount: 0,
        currentCount: 0,
        files: {}
      };
      yield this.saveData(this.data);
      if (this.view) {
        yield this.view.reopenView();
      }
    });
  }
};
var TamagotchiView = class extends import_obsidian2.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.petEl = null;
    this.petImg = null;
    this.statusEl = null;
    this.scoreEl = null;
    this.lastPauseTime = 0;
    this.pauseDuration = 0;
    this.lastMoodCheck = 0;
    this.lastJumpCheck = 0;
    this.plugin = plugin;
  }
  getViewType() {
    return VIEW_TYPE;
  }
  getDisplayText() {
    return "Tamagotchi Pet";
  }
  getIcon() {
    return "heart";
  }
  updateScore() {
    if (!this.scoreEl)
      return;
    this.scoreEl.empty();
    this.scoreEl.addClass("hearts-container");
    for (let i = 0; i < this.plugin.data.score; i++) {
      const heartContainer = this.scoreEl.createDiv("heart-container");
      const heartImg = heartContainer.createEl("img", {
        cls: "heart-img"
      });
      const heartPath = this.plugin.settings.imageSettings.heart;
      if (heartPath) {
        const file = this.app.vault.getAbstractFileByPath(heartPath);
        if (file instanceof import_obsidian2.TFile) {
          heartImg.src = this.app.vault.getResourcePath(file);
        }
      }
    }
  }
  shouldPause() {
    const now = Date.now();
    if (now - this.lastPauseTime > this.pauseDuration + 1e3) {
      if (Math.random() < 0.15) {
        this.lastPauseTime = now;
        this.pauseDuration = Math.random() * 4e3 + 500;
        return true;
      }
    }
    return now - this.lastPauseTime < this.pauseDuration;
  }
  checkRandomMood() {
    const now = Date.now();
    if (now - this.lastMoodCheck > 15e3 + Math.random() * 2e4) {
      this.lastMoodCheck = now;
      if (Math.random() < 0.4 && !this.plugin.data.isJumping && this.plugin.data.currentMood === "happy") {
        const moods = ["annoyed", "tripping", "kissing", "laugh"];
        const newMood = moods[Math.floor(Math.random() * moods.length)];
        this.plugin.data.currentMood = newMood;
        this.plugin.data.moodEndTime = now + 2e3;
        this.updateVisuals();
      }
    }
  }
  checkRandomJump() {
    const now = Date.now();
    if (now - this.lastJumpCheck > 18e3 + Math.random() * 42e3) {
      this.lastJumpCheck = now;
      if (Math.random() < 0.35 && !this.plugin.data.isJumping && this.plugin.data.currentMood === "happy") {
        this.plugin.data.isJumping = true;
        this.plugin.data.jumpEndTime = now + 1500;
      }
    }
  }
  checkRandomTurn() {
    if (Math.random() < 0.01) {
      this.plugin.data.direction = this.plugin.data.direction === "left" ? "right" : "left";
      if (this.petEl) {
        if (this.plugin.data.direction === "left") {
          this.petEl.classList.add("flip-left");
        } else {
          this.petEl.classList.remove("flip-left");
        }
      }
    }
  }
  startAnimation() {
    if (!this.petEl)
      return;
    const animate = () => {
      if (this.petEl && this.plugin.data.isAlive) {
        const now = Date.now();
        this.checkRandomMood();
        this.checkRandomJump();
        if (this.plugin.data.isJumping && now < this.plugin.data.jumpEndTime) {
          const baseBottom = 20;
          const progress = (now - (this.plugin.data.jumpEndTime - 5e3)) / 5e3;
          const jumpHeight = Math.abs(Math.sin(progress * Math.PI * 6)) * 30;
          this.petEl.style.bottom = `${baseBottom + jumpHeight}px`;
        } else if (this.plugin.data.isJumping) {
          this.plugin.data.isJumping = false;
          this.petEl.style.bottom = "20px";
        }
        if (now > this.plugin.data.moodEndTime && this.plugin.data.currentMood !== "happy") {
          this.plugin.data.currentMood = "happy";
          this.updateVisuals();
        }
        if (!this.shouldPause()) {
          this.checkRandomTurn();
          if (this.plugin.data.direction === "right") {
            this.plugin.data.position += 0.5;
            if (this.plugin.data.position > 230) {
              this.plugin.data.position = 230;
              this.plugin.data.direction = "left";
              this.petEl.classList.add("flip-left");
            }
          } else {
            this.plugin.data.position -= 0.5;
            if (this.plugin.data.position < 0) {
              this.plugin.data.position = 0;
              this.plugin.data.direction = "right";
              this.petEl.classList.remove("flip-left");
            }
          }
          this.petEl.style.left = `${this.plugin.data.position}px`;
        }
      }
      this.animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }
  getImagePath(imageName) {
    return __async(this, null, function* () {
      const imageSettings = this.plugin.settings.imageSettings;
      const imageKey = imageName.replace("tamagotchi_", "").replace(".png", "");
      const imagePath = imageSettings[imageKey];
      if (!imagePath) {
        console.warn(`No image set for ${imageKey} state`);
        return "";
      }
      try {
        const file = this.app.vault.getAbstractFileByPath(imagePath);
        if (file instanceof import_obsidian2.TFile) {
          return this.app.vault.getResourcePath(file);
        }
      } catch (error) {
        console.error("Error loading image:", error);
      }
      return "";
    });
  }
  onOpen() {
    return __async(this, null, function* () {
      const container = this.containerEl.children[1];
      container.empty();
      container.addClass("tamagotchi-container");
      const petContainer = container.createDiv("tamagotchi-pet-container");
      const backgroundPath = this.plugin.settings.imageSettings.background;
      if (backgroundPath) {
        const file = this.app.vault.getAbstractFileByPath(backgroundPath);
        if (file instanceof import_obsidian2.TFile) {
          const backgroundUrl = this.app.vault.getResourcePath(file);
          petContainer.style.backgroundImage = `url('${backgroundUrl}')`;
          petContainer.style.backgroundSize = "cover";
          petContainer.style.backgroundPosition = "center";
        }
      }
      this.scoreEl = container.createDiv("hearts-container");
      this.updateScore();
      this.petEl = petContainer.createDiv("tamagotchi-pet");
      this.petImg = this.petEl.createEl("img", {
        cls: "tamagotchi-pet-img"
      });
      const initialDataUrl = yield this.getImagePath("tamagotchi_happy.png");
      if (initialDataUrl) {
        this.petImg.src = initialDataUrl;
      }
      this.statusEl = container.createDiv("tamagotchi-status");
      const controls = container.createDiv("tamagotchi-controls");
      const feedButton = controls.createEl("button", { text: "Feed" });
      feedButton.onclick = () => this.plugin.feedPet();
      if (!this.plugin.data.isAlive) {
        const restartButton = controls.createEl("button", { text: "Restart" });
        restartButton.onclick = () => this.plugin.resetPet();
      }
      const progressContainer = container.createDiv("progress-container");
      const progressBar = progressContainer.createEl("progress", {
        cls: "writing-progress",
        attr: { max: this.plugin.settings.wordCountGoal, value: "0" }
      });
      progressBar.style.width = "100%";
      const progressLabel = progressContainer.createDiv("progress-label");
      let baseWordCount = 0;
      const updateProgress = () => __async(this, null, function* () {
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile) {
          if (this.plugin.isHungry()) {
            const dailyWords = yield this.plugin.updateDailyStats();
            if (!baseWordCount)
              baseWordCount = dailyWords;
            const progress = Math.min(dailyWords - baseWordCount, this.plugin.settings.wordCountGoal);
            progressBar.value = progress;
            progressBar.classList.remove("complete");
            progressLabel.textContent = `${progress}/${this.plugin.settings.wordCountGoal} words`;
            if (progress >= this.plugin.settings.wordCountGoal) {
              yield this.plugin.feedPet();
              baseWordCount = 0;
              progressBar.classList.add("complete");
              progressLabel.textContent = "Tamagotchi has been fed!";
              setTimeout(() => {
                progressLabel.textContent = `${Math.max(0, this.plugin.settings.wordCountGoal)}/${this.plugin.settings.wordCountGoal} words`;
              }, 5e3);
            }
          } else {
            progressBar.value = this.plugin.settings.wordCountGoal;
            progressBar.classList.add("complete");
            progressLabel.textContent = `${this.plugin.settings.wordCountGoal}/${this.plugin.settings.wordCountGoal} words`;
          }
        }
      });
      this.registerEvent(
        this.app.workspace.on("editor-change", updateProgress)
      );
      yield updateProgress();
      this.startAnimation();
      yield this.updateVisuals();
    });
  }
  reopenView() {
    return __async(this, null, function* () {
      yield this.onOpen();
    });
  }
  updateVisuals() {
    return __async(this, null, function* () {
      if (!this.petImg || !this.statusEl)
        return;
      let stateKey = "happy";
      let status = `${this.plugin.data.name} is happy \u{1F60A}`;
      if (!this.plugin.data.isAlive) {
        stateKey = "dead";
        status = `${this.plugin.data.name} is no longer with us \u{1F622}`;
      } else if (this.plugin.data.currentMood === "hungry" || this.plugin.isHungry()) {
        stateKey = "hungry";
      } else if (Date.now() - this.plugin.data.lastFed < 5e3) {
        stateKey = "fed";
        setTimeout(() => {
          this.plugin.data.currentMood = "happy";
          this.updateVisuals();
        }, 5e3);
      } else if (this.plugin.data.currentMood !== "happy") {
        const isValidMood = (mood) => {
          return mood in this.plugin.settings.imageSettings;
        };
        if (isValidMood(this.plugin.data.currentMood)) {
          stateKey = this.plugin.data.currentMood;
        }
      }
      const imagePath = this.plugin.settings.imageSettings[stateKey];
      if (imagePath) {
        const file = this.app.vault.getAbstractFileByPath(imagePath);
        if (file instanceof import_obsidian2.TFile) {
          this.petImg.src = this.app.vault.getResourcePath(file);
        }
      }
    });
  }
  onClose() {
    return __async(this, null, function* () {
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
      }
    });
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyIsICJzZXR0aW5ncy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgUGx1Z2luLCBGaWxlU3RhdHMsIFZhdWx0LCBJdGVtVmlldywgV29ya3NwYWNlTGVhZiwgVmlldywgVEZpbGUsIFRBYnN0cmFjdEZpbGUsIE1vZGFsIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgVGFtYWdvdGNoaVNldHRpbmdzLCBERUZBVUxUX1NFVFRJTkdTLCBUYW1hZ290Y2hpU2V0dGluZ1RhYiB9IGZyb20gJy4vc2V0dGluZ3MnO1xuXG5cblxuY29uc3QgVklFV19UWVBFID0gJ3RhbWFnb3RjaGktdmlldyc7XG5cbmludGVyZmFjZSBEYWlseVN0YXRzIHtcbiAgIGRhdGU6IHN0cmluZztcbiAgIHN0YXJ0Q291bnQ6IG51bWJlcjtcbiAgIGN1cnJlbnRDb3VudDogbnVtYmVyO1xuICAgZmlsZXM6IFJlY29yZDxzdHJpbmcsIHt3b3JkQ291bnQ6IG51bWJlciwgbGFzdFVwZGF0ZWQ6IG51bWJlcn0+O1xufVxuXG5pbnRlcmZhY2UgVGFtYWdvdGNoaURhdGEge1xuICAgbGFzdEZlZDogbnVtYmVyO1xuICAgaXNBbGl2ZTogYm9vbGVhbjtcbiAgIG5hbWU6IHN0cmluZztcbiAgIHNjb3JlOiBudW1iZXI7XG4gICBkaXJlY3Rpb246ICdsZWZ0JyB8ICdyaWdodCc7XG4gICBwb3NpdGlvbjogbnVtYmVyO1xuICAgaXNKdW1waW5nOiBib29sZWFuO1xuICAganVtcEVuZFRpbWU6IG51bWJlcjtcbiAgIGN1cnJlbnRNb29kOiBzdHJpbmc7XG4gICBtb29kRW5kVGltZTogbnVtYmVyO1xuICAgaHVuZ2VyTGV2ZWw6IG51bWJlcjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGFtYWdvdGNoaVBsdWdpbiBleHRlbmRzIFBsdWdpbiB7XG4gICAgZGF0YTogVGFtYWdvdGNoaURhdGE7XG4gICAgdmlldzogVGFtYWdvdGNoaVZpZXc7XG4gICAgc2V0dGluZ3M6IFRhbWFnb3RjaGlTZXR0aW5ncztcbiAgICBkYWlseV9zdGF0czogRGFpbHlTdGF0cztcblxuICAgIGFzeW5jIG9ubG9hZCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0xvYWRpbmcgVGFtYWdvdGNoaSBwbHVnaW4nKTtcblxuICAgICAgICB0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9TRVRUSU5HUywgYXdhaXQgdGhpcy5sb2FkRGF0YSgpKTtcbiAgICAgICAgdGhpcy5hZGRTZXR0aW5nVGFiKG5ldyBUYW1hZ290Y2hpU2V0dGluZ1RhYih0aGlzLmFwcCwgdGhpcykpO1xuXG4gICAgICAgIGNvbnN0IHNhdmVkRGF0YSA9IGF3YWl0IHRoaXMubG9hZERhdGEoKTtcbiAgICAgICAgdGhpcy5kYXRhID0ge1xuICAgICAgICAgICAgbGFzdEZlZDogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgIGlzQWxpdmU6IHRydWUsXG4gICAgICAgICAgICBuYW1lOiAnVGFtYWdvdGNoaScsXG4gICAgICAgICAgICBzY29yZTogMCxcbiAgICAgICAgICAgIGRpcmVjdGlvbjogJ3JpZ2h0JyxcbiAgICAgICAgICAgIHBvc2l0aW9uOiAxMjUsXG4gICAgICAgICAgICBpc0p1bXBpbmc6IGZhbHNlLFxuICAgICAgICAgICAganVtcEVuZFRpbWU6IDAsXG4gICAgICAgICAgICBjdXJyZW50TW9vZDogJ2hhcHB5JyxcbiAgICAgICAgICAgIG1vb2RFbmRUaW1lOiAwLFxuICAgICAgICAgICAgaHVuZ2VyTGV2ZWw6IDAsXG4gICAgICAgICAgICAuLi5zYXZlZERhdGFcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmRhaWx5X3N0YXRzID0ge1xuICAgICAgICAgICAgZGF0ZTogbmV3IERhdGUoKS50b0RhdGVTdHJpbmcoKSxcbiAgICAgICAgICAgIHN0YXJ0Q291bnQ6IDAsXG4gICAgICAgICAgICBjdXJyZW50Q291bnQ6IDAsXG4gICAgICAgICAgICBmaWxlczoge31cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJlZ2lzdGVyVmlldyhcbiAgICAgICAgICAgIFZJRVdfVFlQRSxcbiAgICAgICAgICAgIChsZWFmKSA9PiAodGhpcy52aWV3ID0gbmV3IFRhbWFnb3RjaGlWaWV3KGxlYWYsIHRoaXMpKVxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMuYWRkUmliYm9uSWNvbignaGVhcnQnLCAnT3BlbiBUYW1hZ290Y2hpJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmF0ZVZpZXcoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXdhaXQgdGhpcy5jaGVja1BldFN0YXR1cygpO1xuXG4gICAgICAgIHRoaXMucmVnaXN0ZXJJbnRlcnZhbChcbiAgICAgICAgICAgIHdpbmRvdy5zZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja1BldFN0YXR1cygpO1xuICAgICAgICAgICAgfSwgNjAwMDApXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgYXN5bmMgc2F2ZVNldHRpbmdzKCkge1xuICAgICAgICBhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuc2V0dGluZ3MpO1xuICAgICAgICBpZiAodGhpcy52aWV3KSB7XG4gICAgICAgICAgICB0aGlzLnZpZXcudXBkYXRlVmlzdWFscygpO1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgYXN5bmMgYWN0aXZhdGVWaWV3KCkge1xuICAgICAgICBjb25zdCB7IHdvcmtzcGFjZSB9ID0gdGhpcy5hcHA7XG5cbiAgICAgICAgbGV0IGxlYWY6IFdvcmtzcGFjZUxlYWY7XG4gICAgICAgIGNvbnN0IGxlYXZlcyA9IHdvcmtzcGFjZS5nZXRMZWF2ZXNPZlR5cGUoVklFV19UWVBFKTtcblxuICAgICAgICBpZiAobGVhdmVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGxlYWYgPSBsZWF2ZXNbMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZWFmID0gd29ya3NwYWNlLmdldFJpZ2h0TGVhZihmYWxzZSk7XG4gICAgICAgICAgICBhd2FpdCBsZWFmLnNldFZpZXdTdGF0ZSh7IHR5cGU6IFZJRVdfVFlQRSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdvcmtzcGFjZS5yZXZlYWxMZWFmKGxlYWYpO1xuICAgIH1cblxuXG5cbiAgICBnZXRDdXJyZW50VVRDSG91cigpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRVVENIb3VycygpO1xuICAgIH1cblxuICAgIGlzSHVuZ3J5KCk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBjdXJyZW50SG91ciA9IHRoaXMuZ2V0Q3VycmVudFVUQ0hvdXIoKTtcbiAgICAgICAgY29uc3QgbGFzdEZlZERhdGUgPSBuZXcgRGF0ZSh0aGlzLmRhdGEubGFzdEZlZCk7XG4gICAgICAgIGNvbnN0IGxhc3RGZWREYXkgPSBsYXN0RmVkRGF0ZS5nZXRVVENEYXRlKCk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnREYXkgPSBuZXcgRGF0ZSgpLmdldFVUQ0RhdGUoKTtcblxuICAgICAgICAvLyBJZiBpdCdzIHBhc3QgOCBVVEMgb3IgMTYgVVRDLCBjaGVjayBpZiB3ZSd2ZSBiZWVuIGZlZCB0b2RheSBhZnRlciB0aGF0IHRpbWVcbiAgICAgICAgaWYgKChjdXJyZW50SG91ciA+PSA4ICYmIGN1cnJlbnRIb3VyIDwgMTYpIHx8IGN1cnJlbnRIb3VyID49IDE2KSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSdyZSBpbiBhIGRpZmZlcmVudCBkYXkgb3IgZmVkIGJlZm9yZSB0aGUgY3VycmVudCBwZXJpb2RcbiAgICAgICAgICAgIGlmIChjdXJyZW50RGF5ID4gbGFzdEZlZERheSB8fFxuICAgICAgICAgICAgICAgIChjdXJyZW50RGF5ID09PSBsYXN0RmVkRGF5ICYmIGxhc3RGZWREYXRlLmdldFVUQ0hvdXJzKCkgPFxuICAgICAgICAgICAgICAgICAgICAoY3VycmVudEhvdXIgPj0gMTYgPyAxNiA6IDgpKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuXG4gICAgYXN5bmMgdXBkYXRlRGFpbHlTdGF0cygpIHtcbiAgICAgICAgY29uc3QgdG9kYXkgPSBuZXcgRGF0ZSgpLnRvRGF0ZVN0cmluZygpO1xuICAgICAgICBjb25zdCBmaWxlcyA9IHRoaXMuYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKTtcbiAgICAgICAgbGV0IHRvZGF5VG90YWwgPSAwO1xuXG4gICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgICAgICAgICAgY29uc3QgZmlsZVN0YXRzID0gZmlsZS5zdGF0O1xuICAgICAgICAgICAgaWYgKGZpbGVTdGF0cy5tdGltZSA+IG5ldyBEYXRlKHRvZGF5KS5nZXRUaW1lKCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuY2FjaGVkUmVhZChmaWxlKTtcbiAgICAgICAgICAgICAgICBjb25zdCB3b3JkQ291bnQgPSBjb250ZW50LnNwbGl0KC9cXHMrLykuZmlsdGVyKHdvcmQgPT4gd29yZC5sZW5ndGggPiAwKS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgdG9kYXlUb3RhbCArPSB3b3JkQ291bnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5kYWlseV9zdGF0cy5kYXRlICE9PSB0b2RheSkge1xuICAgICAgICAgICAgdGhpcy5kYWlseV9zdGF0cyA9IHtcbiAgICAgICAgICAgICAgICBkYXRlOiB0b2RheSxcbiAgICAgICAgICAgICAgICBzdGFydENvdW50OiB0b2RheVRvdGFsLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRDb3VudDogdG9kYXlUb3RhbCxcbiAgICAgICAgICAgICAgICBmaWxlczoge31cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRhaWx5X3N0YXRzLmN1cnJlbnRDb3VudCA9IHRvZGF5VG90YWw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdG9kYXlUb3RhbCAtIHRoaXMuZGFpbHlfc3RhdHMuc3RhcnRDb3VudDtcbiAgICB9XG5cbiAgICBhc3luYyBjaGVja1BldFN0YXR1cygpIHtcbiAgIGlmICh0aGlzLmRhdGEuaXNBbGl2ZSkge1xuICAgICAgIGNvbnN0IGhvdXJzU2luY2VMYXN0RmVkID0gKERhdGUubm93KCkgLSB0aGlzLmRhdGEubGFzdEZlZCkgLyAoMTAwMCAqIDYwICogNjApO1xuICAgICAgIGNvbnN0IGh1bmdlckluY3JlbWVudHMgPSBNYXRoLmZsb29yKGhvdXJzU2luY2VMYXN0RmVkIC8gdGhpcy5zZXR0aW5ncy5odW5nZXJJbnRlcnZhbCk7XG5cbiAgICAgICBpZiAoaHVuZ2VySW5jcmVtZW50cyA+PSAxKSB7XG4gICAgICAgICAgIHRoaXMuZGF0YS5odW5nZXJMZXZlbCA9IGh1bmdlckluY3JlbWVudHM7XG4gICAgICAgICAgIHRoaXMuZGF0YS5jdXJyZW50TW9vZCA9ICdodW5ncnknO1xuXG4gICAgICAgICAgIGlmIChodW5nZXJJbmNyZW1lbnRzID49IDIpIHtcbiAgICAgICAgICAgICAgIHRoaXMuZGF0YS5pc0FsaXZlID0gZmFsc2U7XG4gICAgICAgICAgICAgICB0aGlzLmRhdGEuY3VycmVudE1vb2QgPSAnZGVhZCc7XG4gICAgICAgICAgIH1cblxuICAgICAgICAgICBhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuZGF0YSk7XG4gICAgICAgICAgIGlmICh0aGlzLnZpZXcpIHtcbiAgICAgICAgICAgICAgIHRoaXMudmlldy51cGRhdGVWaXN1YWxzKCk7XG4gICAgICAgICAgIH1cbiAgICAgICB9XG4gICB9XG59XG5cbiAgICAvLyBBZGQganVtcCBhbmltYXRpb24gb24gZmVlZFxuICAgIGFzeW5jIGZlZWRQZXQoKSB7XG4gICAgICAgIGlmICh0aGlzLmlzSHVuZ3J5KCkpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YS5sYXN0RmVkID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIHRoaXMuZGF0YS5zY29yZSsrOyAvLyBPbmx5IGluY3JlbWVudCBzY29yZSBvbiBzdWNjZXNzZnVsIGZlZWRcbiAgICAgICAgICAgIHRoaXMuZGF0YS5pc0p1bXBpbmcgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5kYXRhLmp1bXBFbmRUaW1lID0gRGF0ZS5ub3coKSArIDUwMDA7IC8vIDUgc2Vjb25kIGp1bXAgZHVyYXRpb25cbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5kYXRhKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnZpZXcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXcudXBkYXRlVmlzdWFscygpO1xuICAgICAgICAgICAgICAgIHRoaXMudmlldy51cGRhdGVTY29yZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgcmVzZXRQZXQoKSB7XG4gICAgICAgIHRoaXMuZGF0YSA9IHtcbiAgICAgICAgICAgIGxhc3RGZWQ6IERhdGUubm93KCksXG4gICAgICAgICAgICBpc0FsaXZlOiB0cnVlLFxuICAgICAgICAgICAgbmFtZTogdGhpcy5zZXR0aW5ncy5wZXROYW1lLFxuICAgICAgICAgICAgc2NvcmU6IDAsXG4gICAgICAgICAgICBkaXJlY3Rpb246ICdyaWdodCcsXG4gICAgICAgICAgICBwb3NpdGlvbjogMTI1LCAvLyBDZW50ZXIgcG9zaXRpb25cbiAgICAgICAgICAgIGlzSnVtcGluZzogZmFsc2UsXG4gICAgICAgICAgICBqdW1wRW5kVGltZTogMCxcbiAgICAgICAgICAgIGN1cnJlbnRNb29kOiAnaGFwcHknLFxuICAgICAgICAgICAgbW9vZEVuZFRpbWU6IDAsXG4gICAgICAgICAgICBodW5nZXJMZXZlbDogMFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFJlc2V0IGRhaWx5IHN0YXRzXG4gICAgICAgIHRoaXMuZGFpbHlfc3RhdHMgPSB7XG4gICAgICAgICAgICBkYXRlOiBuZXcgRGF0ZSgpLnRvRGF0ZVN0cmluZygpLFxuICAgICAgICAgICAgc3RhcnRDb3VudDogMCxcbiAgICAgICAgICAgIGN1cnJlbnRDb3VudDogMCxcbiAgICAgICAgICAgIGZpbGVzOiB7fVxuICAgICAgICB9O1xuXG4gICAgICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5kYXRhKTtcbiAgICAgICAgaWYgKHRoaXMudmlldykge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy52aWV3LnJlb3BlblZpZXcoKTtcbiAgICAgICAgfVxuICAgIH1cblxufVxuXG5cblxuY2xhc3MgVGFtYWdvdGNoaVZpZXcgZXh0ZW5kcyBJdGVtVmlldyB7XG4gICAgcGx1Z2luOiBUYW1hZ290Y2hpUGx1Z2luO1xuICAgIHBldEVsOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHBldEltZzogSFRNTEltYWdlRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIGFuaW1hdGlvbkZyYW1lOiBudW1iZXI7XG4gICAgc3RhdHVzRWw6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgc2NvcmVFbDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBsYXN0UGF1c2VUaW1lOiBudW1iZXIgPSAwO1xuICAgIHBhdXNlRHVyYXRpb246IG51bWJlciA9IDA7XG4gICAgbGFzdE1vb2RDaGVjazogbnVtYmVyID0gMDtcbiAgICBsYXN0SnVtcENoZWNrOiBudW1iZXIgPSAwO1xuXG4gICAgY29uc3RydWN0b3IobGVhZjogV29ya3NwYWNlTGVhZiwgcGx1Z2luOiBUYW1hZ290Y2hpUGx1Z2luKSB7XG4gICAgICAgIHN1cGVyKGxlYWYpO1xuICAgICAgICB0aGlzLnBsdWdpbiA9IHBsdWdpbjtcbiAgICB9XG5cbiAgICBnZXRWaWV3VHlwZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gVklFV19UWVBFO1xuICAgIH1cblxuICAgIGdldERpc3BsYXlUZXh0KCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBcIlRhbWFnb3RjaGkgUGV0XCI7XG4gICAgfVxuXG4gICAgZ2V0SWNvbigpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gXCJoZWFydFwiO1xuICAgIH1cblxuICAgIHVwZGF0ZVNjb3JlKCkge1xuICAgICAgICBpZiAoIXRoaXMuc2NvcmVFbCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuc2NvcmVFbC5lbXB0eSgpO1xuICAgICAgICB0aGlzLnNjb3JlRWwuYWRkQ2xhc3MoJ2hlYXJ0cy1jb250YWluZXInKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucGx1Z2luLmRhdGEuc2NvcmU7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgaGVhcnRDb250YWluZXIgPSB0aGlzLnNjb3JlRWwuY3JlYXRlRGl2KCdoZWFydC1jb250YWluZXInKTtcbiAgICAgICAgICAgIGNvbnN0IGhlYXJ0SW1nID0gaGVhcnRDb250YWluZXIuY3JlYXRlRWwoJ2ltZycsIHtcbiAgICAgICAgICAgICAgICBjbHM6ICdoZWFydC1pbWcnXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29uc3QgaGVhcnRQYXRoID0gdGhpcy5wbHVnaW4uc2V0dGluZ3MuaW1hZ2VTZXR0aW5ncy5oZWFydDtcbiAgICAgICAgICAgIGlmIChoZWFydFBhdGgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWxlID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGhlYXJ0UGF0aCk7XG4gICAgICAgICAgICAgICAgaWYgKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgICAgICAgICAgICAgICBoZWFydEltZy5zcmMgPSB0aGlzLmFwcC52YXVsdC5nZXRSZXNvdXJjZVBhdGgoZmlsZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2hvdWxkUGF1c2UoKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgICAgIGlmIChub3cgLSB0aGlzLmxhc3RQYXVzZVRpbWUgPiAodGhpcy5wYXVzZUR1cmF0aW9uICsgMTAwMCkpIHtcbiAgICAgICAgICAgIGlmIChNYXRoLnJhbmRvbSgpIDwgMC4xNSkge1xuICAgICAgICAgICAgICAgIHRoaXMubGFzdFBhdXNlVGltZSA9IG5vdztcbiAgICAgICAgICAgICAgICB0aGlzLnBhdXNlRHVyYXRpb24gPSBNYXRoLnJhbmRvbSgpICogNDAwMCArIDUwMDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm93IC0gdGhpcy5sYXN0UGF1c2VUaW1lIDwgdGhpcy5wYXVzZUR1cmF0aW9uO1xuICAgIH1cblxuICAgIGNoZWNrUmFuZG9tTW9vZCgpIHtcbiAgICAgICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgaWYgKG5vdyAtIHRoaXMubGFzdE1vb2RDaGVjayA+ICgxNTAwMCArIE1hdGgucmFuZG9tKCkgKiAyMDAwMCkpIHtcbiAgICAgICAgICAgIHRoaXMubGFzdE1vb2RDaGVjayA9IG5vdztcbiAgICAgICAgICAgIGlmIChNYXRoLnJhbmRvbSgpIDwgMC40ICYmICF0aGlzLnBsdWdpbi5kYXRhLmlzSnVtcGluZyAmJiB0aGlzLnBsdWdpbi5kYXRhLmN1cnJlbnRNb29kID09PSAnaGFwcHknKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbW9vZHMgPSBbJ2Fubm95ZWQnLCAndHJpcHBpbmcnLCAna2lzc2luZycsICdsYXVnaCddO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld01vb2QgPSBtb29kc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBtb29kcy5sZW5ndGgpXTtcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5kYXRhLmN1cnJlbnRNb29kID0gbmV3TW9vZDtcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5kYXRhLm1vb2RFbmRUaW1lID0gbm93ICsgMjAwMDtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVZpc3VhbHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNoZWNrUmFuZG9tSnVtcCgpIHtcbiAgICAgICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgaWYgKG5vdyAtIHRoaXMubGFzdEp1bXBDaGVjayA+ICgxODAwMCArIE1hdGgucmFuZG9tKCkgKiA0MjAwMCkpIHtcbiAgICAgICAgICAgIHRoaXMubGFzdEp1bXBDaGVjayA9IG5vdztcbiAgICAgICAgICAgIGlmIChNYXRoLnJhbmRvbSgpIDwgMC4zNSAmJiAhdGhpcy5wbHVnaW4uZGF0YS5pc0p1bXBpbmcgJiYgdGhpcy5wbHVnaW4uZGF0YS5jdXJyZW50TW9vZCA9PT0gJ2hhcHB5Jykge1xuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLmRhdGEuaXNKdW1waW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5kYXRhLmp1bXBFbmRUaW1lID0gbm93ICsgMTUwMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNoZWNrUmFuZG9tVHVybigpIHtcbiAgICAgICAgaWYgKE1hdGgucmFuZG9tKCkgPCAwLjAxKSB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5kYXRhLmRpcmVjdGlvbiA9IHRoaXMucGx1Z2luLmRhdGEuZGlyZWN0aW9uID09PSAnbGVmdCcgPyAncmlnaHQnIDogJ2xlZnQnO1xuICAgICAgICAgICAgaWYgKHRoaXMucGV0RWwpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wbHVnaW4uZGF0YS5kaXJlY3Rpb24gPT09ICdsZWZ0Jykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBldEVsLmNsYXNzTGlzdC5hZGQoJ2ZsaXAtbGVmdCcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGV0RWwuY2xhc3NMaXN0LnJlbW92ZSgnZmxpcC1sZWZ0Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhcnRBbmltYXRpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5wZXRFbCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGFuaW1hdGUgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5wZXRFbCAmJiB0aGlzLnBsdWdpbi5kYXRhLmlzQWxpdmUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja1JhbmRvbU1vb2QoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNoZWNrUmFuZG9tSnVtcCgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGx1Z2luLmRhdGEuaXNKdW1waW5nICYmIG5vdyA8IHRoaXMucGx1Z2luLmRhdGEuanVtcEVuZFRpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYmFzZUJvdHRvbSA9IDIwO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9ncmVzcyA9IChub3cgLSAodGhpcy5wbHVnaW4uZGF0YS5qdW1wRW5kVGltZSAtIDUwMDApKSAvIDUwMDA7IC8vIDAgdG8gMVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBqdW1wSGVpZ2h0ID0gTWF0aC5hYnMoTWF0aC5zaW4ocHJvZ3Jlc3MgKiBNYXRoLlBJICogNikpICogMzA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGV0RWwuc3R5bGUuYm90dG9tID0gYCR7YmFzZUJvdHRvbSArIGp1bXBIZWlnaHR9cHhgO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5wbHVnaW4uZGF0YS5pc0p1bXBpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uZGF0YS5pc0p1bXBpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wZXRFbC5zdHlsZS5ib3R0b20gPSAnMjBweCc7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKG5vdyA+IHRoaXMucGx1Z2luLmRhdGEubW9vZEVuZFRpbWUgJiYgdGhpcy5wbHVnaW4uZGF0YS5jdXJyZW50TW9vZCAhPT0gJ2hhcHB5Jykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5kYXRhLmN1cnJlbnRNb29kID0gJ2hhcHB5JztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVWaXN1YWxzKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLnNob3VsZFBhdXNlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVja1JhbmRvbVR1cm4oKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wbHVnaW4uZGF0YS5kaXJlY3Rpb24gPT09ICdyaWdodCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLmRhdGEucG9zaXRpb24gKz0gMC41O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGx1Z2luLmRhdGEucG9zaXRpb24gPiAyMzApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5kYXRhLnBvc2l0aW9uID0gMjMwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLmRhdGEuZGlyZWN0aW9uID0gJ2xlZnQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGV0RWwuY2xhc3NMaXN0LmFkZCgnZmxpcC1sZWZ0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5kYXRhLnBvc2l0aW9uIC09IDAuNTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBsdWdpbi5kYXRhLnBvc2l0aW9uIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLmRhdGEucG9zaXRpb24gPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLmRhdGEuZGlyZWN0aW9uID0gJ3JpZ2h0JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBldEVsLmNsYXNzTGlzdC5yZW1vdmUoJ2ZsaXAtbGVmdCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGV0RWwuc3R5bGUubGVmdCA9IGAke3RoaXMucGx1Z2luLmRhdGEucG9zaXRpb259cHhgO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb25GcmFtZSA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlKTtcbiAgICAgICAgfTtcblxuICAgICAgICBhbmltYXRlKCk7XG4gICAgfVxuXG4gICAgYXN5bmMgZ2V0SW1hZ2VQYXRoKGltYWdlTmFtZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgY29uc3QgaW1hZ2VTZXR0aW5ncyA9IHRoaXMucGx1Z2luLnNldHRpbmdzLmltYWdlU2V0dGluZ3M7XG4gICAgICAgIGNvbnN0IGltYWdlS2V5ID0gaW1hZ2VOYW1lLnJlcGxhY2UoJ3RhbWFnb3RjaGlfJywgJycpLnJlcGxhY2UoJy5wbmcnLCAnJykgYXMga2V5b2YgdHlwZW9mIGltYWdlU2V0dGluZ3M7XG4gICAgICAgIGNvbnN0IGltYWdlUGF0aCA9IGltYWdlU2V0dGluZ3NbaW1hZ2VLZXldO1xuXG4gICAgICAgIGlmICghaW1hZ2VQYXRoKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYE5vIGltYWdlIHNldCBmb3IgJHtpbWFnZUtleX0gc3RhdGVgKTtcbiAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBmaWxlID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGltYWdlUGF0aCk7XG4gICAgICAgICAgICBpZiAoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXBwLnZhdWx0LmdldFJlc291cmNlUGF0aChmaWxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGxvYWRpbmcgaW1hZ2U6JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICBhc3luYyBvbk9wZW4oKSB7XG4gICAgICAgIGNvbnN0IGNvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyRWwuY2hpbGRyZW5bMV07XG4gICAgICAgIGNvbnRhaW5lci5lbXB0eSgpO1xuICAgICAgICBjb250YWluZXIuYWRkQ2xhc3MoJ3RhbWFnb3RjaGktY29udGFpbmVyJyk7XG5cbiAgICAgICAgY29uc3QgcGV0Q29udGFpbmVyID0gY29udGFpbmVyLmNyZWF0ZURpdigndGFtYWdvdGNoaS1wZXQtY29udGFpbmVyJyk7XG4gICAgICAgIGNvbnN0IGJhY2tncm91bmRQYXRoID0gdGhpcy5wbHVnaW4uc2V0dGluZ3MuaW1hZ2VTZXR0aW5ncy5iYWNrZ3JvdW5kO1xuICAgICAgICBpZiAoYmFja2dyb3VuZFBhdGgpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGUgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoYmFja2dyb3VuZFBhdGgpO1xuICAgICAgICAgICAgaWYgKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJhY2tncm91bmRVcmwgPSB0aGlzLmFwcC52YXVsdC5nZXRSZXNvdXJjZVBhdGgoZmlsZSk7XG4gICAgICAgICAgICAgICAgcGV0Q29udGFpbmVyLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IGB1cmwoJyR7YmFja2dyb3VuZFVybH0nKWA7XG4gICAgICAgICAgICAgICAgcGV0Q29udGFpbmVyLnN0eWxlLmJhY2tncm91bmRTaXplID0gJ2NvdmVyJztcbiAgICAgICAgICAgICAgICBwZXRDb250YWluZXIuc3R5bGUuYmFja2dyb3VuZFBvc2l0aW9uID0gJ2NlbnRlcic7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuXG4gICAgICAgIHRoaXMuc2NvcmVFbCA9IGNvbnRhaW5lci5jcmVhdGVEaXYoJ2hlYXJ0cy1jb250YWluZXInKTtcbiAgICAgICAgdGhpcy51cGRhdGVTY29yZSgpO1xuXG4gICAgICAgIHRoaXMucGV0RWwgPSBwZXRDb250YWluZXIuY3JlYXRlRGl2KCd0YW1hZ290Y2hpLXBldCcpO1xuICAgICAgICB0aGlzLnBldEltZyA9IHRoaXMucGV0RWwuY3JlYXRlRWwoJ2ltZycsIHtcbiAgICAgICAgICAgIGNsczogJ3RhbWFnb3RjaGktcGV0LWltZydcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgaW5pdGlhbERhdGFVcmwgPSBhd2FpdCB0aGlzLmdldEltYWdlUGF0aCgndGFtYWdvdGNoaV9oYXBweS5wbmcnKTtcbiAgICAgICAgaWYgKGluaXRpYWxEYXRhVXJsKSB7XG4gICAgICAgICAgICB0aGlzLnBldEltZy5zcmMgPSBpbml0aWFsRGF0YVVybDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc3RhdHVzRWwgPSBjb250YWluZXIuY3JlYXRlRGl2KCd0YW1hZ290Y2hpLXN0YXR1cycpO1xuXG4gICAgICAgIGNvbnN0IGNvbnRyb2xzID0gY29udGFpbmVyLmNyZWF0ZURpdigndGFtYWdvdGNoaS1jb250cm9scycpO1xuICAgICAgICBjb25zdCBmZWVkQnV0dG9uID0gY29udHJvbHMuY3JlYXRlRWwoJ2J1dHRvbicsIHsgdGV4dDogJ0ZlZWQnIH0pO1xuICAgICAgICBmZWVkQnV0dG9uLm9uY2xpY2sgPSAoKSA9PiB0aGlzLnBsdWdpbi5mZWVkUGV0KCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLnBsdWdpbi5kYXRhLmlzQWxpdmUpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3RhcnRCdXR0b24gPSBjb250cm9scy5jcmVhdGVFbCgnYnV0dG9uJywgeyB0ZXh0OiAnUmVzdGFydCcgfSk7XG4gICAgICAgICAgICByZXN0YXJ0QnV0dG9uLm9uY2xpY2sgPSAoKSA9PiB0aGlzLnBsdWdpbi5yZXNldFBldCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcHJvZ3Jlc3NDb250YWluZXIgPSBjb250YWluZXIuY3JlYXRlRGl2KCdwcm9ncmVzcy1jb250YWluZXInKTtcbiAgICAgICAgY29uc3QgcHJvZ3Jlc3NCYXIgPSBwcm9ncmVzc0NvbnRhaW5lci5jcmVhdGVFbCgncHJvZ3Jlc3MnLCB7XG4gICAgICAgICAgICBjbHM6ICd3cml0aW5nLXByb2dyZXNzJyxcbiAgICAgICAgICAgIGF0dHI6IHsgbWF4OiB0aGlzLnBsdWdpbi5zZXR0aW5ncy53b3JkQ291bnRHb2FsLCB2YWx1ZTogJzAnIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHByb2dyZXNzQmFyLnN0eWxlLndpZHRoID0gJzEwMCUnO1xuICAgICAgICBjb25zdCBwcm9ncmVzc0xhYmVsID0gcHJvZ3Jlc3NDb250YWluZXIuY3JlYXRlRGl2KCdwcm9ncmVzcy1sYWJlbCcpO1xuXG4gICAgICAgIGxldCBiYXNlV29yZENvdW50ID0gMDtcbiAgICAgICAgY29uc3QgdXBkYXRlUHJvZ3Jlc3MgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhY3RpdmVGaWxlID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZUZpbGUoKTtcbiAgICAgICAgICAgIGlmIChhY3RpdmVGaWxlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGx1Z2luLmlzSHVuZ3J5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGFpbHlXb3JkcyA9IGF3YWl0IHRoaXMucGx1Z2luLnVwZGF0ZURhaWx5U3RhdHMoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFiYXNlV29yZENvdW50KSBiYXNlV29yZENvdW50ID0gZGFpbHlXb3JkcztcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvZ3Jlc3MgPSBNYXRoLm1pbihkYWlseVdvcmRzIC0gYmFzZVdvcmRDb3VudCwgdGhpcy5wbHVnaW4uc2V0dGluZ3Mud29yZENvdW50R29hbCk7XG4gICAgICAgICAgICAgICAgICAgIHByb2dyZXNzQmFyLnZhbHVlID0gcHJvZ3Jlc3M7XG4gICAgICAgICAgICAgICAgICAgIHByb2dyZXNzQmFyLmNsYXNzTGlzdC5yZW1vdmUoJ2NvbXBsZXRlJyk7XG4gICAgICAgICAgICAgICAgICAgIHByb2dyZXNzTGFiZWwudGV4dENvbnRlbnQgPSBgJHtwcm9ncmVzc30vJHt0aGlzLnBsdWdpbi5zZXR0aW5ncy53b3JkQ291bnRHb2FsfSB3b3Jkc2A7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb2dyZXNzID49IHRoaXMucGx1Z2luLnNldHRpbmdzLndvcmRDb3VudEdvYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLmZlZWRQZXQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VXb3JkQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3NCYXIuY2xhc3NMaXN0LmFkZCgnY29tcGxldGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2dyZXNzTGFiZWwudGV4dENvbnRlbnQgPSBcIlRhbWFnb3RjaGkgaGFzIGJlZW4gZmVkIVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3NMYWJlbC50ZXh0Q29udGVudCA9IGAke01hdGgubWF4KDAsIHRoaXMucGx1Z2luLnNldHRpbmdzLndvcmRDb3VudEdvYWwpfS8ke3RoaXMucGx1Z2luLnNldHRpbmdzLndvcmRDb3VudEdvYWx9IHdvcmRzYDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDUwMDApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3NCYXIudmFsdWUgPSB0aGlzLnBsdWdpbi5zZXR0aW5ncy53b3JkQ291bnRHb2FsO1xuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzc0Jhci5jbGFzc0xpc3QuYWRkKCdjb21wbGV0ZScpO1xuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzc0xhYmVsLnRleHRDb250ZW50ID0gYCR7dGhpcy5wbHVnaW4uc2V0dGluZ3Mud29yZENvdW50R29hbH0vJHt0aGlzLnBsdWdpbi5zZXR0aW5ncy53b3JkQ291bnRHb2FsfSB3b3Jkc2A7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucmVnaXN0ZXJFdmVudChcbiAgICAgICAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS5vbihcImVkaXRvci1jaGFuZ2VcIiwgdXBkYXRlUHJvZ3Jlc3MpXG4gICAgICAgICk7XG5cbiAgICAgICAgYXdhaXQgdXBkYXRlUHJvZ3Jlc3MoKTtcblxuICAgICAgICB0aGlzLnN0YXJ0QW5pbWF0aW9uKCk7XG4gICAgICAgIGF3YWl0IHRoaXMudXBkYXRlVmlzdWFscygpO1xuICAgIH1cblxuICAgIGFzeW5jIHJlb3BlblZpZXcoKSB7XG4gICAgICAgIGF3YWl0IHRoaXMub25PcGVuKCk7XG4gICAgfVxuXG4gICAgYXN5bmMgdXBkYXRlVmlzdWFscygpIHtcbiAgICAgICAgaWYgKCF0aGlzLnBldEltZyB8fCAhdGhpcy5zdGF0dXNFbCkgcmV0dXJuO1xuXG4gICAgICAgIGxldCBzdGF0ZUtleToga2V5b2YgVGFtYWdvdGNoaVNldHRpbmdzWydpbWFnZVNldHRpbmdzJ10gPSAnaGFwcHknO1xuICAgICAgICBsZXQgc3RhdHVzID0gYCR7dGhpcy5wbHVnaW4uZGF0YS5uYW1lfSBpcyBoYXBweSBcdUQ4M0RcdURFMEFgO1xuXG4gICAgICAgIGlmICghdGhpcy5wbHVnaW4uZGF0YS5pc0FsaXZlKSB7XG4gICAgICAgICAgICBzdGF0ZUtleSA9ICdkZWFkJztcbiAgICAgICAgICAgIHN0YXR1cyA9IGAke3RoaXMucGx1Z2luLmRhdGEubmFtZX0gaXMgbm8gbG9uZ2VyIHdpdGggdXMgXHVEODNEXHVERTIyYDtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnBsdWdpbi5kYXRhLmN1cnJlbnRNb29kID09PSAnaHVuZ3J5JyB8fCB0aGlzLnBsdWdpbi5pc0h1bmdyeSgpKSB7XG4gICAgICAgICAgICBzdGF0ZUtleSA9ICdodW5ncnknO1xuICAgICAgICB9IGVsc2UgaWYgKERhdGUubm93KCkgLSB0aGlzLnBsdWdpbi5kYXRhLmxhc3RGZWQgPCA1MDAwKSB7XG4gICAgICAgICAgICBzdGF0ZUtleSA9ICdmZWQnO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uZGF0YS5jdXJyZW50TW9vZCA9ICdoYXBweSc7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVWaXN1YWxzKCk7XG4gICAgICAgICAgICB9LCA1MDAwKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnBsdWdpbi5kYXRhLmN1cnJlbnRNb29kICE9PSAnaGFwcHknKSB7XG4gICAgICAgICAgICAvLyBWYWxpZGF0ZSB0aGF0IGN1cnJlbnRNb29kIGlzIGEgdmFsaWQga2V5XG4gICAgICAgICAgICBjb25zdCBpc1ZhbGlkTW9vZCA9IChtb29kOiBzdHJpbmcpOiBtb29kIGlzIGtleW9mIFRhbWFnb3RjaGlTZXR0aW5nc1snaW1hZ2VTZXR0aW5ncyddID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbW9vZCBpbiB0aGlzLnBsdWdpbi5zZXR0aW5ncy5pbWFnZVNldHRpbmdzO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKGlzVmFsaWRNb29kKHRoaXMucGx1Z2luLmRhdGEuY3VycmVudE1vb2QpKSB7XG4gICAgICAgICAgICAgICAgc3RhdGVLZXkgPSB0aGlzLnBsdWdpbi5kYXRhLmN1cnJlbnRNb29kO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaW1hZ2VQYXRoID0gdGhpcy5wbHVnaW4uc2V0dGluZ3MuaW1hZ2VTZXR0aW5nc1tzdGF0ZUtleV07XG4gICAgICAgIGlmIChpbWFnZVBhdGgpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGUgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoaW1hZ2VQYXRoKTtcbiAgICAgICAgICAgIGlmIChmaWxlIGluc3RhbmNlb2YgVEZpbGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBldEltZy5zcmMgPSB0aGlzLmFwcC52YXVsdC5nZXRSZXNvdXJjZVBhdGgoZmlsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL2lmICh0aGlzLnN0YXR1c0VsIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgLy8gICAgdGhpcy5zdGF0dXNFbC50ZXh0Q29udGVudCA9IHN0YXR1cztcbiAgICAgICAgLy99XG4gICAgfVxuXG4gICAgYXN5bmMgb25DbG9zZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuYW5pbWF0aW9uRnJhbWUpIHtcbiAgICAgICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuYW5pbWF0aW9uRnJhbWUpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwgImltcG9ydCB7IEFwcCwgUGx1Z2luLCBQbHVnaW5TZXR0aW5nVGFiLCBTZXR0aW5nLCBURmlsZSwgVEFic3RyYWN0RmlsZSwgTW9kYWwsIG5vcm1hbGl6ZVBhdGggfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgVGFtYWdvdGNoaVBsdWdpbiBmcm9tICcuL21haW4nO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRhbWFnb3RjaGlTZXR0aW5ncyB7XG4gICBwZXROYW1lOiBzdHJpbmc7XG4gICBqdW1wSGVpZ2h0OiBudW1iZXI7XG4gICBqdW1wRnJlcXVlbmN5OiBudW1iZXI7XG4gICBodW5nZXJJbnRlcnZhbDogbnVtYmVyO1xuICAgd29yZENvdW50R29hbDogbnVtYmVyO1xuICAgaW1hZ2VTZXR0aW5nczoge1xuICAgICAgIGhhcHB5OiBzdHJpbmc7XG4gICAgICAgaHVuZ3J5OiBzdHJpbmc7XG4gICAgICAgZGVhZDogc3RyaW5nO1xuICAgICAgIGZlZDogc3RyaW5nO1xuICAgICAgIGFubm95ZWQ6IHN0cmluZztcbiAgICAgICB0cmlwcGluZzogc3RyaW5nO1xuICAgICAgIGtpc3Npbmc6IHN0cmluZztcbiAgICAgICBsYXVnaDogc3RyaW5nO1xuICAgICAgIGhlYXJ0OiBzdHJpbmc7XG4gICAgICAgYmFja2dyb3VuZDogc3RyaW5nO1xuICAgfTtcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0VUVElOR1M6IFRhbWFnb3RjaGlTZXR0aW5ncyA9IHtcbiAgIHBldE5hbWU6ICdUYW1hZ290Y2hpJyxcbiAgIGp1bXBIZWlnaHQ6IDMwLFxuICAganVtcEZyZXF1ZW5jeTogMC4wMDIsXG4gICBodW5nZXJJbnRlcnZhbDogMTIsXG4gICB3b3JkQ291bnRHb2FsOiAyMDAsXG4gICBpbWFnZVNldHRpbmdzOiB7XG4gICAgICAgaGFwcHk6ICcnLFxuICAgICAgIGh1bmdyeTogJycsXG4gICAgICAgZGVhZDogJycsXG4gICAgICAgZmVkOiAnJyxcbiAgICAgICBhbm5veWVkOiAnJyxcbiAgICAgICB0cmlwcGluZzogJycsXG4gICAgICAga2lzc2luZzogJycsXG4gICAgICAgbGF1Z2g6ICcnLFxuICAgICAgIGhlYXJ0OiAnJyxcbiAgICAgICBiYWNrZ3JvdW5kOiAnJ1xuICAgfVxufTtcblxuZXhwb3J0IGNsYXNzIFRhbWFnb3RjaGlTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XG4gICAgcGx1Z2luOiBUYW1hZ290Y2hpUGx1Z2luO1xuXG4gICAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHBsdWdpbjogVGFtYWdvdGNoaVBsdWdpbikge1xuICAgICAgICBzdXBlcihhcHAsIHBsdWdpbik7XG4gICAgICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICAgIH1cblxuICAgIGFzeW5jIGNyZWF0ZUltYWdlRmlsZVNldHRpbmcoY29udGFpbmVyRWw6IEhUTUxFbGVtZW50LCBrZXk6IGtleW9mIFRhbWFnb3RjaGlTZXR0aW5nc1snaW1hZ2VTZXR0aW5ncyddLCBuYW1lOiBzdHJpbmcsIGRlc2M6IHN0cmluZykge1xuICAgICAgICBsZXQgdGV4dENvbXBvbmVudDogYW55O1xuICAgICAgICBjb25zdCBzZXR0aW5nID0gbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAgICAgICAuc2V0TmFtZShuYW1lKVxuICAgICAgICAgICAgLnNldERlc2MoZGVzYylcbiAgICAgICAgICAgIC5hZGRUZXh0KHRleHQgPT4ge1xuICAgICAgICAgICAgICAgIHRleHRDb21wb25lbnQgPSB0ZXh0O1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0XG4gICAgICAgICAgICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5pbWFnZVNldHRpbmdzW2tleV0pXG4gICAgICAgICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignUGF0aCB0byBpbWFnZSBpbiB2YXVsdCcpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5hZGRCdXR0b24oYnV0dG9uID0+IGJ1dHRvblxuICAgICAgICAgICAgICAgIC5zZXRCdXR0b25UZXh0KCdDaG9vc2UnKVxuICAgICAgICAgICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbW9kYWwgPSBuZXcgSW1hZ2VTZWxlY3Rvck1vZGFsKHRoaXMuYXBwLCBhc3luYyAoZmlsZTogVEZpbGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhdGggPSBub3JtYWxpemVQYXRoKGZpbGUucGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5pbWFnZVNldHRpbmdzW2tleV0gPSBwYXRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Q29tcG9uZW50LnNldFZhbHVlKHBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGx1Z2luLnZpZXcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi52aWV3LnVwZGF0ZVZpc3VhbHMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLm9wZW4oKTtcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgfVxuXG4gICAgZGlzcGxheSgpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qge2NvbnRhaW5lckVsfSA9IHRoaXM7XG4gICAgICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XG5cbiAgICAgICAgLy8gT3JpZ2luYWwgc2V0dGluZ3NcbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAgICAgICAuc2V0TmFtZSgnV29yZCBDb3VudCBHb2FsJylcbiAgICAgICAgICAgIC5zZXREZXNjKCdXb3JkcyBuZWVkZWQgdG8gZmVlZCBwZXQnKVxuICAgICAgICAgICAgLmFkZFRleHQodGV4dCA9PiB0ZXh0XG4gICAgICAgICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLndvcmRDb3VudEdvYWwudG9TdHJpbmcoKSlcbiAgICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG51bVZhbHVlID0gcGFyc2VJbnQodmFsdWUpIHx8IDIwMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3Mud29yZENvdW50R29hbCA9IG51bVZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gSW1hZ2Ugc2V0dGluZ3Mgc2VjdGlvblxuICAgICAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDInLCB7dGV4dDogJ1BldCBJbWFnZXMnfSk7XG4gICAgICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdwJywge1xuICAgICAgICAgICAgdGV4dDogJ1NlbGVjdCBpbWFnZXMgZnJvbSB5b3VyIHZhdWx0IGZvciBkaWZmZXJlbnQgcGV0IHN0YXRlcy4gSW1hZ2VzIHNob3VsZCBiZSBQTkcgb3IgSlBHIGZvcm1hdC4nXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIENyZWF0ZSBzZXR0aW5ncyBmb3IgZWFjaCBpbWFnZSB0eXBlXG4gICAgICAgIHRoaXMuY3JlYXRlSW1hZ2VGaWxlU2V0dGluZyhjb250YWluZXJFbCwgJ2hhcHB5JywgJ0hhcHB5IFN0YXRlIEltYWdlJywgJ0ltYWdlIHNob3duIHdoZW4gcGV0IGlzIGhhcHB5Jyk7XG4gICAgICAgIHRoaXMuY3JlYXRlSW1hZ2VGaWxlU2V0dGluZyhjb250YWluZXJFbCwgJ2h1bmdyeScsICdIdW5ncnkgU3RhdGUgSW1hZ2UnLCAnSW1hZ2Ugc2hvd24gd2hlbiBwZXQgaXMgaHVuZ3J5Jyk7XG4gICAgICAgIHRoaXMuY3JlYXRlSW1hZ2VGaWxlU2V0dGluZyhjb250YWluZXJFbCwgJ2RlYWQnLCAnRGVhZCBTdGF0ZSBJbWFnZScsICdJbWFnZSBzaG93biB3aGVuIHBldCBkaWVzJyk7XG4gICAgICAgIHRoaXMuY3JlYXRlSW1hZ2VGaWxlU2V0dGluZyhjb250YWluZXJFbCwgJ2ZlZCcsICdGZWQgU3RhdGUgSW1hZ2UnLCAnSW1hZ2Ugc2hvd24gcmlnaHQgYWZ0ZXIgZmVlZGluZycpO1xuICAgICAgICB0aGlzLmNyZWF0ZUltYWdlRmlsZVNldHRpbmcoY29udGFpbmVyRWwsICdhbm5veWVkJywgJ0Fubm95ZWQgU3RhdGUgSW1hZ2UnLCAnSW1hZ2Ugc2hvd24gd2hlbiBwZXQgaXMgYW5ub3llZCcpO1xuICAgICAgICB0aGlzLmNyZWF0ZUltYWdlRmlsZVNldHRpbmcoY29udGFpbmVyRWwsICd0cmlwcGluZycsICdUcmlwcGluZyBTdGF0ZSBJbWFnZScsICdJbWFnZSBzaG93biB3aGVuIHBldCBpcyB0cmlwcGluZycpO1xuICAgICAgICB0aGlzLmNyZWF0ZUltYWdlRmlsZVNldHRpbmcoY29udGFpbmVyRWwsICdraXNzaW5nJywgJ0tpc3NpbmcgU3RhdGUgSW1hZ2UnLCAnSW1hZ2Ugc2hvd24gd2hlbiBwZXQgaXMga2lzc2luZycpO1xuICAgICAgICB0aGlzLmNyZWF0ZUltYWdlRmlsZVNldHRpbmcoY29udGFpbmVyRWwsICdsYXVnaCcsICdMYXVnaGluZyBTdGF0ZSBJbWFnZScsICdJbWFnZSBzaG93biB3aGVuIHBldCBpcyBsYXVnaGluZycpO1xuICAgICAgICB0aGlzLmNyZWF0ZUltYWdlRmlsZVNldHRpbmcoY29udGFpbmVyRWwsICdoZWFydCcsICdIZWFydCBJbWFnZScsICdJbWFnZSB1c2VkIGZvciBzY29yZSBoZWFydHMnKTtcbiAgICAgICAgdGhpcy5jcmVhdGVJbWFnZUZpbGVTZXR0aW5nKGNvbnRhaW5lckVsLCAnYmFja2dyb3VuZCcsICdCYWNrZ3JvdW5kIEltYWdlJywgJ0JhY2tncm91bmQgaW1hZ2UgZm9yIHRoZSBwZXQgY29udGFpbmVyJyk7XG5cbiAgICB9XG59XG5cbmNsYXNzIEltYWdlU2VsZWN0b3JNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgICBvbkNob29zZTogKGZpbGU6IFRGaWxlKSA9PiB2b2lkO1xuICAgIGZpbGVzOiBURmlsZVtdO1xuXG4gICAgY29uc3RydWN0b3IoYXBwOiBBcHAsIG9uQ2hvb3NlOiAoZmlsZTogVEZpbGUpID0+IHZvaWQpIHtcbiAgICAgICAgc3VwZXIoYXBwKTtcbiAgICAgICAgdGhpcy5vbkNob29zZSA9IG9uQ2hvb3NlO1xuICAgICAgICB0aGlzLmZpbGVzID0gdGhpcy5nZXRJbWFnZUZpbGVzKCk7XG4gICAgfVxuXG4gICAgZ2V0SW1hZ2VGaWxlcygpOiBURmlsZVtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXBwLnZhdWx0LmdldEZpbGVzKCkuZmlsdGVyKGZpbGUgPT5cbiAgICAgICAgICAgIGZpbGUuZXh0ZW5zaW9uLnRvTG93ZXJDYXNlKCkgPT09ICdwbmcnIHx8XG4gICAgICAgICAgICBmaWxlLmV4dGVuc2lvbi50b0xvd2VyQ2FzZSgpID09PSAnanBnJyB8fFxuICAgICAgICAgICAgZmlsZS5leHRlbnNpb24udG9Mb3dlckNhc2UoKSA9PT0gJ2pwZWcnXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgb25PcGVuKCkge1xuICAgICAgICBjb25zdCB7Y29udGVudEVsfSA9IHRoaXM7XG4gICAgICAgIGNvbnRlbnRFbC5lbXB0eSgpO1xuXG4gICAgICAgIGNvbnRlbnRFbC5jcmVhdGVFbCgnaDInLCB7dGV4dDogJ0Nob29zZSBhbiBJbWFnZSd9KTtcblxuICAgICAgICBjb25zdCBjb250YWluZXIgPSBjb250ZW50RWwuY3JlYXRlRGl2KCdpbWFnZS1ncmlkJyk7XG4gICAgICAgIGNvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gJ2dyaWQnO1xuICAgICAgICBjb250YWluZXIuc3R5bGUuZ3JpZFRlbXBsYXRlQ29sdW1ucyA9ICdyZXBlYXQoYXV0by1maWxsLCBtaW5tYXgoMTAwcHgsIDFmcikpJztcbiAgICAgICAgY29udGFpbmVyLnN0eWxlLmdhcCA9ICcxMHB4JztcbiAgICAgICAgY29udGFpbmVyLnN0eWxlLnBhZGRpbmcgPSAnMTBweCc7XG4gICAgICAgIGNvbnRhaW5lci5zdHlsZS5tYXhIZWlnaHQgPSAnNDAwcHgnO1xuICAgICAgICBjb250YWluZXIuc3R5bGUub3ZlcmZsb3dZID0gJ2F1dG8nO1xuXG4gICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiB0aGlzLmZpbGVzKSB7XG4gICAgICAgICAgICBjb25zdCBpbWFnZUNvbnRhaW5lciA9IGNvbnRhaW5lci5jcmVhdGVEaXYoJ2ltYWdlLWNvbnRhaW5lcicpO1xuICAgICAgICAgICAgaW1hZ2VDb250YWluZXIuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuICAgICAgICAgICAgaW1hZ2VDb250YWluZXIuc3R5bGUuYm9yZGVyID0gJzFweCBzb2xpZCB2YXIoLS1iYWNrZ3JvdW5kLW1vZGlmaWVyLWJvcmRlciknO1xuICAgICAgICAgICAgaW1hZ2VDb250YWluZXIuc3R5bGUuYm9yZGVyUmFkaXVzID0gJzRweCc7XG4gICAgICAgICAgICBpbWFnZUNvbnRhaW5lci5zdHlsZS5wYWRkaW5nID0gJzVweCc7XG5cbiAgICAgICAgICAgIGNvbnN0IGltZyA9IGltYWdlQ29udGFpbmVyLmNyZWF0ZUVsKCdpbWcnLCB7XG4gICAgICAgICAgICAgICAgYXR0cjoge1xuICAgICAgICAgICAgICAgICAgICBzcmM6IHRoaXMuYXBwLnZhdWx0LmdldFJlc291cmNlUGF0aChmaWxlKSxcbiAgICAgICAgICAgICAgICAgICAgYWx0OiBmaWxlLmJhc2VuYW1lXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpbWcuc3R5bGUud2lkdGggPSAnMTAwJSc7XG4gICAgICAgICAgICBpbWcuc3R5bGUuaGVpZ2h0ID0gJ2F1dG8nO1xuICAgICAgICAgICAgaW1nLnN0eWxlLm9iamVjdEZpdCA9ICdjb250YWluJztcblxuICAgICAgICAgICAgY29uc3QgbGFiZWwgPSBpbWFnZUNvbnRhaW5lci5jcmVhdGVEaXYoKTtcbiAgICAgICAgICAgIGxhYmVsLnN0eWxlLnRleHRBbGlnbiA9ICdjZW50ZXInO1xuICAgICAgICAgICAgbGFiZWwuc3R5bGUuZm9udFNpemUgPSAnMC44ZW0nO1xuICAgICAgICAgICAgbGFiZWwuc3R5bGUubWFyZ2luVG9wID0gJzVweCc7XG4gICAgICAgICAgICBsYWJlbC50ZXh0Q29udGVudCA9IGZpbGUuYmFzZW5hbWU7XG5cbiAgICAgICAgICAgIGltYWdlQ29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMub25DaG9vc2UoZmlsZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbkNsb3NlKCkge1xuICAgICAgICBjb25zdCB7Y29udGVudEVsfSA9IHRoaXM7XG4gICAgICAgIGNvbnRlbnRFbC5lbXB0eSgpO1xuICAgIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBQUFBLG1CQUFxRzs7O0FDQXJHLHNCQUFtRztBQXVCNUYsSUFBTSxtQkFBdUM7QUFBQSxFQUNqRCxTQUFTO0FBQUEsRUFDVCxZQUFZO0FBQUEsRUFDWixlQUFlO0FBQUEsRUFDZixnQkFBZ0I7QUFBQSxFQUNoQixlQUFlO0FBQUEsRUFDZixlQUFlO0FBQUEsSUFDWCxPQUFPO0FBQUEsSUFDUCxRQUFRO0FBQUEsSUFDUixNQUFNO0FBQUEsSUFDTixLQUFLO0FBQUEsSUFDTCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixTQUFTO0FBQUEsSUFDVCxPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxZQUFZO0FBQUEsRUFDaEI7QUFDSDtBQUVPLElBQU0s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
