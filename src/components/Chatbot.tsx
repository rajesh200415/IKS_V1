import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, ChevronDown, ChevronUp, ExternalLink, Cpu, Zap } from 'lucide-react';
import { ChatMessage, Disease } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { enhancedVetCareAI, EnhancedChatResponse } from '../utils/enhancedAiChatbot';

interface EnhancedChatMessage extends ChatMessage {
  relatedDiseases?: Disease[];
  suggestions?: string[];
  confidence?: number;
  isAiGenerated?: boolean;
  modelStatus?: string;
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
      confidence: 1.0,
      isAiGenerated: true,
      suggestions: language === 'ta' 
        ? ['மாட்டில் காய்ச்சல் அறிகுறிகள்', 'எருமையின் பால் குறைவு', 'கால்நடை தடுப்பூசி']
        : ['Fever symptoms in cattle', 'Milk reduction in buffaloes', 'Livestock vaccination']
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [expandedDiseases, setExpandedDiseases] = useState<Set<string>>(new Set());
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
        text: language === 'ta' 
          ? 'வணக்கம்! 🙏 நான் உங்கள் AI-powered வெட்கேர் உதவியாளர். விலங்கு நல கேள்விகளில் உங்களுக்கு உதவ தயாராக இருக்கிறேன்.\n\n🤖 **AI திறன்கள்:**\n• BioBERT மாடல் பயன்படுத்தி அறிவார்ந்த பதில்கள்\n• அறிகுறிகள் அடையாளம் காணுதல்\n• நோய் தகவல்கள்\n• சிகிச்சை முறைகள்\n• தடுப்பு நடவடிக்கைகள்\n\nஎனக்கு எதையும் கேளுங்கள்!'
          : 'Hello! 🙏 I\'m your AI-powered VetCare assistant, ready to help with animal health questions.\n\n🤖 **AI Capabilities:**\n• Intelligent responses using BioBERT model\n• Symptom identification\n• Disease information\n• Treatment methods\n• Prevention measures\n\nAsk me anything!',
        sender: 'bot',
        timestamp: new Date(),
        confidence: 1.0,
        isAiGenerated: true,
        suggestions: language === 'ta' 
          ? ['மாட்டில் காய்ச்சல் அறிகுறிகள்', 'எருமையின் பால் குறைவு', 'கால்நடை தடுப்பூசி']
          : ['Fever symptoms in cattle', 'Milk reduction in buffaloes', 'Livestock vaccination']
      }
    ]);
    setExpandedDiseases(new Set());
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

    // Faster response time for better responsiveness
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));

    // Get Enhanced AI response
    const aiResponse: EnhancedChatResponse = await enhancedVetCareAI.processQuery(textToSend, language);

    const botResponse: EnhancedChatMessage = {
      id: (Date.now() + 1).toString(),
      text: aiResponse.text,
      sender: 'bot',
      timestamp: new Date(),
      relatedDiseases: aiResponse.relatedDiseases,
      suggestions: aiResponse.suggestions,
      confidence: aiResponse.confidence,
      isAiGenerated: aiResponse.isAiGenerated,
      modelStatus: aiResponse.modelStatus
    };

    setMessages(prev => [...prev, botResponse]);
    setIsTyping(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const toggleDiseaseExpansion = (diseaseId: string) => {
    setExpandedDiseases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(diseaseId)) {
        newSet.delete(diseaseId);
      } else {
        newSet.add(diseaseId);
      }
      return newSet;
    });
  };

  const DiseasePreview: React.FC<{ disease: Disease; messageId: string }> = ({ disease, messageId }) => {
    const isExpanded = expandedDiseases.has(`${messageId}-${disease.id}`);
    const expandKey = `${messageId}-${disease.id}`;

    const getLocalizedContent = () => {
      if (language === 'ta') {
        return {
          name: disease.nameTa || disease.name,
          treatmentName: disease.treatmentNameTa || disease.treatmentName,
          symptoms: disease.symptomsTa || disease.symptoms,
          ingredients: disease.ingredientsTa || disease.ingredients,
          preparation: disease.preparationTa || disease.preparation,
          dosage: disease.dosageTa || disease.dosage
        };
      }
      return {
        name: disease.name,
        treatmentName: disease.treatmentName,
        symptoms: disease.symptoms,
        ingredients: disease.ingredients,
        preparation: disease.preparation,
        dosage: disease.dosage
      };
    };

    const localizedContent = getLocalizedContent();
    const getSeverityColor = (severity: string) => {
      switch (severity) {
        case 'High': return 'bg-red-100 text-red-700 border-red-200';
        case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'Low': return 'bg-green-100 text-green-700 border-green-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
      }
    };

    const getSeverityText = (severity: string) => {
      if (language === 'ta') {
        switch (severity) {
          case 'High': return 'அதிகம்';
          case 'Medium': return 'நடுத்தரம்';
          case 'Low': return 'குறைவு';
          default: return severity;
        }
      }
      return severity;
    };

    return (
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg mt-2 overflow-hidden hover:shadow-md transition-all duration-200">
        {/* Header - Always visible */}
        <div 
          className="p-3 cursor-pointer hover:bg-green-100 transition-colors duration-200"
          onClick={() => toggleDiseaseExpansion(expandKey)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h5 className="font-semibold text-green-800 text-sm">{localizedContent.name}</h5>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(disease.severity)}`}>
                  {getSeverityText(disease.severity)}
                </span>
              </div>
              <p className="text-xs text-green-600 mb-2">{localizedContent.treatmentName}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  {language === 'ta' ? 'பாதிக்கும்:' : 'Affects:'} {disease.affectedAnimals.map(animal => 
                    language === 'ta' ? (animal === 'Cattle' ? 'மாடுகள்' : 'எருமைகள்') : animal
                  ).join(', ')}
                </span>
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-blue-600">
                    {language === 'ta' ? (isExpanded ? 'மறைக்க' : 'விரிவாக பார்க்க') : (isExpanded ? 'Hide details' : 'View details')}
                  </span>
                  {isExpanded ? <ChevronUp size={14} className="text-blue-600" /> : <ChevronDown size={14} className="text-blue-600" />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-3 pb-3 border-t border-green-200 bg-white">
            <div className="space-y-3 mt-3">
              {/* Symptoms */}
              <div>
                <h6 className="font-medium text-gray-800 text-xs mb-1 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  {language === 'ta' ? 'அறிகுறிகள்' : 'Symptoms'}
                </h6>
                <div className="flex flex-wrap gap-1">
                  {localizedContent.symptoms.slice(0, 4).map((symptom, index) => (
                    <span
                      key={index}
                      className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs border border-blue-200"
                    >
                      {symptom}
                    </span>
                  ))}
                  {localizedContent.symptoms.length > 4 && (
                    <span className="text-xs text-gray-500 px-2 py-1">
                      +{localizedContent.symptoms.length - 4} {language === 'ta' ? 'மேலும்' : 'more'}
                    </span>
                  )}
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <h6 className="font-medium text-gray-800 text-xs mb-1 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  {language === 'ta' ? 'பொருட்கள்' : 'Ingredients'}
                </h6>
                <div className="flex flex-wrap gap-1">
                  {localizedContent.ingredients.slice(0, 3).map((ingredient, index) => (
                    <span
                      key={index}
                      className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs border border-green-200"
                    >
                      {ingredient}
                    </span>
                  ))}
                  {localizedContent.ingredients.length > 3 && (
                    <span className="text-xs text-gray-500 px-2 py-1">
                      +{localizedContent.ingredients.length - 3} {language === 'ta' ? 'மேலும்' : 'more'}
                    </span>
                  )}
                </div>
              </div>

              {/* Preparation */}
              <div>
                <h6 className="font-medium text-gray-800 text-xs mb-1 flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  {language === 'ta' ? 'தயாரிப்பு' : 'Preparation'}
                </h6>
                <p className="text-xs text-gray-700 bg-purple-50 p-2 rounded border border-purple-200 leading-relaxed">
                  {localizedContent.preparation.length > 120 
                    ? `${localizedContent.preparation.substring(0, 120)}...` 
                    : localizedContent.preparation
                  }
                </p>
              </div>

              {/* Dosage */}
              <div>
                <h6 className="font-medium text-gray-800 text-xs mb-1 flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  {language === 'ta' ? 'அளவு மற்றும் பயன்பாடு' : 'Dosage & Application'}
                </h6>
                <p className="text-xs text-gray-700 bg-orange-50 p-2 rounded border border-orange-200 leading-relaxed">
                  {localizedContent.dosage.length > 100 
                    ? `${localizedContent.dosage.substring(0, 100)}...` 
                    : localizedContent.dosage
                  }
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-gray-200">
                <button 
                  onClick={() => handleSendMessage(`${language === 'ta' ? 'மேலும் தகவல்' : 'More information about'} ${localizedContent.name}`)}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-3 rounded text-xs font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center space-x-1"
                >
                  <ExternalLink size={12} />
                  <span>{language === 'ta' ? 'மேலும் தகவல் பெறுங்கள்' : 'Get More Information'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Chat Button - Fixed positioning */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-full shadow-lg hover:from-green-700 hover:to-green-800 transform hover:scale-110 transition-all duration-200 z-50"
      >
        {/* AI Indicator */}
        <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold shadow-lg min-w-[20px] text-center">
          AI
        </div>
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-40 max-h-[75vh] flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-t-lg flex-shrink-0">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="flex items-center space-x-1">
                  <Bot size={20} />
                  <Cpu size={16} className="text-green-200" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h3 className="font-semibold">
                  {language === 'ta' ? 'AI வெட்கேர் உதவியாளர்' : 'AI VetCare Assistant'}
                </h3>
                <p className="text-xs text-green-100">
                  {language === 'ta' ? 'BioBERT AI மாடல்' : 'BioBERT AI Model'}
                </p>
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
                    className={`max-w-xs px-4 py-2 rounded-lg relative ${
                      message.sender === 'user'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                    
                    {/* AI Confidence Indicator */}
                    {message.sender === 'bot' && message.confidence !== undefined && (
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                        <div className="flex items-center space-x-1">
                          {message.isAiGenerated ? (
                            <Zap size={12} className="text-blue-500" />
                          ) : (
                            <Bot size={12} className="text-gray-500" />
                          )}
                          <span className="text-xs text-gray-500">
                            {message.modelStatus || (message.isAiGenerated ? 
                              (language === 'ta' ? 'AI பதில்' : 'AI Response') : 
                              (language === 'ta' ? 'பாரம்பரிய' : 'Traditional')
                            )}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${
                            message.confidence > 0.7 ? 'bg-green-500' :
                            message.confidence > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-xs text-gray-500">
                            {Math.round(message.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Related Diseases with expandable details */}
                {message.sender === 'bot' && message.relatedDiseases && message.relatedDiseases.length > 0 && (
                  <div className="ml-0 mt-2">
                    <p className="text-xs text-gray-600 mb-2 font-medium">
                      {language === 'ta' ? '🔍 தொடர்புடைய நோய்கள்:' : '🔍 Related Diseases:'}
                    </p>
                    {message.relatedDiseases.map((disease) => (
                      <DiseasePreview key={disease.id} disease={disease} messageId={message.id} />
                    ))}
                  </div>
                )}

                {/* Suggestions */}
                {message.sender === 'bot' && message.suggestions && message.suggestions.length > 0 && (
                  <div className="ml-0 mt-3">
                    <p className="text-xs text-gray-600 mb-2 font-medium">
                      {language === 'ta' ? '💡 பரிந்துரைகள்:' : '💡 Suggestions:'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs border border-blue-200 transition-all duration-200 hover:scale-105"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator - Faster animation */}
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
               ? 'AI-powered • கல்வி நோக்கங்களுக்காக மட்டுமே • எப்போதும் கால்நடை மருத்துவரை அணுகவும்'
               : 'AI-powered • For educational purposes only • Always consult a veterinarian'
              }
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;