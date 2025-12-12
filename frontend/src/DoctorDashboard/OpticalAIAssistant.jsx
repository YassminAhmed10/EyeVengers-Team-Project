import React, { useState, useRef, useEffect } from 'react';
import './OpticalAIAssistant.css';

const OpticalAIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello Doctor! I'm your Optical AI Assistant. How can I help you with patient care today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      const botMessage = {
        id: messages.length + 2,
        text: aiResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const generateAIResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('patient') || input.includes('record')) {
      return "I can help you access patient records. Would you like me to search for a specific patient or their optical history?";
    } else if (input.includes('appointment') || input.includes('schedule')) {
      return "I can help you manage your appointment schedule. You have 2 upcoming appointments today. Would you like details?";
    } else if (input.includes('diagnosis') || input.includes('symptom')) {
      return "Based on common optical conditions, I can provide information about symptoms like myopia, hyperopia, or astigmatism. However, please conduct proper examinations for official diagnosis.";
    } else if (input.includes('prescription') || input.includes('glasses') || input.includes('lenses')) {
      return "I can assist with optical prescription information, lens types, and fitting guidelines. Always verify measurements with current instruments.";
    } else if (input.includes('hello') || input.includes('hi')) {
      return "Hello Doctor! How can I assist with your optical practice today?";
    } else if (input.includes('help')) {
      return "I can help with: patient records, appointment scheduling, optical prescriptions, medical research, clinical guidelines, and practice management.";
    } else if (input.includes('today') || input.includes('appointment')) {
      return "Today you have 6 appointments: 3 completed, 1 concealed, and 2 upcoming. Your next appointment is with Doira Wothed at 1:00 PM.";
    } else {
      return "I understand you're asking about: '" + userInput + "'. As your optical AI assistant, I can help with patient care, prescriptions, and practice management. Could you provide more specific details?";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: "Hello Doctor! I'm your Optical AI Assistant. How can I help you with patient care today?",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="optical-ai-assistant">
      {/* AI Assistant Button */}
      <div 
        className={`ai-assistant-button ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="ai-icon">AI</span>
        <span className="pulse-ring"></span>
      </div>

      {/* Chat Modal */}
      {isOpen && (
        <div className="ai-chat-modal">
          <div className="chat-header">
            <div className="header-left">
              <span className="ai-avatar">AI</span>
              <div>
                <h3>Optical AI Assistant</h3>
                <span className="status"></span>
              </div>
            </div>
            <div className="header-actions">
              <button className="action-btn" onClick={clearChat} title="Clear Chat">
                 🗑️
              </button>
              <button 
                className="action-btn" 
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                X
              </button>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
              >
                <div className="message-content">
                  {message.text}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <div className="quick-actions">
              <button 
                className="quick-action"
                onClick={() => setInputMessage("Show today's appointments")}
              >
                Today's Appointments
              </button>
              <button 
                className="quick-action"
                onClick={() => setInputMessage("Search patient records")}
              >
                Patient Search
              </button>
              <button 
                className="quick-action"
                onClick={() => setInputMessage("Optical prescription guidelines")}
              >
                Prescription Help
              </button>
            </div>
            <div className="input-wrapper">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about patients, appointments, or optical care..."
                className="chat-input"
              />
              <button 
                onClick={handleSendMessage}
                className="send-button"
                disabled={!inputMessage.trim()}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpticalAIAssistant;