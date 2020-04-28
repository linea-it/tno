import { useState, useEffect } from 'react';

function useLocalStorageState(key, initialState) {
  const [state, setState] = useState(() => {
    const storageValue = localStorage.getItem(key);

    if (storageValue) {
      return storageValue;
    }
    return initialState;
  });

  useEffect(() => {
    localStorage.setItem(key, state);
  }, [key, state]);

  return [state, setState];
}

export default useLocalStorageState;
