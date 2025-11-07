import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./css/Igra.module.css";
import "./css/global.css";

export default function Igra() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mod, rjecnik, smijeIgrat } = location.state || {};

  const [words, setWords] = useState([]);
  const [choices, setChoices] = useState([]);
  const [currentWord, setCurrentWord] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!mod || !rjecnik) {
      navigate("/postavkeIgre");
    }
  }, [mod, rjecnik, navigate]);

  const fetchWords = async (langId) => {
    if (!langId) {
      setWords([]);
      return;
    }
    try {
      const response = await fetch(`/api/words?language_id=${langId}&mod=${mod}`);
      const data = await response.json();
      setWords(data);
    } catch (err) {
      console.error("Greška pri dohvaćanju riječi:", err);
    }
  };

  const fetchChoices = async (langId, wordId) => {
    if (!langId || !wordId) {
      setChoices([]);
      return;
    }
    try {
      const response = await fetch(`/api/words?language_id=${langId}&mod=${mod}&word_id=${wordId}`);
      const data = await response.json();
      setChoices(data);
    } catch (err) {
      console.error("Greška pri dohvaćanju odabira:", err);
    }
  };

  const generateQuestion = () => {
    if (words.length === 0) return;
    const index = Math.floor(Math.random() * words.length);
    const targetWord = words[index];
    setCurrentWord(targetWord);
    setCurrentQuestion(mod === "mod1" ? targetWord.word_text : targetWord.translation_to_croatian);
  };

  useEffect(() => {
    if (rjecnik) fetchWords(rjecnik);
  }, [rjecnik]);

  useEffect(() => {
    if (words.length > 0) {
      generateQuestion();
    }
  }, [words]);

  useEffect(() => {
    if (currentWord && rjecnik) fetchChoices(rjecnik, currentWord.word_id);
  }, [currentWord, rjecnik]);

  const handleSubmit = async () => {
    if (!selectedAnswer) {
      setResult("Please select an answer first!");
      return;
    }
    try {
      const res = await fetch(`/api/words/${currentWord.word_id}?language_id=${rjecnik}&mod=${mod}`);
      const correctAnswer = await res.json();
      if (selectedAnswer === correctAnswer) {
        setResult("Correct!");
      } else {
        setResult(`Incorrect. The correct answer was "${correctAnswer}".`);
      }
    } catch (err) {
      console.error("Greška pri dohvaćanju odgovora:", err);
      setResult("Error fetching the answer. Try again.");
    }
  };

  const handleNext = () => {
    generateQuestion();
    setSelectedAnswer(null);
    setResult(null);
  };

  const isAnswered = result && !result.includes("Please select");

  return (
    <div className={styles.game}>
        <button className={`${styles.thirdColor} ${styles.back}`} onClick={() => navigate(-1)}>
          Go Back
        </button>

      <div className={`${styles.gameContainer} ${styles.secondColor}`}>
        <div className={styles.question}>
          What is the Croatian translation for the word <strong>{currentQuestion}</strong>?
        </div>

        <ul className={styles.answers}>
          {choices?.map((ans, index) => (
            <li
              key={index}
              className={`${styles.answer} ${styles.thirdColor} ${
                selectedAnswer === ans ? styles.selected : ""
              }`}
              onClick={() => !isAnswered && setSelectedAnswer(ans)}
            >
              {ans}
            </li>
          ))}
        </ul>

        <div className={styles.buttons}>
          <button
            className={`${styles.submitButton} ${styles.thirdColor}`}
            onClick={handleSubmit}
            disabled={isAnswered}
          >
            Submit
          </button>

          <button
            id="next"
            className={`${styles.submitButton} ${styles.thirdColor}`}
            onClick={handleNext}
            disabled={!isAnswered}
          >
            Next
          </button>
        </div>

        {result && <div className={styles.result}>{result}</div>}
      </div>
    </div>
  );
}
