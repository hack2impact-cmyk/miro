import React, { useState } from 'react';
import type { UserProfile } from '../types';
import { useTranslation } from '../context/i18n';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const OnboardingLogo: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 40 38" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M20 37C11.3333 37 11.3333 24.3333 11.3333 18C11.3333 9.33333 15.6667 1 20 1C24.3333 1 28.6667 9.33333 28.6667 18C28.6667 24.3333 28.6667 37 20 37Z" fill="#A3B8A2"/>
      <path d="M20 37C16.8333 28.3333 15 18 20 1C25 18 23.1667 28.3333 20 37Z" fill="#FCFBF9"/>
      <path d="M20 11C22.2091 11 24 9.20914 24 7C24 4.79086 22.2091 3 20 3C17.7909 3 16 4.79086 16 7C16 9.20914 17.7909 11 20 11Z" fill="#F87171"/>
    </svg>
);


const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const { t } = useTranslation();

  const genderOptions = [
      { value: 'female', label: t('onboarding.gender.female') },
      { value: 'male', label: t('onboarding.gender.male') },
      { value: 'non-binary', label: t('onboarding.gender.non-binary') },
      { value: 'other', label: t('onboarding.gender.other') },
      { value: 'prefer not to say', label: t('onboarding.gender.preferNotToSay') }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && age && gender) {
      onComplete({ name, age: parseInt(age, 10), gender });
    }
  };

  return (
    <div className="min-h-screen bg-miro-base flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-10 space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <OnboardingLogo className="w-10 h-10" />
          <h1 className="text-4xl font-bold text-miro-text">{t('onboarding.welcome')}</h1>
          <p className="text-miro-text-light text-center">{t('onboarding.subtitle')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-miro-text mb-1">{t('onboarding.name.label')}</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-miro-base border border-gray-200 rounded-lg text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-miro-green-dark focus:border-miro-green-dark text-miro-text"
              placeholder={t('onboarding.name.placeholder')}
              required
            />
          </div>
          <div>
            <label htmlFor="age" className="block text-sm font-semibold text-miro-text mb-1">{t('onboarding.age.label')}</label>
            <input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-miro-base border border-gray-200 rounded-lg text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-miro-green-dark focus:border-miro-green-dark text-miro-text"
              placeholder={t('onboarding.age.placeholder')}
              required
              min="1"
            />
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-semibold text-miro-text mb-1">{t('onboarding.gender.label')}</label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-miro-base border border-gray-200 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-miro-green-dark focus:border-miro-green-dark text-miro-text"
              required
            >
              <option value="" disabled>{t('onboarding.gender.select')}</option>
              {genderOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-md font-medium text-white bg-miro-green-dark hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-miro-green-dark transition-colors"
          >
            {t('onboarding.submit')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;