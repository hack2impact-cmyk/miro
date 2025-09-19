import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Hardcoded English translations as a reliable fallback to prevent blank screens.
const fallbackTranslations = {
  "onboarding": {
    "welcome": "Welcome to Miro",
    "subtitle": "Your personal space for mental wellness. Let's get to know you a little.",
    "name": { "label": "What should we call you?", "placeholder": "Enter your name" },
    "age": { "label": "How old are you?", "placeholder": "Enter your age" },
    "gender": {
      "label": "How do you identify?",
      "select": "Select your gender",
      "female": "Female", "male": "Male", "non-binary": "Non-binary", "other": "Other", "preferNotToSay": "Prefer not to say"
    },
    "submit": "Start My Journey"
  },
  "nav": { "chat": "Chat", "journal": "Journal", "tips": "Tips", "community": "Community", "history": "History" },
  "sidebar": { "language": "Language", "editProfile": "Edit Profile", "hello": "Hello, {{name}}!", "emergency": "Emergency" },
  "chat": {
    "header": "Chat with Miro",
    "welcomeMessage": "Hi {{name}}, how are you feeling today? Tell me about your day.",
    "error": "I'm having a little trouble connecting right now. Please try again in a moment.",
    "placeholder": "Type your message here...",
    "search": { "placeholder": "Search in conversation..." },
    "tts": { "speak": "Read message aloud", "speaking": "Speaking...", "stop": "Stop speaking" },
    "stt": { "mic_on": "Turn on microphone", "mic_off": "Turn off microphone", "listening": "Listening..." },
    "clearHistory": { "button": "Clear history", "confirm": "Are you sure you want to clear the entire chat history?" },
    "deleteMessage": { "button": "Delete message", "confirm": "Are you sure you want to delete this message?" }
  },
  "history": {
    "empty": "Your chat history is empty."
  },
  "journal": {
    "title": "My Journal",
    "mood": {
      "weeklyGraph": "Weekly Mood Graph", "today": "How are you feeling today?", "noEntry": "No entry",
      "aria": { "graph": "A bar chart showing your mood for the last 7 days.", "moodLogged": "Mood logged as {{mood}}", "noMoodLogged": "No mood logged for this day" }
    },
    "thoughts": {
      "title": "What's on your mind?", "subtitle": "Negative entries are cleared after 24 hours.", "placeholder": "Write your thoughts here. It's a safe space.", "saving": "Saving...", "save": "Save Entry"
    },
    "reflections": { "title": "Positive Reflections", "empty": "Your positive journal entries will appear here. Keep writing!" }
  },
  "tips": {
    "title": "Wellness Hub",
    "affirmation": { "title": "Daily Affirmation", "loading": "Finding a positive thought for you...", "new": "New Affirmation" },
    "wellness": { "title": "Wellness Tip", "loading": "Loading a helpful tip...", "new": "New Tip" }
  },
  "community": { "title": "Community Stories", "refreshing": "Refreshing...", "refresh": "Refresh", "loading": "Loading community posts...", "empty": "Could not load any posts right now. Please try again." },
  "modal": {
    "emergency": { "title": "Immediate Support Available", "subtitle": "If you are in crisis or distress, please reach out to one of these 24/7 helplines in India. You are not alone.", "close": "Close" },
    "editProfile": { "title": "Edit Your Profile", "name": "Name", "age": "Age", "gender": "Gender", "cancel": "Cancel", "save": "Save Changes" }
  }
};

interface I18nContextType {
  language: string;
  languageFullName: string;
  setLanguage: (lang: string) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const languageMap: Record<string, string> = {
  English: 'en', Hindi: 'hi', Kannada: 'kn', Bengali: 'bn', Tamil: 'ta', Telugu: 'te',
};

export const I18nProvider: React.FC<{ children: React.ReactNode; initialLanguage: string; onLanguageChange: (lang: string) => void }> = ({ children, initialLanguage, onLanguageChange }) => {
  const [langFullName, setLangFullName] = useState(initialLanguage);
  const langCode = languageMap[langFullName] || 'en';
  
  // Initialize state with the hardcoded fallback to prevent a blank screen.
  const [translations, setTranslations] = useState<{ current: any, fallback: any }>({ current: fallbackTranslations, fallback: fallbackTranslations });

  useEffect(() => {
    const loadTranslations = async () => {
      // If English is selected, we don't need to fetch anything.
      if (langCode === 'en') {
        setTranslations({ current: fallbackTranslations, fallback: fallbackTranslations });
        return;
      }

      try {
        const response = await fetch(`/locales/${langCode}.json`);
        if (!response.ok) {
          throw new Error(`Failed to fetch translation file for ${langCode}`);
        }
        const current = await response.json();
        setTranslations({ current, fallback: fallbackTranslations });
      } catch (error) {
        console.error("Error loading translation file:", error);
        // If fetching fails, fall back to showing English content.
        setTranslations({ current: fallbackTranslations, fallback: fallbackTranslations });
      }
    };

    loadTranslations();
  }, [langCode]);

  const setLanguage = (newLangFullName: string) => {
    setLangFullName(newLangFullName);
    onLanguageChange(newLangFullName);
  };

  const t = useCallback((key: string, replacements?: Record<string, string>): string => {
    const keys = key.split('.');
    
    // Try to get the translation from the current language
    let result = translations.current;
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) break;
    }
    
    // If not found, try the fallback language
    if (result === undefined) {
        result = translations.fallback;
        for (const k of keys) {
          result = result?.[k];
          if (result === undefined) break;
        }
    }

    // If still not found, return the key itself as a last resort
    if (result === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
    }

    let strResult = String(result);

    // Perform replacements if any
    if (replacements) {
        Object.keys(replacements).forEach(rKey => {
            strResult = strResult.replace(`{{${rKey}}}`, replacements[rKey]);
        });
    }

    return strResult;
  }, [translations]);
  
  return (
    <I18nContext.Provider value={{ language: langCode, languageFullName: langFullName, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};