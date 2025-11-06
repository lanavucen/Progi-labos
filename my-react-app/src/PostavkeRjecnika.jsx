import "./css/PostavkeRjecnika.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function PostavkeRjecnika() {
  const navigate = useNavigate();

  const [languages, setLanguages] = useState([]);
  const [selectedLanguageId, setSelectedLanguageId] = useState('');
  const [words, setWords] = useState([]);
  
  const [newLanguageName, setNewLanguageName] = useState('');
  const [newWord, setNewWord] = useState({ text: '', translation: '', phrases: '' });
  
  const [editingWord, setEditingWord] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  
  const fetchLanguages = async () => {
    try {
      const response = await fetch('/api/languages');
      const data = await response.json();
      setLanguages(data);
    } catch (err) { console.error("Greška pri dohvaćanju jezika:", err); }
  };

  const fetchWords = async (langId) => {
    if (!langId) {
      setWords([]);
      return;
    }
    try {
      const response = await fetch(`/api/words?language_id=${langId}`);
      const data = await response.json();
      setWords(data);
    } catch (err) { console.error("Greška pri dohvaćanju riječi:", err); }
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
    if (!newLanguageName.trim()) return;
    await fetch('/api/languages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ language_name: newLanguageName }) });
    setNewLanguageName(''); fetchLanguages();
  };
  const handleDeleteLanguage_func = async (langId) => {
    if (!window.confirm("Jeste li sigurni? Brisanje jezika će obrisati i sve povezane riječi.")) return;
    await fetch(`/api/languages/${langId}`, { method: 'DELETE' });
    fetchLanguages(); setSelectedLanguageId('');
  };
  const handleAddWord_func = async () => {
    if (!newWord.text.trim() || !selectedLanguageId) return;
    await fetch('/api/words', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ word_text: newWord.text, language_id: selectedLanguageId, translation_to_croatian: newWord.translation, phrases: newWord.phrases.split(',').map(p => p.trim()) }) });
    setNewWord({ text: '', translation: '', phrases: '' }); fetchWords(selectedLanguageId);
  };
  const handleDeleteWord_func = async (wordId) => {
    if (!window.confirm("Jeste li sigurni da želite obrisati ovu riječ?")) return;
    await fetch(`/api/words/${wordId}`, { method: 'DELETE' });
    fetchWords(selectedLanguageId);
  };
  const handleEditWord_func = (word) => { setEditingWord({ ...word, phrases: word.phrases ? word.phrases.join(', ') : '' }); };
  const handleUpdateWord_func = async () => {
    if (!editingWord.word_text.trim()) return;
    await fetch(`/api/words/${editingWord.word_id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ word_text: editingWord.word_text, translation_to_croatian: editingWord.translation_to_croatian, phrases: editingWord.phrases.split(',').map(p => p.trim()) }) });
    setEditingWord(null); fetchWords(selectedLanguageId);
  };
  const filteredWords = words.filter(word => 
    word.word_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.translation_to_croatian.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="containerPR">
      <h1 className="headerPR">Postavke riječnika</h1>
      <button className="Button" style={{ position: 'absolute', top: '40px', right: '400px' }} onClick={() => navigate(-1)}>Natrag</button>
      
      <div className="PR">
        <p className="naslovPR">Upravljanje jezicima:</p>
        <div className="info">
          <p>Dodaj novi jezik:</p>
          <input type="text" value={newLanguageName} onChange={e => setNewLanguageName(e.target.value)} placeholder="Npr. Francuski" />
        </div>
        <button className="Button" onClick={handleAddLanguage_func}>Dodaj jezik</button>
        <ul className="word-list">
          {languages.map(lang => (
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
        <select className="language-select" value={selectedLanguageId} onChange={e => setSelectedLanguageId(e.target.value)}>
          <option value="">-- Odaberi --</option>
          {languages.map(lang => <option key={lang.language_id} value={lang.language_id}>{lang.language_name}</option>)}
        </select>

        {selectedLanguageId && !editingWord && (
          <>
            <p className="naslovPR">Dodavanje riječi:</p>
            <div className="info">
              <p>Upiši riječ:</p>
              <input type="text" value={newWord.text} onChange={e => setNewWord({...newWord, text: e.target.value})} />
            </div>
            <div className="info">
              <p>Upiši prijevod riječi:</p>
              <input type="text" value={newWord.translation} onChange={e => setNewWord({...newWord, translation: e.target.value})} />
            </div>
            <div className="info">
              <p>Upiši frazu s kontekstom (odvojeno zarezom):</p>
              <input type="text" value={newWord.phrases} onChange={e => setNewWord({...newWord, phrases: e.target.value})} />
            </div>
            <button className="Button" onClick={handleAddWord_func}>Dodaj riječ</button>

            <p className="naslovPR">Postojeće riječi:</p>
            
            <div className="info">
              <p>Pretraži riječi:</p>
              <input 
                type="text" 
                placeholder="Unesite riječ ili prijevod..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <ul className="word-list">
              {filteredWords.map(word => (
                <li key={word.word_id} className="word-list-item">
                  <span>{word.word_text} -> {word.translation_to_croatian}</span>
                  <div className="word-actions">
                    <button className="gumb_uloga izmijeni" onClick={() => handleEditWord_func(word)}>Izmijeni</button>
                    <button className="gumb_uloga democija" onClick={() => handleDeleteWord_func(word.word_id)}>Obriši</button>
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
              <input type="text" value={editingWord.word_text} onChange={e => setEditingWord({...editingWord, word_text: e.target.value})} />
            </div>
            <div className="info">
              <p>Prijevod:</p>
              <input type="text" value={editingWord.translation_to_croatian} onChange={e => setEditingWord({...editingWord, translation_to_croatian: e.target.value})} />
            </div>
            <div className="info">
              <p>Fraze (odvojeno zarezom):</p>
              <input type="text" value={editingWord.phrases} onChange={e => setEditingWord({...editingWord, phrases: e.target.value})} />
            </div>
            <button className="Button" onClick={handleUpdateWord_func}>Spremi promjene</button>
            <button className="Button" onClick={() => setEditingWord(null)}>Odustani</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PostavkeRjecnika;