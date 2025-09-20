import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, PlusCircle } from 'lucide-react';
import { pollApi, chatApi } from '../lib/educational-api';
import { localBus, demoEvents } from '../lib/local-bus';
import EmojiPicker from './EmojiPicker';
import type { ClassroomChat, Profile, Classroom } from '../types';

interface ChatProps {
  classroom: Classroom;
  currentUser: Profile;
}

const Chat: React.FC<ChatProps> = ({ classroom, currentUser }) => {
  const isTeacher = currentUser.role === 'teacher';
  const [messages, setMessages] = useState<ClassroomChat[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string>('');
  const [showEmoji, setShowEmoji] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    
    // Subscribe to real-time chat updates
    const cleanup = localBus.on(demoEvents.chatMessage(classroom.id), (newMessage) => {
      if (newMessage && newMessage.sender_id !== currentUser.id) {
        setMessages(prev => [...prev, newMessage]);
      }
    });
    
    return cleanup;
  }, [classroom.id, currentUser.id]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const result = await chatApi.getMessages(classroom.id);
      if (result.data) {
        setMessages(result.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const result = await chatApi.sendMessage(classroom.id, newMessage);
    if (result.data) {
      // Only add to local state if it's our own message (others come via bus)
      setMessages(prev => [...prev, result.data!]);
      setNewMessage('');
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const result = await chatApi.sendMessage(classroom.id, file.name, 'file', [url]);
    if(result.data){
      setMessages(prev=>[...prev, result.data!]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmoji(false);
  };

  const handleCreatePoll = async () => {
    if (!pollQuestion.trim()) return;
    const optionsArr = pollOptions.split('\n').map(o=>o.trim()).filter(Boolean);
    if (optionsArr.length<2) return alert('Need at least two options');

    const result = await pollApi.create(classroom.id, {question: pollQuestion, options: optionsArr, is_anonymous:true, multiple_choice:false});
    if(result.data){
      await chatApi.sendMessage(classroom.id, `📊 New poll: ${pollQuestion}`, 'announcement');
      setShowPollModal(false);
      setPollQuestion('');
      setPollOptions('');
      loadMessages();
    } else if(result.error){
      alert(result.error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <div className="text-center">Loading messages...</div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex items-start gap-3 my-4 ${msg.sender_id === currentUser.id ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-gray-300"></div>
              <div className={`p-3 rounded-lg max-w-xs ${msg.sender_id === currentUser.id ? 'bg-blue-500 text-white' : 'bg-white'}`}>
                <p className="font-bold text-sm">{msg.sender?.full_name}</p>
                <p>{msg.message}</p>
                <p className="text-xs opacity-70 mt-1">{new Date(msg.created_at).toLocaleTimeString()}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white border-t relative">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          {isTeacher && (
            <button type="button" onClick={()=>setShowPollModal(true)} className="p-2 text-gray-500 hover:text-gray-700"><PlusCircle size={20} /></button>
          )}
          <button type="button" onClick={handleAttachClick} className="p-2 text-gray-500 hover:text-gray-700"><Paperclip size={20} /></button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="button" onClick={()=>setShowEmoji(prev=>!prev)} className="p-2 text-gray-500 hover:text-gray-700"><Smile size={20} /></button>
          <button type="submit" className="p-2 text-white bg-blue-500 rounded-full hover:bg-blue-600"><Send size={20} /></button>
        </form>
        {showEmoji && (
          <EmojiPicker
            onEmojiSelect={addEmoji}
            onClose={() => setShowEmoji(false)}
          />
        )}
      </div>
          {showPollModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold">Create Poll</h3>
            <input
              type="text"
              value={pollQuestion}
              onChange={e=>setPollQuestion(e.target.value)}
              placeholder="Poll question"
              className="w-full border px-3 py-2 rounded"
            />
            <textarea
              value={pollOptions}
              onChange={e=>setPollOptions(e.target.value)}
              placeholder="Each option on new line"
              rows={4}
              className="w-full border px-3 py-2 rounded"
            />
            <div className="flex gap-2">
              <button onClick={()=>setShowPollModal(false)} className="flex-1 border rounded py-2">Cancel</button>
              <button onClick={handleCreatePoll} className="flex-1 bg-blue-600 text-white rounded py-2">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
