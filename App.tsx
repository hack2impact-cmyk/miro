import React, { useState } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import Onboarding from './components/Onboarding';
import ChatView from './components/ChatView';
import JournalView from './components/JournalView';
import TipsView from './components/TipsView';
import CommunityView from './components/CommunityView';
import HistoryView from './components/HistoryView';
import EmergencyModal from './components/EmergencyModal';
import EditProfileModal from './components/EditProfileModal';
import { LeafIcon, ChatIcon, JournalIcon, TipsIcon, ProfileIcon, CommunityIcon, PencilIcon, HistoryIcon } from './components/icons';
import type { UserProfile } from './types';
import { I18nProvider, useTranslation } from './context/i18n';

type View = 'Chat' | 'Journal' | 'Tips' | 'Community' | 'History';

const AppContent: React.FC<{ profile: UserProfile }> = ({ profile: initialProfile }) => {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [activeView, setActiveView] = useState<View>('Chat');
  const [isEmergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [isEditProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const { t, languageFullName, setLanguage } = useTranslation();

  const languages = ['English', 'Hindi', 'Kannada', 'Bengali', 'Tamil', 'Telugu'];
  
  const handleProfileSave = (updatedProfile: UserProfile) => {
    if (profile && profile.name !== updatedProfile.name) {
      const oldKey = `chatHistory_${profile.name}`;
      const newKey = `chatHistory_${updatedProfile.name}`;
      const history = localStorage.getItem(oldKey);
      if (history) {
        localStorage.setItem(newKey, history);
        localStorage.removeItem(oldKey);
      }
    }
    setProfile(updatedProfile);
    setEditProfileModalOpen(false);
  }

  const NavItem: React.FC<{ view: View; icon: React.ReactNode; label: string, isMobile?: boolean }> = ({ view, icon, label, isMobile = false }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex items-center transition-colors text-left ${
        isMobile
          ? 'flex-col justify-center text-xs gap-1 p-2 rounded-lg w-full'
          : 'w-full space-x-3 px-4 py-3 rounded-lg text-base'
      } ${activeView === view ? 'bg-miro-accent text-miro-accent-dark' : 'text-miro-text-light hover:bg-gray-100'}`}
    >
      {icon}
      <span className="font-bold">{label}</span>
    </button>
  );

  const renderView = () => {
    const openEmergencyModal = () => setEmergencyModalOpen(true);
    switch (activeView) {
      case 'Chat':
        return <ChatView profile={profile} onCrisis={openEmergencyModal} language={languageFullName} />;
      case 'Journal':
        return <JournalView />;
      case 'Tips':
        return <TipsView language={languageFullName} />;
      case 'Community':
        return <CommunityView language={languageFullName} />;
      case 'History':
        return <HistoryView profile={profile} />;
      default:
        return <ChatView profile={profile} onCrisis={openEmergencyModal} language={languageFullName} />;
    }
  };

  return (
    <div className="h-screen w-screen p-0 md:p-8 flex items-center justify-center bg-gray-100">
      <div className="w-full h-full flex flex-col md:flex-row bg-miro-sidebar md:rounded-2xl md:shadow-2xl md:max-w-6xl md:max-h-[900px]">
        {/* Sidebar - Desktop */}
        <nav className="hidden md:flex flex-col w-1/4 max-w-[250px] p-6">
          <div className="flex items-center space-x-2 mb-10">
            <LeafIcon className="w-8 h-8 text-miro-green-dark" />
            <h1 className="text-2xl font-bold text-miro-text">Miro</h1>
          </div>
          <div className="space-y-2 flex-1">
            <NavItem view="Chat" icon={<ChatIcon className="w-6 h-6" />} label={t('nav.chat')} />
            <NavItem view="Journal" icon={<JournalIcon className="w-6 h-6" />} label={t('nav.journal')} />
            <NavItem view="Tips" icon={<TipsIcon className="w-6 h-6" />} label={t('nav.tips')} />
            <NavItem view="Community" icon={<CommunityIcon className="w-6 h-6" />} label={t('nav.community')} />
            <NavItem view="History" icon={<HistoryIcon className="w-6 h-6" />} label={t('nav.history')} />
          </div>
          <div className="border-t border-gray-200 pt-4 space-y-4">
            <div>
              <label htmlFor="language-select" className="block text-sm font-bold text-miro-text-light px-4 mb-2">{t('sidebar.language')}</label>
              <select
                id="language-select"
                value={languageFullName}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-miro-text focus:outline-none focus:ring-1 focus:ring-miro-green-dark"
              >
                  {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
              </select>
            </div>
            <div className="flex items-center space-x-3 px-4 py-2">
              <ProfileIcon className="w-8 h-8 text-miro-text-light p-1 bg-gray-200 rounded-full" />
              <div>
                <p className="font-bold text-miro-text">{profile.name}</p>
                <button onClick={() => setEditProfileModalOpen(true)} className="text-xs text-miro-text-light hover:underline flex items-center gap-1">
                    {t('sidebar.editProfile')} <PencilIcon className="w-3 h-3"/>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="relative h-full">
            <div className="absolute top-4 right-6 z-10 hidden md:flex items-center gap-4">
               <p className="text-sm font-bold text-miro-text">{t('sidebar.hello', { name: profile.name })}</p>
               <button id="emergency-btn" onClick={() => setEmergencyModalOpen(true)} className="px-4 py-2 bg-miro-accent-dark text-white rounded-full font-bold text-sm hover:bg-opacity-90 transition-colors">
                  {t('sidebar.emergency')}
               </button>
            </div>
            <div className="h-full pt-4 md:pt-16 pb-24 md:pb-0 box-border">
              {renderView()}
            </div>
          </div>
        </main>
        
        {/* Bottom Nav - Mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 grid grid-cols-5 gap-1 z-20">
            <NavItem view="Chat" icon={<ChatIcon className="w-6 h-6" />} label={t('nav.chat')} isMobile={true} />
            <NavItem view="Journal" icon={<JournalIcon className="w-6 h-6" />} label={t('nav.journal')} isMobile={true} />
            <NavItem view="Tips" icon={<TipsIcon className="w-6 h-6" />} label={t('nav.tips')} isMobile={true} />
            <NavItem view="Community" icon={<CommunityIcon className="w-6 h-6" />} label={t('nav.community')} isMobile={true} />
            <NavItem view="History" icon={<HistoryIcon className="w-6 h-6" />} label={t('nav.history')} isMobile={true} />
        </nav>
      </div>
      
      <EmergencyModal isOpen={isEmergencyModalOpen} onClose={() => setEmergencyModalOpen(false)} />
      {isEditProfileModalOpen && <EditProfileModal isOpen={isEditProfileModalOpen} onClose={() => setEditProfileModalOpen(false)} currentProfile={profile} onSave={handleProfileSave}/>}
    </div>
  );
};

const App: React.FC = () => {
  const [profile, setProfile] = useLocalStorage<UserProfile | null>('userProfile', null);
  const [language, setLanguage] = useLocalStorage<string>('userLanguage', 'English');

  if (!profile) {
    return (
        <I18nProvider initialLanguage={language} onLanguageChange={setLanguage}>
            <Onboarding onComplete={setProfile} />
        </I18nProvider>
    );
  }
  
  return (
    <I18nProvider initialLanguage={language} onLanguageChange={setLanguage}>
      <AppContent profile={profile} />
    </I18nProvider>
  );
}

export default App;