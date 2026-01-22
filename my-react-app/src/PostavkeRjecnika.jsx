import "./css/PostavkeRjecnika.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import wordList from './assets/wordlist.js';

const API_URL = import.meta.env.VITE_API_URL || '';

function PostavkeRjecnika() {
  const navigate = useNavigate();

  const [languages, setLanguages] = useState([]);
  const [selectedLanguageId, setSelectedLanguageId] = useState('');
  const [words, setWords] = useState([]);
  
  const [newLanguageName, setNewLanguageName] = useState('');
  const [newWord, setNewWord] = useState({ text: '', translation: '', phrases: '' });
  
  const [editingWord, setEditingWord] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  
  const fetchLanguages = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/api/languages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setLanguages(data);
    } catch (err) {
      console.error("Greška pri dohvaćanju jezika:", err);
    }
  };

  const fetchWords = async (langId) => {
    const token = localStorage.getItem("token");
    if (!langId) {
      setWords([]);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/words?language_id=${langId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setWords(data);
    } catch (err) {
      console.error("Greška pri dohvaćanju riječi:", err);
    }
  };
  
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    // Filtriraj lokalnu listu riječi. Puno brže od API poziva!
    const filtered = wordList.filter(word => 
      word.toLowerCase().startsWith(term.toLowerCase())
    );
    
    setSearchResults(filtered.slice(0, 10)); // Pokaži najviše 10 rezultata
  };

  const handleSelectSearchResult = (word) => {
    setNewWord({ text: word, translation: '', phrases: '' });
    setSearchTerm('');
    setSearchResults([]);
  };

  useEffect(() => {
    const userDataString = localStorage.getItem('user');
    if (!userDataString) {
      alert("Morate biti prijavljeni za pristup ovoj stranici.");
      navigate("/Prijava");
      return;
    }
    const user = JSON.parse(userDataString);
    if (user.role < 1) {
      alert("Nemate administratorska prava za pristup ovoj stranici.");
      navigate("/");
    } else {
      fetchLanguages();
    }
  }, [navigate]);

  useEffect(() => {
    fetchWords(selectedLanguageId);
  }, [selectedLanguageId]);

  const handleAddLanguage_func = async () => {
    const token = localStorage.getItem("token");
    if (!newLanguageName.trim()) return;

    if (
        languages.some(
          (lang) =>
            lang.language_name.toLowerCase() === newLanguageName.trim().toLowerCase()
        )
        ) {
          alert("Rječnik s tim imenom već postoji!");
          return;
        }

    await fetch(`${API_URL}/api/languages`, {
      method: 'POST',
      headers: {
        "Content-Type": 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ language_name: newLanguageName })
    });
    setNewLanguageName("");
    fetchLanguages();
  };
  const handleDeleteLanguage_func = async (langId) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Jeste li sigurni? Brisanje jezika će obrisati i sve povezane riječi.")) return;
    await fetch(`${API_URL}/api/languages/${langId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchLanguages();
    setSelectedLanguageId('');
  };
  const handleAddWord_func = async () => {
    const token = localStorage.getItem("token");
    if (!newWord.text.trim() || !selectedLanguageId) return;
    await fetch(`${API_URL}/api/words`, {
      method: 'POST',
      headers: {
        "Content-Type": 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        word_text: newWord.text,
        language_id: selectedLanguageId,
        translation_to_croatian: newWord.translation,
        phrases: newWord.phrases.split(',').map((p) => p.trim())
      })
    });
    setNewWord({ text: '', translation: '', phrases: '' });
    fetchWords(selectedLanguageId);
  };
  const handleDeleteWord_func = async (wordId) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Jeste li sigurni da želite obrisati ovu riječ?")) return;
    await fetch(`${import.meta.env.VITE_API_URL}/api/words/${wordId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchWords(selectedLanguageId);
  };
  const handleEditWord_func = (word) => {
    setEditingWord({ ...word, phrases: word.phrases ? word.phrases.join(', ') : '' });
  };
  const handleUpdateWord_func = async () => {
    const token = localStorage.getItem("token");
    if (!editingWord.word_text.trim()) return;
    await fetch(`${API_URL}/api/words/${editingWord.word_id}`, {
      method: 'PUT',
      headers: {
        "Content-Type": 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        word_text: editingWord.word_text,
        translation_to_croatian: editingWord.translation_to_croatian,
        phrases: editingWord.phrases.split(',').map((p) => p.trim())
      })
    });
    setEditingWord(null);
    fetchWords(selectedLanguageId);
  };
  const filteredWords = words.filter(
    (word) =>
      word.word_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.translation_to_croatian.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="containerPR">
      <h1 className="headerPR">Postavke riječnika</h1>
      <button className="Button" style={{ position: "absolute", top: "0px", left: "0px" }} onClick={() => navigate(-1)}>
        Natrag
      </button>

      <div className="PR">
        <p className="naslovPR">Upravljanje jezicima:</p>
        <div className="info">
          <p>Dodaj novi jezik:</p>
          <input
            type="text"
            value={newLanguageName}
            onChange={(e) => setNewLanguageName(e.target.value)}
            placeholder="Npr. Francuski"
          />
        </div>
        <button className="Button" onClick={handleAddLanguage_func}>
          Dodaj jezik
        </button>
        <ul className="word-list">
          {languages.map((lang) => (
            <li key={lang.language_id} className="word-list-item">
              <span>{lang.language_name}</span>
              <div className="word-actions">
                <button onClick={() => handleDeleteLanguage_func(lang.language_id)}>Obriši</button>
              </div>
            </li>
          ))}
        </ul>

        <hr />

        <p className="naslovPR">Odaberi jezik za rad:</p>
        <select
          className="language-select"
          value={selectedLanguageId}
          onChange={(e) => setSelectedLanguageId(e.target.value)}>
          <option value="">-- Odaberi --</option>
          {languages.map((lang) => (
            <option key={lang.language_id} value={lang.language_id}>
              {lang.language_name}
            </option>
          ))}
        </select>

        {selectedLanguageId && !editingWord && (
          <>
            {languages.find(l => l.language_id == selectedLanguageId)?.language_name.toLowerCase() === 'engleski' && (
              <>
                <p className="naslovPR">Pretraga engleskog rječnika:</p>
                <div className="info">
                  <p>Upiši početak riječi:</p>
                  <input
                    type="text"
                    placeholder="Npr. 'jour...'"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
                {searchResults.length > 0 && (
                  <ul className="search-results-list">
                    {searchResults.map((word, index) => (
                      <li key={index} onClick={() => handleSelectSearchResult(word)}>
                        {word}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
            <p className="naslovPR">Dodavanje riječi:</p>
            <div className="info">
              <p>Upiši riječ:</p>
              <input
                type="text"
                value={newWord.text}
                onChange={(e) => setNewWord({ ...newWord, text: e.target.value })}
              />
            </div>
            <div className="info">
              <p>Upiši prijevod riječi:</p>
              <input
                type="text"
                value={newWord.translation}
                onChange={(e) => setNewWord({ ...newWord, translation: e.target.value })}
              />
            </div>
            {languages.find(l => l.language_id == selectedLanguageId)?.language_name.toLowerCase() !== 'engleski' && (
              <div className="info">
                <p>Upiši frazu s kontekstom (odvojeno zarezom):</p>
                <input type="text" value={newWord.phrases} onChange={e => setNewWord({...newWord, phrases: e.target.value})} />
              </div>
            )}
            <button className="Button" onClick={handleAddWord_func}>
              Dodaj riječ
            </button>

            <p className="naslovPR">Postojeće riječi:</p>

            <div className="info">
              <p>Pretraži riječi:</p>
              <input
                type="text"
                placeholder="Unesite riječ ili prijevod..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <ul className="word-list">
              {filteredWords.map((word) => (
                <li key={word.word_id} className="word-list-item">
                  <span>
                    {word.word_text} -{">"} {word.translation_to_croatian}
                  </span>
                  <div className="word-actions">
                    <button className="gumb_uloga izmijeni" onClick={() => handleEditWord_func(word)}>
                      Izmijeni
                    </button>
                    <button className="gumb_uloga democija" onClick={() => handleDeleteWord_func(word.word_id)}>
                      Obriši
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {editingWord && (
          <div className="editing-section">
            <p className="naslovPR">Izmjena riječi:</p>
            <div className="info">
              <p>Riječ:</p>
              <input
                type="text"
                value={editingWord.word_text}
                onChange={(e) => setEditingWord({ ...editingWord, word_text: e.target.value })}
              />
            </div>
            <div className="info">
              <p>Prijevod:</p>
              <input
                type="text"
                value={editingWord.translation_to_croatian}
                onChange={(e) => setEditingWord({ ...editingWord, translation_to_croatian: e.target.value })}
              />
            </div>
            <div className="info">
              <p>Fraze (odvojeno zarezom):</p>
              <input
                type="text"
                value={editingWord.phrases}
                onChange={(e) => setEditingWord({ ...editingWord, phrases: e.target.value })}
              />
            </div>
            <button className="Button" onClick={handleUpdateWord_func}>
              Spremi promjene
            </button>
            <button className="Button" onClick={() => setEditingWord(null)}>
              Odustani
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PostavkeRjecnika;