import "./css/Igra.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import rasporediPosude from "./Posude.jsx";

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Igra() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mod, rjecnik, smijeIgrat } = location.state || {};

  const [user, setUser] = useState(null);
  const [allWords, setAllWords] = useState([]);
  const [words, setWords] = useState([]);
  const [choices, setChoices] = useState([]);
  const [currentWord, setCurrentWord] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [result, setResult] = useState(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const mediaRecorderRef = useRef(null);
  
  const [audioSrc, setAudioSrc] = useState('');
  const [audioStatus, setAudioStatus] = useState('idle');
 
  const raspored = useMemo(() => {
    if (!rjecnik || !user) return null;
    return new rasporediPosude(rjecnik, user.email);
  }, [rjecnik, user]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    if (!mod || !rjecnik) {
      navigate("/postavkeIgre");
    }

  }, [mod, rjecnik, navigate]);

  const fetchWords = async (langId) => {
    const token = localStorage.getItem("token"); 
    if (!langId) {
      setAllWords([]);
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/api/words?language_id=${langId}&mod=${mod}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAllWords(data);
  
      if (raspored && data.length > 0) {
        const filtrirane = raspored.filtrirajRijeci(data);
        setWords(filtrirane);
      } else {
        setWords([]);
      }
      

    } catch (err) {
      console.error("Greška pri dohvaćanju riječi:", err);
    }
  };

  const fetchChoices = async (langId, wordId) => {
    const token = localStorage.getItem("token"); 
    if (!langId || !wordId) {
      setChoices([]);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/words?language_id=${langId}&mod=${mod}&word_id=${wordId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setChoices(data);
    } catch (err) {
      console.error("Greška pri dohvaćanju odabira:", err);
    }
  };

  const generateQuestion = () => {
    if (words.length === 0) {
      setCurrentWord(null);
      return;
    }
    const index = Math.floor(Math.random() * words.length);
    const targetWord = words[index];
    setCurrentWord(targetWord);
    setCurrentQuestion(mod === "mod1" ? targetWord.word_text : targetWord.translation_to_croatian);
    if (mod === 'mod4') {
      fetchAudio(targetWord.word_id);
    }
  };

  useEffect(() => {
    if (rjecnik && raspored) {
      fetchWords(rjecnik);
    }
  }, [rjecnik, raspored]);

  useEffect(() => {
    if (words.length > 0 && !currentWord) {
      generateQuestion();
    }
  }, [words]);

  useEffect(() => {
    if (currentWord && rjecnik) fetchChoices(rjecnik, currentWord.word_id);
  }, [currentWord, rjecnik]);


  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!selectedAnswer) {
      setResult("Please select an answer first!");
      return;
    }
    
    try {
      const wordId = currentWord.word_id;
      const res = await fetch(`${API_URL}/api/words/${wordId}?language_id=${rjecnik}&mod=${mod}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const correctAnswer = await res.json();
      const isCorrect = selectedAnswer === correctAnswer;
      const rezultat = raspored.obradi(wordId, isCorrect);

      if (isCorrect) {
        setResult(`Correct! "${rezultat.posuda}".`);
      } else {
        setResult(`Incorrect. The correct answer was "${correctAnswer}" "${rezultat.posuda}".`);
      }
      const filtrirane = raspored.filtrirajRijeci(allWords);
      setWords(filtrirane);

    } catch (err) {
      console.error("Greška pri obradi odgovora:", err);
      setResult("Error fetching the answer. Try again.");
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setResult(null);
    setCurrentWord(null);
    setRecordedAudio(null);
    generateQuestion();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks = [];
      mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        setRecordedAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      setRecordedAudio(null);
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) { alert("Nije moguće pristupiti mikrofonu."); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const checkPronunciation = async () => {
    if (!recordedAudio) return;
    
    const formData = new FormData();
    formData.append('audio', recordedAudio, 'pronunciation.webm');
    formData.append('word_text', currentWord.word_text);
    
    setResult("Šaljem na provjeru...");

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/pronunciation/check`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
        });

        const data = await response.json();
        
        if (response.status === 503) {
            setResult(data.error);
            raspored.obradi(currentWord.word_id, true);
        } else if (response.ok) {
            const score = data.score.toFixed(1);
            const isCorrect = score >= 7.0;
            const srsResult = raspored.obradi(currentWord.word_id, isCorrect);
            setResult(`Ocjena izgovora: ${score}/10. ${isCorrect ? 'Odlično!' : 'Pokušaj opet!'} Nova razina: ${srsResult.posuda}.`);
        } else {
            setResult("Došlo je do greške pri provjeri.");
        }
    } catch (err) {
        setResult("Došlo je do greške pri spajanju.");
    }
    const filtrirane = raspored.filtrirajRijeci(allWords);
    setWords(filtrirane);
  };
  
  const fetchAudio = async (wordId) => {
    setAudioStatus('loading');
    setAudioSrc('');
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/api/words/${wordId}/pronunciation`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-cache'
      });
      if (!response.ok) throw new Error('Audio not found on server');
      const audioBlob = await response.blob();
      if (audioBlob.size === 0) throw new Error("Prazan audio zapis.");
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioSrc(audioUrl);
      setAudioStatus('loaded');
    } catch (err) {
      console.error("Greška pri dohvaćanju zvuka:", err);
      setAudioStatus('error');
    }
  };
  
  const isAnswered = !!result;
  
  useEffect(() => {
    return () => {
      if (audioSrc) {
        URL.revokeObjectURL(audioSrc);
      }
    };
  }, [audioSrc]); 
  
  return (
    <div className="game">
      <header>
        <button className="third-color back" onClick={() => navigate(-1)}>
          Natrag
        </button>
      </header>

      <div className="game-container second-color">
        {currentWord ? (
          <>
            {mod === 'mod4' ? (
              <>
                <div className="question">Poslušaj i izgovori riječ: <strong>{currentWord.word_text}</strong></div>

                {audioStatus === 'loading' && <p>Učitavam zvuk...</p>}
                {audioStatus === 'error' && <p style={{color: 'red'}}>Greška pri učitavanju zvuka.</p>}
                {audioStatus === 'loaded' && (
                  <audio 
                    src={audioSrc}
                    controls 
                    controlsList="nodownload"
                  />
                )}
                <div className="buttons">
                  <button 
                    className="submit-button third-color" 
                    onClick={isRecording ? stopRecording : startRecording} 
                    disabled={isAnswered}
                  >
                    {isRecording ? '⏹️ Zaustavi snimanje' : '🎙️ Snimi izgovor'}
                  </button>

                  {recordedAudio && !result && (
                    <button 
                      className="submit-button third-color" 
                      onClick={checkPronunciation}
                    >
                      Provjeri
                    </button>
                  )}
                </div>

                {result && <div className="result">{result}</div>}

                <button 
                  id="next" 
                  className="submit-button third-color next-button" 
                  onClick={handleNext} 
                  disabled={!isAnswered}
                >
                  Sljedeće
                </button>
              </>
            ) : (
              <>
                <div className="question">
                  {mod === "mod1" 
                    ? <>Što je hrvatski prijevod za riječ <strong>{currentQuestion}</strong>?</>
                    : <>Što je engleski prijevod za riječ <strong>{currentQuestion}</strong>?</>
                  }
                </div>

                <ul className="answers">
                  {choices?.map((ans, index) => (
                    <li
                      key={index}
                      className={`answer third-color ${selectedAnswer === ans ? "selected" : ""}`}
                      onClick={() => !isAnswered && setSelectedAnswer(ans)}
                    >
                      {ans}
                    </li>
                  ))}
                </ul>

                <div className="buttons">
                  <button
                    className="submit-button third-color"
                    onClick={handleSubmit}
                    disabled={isAnswered}
                  >
                    Potvrdi
                  </button>

                  <button
                    id="next"
                    className="submit-button third-color next-button"
                    onClick={handleNext}
                    disabled={!isAnswered}
                  >
                    Sljedeće
                  </button>
                </div>

                {result && <div className="result">{result}</div>}
              </>
            )}
          </>
        ) : (
          <div className="question">
            <p>Gotovo za danas</p>
            <button 
              className="third-color" 
              onClick={() => navigate("/postavkeIgre")}
              style={{ marginTop: "20px", padding: "10px 20px", cursor: 'pointer' }}
            >
              Natrag na postavke
            </button>
          </div>
        )}
      </div>
    </div>
  );
}