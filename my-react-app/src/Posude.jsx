const interval = {
  0: 0,     //odmah
  1: 1440,  //1 dan, za probu prebacite na 10 ili 5 minuta pa da vidite kad se vrate pitanja 
  2: 2880,  //2 dana
  3: 5760,  //4 dana 
  4: 10080, //7 dana 
  5: 20160, //14 dana  
};

class rasporediPosude{
  constructor(languageId, userEmail, options = {}) {
    this.languageId = languageId;
    this.userEmail = userEmail;
    this.storageKey = `learning_${userEmail}_${languageId}`;
    this.wordProgress = {};
    this.load();
  }

  load() {
    try {
      const data = localStorage.getItem(this.storageKey);
      this.wordProgress = data ? JSON.parse(data) : {};
    } catch (error) {
      this.wordProgress = {};
    }
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.wordProgress));
    } catch (error) {
    }
  }

  getWordProgress(wordId) {
    if (!this.wordProgress[wordId]) {
      return {
        razina: 0,
        sljedeciDatum: new Date(Date.now() - 86400000).toISOString(), 
        zadnjiPokusaj: null
      };
    }
    return this.wordProgress[wordId];
  }

  setWordProgress(wordId, progress) {
    this.wordProgress[wordId] = progress;
    this.save();
  }

  obradi(wordId, tocanOdgovor) {
    const progress = this.getWordProgress(wordId);

    if (!tocanOdgovor) {
      progress.razina = 0;
    } else {
      progress.razina = Math.min(progress.razina + 1, 5);
    }

    const intervalMinuta = interval[progress.razina];
    const sljedeciDatum = new Date();
    
    const milisekunde = intervalMinuta * 60 * 1000;
    sljedeciDatum.setTime(sljedeciDatum.getTime() + milisekunde);
    
    progress.sljedeciDatum = sljedeciDatum.toISOString();
    progress.zadnjiPokusaj = new Date().toISOString();

    this.setWordProgress(wordId, progress);

    return {
      novaRazina: progress.razina,
      posuda: `${progress.razina}`
    };
  }

  filtrirajRijeci(words) {
    const sada = new Date();
    
    return words.filter(word => {
      const progress = this.getWordProgress(word.word_id);
      
      if (progress.razina >= 5) return false;

      const sljedeciDatum = new Date(progress.sljedeciDatum);
      return sljedeciDatum <= sada;
    });
  }


  reset() {
    this.wordProgress = {};
    this.save();
  }

  export() {
    return {
      languageId: this.languageId,
      userEmail: this.userEmail,
      data: this.wordProgress,
      exportDate: new Date().toISOString(),
    };
  }

  import(exportedData) {
    if (!exportedData || 
        exportedData.languageId !== this.languageId ||
        exportedData.userEmail !== this.userEmail) {
      return false;
    }
    
    this.wordProgress = exportedData.data;
    this.save();
    return true;
  }
}

export default rasporediPosude;
export {interval};