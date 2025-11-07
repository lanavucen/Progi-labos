import "./css/Igra.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function Igra() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mod, rjecnik } = location.state || {};
  const [words, setWords] = useState([]);
  const [currentWordOption, setCurrentWordOption] = useState(null); 
  const [currentWordQuestion, setCurrentWordQuestion] = useState(null); 
  const [choices, setChoices] = useState([]); 

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
  if (rjecnik) fetchWords(rjecnik);
}, [rjecnik]);
  

const generateQuestion = () => {
  const index = Math.floor(Math.random() * words.length);
  const targetWord = words[index];
  const potentialDistractors = words.filter(w => w.word_id !== targetWord.word_id);
  const SortedPotentialDistractors = potentialDistractors.sort(() => Math.random() - 0.5);
  const distractors = SortedPotentialDistractors.slice(0, 3);
  if(mod == "mod1"){
    const choicesRandom = [...distractors, targetWord].sort(() => Math.random() - 0.5).map(w => w.translation_to_croatian);
    setCurrentWordQuestion(targetWord.word_text);
    setCurrentWordOption(targetWord.translation_to_croatian);
    setChoices(choicesRandom);

  } else if(mod == "mod2"){
    const choicesRandom = [...distractors, targetWord].sort(() => Math.random() - 0.5).map(w => w.word_text);
    setCurrentWordQuestion(targetWord.translation_to_croatian);
    setCurrentWordOption(targetWord.word_text);
    setChoices(choicesRandom);
  }
};

useEffect(() => {
  if (words.length > 0) {
    generateQuestion();
  }
}, [words]);



  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [result, setResult] = useState(null);


  function handleSubmit() {
    if (!selectedAnswer) {
      setResult("Please select an answer first!");
      return;
    }

    if (selectedAnswer === currentWordOption) {
      setResult("Correct!");
    } else {
      setResult(`Incorrect. The correct answer was "${currentWordOption}".`);
    }
  }

  function handleNext() {
    generateQuestion();
    setSelectedAnswer(null);
    setResult(null);
  }

  const isAnswered = result && !result.includes("Please select");

  return (
    <div className="game">
      <header>
        <button className="third-color back" onClick={() => navigate(-1)}>Go Back</button>
      </header>
      <div className="game-container second-color">
        <div className="question">
          What is the Croatian translation for the word <strong>{currentWordQuestion}</strong>?
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
            Submit
          </button>

          <button
            id="next"
            className="submit-button third-color next-button"
            onClick={handleNext}
            disabled={!isAnswered}
          >
            Next
          </button>
        </div>

        {<div className="result">{result}</div>}
      </div>
    </div>
  );
}
