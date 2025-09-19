import React, { useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { useTranslation } from '../context/i18n';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onSave: (updatedProfile: UserProfile) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, currentProfile, onSave }) => {
  const [name, setName] = useState(currentProfile.name);
  const [age, setAge] = useState(currentProfile.age.toString());
  const [gender, setGender] = useState(currentProfile.gender);
  const { t } = useTranslation();

  const genderOptions = [
      { value: 'female', label: t('onboarding.gender.female') },
      { value: 'male', label: t('onboarding.gender.male') },
      { value: 'non-binary', label: t('onboarding.gender.non-binary') },
      { value: 'other', label: t('onboarding.gender.other') },
      { value: 'prefer not to say', label: t('onboarding.gender.preferNotToSay') }
  ];

  useEffect(() => {
    if (isOpen) {
        setName(currentProfile.name);
        setAge(currentProfile.age.toString());
        setGender(currentProfile.gender);
    }
  }, [isOpen, currentProfile]);

  if (!isOpen) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && age && gender) {
      onSave({ name, age: parseInt(age, 10), gender });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl p-8 m-4 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-miro-text mb-6 text-center">{t('modal.editProfile.title')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-miro-text">{t('modal.editProfile.name')}</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-miro-base border border-gray-200 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-miro-green-dark focus:border-miro-green-dark text-miro-text"
              required
            />
          </div>
          <div>
            <label htmlFor="age" className="block text-sm font-semibold text-miro-text">{t('modal.editProfile.age')}</label>
            <input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-miro-base border border-gray-200 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-miro-green-dark focus:border-miro-green-dark text-miro-text"
              required
              min="1"
            />
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-semibold text-miro-text">{t('modal.editProfile.gender')}</label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-miro-base border border-gray-200 rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-miro-green-dark focus:border-miro-green-dark text-miro-text"
              required
            >
              {genderOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="pt-4 flex items-center justify-end space-x-4">
             <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-full text-sm font-bold text-miro-text-light hover:bg-gray-100 transition-colors"
            >
              {t('modal.editProfile.cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-miro-green-dark hover:bg-opacity-90 transition-colors"
            >
              {t('modal.editProfile.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
