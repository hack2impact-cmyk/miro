import React, { useState, useEffect, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { getJournalSentiment } from '../services/geminiService';
import type { JournalEntry, MoodEntry, Mood } from '../types';
import { Sentiment } from '../types';
import MoodTracker from './MoodTracker';
import { useTranslation } from '../context/i18n';
import { SpinnerIcon } from './icons';

const JournalView: React.FC = () => {
  const [entries, setEntries] = useLocalStorage<JournalEntry[]>('journalEntries', []);
  const [moods, setMoods] = useLocalStorage<MoodEntry[]>('moodEntries', []);
  const [newEntry, setNewEntry] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { t, language } = useTranslation();

  useEffect(() => {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const now = new Date().getTime();
    
    const filteredEntries = entries.filter(entry => {
      if (entry.sentiment === Sentiment.Negative) {
        const entryDate = new Date(entry.date).getTime();
        return now - entryDate < twentyFourHours;
      }
      return true;
    });

    if (filteredEntries.length !== entries.length) {
      setEntries(filteredEntries);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleSaveEntry = async () => {
    if (!newEntry.trim()) return;
    setIsSaving(true);
    const sentiment = await getJournalSentiment(newEntry);
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      content: newEntry,
      sentiment: sentiment as Sentiment,
    };

    setEntries([...entries, entry]);
    setNewEntry('');
    setIsSaving(false);
  };

  const handleMoodChange = (date: string, mood: Mood) => {
    const existingIndex = moods.findIndex(m => m.date === date);
    if (existingIndex > -1) {
      const updated = [...moods];
      updated[existingIndex] = { date, mood };
      setMoods(updated);
    } else {
      setMoods([...moods, { date, mood }]);
    }
  };
  
  const positiveEntries = useMemo(() => {
    return entries
      .filter(e => e.sentiment === Sentiment.Positive)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries]);

  return (
    <div className="p-6 h-full overflow-y-auto space-y-6 bg-miro-base rounded-r-2xl">
      <h2 className="text-3xl font-bold text-miro-text">{t('journal.title')}</h2>
      
      <MoodTracker moods={moods} onMoodChange={handleMoodChange} language={language} />

      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h3 className="text-xl font-bold text-miro-text mb-2">{t('journal.thoughts.title')}</h3>
        <p className="text-sm font-medium text-miro-text mb-4">{t('journal.thoughts.subtitle')}</p>
        <textarea
          value={newEntry}
          onChange={(e) => setNewEntry(e.target.value)}
          placeholder={t('journal.thoughts.placeholder')}
          className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-miro-green text-miro-text"
          disabled={isSaving}
        />
        <button
          onClick={handleSaveEntry}
          disabled={isSaving || !newEntry.trim()}
          className="mt-4 flex items-center justify-center px-6 py-2 bg-miro-green-dark text-white font-bold rounded-full hover:bg-opacity-90 disabled:bg-gray-300 transition-colors"
        >
          {isSaving && <SpinnerIcon className="w-5 h-5 mr-2 animate-spin" />}
          {isSaving ? t('journal.thoughts.saving') : t('journal.thoughts.save')}
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h3 className="text-xl font-bold text-miro-text mb-4">{t('journal.reflections.title')}</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {positiveEntries.length > 0 ? (
            positiveEntries.map(entry => (
              <div key={entry.id} className="p-4 bg-green-50 rounded-lg animate-fadeIn">
                <p className="text-sm font-bold text-green-800 mb-1">
                  {new Date(entry.date).toLocaleDateString(language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-miro-text">{entry.content}</p>
              </div>
            ))
          ) : (
            <p className="text-miro-text-light">{t('journal.reflections.empty')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JournalView;