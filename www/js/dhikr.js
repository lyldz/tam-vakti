/**
 * Tam Vakti - Akıllı Zikirmatik & Kaza Namazı Takip Defteri
 * Sürüm: 2026.10.12
 */

class DhikrManager {
  constructor() {
    this.dhikrStages = [
      { text: "Sübhânallâh (سُبْحَانَ الله)", target: 33, meaning: "Allah her türlü eksiklikten münezzehtir" },
      { text: "Elhamdülillâh (الْحَمْدُ لِلَّهِ)", target: 33, meaning: "Hamd ve övgü yalnız Allah'a aittir" },
      { text: "Allâhuekber (اللهُ أَكْبَرُ)", target: 33, meaning: "Allah en büyüktür" },
      { text: "Lâ ilâhe illallâh...", target: 1, meaning: "Lâ ilâhe illallâhu vahdehû lâ şerîke leh..." }
    ];
    this.currentStageIndex = 0;
    this.count = 0;

    // Kaza Namazları Deposu
    this.kazaStorageKey = "tamvakti_kaza_records";
    this.kazaDefaults = {
      sabah: 0,
      ogle: 0,
      ikindi: 0,
      aksam: 0,
      yatsi: 0,
      vitir: 0,
      oruc: 0
    };
  }

  // Zikirmatik İşlemleri
  increment(onUpdate) {
    const currentStage = this.dhikrStages[this.currentStageIndex];
    this.count++;

    // Dokunma titreşimi
    if (navigator.vibrate) {
      navigator.vibrate(15);
    }

    if (this.count >= currentStage.target) {
      // Aşama bittiğinde uzun titreşim
      if (navigator.vibrate) {
        navigator.vibrate([40, 60, 40]);
      }
      if (this.currentStageIndex < this.dhikrStages.length - 1) {
        this.currentStageIndex++;
        this.count = 0;
      }
    }

    if (onUpdate) {
      onUpdate(this.getCurrentState());
    }
  }

  reset(onUpdate) {
    this.currentStageIndex = 0;
    this.count = 0;
    if (onUpdate) {
      onUpdate(this.getCurrentState());
    }
  }

  getCurrentState() {
    const stage = this.dhikrStages[this.currentStageIndex];
    return {
      title: stage.text,
      meaning: stage.meaning,
      count: this.count,
      target: stage.target,
      stageIndex: this.currentStageIndex,
      isFinished: this.currentStageIndex === this.dhikrStages.length - 1 && this.count >= stage.target
    };
  }

  // Kaza Namazı Defteri İşlemleri
  getKazaRecords() {
    try {
      const data = localStorage.getItem(this.kazaStorageKey);
      return data ? { ...this.kazaDefaults, ...JSON.parse(data) } : { ...this.kazaDefaults };
    } catch (e) {
      return { ...this.kazaDefaults };
    }
  }

  saveKazaRecords(records) {
    localStorage.setItem(this.kazaStorageKey, JSON.stringify(records));
  }

  updateKaza(key, delta) {
    const records = this.getKazaRecords();
    if (records[key] !== undefined) {
      records[key] = Math.max(0, records[key] + delta);
      this.saveKazaRecords(records);
    }
    return records;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DhikrManager };
}
