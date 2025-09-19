import React from 'react';
import type { Mood, MoodEntry } from '../types';
import { useTranslation } from '../context/i18n';

interface MoodTrackerProps {
  moods: MoodEntry[];
  onMoodChange: (date: string, mood: Mood) => void;
  language: string;
}

const moodOptions: Mood[] = ['Happy', 'Calm', 'Okay', 'Anxious', 'Sad'];
const moodEmojis: Record<Mood, string> = {
  Happy: '😄',
  Calm: '😊',
  Okay: '🙂',
  Anxious: '😟',
  Sad: '😢',
};
const moodColors: Record<Mood, string> = {
  Happy: 'bg-green-400',
  Calm: 'bg-blue-400',
  Okay: 'bg-yellow-400',
  Anxious: 'bg-purple-400',
  Sad: 'bg-gray-400',
};
const moodLevels: Record<Mood, number> = {
  Happy: 5,
  Calm: 4,
  Okay: 3,
  Anxious: 2,
  Sad: 1,
};

const MoodTracker: React.FC<MoodTrackerProps> = ({ moods, onMoodChange, language }) => {
  const { t } = useTranslation();
  const moodMap = new Map(moods.map(m => [m.date, m.mood]));
  
  const today = new Date();
  
  const weekData = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i));
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const dayInitial = date.toLocaleDateString(language, { weekday: 'short' })[0];
    const mood = moodMap.get(dateStr);
    return { dateStr, dayInitial, mood };
  });

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <h3 className="text-xl font-bold text-miro-text mb-4">{t('journal.mood.weeklyGraph')}</h3>
      
      <div className="flex justify-around items-end h-48 border-b border-gray-100 pb-2" aria-label={t('journal.mood.aria.graph')}>
        {weekData.map(({ dateStr, mood }) => {
          const level = mood ? moodLevels[mood] : 0;
          const heightPercentage = mood ? (level / 5) * 100 : 2; 
          const color = mood ? moodColors[mood] : 'bg-gray-200';
          
          return (
            <div key={dateStr} className="flex flex-col items-center justify-end h-full w-10 group" title={mood || t('journal.mood.noEntry')}>
              <div className="text-2xl mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-8" aria-hidden="true">
                {mood ? moodEmojis[mood] : '🤔'}
              </div>
              <div 
                className={`w-full rounded-t-lg ${color} transition-all duration-700 ease-out`}
                style={{ height: `${heightPercentage}%` }}
                role="presentation"
                aria-label={mood ? t('journal.mood.aria.moodLogged', {mood}) : t('journal.mood.aria.noMoodLogged')}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-around pt-2">
        {weekData.map(({ dateStr, dayInitial }) => (
          <span key={dateStr} className="text-sm font-medium text-miro-text-light w-10 text-center">{dayInitial}</span>
        ))}
      </div>

      <div className="mt-6 border-t border-gray-100 pt-6">
        <h4 className="font-bold text-miro-text mb-4 text-center">{t('journal.mood.today')}</h4>
        <div className="flex flex-wrap gap-3 justify-center">
          {moodOptions.map(mood => (
            <button
              key={mood}
              onClick={() => onMoodChange(todayStr, mood)}
              aria-label={mood}
              className={`w-16 h-16 flex items-center justify-center text-3xl rounded-full transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${moodMap.get(todayStr) === mood ? `${moodColors[mood]} text-white font-bold shadow-lg focus:ring-miro-green-dark` : 'bg-gray-100 hover:bg-gray-200 focus:ring-gray-400'}`}
            >
              {moodEmojis[mood]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;
