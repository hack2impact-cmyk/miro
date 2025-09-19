import React from 'react';
import type { Helpline } from '../types';
import { useTranslation } from '../context/i18n';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const helplines: Helpline[] = [
  { name: 'Vandrevala Foundation', number: '9999666555', description: '24/7 crisis intervention' },
  { name: 'iCall', number: '9152987821', description: 'Mon-Sat, 10 AM - 8 PM' },
  { name: 'Connecting Trust', number: '+919922001122', description: '12 PM - 8 PM, all days' },
  { name: 'AASRA', number: '9820466726', description: '24/7 emotional support for those in distress' },
];

const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl p-8 m-4 max-w-lg w-full transform transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-miro-accent-dark">{t('modal.emergency.title')}</h2>
          <p className="text-miro-text-light mt-2">{t('modal.emergency.subtitle')}</p>
        </div>
        <div className="mt-6 space-y-4">
          {helplines.map((line) => (
            <div key={line.name} className="bg-miro-base p-4 rounded-lg">
              <p className="font-semibold text-miro-text">{line.name}</p>
              <a href={`tel:${line.number}`} className="text-lg font-bold text-miro-green-dark hover:underline">{line.number}</a>
              <p className="text-sm text-miro-text-light">{line.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="bg-miro-accent-dark text-white font-bold py-2 px-6 rounded-full hover:bg-opacity-90 transition-colors"
          >
            {t('modal.emergency.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyModal;
