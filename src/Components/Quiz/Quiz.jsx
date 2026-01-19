// Quiz.jsx
import React, { useState } from "react";
import "./Quiz.css";

const Quiz = () => {
  // Decode HTML entities
  const decodeHtml = (text) => {
    const doc = new DOMParser().parseFromString(text, "text/html");
    return doc.documentElement.textContent;
  };

  // Shuffle function
  const shuffleArray = (arr) => {
    return arr.sort(() => Math.random() - 0.5);
  };

  const [index, setIndex] = useState(0);
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedOption, setSelectedOption] = useState(null);
  const [lock, setLock] = useState(false);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(false);

  // ✅ Fetch Questions when Start button clicked
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      // reset quiz
      setIndex(0);
      setQuizData([]);
      setSelectedOption(null);
      setLock(false);
      setScore(0);
      setResult(false);

      // ✅ OpenTDB API
      const response = await fetch(
        "https://opentdb.com/api.php?amount=20&category=10&difficulty=easy&type=multiple"
      );

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        throw new Error("No questions received from OpenTDB");
      }

      const transformedData = data.results.map((item) => {
        const questionText = decodeHtml(item.question);

        const correct = decodeHtml(item.correct_answer);
        const incorrect = item.incorrect_answers.map((ans) => decodeHtml(ans));

        const options = shuffleArray([correct, ...incorrect]);

        const correctIndex = options.indexOf(correct) + 1; // 1-based index

        return {
          question: questionText,
          options: options,
          ans: correctIndex,
        };
      });

      setQuizData(transformedData);
    } catch (err) {
      setError(err.message);
      setQuizData([]);
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = quizData[index];

  const checkAns = (ans) => {
    if (lock) return;

    setSelectedOption(ans);

    if (currentQuestion.ans === ans) {
      setScore((prev) => prev + 1);
    }

    setLock(true);
  };

  const nextQuestion = () => {
    if (!lock) return;

    if (index === quizData.length - 1) {
      setResult(true);
      return;
    }

    setIndex((prev) => prev + 1);
    setSelectedOption(null);
    setLock(false);
  };

  return (
    <div className="container">
      <h1>Quiz App</h1>
      <hr />

      {/* Start Screen */}
      {quizData.length === 0 && !loading && !error && (
        <>
          <h2>Click Start to begin the Quiz 🚀</h2>
          <button onClick={fetchQuestions}>Start Quiz</button>
        </>
      )}

      {/* Loading */}
      {loading && <h2>Loading questions...</h2>}

      {/* Error Screen */}
      {error && (
        <>
          <h2>Error: {error}</h2>
          <p>Please try again.</p>
          <button onClick={fetchQuestions}>Try Again</button>
        </>
      )}

      {/* Quiz Screen */}
      {!loading && !error && quizData.length > 0 && (
        <>
          {result ? (
            <>
              <h2>
                Your Score: {score} / {quizData.length}
              </h2>

              {/* ✅ Changed here */}
              <button onClick={fetchQuestions}>Again Test</button>
            </>
          ) : (
            <>
              <h2>
                {index + 1}. {currentQuestion?.question}
              </h2>

              <ul className={lock ? "locked" : ""}>
                {currentQuestion?.options?.map((opt, i) => {
                  const optionNumber = i + 1;

                  let className = "";

                  if (lock) {
                    if (optionNumber === currentQuestion.ans)
                      className = "correct";
                    else if (optionNumber === selectedOption)
                      className = "wrong";
                  }

                  return (
                    <li
                      key={i}
                      className={className}
                      onClick={() => checkAns(optionNumber)}
                    >
                      {opt}
                    </li>
                  );
                })}
              </ul>

              <button onClick={nextQuestion}>Next</button>

              <div className="index">
                {index + 1} of {quizData.length} Questions
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Quiz;
