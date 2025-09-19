import { useState, useEffect } from 'react';

// FIX: The original implementation had a stale closure bug in `setValue`.
// The functional update was called with a stale `storedValue`.
// This version uses the functional update form of the `useState` setter (`setStoredValue`)
// to ensure the latest state is always used for updates.
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Pass a function to setStoredValue to get the latest state.
      // This prevents bugs from stale closures.
      setStoredValue(currentState => {
        // Resolve the new value: it can be a value or a function that takes the current state.
        const valueToStore = value instanceof Function ? value(currentState) : value;
        // Persist to localStorage.
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // Return the new value to update the state.
        return valueToStore;
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue];
}

export default useLocalStorage;
