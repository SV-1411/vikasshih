import React, { useState } from 'react';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { ExerciseSchema } from '../types';

interface QuizEngineProps {
  exercises: ExerciseSchema[];
  onComplete: (score: number, answers: Record<number, any>) => void;
}

export default function QuizEngine({ exercises, onComplete }: QuizEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const currentExercise = exercises[currentIndex];

  const handleAnswer = (answer: any) => {
    setAnswers(prev => ({ ...prev, [currentIndex]: answer }));
  };

  const nextQuestion = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSubmitted(false);
    } else {
      calculateScore();
    }
  };

  const calculateScore = () => {
    let correct = 0;
    exercises.forEach((exercise, index) => {
      const userAnswer = answers[index];
      const correctAnswer = exercise.correctAnswer;
      
      if (exercise.type === 'multi-select') {
        const isCorrect = Array.isArray(userAnswer) && Array.isArray(correctAnswer) &&
          userAnswer.length === correctAnswer.length &&
          userAnswer.every(ans => correctAnswer.includes(ans));
        if (isCorrect) correct++;
      } else {
        if (userAnswer === correctAnswer) correct++;
      }
    });

    const score = Math.round((correct / exercises.length) * 100);
    setShowResults(true);
    onComplete(score, answers);
  };

  const isAnswerCorrect = (exerciseIndex: number) => {
    const exercise = exercises[exerciseIndex];
    const userAnswer = answers[exerciseIndex];
    
    if (exercise.type === 'multi-select') {
      return Array.isArray(userAnswer) && Array.isArray(exercise.correctAnswer) &&
        userAnswer.length === exercise.correctAnswer.length &&
        userAnswer.every(ans => exercise.correctAnswer.includes(ans));
    }
    
    return userAnswer === exercise.correctAnswer;
  };

  if (showResults) {
    const correctCount = exercises.filter((_, index) => isAnswerCorrect(index)).length;
    const score = Math.round((correctCount / exercises.length) * 100);
    
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            score >= 70 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {score >= 70 ? <CheckCircle size={32} /> : <XCircle size={32} />}
          </div>
          <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
          <p className="text-lg text-gray-600">
            You scored {correctCount} out of {exercises.length} ({score}%)
          </p>
        </div>

        <div className="space-y-4">
          {exercises.map((exercise, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  isAnswerCorrect(index) ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {isAnswerCorrect(index) ? '✓' : '✗'}
                </div>
                <div className="flex-1">
                  <p className="font-medium mb-2">{exercise.question}</p>
                  <p className="text-sm text-gray-600">
                    Your answer: {Array.isArray(answers[index]) ? answers[index].join(', ') : answers[index]}
                  </p>
                  {!isAnswerCorrect(index) && (
                    <p className="text-sm text-green-600">
                      Correct answer: {Array.isArray(exercise.correctAnswer) 
                        ? exercise.correctAnswer.join(', ') 
                        : exercise.correctAnswer}
                    </p>
                  )}
                  {exercise.explanation && (
                    <p className="text-sm text-blue-600 mt-1">{exercise.explanation}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const renderExercise = () => {
    switch (currentExercise.type) {
      case 'mcq':
        return (
          <div className="space-y-3">
            {currentExercise.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${currentIndex}`}
                  value={option}
                  checked={answers[currentIndex] === option}
                  onChange={(e) => handleAnswer(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-800">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'multi-select':
        return (
          <div className="space-y-3">
            {currentExercise.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  value={option}
                  checked={answers[currentIndex]?.includes(option) || false}
                  onChange={(e) => {
                    const currentAnswers = answers[currentIndex] || [];
                    if (e.target.checked) {
                      handleAnswer([...currentAnswers, option]);
                    } else {
                      handleAnswer(currentAnswers.filter((ans: string) => ans !== option));
                    }
                  }}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-800">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'fill-blank':
        return (
          <input
            type="text"
            value={answers[currentIndex] || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder="Enter your answer..."
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );

      default:
        return <div>Unknown exercise type</div>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">
            Question {currentIndex + 1} of {exercises.length}
          </span>
          <div className="flex space-x-1">
            {exercises.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentIndex 
                    ? 'bg-blue-500' 
                    : index < currentIndex 
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-6">{currentExercise.question}</h3>
        {renderExercise()}
      </div>

      {submitted && (
        <div className={`mb-4 p-3 rounded-lg ${
          isAnswerCorrect(currentIndex) ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {isAnswerCorrect(currentIndex) ? 'Correct!' : 'Incorrect'}
          {currentExercise.explanation && (
            <p className="mt-2 text-sm">{currentExercise.explanation}</p>
          )}
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => {
            if (currentIndex > 0) {
              setCurrentIndex(prev => prev - 1);
              setSubmitted(false);
            }
          }}
          disabled={currentIndex === 0}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
        >
          Previous
        </button>

        <button
          onClick={() => {
            if (!submitted) {
              setSubmitted(true);
            } else {
              nextQuestion();
            }
          }}
          disabled={!answers[currentIndex]}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          <span>{!submitted ? 'Submit' : currentIndex === exercises.length - 1 ? 'Finish' : 'Next'}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}