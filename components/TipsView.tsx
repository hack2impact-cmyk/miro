import React, { useState, useEffect, useCallback } from 'react';
import { getWellnessTip, getAffirmation } from '../services/geminiService';
import { useTranslation } from '../context/i18n';

interface TipsViewProps {
  language: string;
}

const TipsView: React.FC<TipsViewProps> = ({ language }) => {
  const [tip, setTip] = useState('');
  const [affirmation, setAffirmation] = useState('');
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  const [isLoadingAffirmation, setIsLoadingAffirmation] = useState(false);
  const { t } = useTranslation();

  const fetchTip = useCallback(async () => {
    setIsLoadingTip(true);
    const newTip = await getWellnessTip(language);
    setTip(newTip);
    setIsLoadingTip(false);
  }, [language]);

  const fetchAffirmation = useCallback(async () => {
    setIsLoadingAffirmation(true);
    const newAffirmation = await getAffirmation(language);
    setAffirmation(newAffirmation);
    setIsLoadingAffirmation(false);
  }, [language]);

  useEffect(() => {
    fetchTip();
    fetchAffirmation();
  }, [fetchTip, fetchAffirmation]);

  const SkeletonLoader: React.FC<{rows: number}> = ({ rows }) => (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
         <div key={i} className={`h-4 bg-gray-200 rounded-md animate-pulse ${i === rows - 1 ? 'w-5/6' : 'w-full'}`}></div>
      ))}
    </div>
  );

  return (
    <div className="p-6 h-full overflow-y-auto space-y-6 bg-miro-base rounded-r-2xl">
      <h2 className="text-3xl font-bold text-miro-text">{t('tips.title')}</h2>

      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h3 className="text-xl font-bold text-miro-text mb-4">{t('tips.affirmation.title')}</h3>
        {isLoadingAffirmation ? (
          <SkeletonLoader rows={2} />
        ) : (
          <p className="text-lg text-miro-text italic animate-fadeIn">"{affirmation}"</p>
        )}
        <button
          onClick={fetchAffirmation}
          disabled={isLoadingAffirmation}
          className="mt-4 px-5 py-2 text-sm bg-miro-accent text-miro-accent-dark font-bold rounded-full hover:bg-opacity-80 transition-colors"
        >
          {t('tips.affirmation.new')}
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h3 className="text-xl font-bold text-miro-text mb-4">{t('tips.wellness.title')}</h3>
        {isLoadingTip ? (
          <SkeletonLoader rows={3} />
        ) : (
          <p className="text-miro-text animate-fadeIn">{tip}</p>
        )}
        <button
          onClick={fetchTip}
          disabled={isLoadingTip}
          className="mt-4 px-5 py-2 text-sm bg-miro-accent text-miro-accent-dark font-bold rounded-full hover:bg-opacity-80 transition-colors"
        >
          {t('tips.wellness.new')}
        </button>
      </div>
    </div>
  );
};

export default TipsView;