import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Clock, Plus } from 'lucide-react';
import { pollApi } from '../lib/educational-api';
import { localBus, demoEvents } from '../lib/local-bus';
import type { Poll, Profile, Classroom, PollResponse } from '../types';

interface PollsProps {
  classroom: Classroom;
  currentUser: Profile;
}

const Polls: React.FC<PollsProps> = ({ classroom, currentUser }) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState<Record<string, boolean>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pollForm, setPollForm] = useState({ question: '', options: ['', ''] });

  useEffect(() => {
    loadPolls();
    
    // Subscribe to real-time poll updates
    const cleanup = localBus.on(demoEvents.pollCreated(classroom.id), (newPoll) => {
      if (newPoll) {
        setPolls(prev => [...prev, newPoll]);
      }
    });
    
    return cleanup;
  }, [classroom.id]);

  const loadPolls = async () => {
    setLoading(true);
    try {
      const result = await pollApi.getPolls(classroom.id);
      if (result.data) {
        setPolls(result.data);
        
        // Check which polls user has voted on
        const responses: PollResponse[] = JSON.parse(localStorage.getItem('demo_poll_responses') || '[]');
        const userVotes: Record<string, boolean> = {};
        result.data.forEach(poll => {
          userVotes[poll.id] = responses.some(r => r.poll_id === poll.id && r.student_id === currentUser.id);
        });
        setHasVoted(userVotes);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedPoll || selectedOption === null) return;
    
    const result = await pollApi.respond(selectedPoll.id, [selectedOption]);
    if (result.data) {
      setHasVoted(prev => ({ ...prev, [selectedPoll.id]: true }));
      setSelectedPoll(null);
      // Emit event for real-time updates
      localBus.emit(demoEvents.pollResponse(selectedPoll.id), result.data);
      setSelectedOption(null);
      loadPolls(); // Refresh to update counts
    }
  };

  const getPollResults = (poll: Poll) => {
    const responses: PollResponse[] = JSON.parse(localStorage.getItem('demo_poll_responses') || '[]');
    const pollResponses = responses.filter(r => r.poll_id === poll.id);
    
    return poll.options.map((option, index) => ({
      option: option.text,
      votes: pollResponses.filter(r => r.selected_options.includes(index)).length,
      percentage: pollResponses.length > 0 
        ? Math.round((pollResponses.filter(r => r.selected_options.includes(index)).length / pollResponses.length) * 100)
        : 0
    }));
  };

  if (loading) {
    return <div className="p-4">Loading polls...</div>;
  }

  if (selectedPoll) {
    const results = getPollResults(selectedPoll);
    const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);
    
    return (
      <div className="p-6">
        <button 
          onClick={() => setSelectedPoll(null)}
          className="mb-4 text-blue-600 hover:text-blue-800"
        >
          ← Back to Polls
        </button>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">{selectedPoll.question}</h3>
          
          {!hasVoted[selectedPoll.id] && currentUser.role === 'student' ? (
            <div className="space-y-3">
              {selectedPoll.options.map((option, index) => (
                <label key={index} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="pollOption"
                    value={index}
                    checked={selectedOption === index}
                    onChange={() => setSelectedOption(index)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>{option.text}</span>
                </label>
              ))}
              
              <button
                onClick={handleVote}
                disabled={selectedOption === null}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Submit Vote
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center text-sm text-gray-600 mb-4">
                <Users className="w-4 h-4 mr-2" />
                <span>{totalVotes} total votes</span>
              </div>
              
              {results.map((result, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{result.option}</span>
                    <span>{result.votes} votes ({result.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${result.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
              
              {hasVoted[selectedPoll.id] && currentUser.role === 'student' && (
                <p className="text-green-600 text-sm mt-4">✓ You have voted on this poll</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleCreatePoll = async () => {
    if (!pollForm.question.trim()) return;
    const validOptions = pollForm.options.filter(opt => opt.trim());
    if (validOptions.length < 2) return alert('Need at least 2 options');

    const result = await pollApi.create(classroom.id, {
      question: pollForm.question,
      options: validOptions,
      is_anonymous: true,
      multiple_choice: false
    });

    if (result.data) {
      setPolls(prev => [...prev, result.data!]);
      setShowCreateModal(false);
      setPollForm({ question: '', options: ['', ''] });
    }
  };

  const addOption = () => {
    setPollForm(prev => ({ ...prev, options: [...prev.options, ''] }));
  };

  const removeOption = (index: number) => {
    if (pollForm.options.length > 2) {
      setPollForm(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Polls</h2>
        {currentUser.role === 'teacher' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Poll
          </button>
        )}
      </div>
      
      {polls.length === 0 ? (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No polls yet</h3>
          <p className="text-gray-600">
            {currentUser.role === 'teacher' 
              ? 'Create polls in the chat to engage with your students.'
              : 'Your teacher will create polls for you to participate in.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map(poll => {
            const results = getPollResults(poll);
            const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);
            
            return (
              <div
                key={poll.id}
                onClick={() => setSelectedPoll(poll)}
                className="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
              >
                <h3 className="font-semibold mb-2">{poll.question}</h3>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{totalVotes} votes</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{new Date(poll.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {hasVoted[poll.id] && currentUser.role === 'student' && (
                    <span className="text-green-600 text-xs">✓ Voted</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Poll Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold">Create Poll</h3>
            
            <input
              type="text"
              value={pollForm.question}
              onChange={e => setPollForm(prev => ({ ...prev, question: e.target.value }))}
              placeholder="Poll question"
              className="w-full border px-3 py-2 rounded"
            />
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Options:</label>
              {pollForm.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={e => {
                      const newOptions = [...pollForm.options];
                      newOptions[index] = e.target.value;
                      setPollForm(prev => ({ ...prev, options: newOptions }));
                    }}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 border px-3 py-2 rounded"
                  />
                  {pollForm.options.length > 2 && (
                    <button
                      onClick={() => removeOption(index)}
                      className="text-red-600 hover:text-red-800 px-2"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              
              <button
                onClick={addOption}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Add Option
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
                onClick={handleCreatePoll} 
                className="flex-1 bg-blue-600 text-white rounded py-2"
              >
                Create Poll
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Polls;
