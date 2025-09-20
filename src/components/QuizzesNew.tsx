import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Clock, CheckCircle, XCircle, Users, BarChart3 } from 'lucide-react';
import type { Profile, Classroom } from '../types';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  points: number;
}

interface Quiz {
  id: string;
  classroom_id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  total_points: number;
  created_by: string;
  created_at: string;
}

interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  student_name: string;
  answers: Record<string, number>;
  score: number;
  total_points: number;
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [attempts, setAttempts] = useState<Record<string, QuizAttempt>>({});
  const [showResult, setShowResult] = useState<QuizAttempt | null>(null);
  const [showGradebook, setShowGradebook] = useState<Quiz | null>(null);
  
  // Create quiz form
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    questions: [{ question: '', options: ['', '', '', ''], correct_answer: 0, points: 1 }]
  });

  useEffect(() => {
    loadQuizzes();
    loadAttempts();
  }, [classroom.id]);

  const loadQuizzes = () => {
    const stored: Quiz[] = JSON.parse(localStorage.getItem('demo_quizzes_new') || '[]');
    const classroomQuizzes = stored.filter(q => q.classroom_id === classroom.id);
    setQuizzes(classroomQuizzes);
  };

  const loadAttempts = () => {
    const stored: QuizAttempt[] = JSON.parse(localStorage.getItem('demo_quiz_attempts_new') || '[]');
    const userAttempts: Record<string, QuizAttempt> = {};
    stored.forEach(attempt => {
      if (attempt.student_id === currentUser.id) {
        userAttempts[attempt.quiz_id] = attempt;
      }
    });
    setAttempts(userAttempts);
  };

  const addQuestion = () => {
    setQuizForm(prev => ({
      ...prev,
      questions: [...prev.questions, { question: '', options: ['', '', '', ''], correct_answer: 0, points: 1 }]
    }));
  };

  const removeQuestion = (index: number) => {
    if (quizForm.questions.length > 1) {
      setQuizForm(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }));
    }
  };

  const updateQuestion = (questionIndex: number, field: string, value: any) => {
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex ? { ...q, [field]: value } : q
      )
    }));
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { ...q, options: q.options.map((opt, oi) => oi === optionIndex ? value : opt) }
          : q
      )
    }));
  };

  const handleCreateQuiz = () => {
    if (!quizForm.title.trim()) return alert('Quiz title is required');
    if (quizForm.questions.some(q => !q.question.trim() || q.options.some(opt => !opt.trim()))) {
      return alert('All questions and options must be filled');
    }

    const totalPoints = quizForm.questions.reduce((sum, q) => sum + q.points, 0);
    const newQuiz: Quiz = {
      id: `quiz_${Date.now()}`,
      classroom_id: classroom.id,
      title: quizForm.title,
      description: quizForm.description,
      questions: quizForm.questions.map((q, i) => ({ ...q, id: `q_${i}_${Date.now()}` })),
      total_points: totalPoints,
      created_by: currentUser.id,
      created_at: new Date().toISOString()
    };

    const stored: Quiz[] = JSON.parse(localStorage.getItem('demo_quizzes_new') || '[]');
    stored.push(newQuiz);
    localStorage.setItem('demo_quizzes_new', JSON.stringify(stored));

    setQuizzes(prev => [...prev, newQuiz]);
    setShowCreateModal(false);
    setQuizForm({
      title: '',
      description: '',
      questions: [{ question: '', options: ['', '', '', ''], correct_answer: 0, points: 1 }]
    });
  };

  const handleSubmitQuiz = () => {
    if (!selectedQuiz) return;

    let score = 0;
    selectedQuiz.questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (userAnswer === question.correct_answer) {
        score += question.points;
      }
    });

    const attempt: QuizAttempt = {
      id: `attempt_${Date.now()}`,
      quiz_id: selectedQuiz.id,
      student_id: currentUser.id,
      student_name: currentUser.full_name || currentUser.username,
      answers,
      score,
      total_points: selectedQuiz.total_points,
      completed_at: new Date().toISOString()
    };

    const stored: QuizAttempt[] = JSON.parse(localStorage.getItem('demo_quiz_attempts_new') || '[]');
    stored.push(attempt);
    localStorage.setItem('demo_quiz_attempts_new', JSON.stringify(stored));

    setAttempts(prev => ({ ...prev, [selectedQuiz.id]: attempt }));
    setShowResult(attempt);
    setSelectedQuiz(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
  };

  const getQuizResults = (quiz: Quiz) => {
    const stored: QuizAttempt[] = JSON.parse(localStorage.getItem('demo_quiz_attempts_new') || '[]');
    return stored.filter(attempt => attempt.quiz_id === quiz.id);
  };

  if (showGradebook) {
    const results = getQuizResults(showGradebook);
    const averageScore = results.length > 0 
      ? results.reduce((sum, r) => sum + r.score, 0) / results.length 
      : 0;

    return (
      <div className="p-6">
        <button 
          onClick={() => setShowGradebook(null)}
          className="mb-4 text-blue-600 hover:text-blue-800"
        >
          ← Back to Quizzes
        </button>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-2">{showGradebook.title}</h3>
          <div className="flex items-center space-x-6 mb-6 text-sm text-gray-600">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>{results.length} submissions</span>
            </div>
            <div className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-1" />
              <span>Average: {averageScore.toFixed(1)}/{showGradebook.total_points}</span>
            </div>
          </div>

          {results.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No submissions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Student</th>
                    <th className="text-left py-2 px-4">Score</th>
                    <th className="text-left py-2 px-4">Percentage</th>
                    <th className="text-left py-2 px-4">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(result => (
                    <tr key={result.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4 font-medium">{result.student_name}</td>
                      <td className="py-2 px-4">{result.score}/{result.total_points}</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          (result.score / result.total_points) >= 0.8 
                            ? 'bg-green-100 text-green-800'
                            : (result.score / result.total_points) >= 0.6
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {Math.round((result.score / result.total_points) * 100)}%
                        </span>
                      </td>
                      <td className="py-2 px-4 text-sm text-gray-600">
                        {new Date(result.completed_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (showResult) {
    const quiz = quizzes.find(q => q.id === showResult.quiz_id);
    const percentage = Math.round((showResult.score / showResult.total_points) * 100);
    
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg p-6 shadow-sm text-center">
          <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
            percentage >= 80 ? 'bg-green-100' : percentage >= 60 ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            {percentage >= 60 ? (
              <CheckCircle className={`w-8 h-8 ${percentage >= 80 ? 'text-green-600' : 'text-yellow-600'}`} />
            ) : (
              <XCircle className="w-8 h-8 text-red-600" />
            )}
          </div>
          
          <h3 className="text-xl font-semibold mb-2">Quiz Complete!</h3>
          <p className="text-2xl font-bold mb-2">{showResult.score}/{showResult.total_points} ({percentage}%)</p>
          <p className="text-gray-600 mb-4">
            {percentage >= 80 ? 'Excellent work!' : percentage >= 60 ? 'Good job!' : 'Keep studying!'}
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
    const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === selectedQuiz.questions.length - 1;
    
    return (
      <div className="p-6">
        <button 
          onClick={() => {
            setSelectedQuiz(null);
            setAnswers({});
            setCurrentQuestionIndex(0);
          }}
          className="mb-4 text-blue-600 hover:text-blue-800"
        >
          ← Back to Quizzes
        </button>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">{selectedQuiz.title}</h3>
            <span className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}
            </span>
          </div>
          
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-lg mb-1">{currentQuestion.question}</p>
            <p className="text-sm text-gray-600">{currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}</p>
          </div>
          
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                <input
                  type="radio"
                  name={`question_${currentQuestion.id}`}
                  value={index}
                  checked={answers[currentQuestion.id] === index}
                  onChange={() => setAnswers(prev => ({ ...prev, [currentQuestion.id]: index }))}
                  className="w-4 h-4 text-blue-600"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            
            {isLastQuestion ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(answers).length !== selectedQuiz.questions.length}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                disabled={answers[currentQuestion.id] === undefined}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Next
              </button>
            )}
          </div>
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
            const results = getQuizResults(quiz);
            
            return (
              <div
                key={quiz.id}
                className="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{quiz.title}</h3>
                    {quiz.description && (
                      <p className="text-gray-600 text-sm mb-2">{quiz.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}</span>
                      <span>{quiz.total_points} point{quiz.total_points !== 1 ? 's' : ''}</span>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{new Date(quiz.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex space-x-2">
                    {currentUser.role === 'teacher' && (
                      <button
                        onClick={() => setShowGradebook(quiz)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                      >
                        Results ({results.length})
                      </button>
                    )}
                    
                    {attempt ? (
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        (attempt.score / attempt.total_points) >= 0.8
                          ? 'bg-green-100 text-green-800' 
                          : (attempt.score / attempt.total_points) >= 0.6
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {attempt.score}/{attempt.total_points} ({Math.round((attempt.score / attempt.total_points) * 100)}%)
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
          <div className="bg-white rounded-lg w-full max-w-4xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold">Create Quiz</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={quizForm.title}
                onChange={e => setQuizForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Quiz title"
                className="w-full border px-3 py-2 rounded"
              />
              
              <input
                type="text"
                value={quizForm.description}
                onChange={e => setQuizForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description (optional)"
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            
            <div className="space-y-6">
              {quizForm.questions.map((question, qIndex) => (
                <div key={qIndex} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Question {qIndex + 1}</h4>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        value={question.points}
                        onChange={e => updateQuestion(qIndex, 'points', parseInt(e.target.value) || 1)}
                        className="w-16 border px-2 py-1 rounded text-sm"
                        placeholder="Points"
                      />
                      <span className="text-sm text-gray-600">pts</span>
                      {quizForm.questions.length > 1 && (
                        <button
                          onClick={() => removeQuestion(qIndex)}
                          className="text-red-600 hover:text-red-800 px-2"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <textarea
                    value={question.question}
                    onChange={e => updateQuestion(qIndex, 'question', e.target.value)}
                    placeholder="Enter your question"
                    rows={2}
                    className="w-full border px-3 py-2 rounded"
                  />
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Options:</label>
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={`correct_${qIndex}`}
                          checked={question.correct_answer === oIndex}
                          onChange={() => updateQuestion(qIndex, 'correct_answer', oIndex)}
                          className="w-4 h-4 text-green-600"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={e => updateOption(qIndex, oIndex, e.target.value)}
                          placeholder={`Option ${oIndex + 1}`}
                          className="flex-1 border px-3 py-2 rounded"
                        />
                        <span className="text-xs text-gray-500 w-16">
                          {question.correct_answer === oIndex ? '(Correct)' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <button
                onClick={addQuestion}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-600 hover:border-gray-400 hover:text-gray-800"
              >
                + Add Question
              </button>
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
                Create Quiz ({quizForm.questions.reduce((sum, q) => sum + q.points, 0)} points)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quizzes;
