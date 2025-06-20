import { useState } from "react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizProps {
  onComplete: () => void;
}

const sampleQuestions: Question[] = [
  {
    id: 1,
    question: "What is the capital city of this country?",
    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
    correctAnswer: 0,
  },
  {
    id: 2,
    question: "Which continent is this location in?",
    options: ["North America", "Europe", "Asia", "Africa"],
    correctAnswer: 1,
  },
  {
    id: 3,
    question: "What is the main language spoken here?",
    options: ["English", "Spanish", "French", "German"],
    correctAnswer: 2,
  },
];

export default function Quiz({ onComplete }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);

    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    return answers.reduce((score, answer, index) => {
      return score + (answer === sampleQuestions[index].correctAnswer ? 1 : 0);
    }, 0);
  };

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="bg-white rounded-lg p-4 sm:p-8 w-full max-w-lg mx-auto">
        <h2 className="text-xl sm:text-2xl font-satoshi font-bold mb-4">Quiz Results</h2>
        <p className="text-base sm:text-lg mb-6">
          You scored {score} out of {sampleQuestions.length}!
        </p>
        <button
          onClick={onComplete}
          className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg font-satoshi hover:bg-blue-700 transition-colors"
        >
          Continue to Badge
        </button>
      </div>
    );
  }

  const question = sampleQuestions[currentQuestion];

  return (
    <div className="bg-white rounded-lg p-4 sm:p-8 w-full max-w-lg mx-auto">
      <div className="mb-4 sm:mb-6">
        <span className="text-xs sm:text-sm text-gray-500 font-satoshi">
          Question {currentQuestion + 1} of {sampleQuestions.length}
        </span>
        <h2 className="text-lg sm:text-xl font-satoshi font-bold mt-2">
          {question.question}
        </h2>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left text-sm sm:text-base bg-gray-100 rounded-lg font-satoshi hover:bg-gray-200 transition-colors"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
