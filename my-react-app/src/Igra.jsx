import "./css/Igra.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Igra() {
  const navigate = useNavigate();

  const wordData = [
    { word: "adjust", answers: ["adapt", "change", "refuse", "ignore"], correct: "adapt" },
    { word: "decline", answers: ["refuse", "accept", "rise", "agree"], correct: "refuse" },
    { word: "indirect", answers: ["roundabout", "straight", "clear", "simple"], correct: "roundabout" },
    { word: "valid", answers: ["correct", "false", "wrong", "fake"], correct: "correct" },
  ];

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [result, setResult] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuestion = wordData[currentIndex];

  function handleSubmit() {
    if (!selectedAnswer) {
      setResult("Please select an answer first!");
      return;
    }

    if (selectedAnswer === currentQuestion.correct) {
      setResult("Correct!");
    } else {
      setResult(`Incorrect. The correct answer was "${currentQuestion.correct}".`);
    }
  }

  function handleNext() {
    const nextIndex = (currentIndex + 1) % wordData.length;
    setCurrentIndex(nextIndex);
    setSelectedAnswer(null);
    setResult(null);
  }

  const isAnswered = result && !result.includes("Please select");

  return (
    <div className="game">
      <header>
        <button className="submit-button third-color back" onClick={() => navigate("/")}>Go Back</button>
      </header>
      <div className="game-container second-color">
        <div className="question">
          What is a synonym for the word <strong>{currentQuestion.word}</strong>?
        </div>

        <ul className="answers">
          {currentQuestion.answers.map((ans, index) => (
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

        {result && <div className="result">{result}</div>}
      </div>
    </div>
  );
}
