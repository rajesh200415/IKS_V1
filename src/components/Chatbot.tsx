import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles, ExternalLink } from 'lucide-react';
import { ChatMessage, Disease } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { vetCareAI, ChatResponse } from '../utils/aiChatbot';

interface EnhancedChatMessage extends ChatMessage {
  relatedDiseases?: Disease[];
  suggestions?: string[];
}

const Chatbot: React.FC = () => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<EnhancedChatMessage[]>([
    {
      id: '1',
      text: t('chat.welcome'),
      sender: 'bot',
      timestamp: new Date(),
      suggestions: language === 'ta' 
        ? ['மாட்டில் காய்ச்சல் அறிகுறிகள்', 'எருமையின் பால் குறைவு', 'கால்நடை தடுப்பூசி']
        : ['Fever symptoms in cattle', 'Milk reduction in buffaloes', 'Livestock vaccination']
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update welcome message when language changes
  useEffect(() => {
    setMessages([
      {
        id: '1',
        text: t('chat.welcome'),
        sender: 'bot',
        timestamp: new Date(),
        suggestions: language === 'ta' 
          ? ['மாட்டில் காய்ச்சல் அறிகுறிகள்', 'எருமையின் பால் குறைவு', 'கால்நடை தடுப்பூசி']
          : ['Fever symptoms in cattle', 'Milk reduction in buffaloes', 'Livestock vaccination']
      }
    ]);
  }, [t, language]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || currentMessage;
    if (!textToSend.trim()) return;

    const userMessage: EnhancedChatMessage = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Get AI response
    const aiResponse: ChatResponse = vetCareAI.processQuery(textToSend, language);

    const botResponse: EnhancedChatMessage = {
      id: (Date.now() + 1).toString(),
      text: aiResponse.text,
      sender: 'bot',
      timestamp: new Date(),
      relatedDiseases: aiResponse.relatedDiseases,
      suggestions: aiResponse.suggestions
    };

    setMessages(prev => [...prev, botResponse]);
    setIsTyping(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const DiseasePreview: React.FC<{ disease: Disease }> = ({ disease }) => {
    const getLocalizedName = () => {
      return language === 'ta' && disease.nameTa ? disease.nameTa : disease.name;
    };

    const getLocalizedTreatment = () => {
      return language === 'ta' && disease.treatmentNameTa ? disease.treatmentNameTa : disease.treatmentName;
    };

    return (
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3 mt-2 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h5 className="font-semibold text-green-800 text-sm">{getLocalizedName()}</h5>
            <p className="text-xs text-green-600 mt-1">{getLocalizedTreatment()}</p>
            <div className="flex items-center mt-2 space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                disease.severity === 'High' ? 'bg-red-100 text-red-700' :
                disease.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {disease.severity}
              </span>
              <span className="text-xs text-gray-600">
                {disease.affectedAnimals.join(', ')}
              </span>
            </div>
          </div>
          <ExternalLink size={14} className="text-green-600 flex-shrink-0 ml-2" />
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-full shadow-lg hover:from-green-700 hover:to-green-800 transform hover:scale-110 transition-all duration-200 z-50 group"
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <div className="relative">
            <MessageCircle size={24} />
            <Sparkles size={12} className="absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
          </div>
        )}
        {!isOpen && (
          <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
            AI
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[70vh] flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-t-lg flex-shrink-0">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Bot size={20} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h3 className="font-semibold">{t('chat.title')}</h3>
                <p className="text-xs text-green-100">AI-Powered Assistant</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {messages.map((message) => (
              <div key={message.id}>
                <div
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                  </div>
                </div>

                {/* Related Diseases */}
                {message.sender === 'bot' && message.relatedDiseases && message.relatedDiseases.length > 0 && (
                  <div className="ml-0 mt-2">
                    <p className="text-xs text-gray-600 mb-2 font-medium">
                      {language === 'ta' ? 'தொடர்புடைய நோய்கள்:' : 'Related Diseases:'}
                    </p>
                    {message.relatedDiseases.map((disease) => (
                      <DiseasePreview key={disease.id} disease={disease} />
                    ))}
                  </div>
                )}

                {/* Suggestions */}
                {message.sender === 'bot' && message.suggestions && message.suggestions.length > 0 && (
                  <div className="ml-0 mt-3">
                    <p className="text-xs text-gray-600 mb-2 font-medium">
                      {language === 'ta' ? 'பரிந்துரைகள்:' : 'Suggestions:'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs border border-blue-200 transition-colors duration-200"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 flex-shrink-0">
            <div className="flex space-x-2">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder={t('chat.placeholder')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleSendMessage()}
                disabled={isTyping}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isTyping || !currentMessage.trim()}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {language === 'ta' 
                ? 'AI மூலம் இயக்கப்படுகிறது • கல்வி நோக்கங்களுக்காக மட்டுமே'
                : 'Powered by AI • For educational purposes only'
              }
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;