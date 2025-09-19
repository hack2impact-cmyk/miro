import React from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { UserProfile, Message } from '../types';
import { ProfileIcon, TrashIcon } from './icons';
import { useTranslation } from '../context/i18n';

interface HistoryViewProps {
  profile: UserProfile;
}

const HistoryView: React.FC<HistoryViewProps> = ({ profile }) => {
  const [messages, setMessages] = useLocalStorage<Message[]>(`chatHistory_${profile.name}`, []);
  const { t } = useTranslation();

  const handleClearHistory = () => {
    if (window.confirm(t('chat.clearHistory.confirm'))) {
      setMessages([]);
    }
  };

  const handleDeleteMessage = (id: string) => {
    if (window.confirm(t('chat.deleteMessage.confirm'))) {
      setMessages(prev => prev.filter(msg => msg.id !== id));
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
    <div className="p-6 h-full overflow-y-auto space-y-6 bg-miro-base rounded-r-2xl">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-miro-text">{t('nav.history')}</h2>
        <button
          onClick={handleClearHistory}
          disabled={messages.length === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-miro-accent-dark text-white font-bold rounded-full hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          aria-label={t('chat.clearHistory.button')}
        >
          <TrashIcon className="w-4 h-4" />
          <span>{t('chat.clearHistory.button')}</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm">
        {messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message) => (
               <div key={message.id} className={`flex items-center gap-2 group ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className="flex-shrink-0">
                  {message.sender === 'ai' ? <AIAvatar /> : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <ProfileIcon className="w-5 h-5 text-miro-text-light" />
                    </div>
                  )}
                </div>
                
                <div className={`max-w-xs md:max-w-md p-4 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-miro-green-dark text-white rounded-br-none'
                      : 'bg-white text-miro-text rounded-bl-none border border-gray-100'
                  }`}>
                  <p>{message.text}</p>
                </div>
              
                <div className="w-8 flex justify-center">
                  <button
                    onClick={() => handleDeleteMessage(message.id)}
                    aria-label={t('chat.deleteMessage.button')}
                    className="p-1 rounded-full transition-opacity opacity-0 group-hover:opacity-100 text-miro-text-light hover:text-miro-accent-dark hover:bg-gray-100"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-miro-text-light text-center">{t('history.empty')}</p>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
