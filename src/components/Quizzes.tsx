import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { Profile, Classroom } from '../types';

interface Quiz {
  id: string;
  classroom_id: string;
  title: string;
  question: string;
  options: string[];
  correct_answer: number;
  created_by: string;
  created_at: string;
}

interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  selected_answer: number;
  is_correct: boolean;
  completed_at: string;
}

interface QuizzesProps {
  classroom: Classroom;
  currentUser: Profile;
}

const Quizzes: React.FC<QuizzesProps> = ({ classroom, currentUser }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<Record<string, QuizAttempt>>({});
  const [showResult, setShowResult] = useState<QuizAttempt | null>(null);
  
  // Create quiz form
  const [quizForm, setQuizForm] = useState({
    title: '',
    question: '',
    options: ['', '', '', ''],
    correct_answer: 0
  });

  useEffect(() => {
    loadQuizzes();
    loadAttempts();
  }, [classroom.id]);

  const loadQuizzes = () => {
    const stored: Quiz[] = JSON.parse(localStorage.getItem('demo_quizzes') || '[]');
    const classroomQuizzes = stored.filter(q => q.classroom_id === classroom.id);
    setQuizzes(classroomQuizzes);
  };

  const loadAttempts = () => {
    const stored: QuizAttempt[] = JSON.parse(localStorage.getItem('demo_quiz_attempts') || '[]');
    const userAttempts: Record<string, QuizAttempt> = {};
    stored.forEach(attempt => {
      if (attempt.student_id === currentUser.id) {
        userAttempts[attempt.quiz_id] = attempt;
      }
    });
    setAttempts(userAttempts);
  };

  const handleCreateQuiz = () => {
    if (!quizForm.title.trim() || !quizForm.question.trim()) return;
    if (quizForm.options.some(opt => !opt.trim())) return alert('All options must be filled');

    const newQuiz: Quiz = {
      id: `quiz_${Date.now()}`,
      classroom_id: classroom.id,
      title: quizForm.title,
      question: quizForm.question,
      options: quizForm.options,
      correct_answer: quizForm.correct_answer,
      created_by: currentUser.id,
      created_at: new Date().toISOString()
    };

    const stored: Quiz[] = JSON.parse(localStorage.getItem('demo_quizzes') || '[]');
    stored.push(newQuiz);
    localStorage.setItem('demo_quizzes', JSON.stringify(stored));

    setQuizzes(prev => [...prev, newQuiz]);
    setShowCreateModal(false);
    setQuizForm({ title: '', question: '', options: ['', '', '', ''], correct_answer: 0 });
  };

  const handleSubmitAnswer = () => {
    if (!selectedQuiz || selectedAnswer === null) return;

    const attempt: QuizAttempt = {
      id: `attempt_${Date.now()}`,
      quiz_id: selectedQuiz.id,
      student_id: currentUser.id,
      selected_answer: selectedAnswer,
      is_correct: selectedAnswer === selectedQuiz.correct_answer,
      completed_at: new Date().toISOString()
    };

    const stored: QuizAttempt[] = JSON.parse(localStorage.getItem('demo_quiz_attempts') || '[]');
    stored.push(attempt);
    localStorage.setItem('demo_quiz_attempts', JSON.stringify(stored));

    setAttempts(prev => ({ ...prev, [selectedQuiz.id]: attempt }));
    setShowResult(attempt);
    setSelectedQuiz(null);
    setSelectedAnswer(null);
  };

  if (showResult) {
    const quiz = quizzes.find(q => q.id === showResult.quiz_id);
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg p-6 shadow-sm text-center">
          <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
            showResult.is_correct ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {showResult.is_correct ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <XCircle className="w-8 h-8 text-red-600" />
            )}
          </div>
          
          <h3 className="text-xl font-semibold mb-2">
            {showResult.is_correct ? 'Correct!' : 'Incorrect'}
          </h3>
          
          <p className="text-gray-600 mb-4">
            {showResult.is_correct 
              ? 'Great job! You got the right answer.'
              : `The correct answer was: ${quiz?.options[quiz.correct_answer]}`
            }
          </p>
          
          <button
            onClick={() => setShowResult(null)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  if (selectedQuiz) {
    return (
      <div className="p-6">
        <button 
          onClick={() => setSelectedQuiz(null)}
          className="mb-4 text-blue-600 hover:text-blue-800"
        >
          ← Back to Quizzes
        </button>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-2">{selectedQuiz.title}</h3>
          <p className="text-lg mb-6">{selectedQuiz.question}</p>
          
          <div className="space-y-3">
            {selectedQuiz.options.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                <input
                  type="radio"
                  name="quizAnswer"
                  value={index}
                  checked={selectedAnswer === index}
                  onChange={() => setSelectedAnswer(index)}
                  className="w-4 h-4 text-blue-600"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          
          <button
            onClick={handleSubmitAnswer}
            disabled={selectedAnswer === null}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Submit Answer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quizzes</h2>
        {currentUser.role === 'teacher' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Quiz
          </button>
        )}
      </div>
      
      {quizzes.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No quizzes yet</h3>
          <p className="text-gray-600">
            {currentUser.role === 'teacher' 
              ? 'Create your first quiz to test student knowledge.'
              : 'Your teacher will create quizzes for you to take.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map(quiz => {
            const attempt = attempts[quiz.id];
            
            return (
              <div
                key={quiz.id}
                className="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{quiz.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{quiz.question}</p>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{new Date(quiz.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    {attempt ? (
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        attempt.is_correct 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {attempt.is_correct ? '✓ Correct' : '✗ Incorrect'}
                      </div>
                    ) : currentUser.role === 'student' ? (
                      <button
                        onClick={() => setSelectedQuiz(quiz)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Take Quiz
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold">Create Quiz</h3>
            
            <input
              type="text"
              value={quizForm.title}
              onChange={e => setQuizForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Quiz title"
              className="w-full border px-3 py-2 rounded"
            />
            
            <textarea
              value={quizForm.question}
              onChange={e => setQuizForm(prev => ({ ...prev, question: e.target.value }))}
              placeholder="Question"
              rows={3}
              className="w-full border px-3 py-2 rounded"
            />
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Options:</label>
              {quizForm.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={quizForm.correct_answer === index}
                    onChange={() => setQuizForm(prev => ({ ...prev, correct_answer: index }))}
                    className="w-4 h-4 text-green-600"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={e => {
                      const newOptions = [...quizForm.options];
                      newOptions[index] = e.target.value;
                      setQuizForm(prev => ({ ...prev, options: newOptions }));
                    }}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 border px-3 py-2 rounded"
                  />
                  <span className="text-xs text-gray-500">
                    {quizForm.correct_answer === index ? '(Correct)' : ''}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 pt-4">
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="flex-1 border rounded py-2"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateQuiz} 
                className="flex-1 bg-blue-600 text-white rounded py-2"
              >
                Create Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quizzes;
