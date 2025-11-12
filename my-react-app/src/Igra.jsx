import "./css/Igra.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import rasporediPosude from "./Posude.jsx";


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
      const response = await fetch(`/api/words?language_id=${langId}&mod=${mod}`, {
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
      const response = await fetch(`/api/words?language_id=${langId}&mod=${mod}&word_id=${wordId}`, {
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
      const res = await fetch(`/api/words/${wordId}?language_id=${rjecnik}&mod=${mod}`, {
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
    generateQuestion();
  };

  const isAnswered = result && !result.includes("Please select");

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
        ) : (
          <div className="question">
            <p>Gotovo za danas</p>
            <button 
              className="third-color" 
              onClick={() => navigate("/postavkeIgre")}
              style={{ marginTop: "20px", padding: "10px 20px" }}
            >
              Natrag na postavke
            </button>
          </div>
        )}
      </div>
    </div>
  );
}