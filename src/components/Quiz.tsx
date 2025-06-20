import { useState } from "react";
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(sampleQuestions.length).fill(null));
  const [quizState, setQuizState] = useState<'answering' | 'results'>('answering');

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);

    if (currentQuestionIndex < sampleQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizState('results');
    }
  };

  if (quizState === 'results') {
    const score = answers.reduce((acc: number, answer, index) => {
      return acc + (answer === sampleQuestions[index].correctAnswer ? 1 : 0);
    }, 0);

    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 w-full max-w-2xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-satoshi font-bold mb-4 text-white text-center">Quiz Results</h2>
        <p className="text-base sm:text-lg mb-6 text-white/80 text-center">
          You scored {score} out of {sampleQuestions.length}!
        </p>

        <div className="space-y-4">
          {sampleQuestions.map((q, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === q.correctAnswer;
            return (
              <div key={q.id} className="bg-black/20 p-4 rounded-lg">
                <p className="font-bold text-white">{q.question}</p>
                <p className={`mt-2 text-sm ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  Your answer: {userAnswer !== null ? q.options[userAnswer] : 'No answer'}
                  {isCorrect ? <CheckCircleIcon className="w-5 h-5 inline ml-2" /> : <XCircleIcon className="w-5 h-5 inline ml-2" />}
                </p>
                {!isCorrect && (
                  <p className="mt-1 text-sm text-green-400">
                    Correct answer: {q.options[q.correctAnswer]}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={onComplete}
          className="w-full mt-6 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg font-satoshi hover:bg-blue-700 transition-colors"
        >
          Claim Your Badge
        </button>
      </div>
    );
  }

  const question = sampleQuestions[currentQuestionIndex];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-8 w-full max-w-2xl mx-auto border border-white/20">
      <div className="mb-4 sm:mb-6">
        <span className="text-xs sm:text-sm text-white/60 font-satoshi">
          Question {currentQuestionIndex + 1} of {sampleQuestions.length}
        </span>
        <h2 className="text-lg sm:text-xl font-satoshi font-bold mt-2 text-white">
          {question.question}
        </h2>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left text-sm sm:text-base bg-white/10 text-white rounded-lg font-satoshi hover:bg-white/20 transition-colors"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
