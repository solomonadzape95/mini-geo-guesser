import { useState } from "react";
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { Question } from '../types';

interface QuizProps {
  onComplete: () => void;
  questions: Question[];
}

export default function Quiz({ onComplete, questions }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [quizState, setQuizState] = useState<'answering' | 'results'>('answering');

  // Convert database question format to quiz format
  const getQuestionOptions = (question: Question): string[] => {
    const options = [];
    if (question.optionA) options.push(question.optionA);
    if (question.optionB) options.push(question.optionB);
    if (question.optionC) options.push(question.optionC);
    if (question.optionD) options.push(question.optionD);
    return options;
  };

  const getCorrectAnswerIndex = (question: Question): number => {
    const options = getQuestionOptions(question);
    const correctAnswer = question.answer;
    return options.findIndex(option => option === correctAnswer);
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizState('results');
    }
  };

  if (quizState === 'results') {
    const score = answers.reduce((acc: number, answer, index) => {
      const question = questions[index];
      const correctAnswerIndex = getCorrectAnswerIndex(question);
      return acc + (answer === correctAnswerIndex ? 1 : 0);
    }, 0);

    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 w-full max-w-2xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-satoshi font-bold mb-4 text-white text-center">Quiz Results</h2>
        <p className="text-base sm:text-lg mb-6 text-white/80 text-center">
          You scored {score} out of {questions.length}!
        </p>

        <div className="space-y-4">
          {questions.map((question, index) => {
            const userAnswer = answers[index];
            const correctAnswerIndex = getCorrectAnswerIndex(question);
            const options = getQuestionOptions(question);
            const isCorrect = userAnswer === correctAnswerIndex;
            
            return (
              <div key={question.id} className="bg-black/20 p-4 rounded-lg">
                <p className="font-bold text-white">{question.question}</p>
                <p className={`mt-2 text-sm ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  Your answer: {userAnswer !== null ? options[userAnswer] : 'No answer'}
                  {isCorrect ? <CheckCircleIcon className="w-5 h-5 inline ml-2" /> : <XCircleIcon className="w-5 h-5 inline ml-2" />}
                </p>
                {!isCorrect && (
                  <p className="mt-1 text-sm text-green-400">
                    Correct answer: {options[correctAnswerIndex]}
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

  const question = questions[currentQuestionIndex];
  const options = getQuestionOptions(question);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-8 w-full max-w-2xl mx-auto border border-white/20">
      <div className="mb-4 sm:mb-6">
        <span className="text-xs sm:text-sm text-white/60 font-satoshi">
          Question {currentQuestionIndex + 1} of {questions.length}
        </span>
        <h2 className="text-lg sm:text-xl font-satoshi font-bold mt-2 text-white">
          {question.question}
        </h2>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {options.map((option, index) => (
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
