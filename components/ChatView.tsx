// Fix for TypeScript "Cannot find name 'SpeechRecognition'" error.
// This adds the necessary types for the Web Speech API, which are not included in default TS lib.
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: any) => void;
  onend: () => void;
  onerror: (event: any) => void;
  start: () => void;
  stop: () => void;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { getChatResponse, getSmartReplies, checkForCrisis } from '../services/geminiService';
import type { UserProfile, Message } from '../types';
import { SendIcon, ProfileIcon, MicrophoneIcon, SpeakerIcon, TrashIcon } from './icons';
import { useTranslation } from '../context/i18n';

interface ChatViewProps {
  profile: UserProfile;
  onCrisis: () => void;
  language: string;
}

const ChatView: React.FC<ChatViewProps> = ({ profile, onCrisis, language }) => {
  const [messages, setMessages] = useLocalStorage<Message[]>(`chatHistory_${profile.name}`, []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { t, language: langCode } = useTranslation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'initial-welcome',
        text: t('chat.welcomeMessage', { name: profile.name }),
        sender: 'ai',
      };
      setMessages([welcomeMessage]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount to show welcome message

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender === 'ai' && !isLoading) {
      getSmartReplies(lastMessage.text, language).then(setSmartReplies);
    } else {
      setSmartReplies([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isLoading, language]);

  const handleSend = async (messageText: string) => {
    const trimmedInput = messageText.trim();
    if (!trimmedInput) return;

    const isCrisis = await checkForCrisis(trimmedInput);
    if (isCrisis) {
      onCrisis();
      return;
    }

    const userMessage: Message = { id: Date.now().toString(), text: trimmedInput, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);
    setSmartReplies([]);

    try {
      const aiResponse = await getChatResponse(profile, messages, trimmedInput, language);
      const aiMessage: Message = { id: (Date.now() + 1).toString(), text: aiResponse, sender: 'ai' };
      setMessages(currentMessages => [...currentMessages, aiMessage]);
    } catch (error) {
      console.error("Failed to get AI response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: t('chat.error'),
        sender: 'ai'
      };
      setMessages(currentMessages => [...currentMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const handleClearHistory = () => {
    if (window.confirm(t('chat.clearHistory.confirm'))) {
      setMessages([]);
       const welcomeMessage: Message = {
        id: 'initial-welcome',
        text: t('chat.welcomeMessage', { name: profile.name }),
        sender: 'ai',
      };
      setMessages([welcomeMessage]);
    }
  };

  const handleSpeak = useCallback((message: Message) => {
    if (speakingMessageId === message.id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.text);
    utterance.lang = langCode;
    utterance.onstart = () => setSpeakingMessageId(message.id);
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);
    window.speechSynthesis.speak(utterance);
  }, [langCode, speakingMessageId]);

  useEffect(() => {
    // FIX: Correctly reference SpeechRecognition API after adding global types.
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = langCode;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    }

    recognitionRef.current = recognition;
  }, [langCode]);

  const handleToggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Could not start recognition:", error);
      }
    }
  };

  const AIAvatar = () => (
    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm p-1">
      <svg viewBox="0 0 40 38" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M20 37C11.3333 37 11.3333 24.3333 11.3333 18C11.3333 9.33333 15.6667 1 20 1C24.3333 1 28.6667 9.33333 28.6667 18C28.6667 24.3333 28.6667 37 20 37Z" fill="#A3B8A2"/>
        <path d="M20 37C16.8333 28.3333 15 18 20 1C25 18 23.1667 28.3333 20 37Z" fill="#FCFBF9"/>
        <path d="M20 11C22.2091 11 24 9.20914 24 7C24 4.79086 22.2091 3 20 3C17.7909 3 16 4.79086 16 7C16 9.20914 17.7909 11 20 11Z" fill="#F87171"/>
      </svg>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-miro-base md:rounded-r-2xl">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white md:bg-transparent md:border-none">
        <h2 className="text-lg font-bold text-miro-text">{t('chat.header')}</h2>
        <button
          onClick={handleClearHistory}
          className="p-2 rounded-full text-miro-text-light hover:bg-gray-100"
          aria-label={t('chat.clearHistory.button')}
          title={t('chat.clearHistory.button')}
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex items-start gap-3 animate-slideInUp ${message.sender === 'user' ? 'justify-end' : ''}`}>
            {message.sender === 'ai' && <AIAvatar />}
            <div
              className={`relative group max-w-xs md:max-w-md p-4 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-miro-green-dark text-white rounded-br-none'
                  : 'bg-white text-miro-text rounded-bl-none shadow-sm'
              }`}
            >
              <p>{message.text}</p>
              {message.sender === 'ai' && !isLoading && (
                <button
                  onClick={() => handleSpeak(message)}
                  className={`absolute -bottom-3 -right-3 p-2 bg-white rounded-full shadow-md transition-all text-miro-text-light hover:text-miro-green-dark focus:outline-none focus:ring-2 focus:ring-miro-green-dark ${speakingMessageId === message.id ? 'text-miro-accent-dark animate-pulse' : ''}`}
                  aria-label={speakingMessageId === message.id ? t('chat.tts.stop') : t('chat.tts.speak')}
                >
                  <SpeakerIcon className="w-5 h-5" />
                </button>
              )}
            </div>
            {message.sender === 'user' && (
              <img
                src={`https://api.dicebear.com/8.x/lorelei/svg?seed=${profile.name}`}
                alt={profile.name}
                className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0"
                aria-label={`Avatar for ${profile.name}`}
              />
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3 animate-fadeIn">
            <AIAvatar />
            <div className="max-w-xs p-4 rounded-2xl bg-white text-miro-text rounded-bl-none shadow-sm flex items-center">
              <div className="w-16 h-4 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white md:bg-transparent border-t md:border-t-0 border-gray-200">
        {smartReplies.length > 0 && !isLoading && (
            <div className="flex flex-wrap gap-2 mb-3">
                {smartReplies.map((reply, i) => (
                    <button
                        key={i}
                        onClick={() => handleSend(reply)}
                        className="px-4 py-2 text-sm bg-miro-accent text-miro-accent-dark font-semibold rounded-full hover:bg-opacity-80 transition-colors"
                    >
                        {reply}
                    </button>
                ))}
            </div>
        )}

        <form onSubmit={handleFormSubmit} className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleToggleListening}
            className={`w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-miro-green-dark ${isListening ? 'bg-miro-accent-dark text-white' : 'bg-gray-100 text-miro-text-light hover:bg-gray-200'}`}
            aria-label={isListening ? t('chat.stt.mic_off') : t('chat.stt.mic_on')}
          >
            <MicrophoneIcon className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? t('chat.stt.listening') : t('chat.placeholder')}
            className="flex-1 w-full px-4 py-3 bg-white md:bg-white border border-gray-200 rounded-full text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-miro-green-dark focus:border-transparent text-miro-text"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-11 h-11 flex items-center justify-center bg-miro-green-dark text-white rounded-full disabled:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-miro-green-dark"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;