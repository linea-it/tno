import React, { createContext, useState, useContext } from 'react';

const TitleContext = createContext({
  title: '',
  setTitle: null,
});

export const TitleProvider = ({ children }) => {
  const [title, setTitle] = useState('');

  return (
    <TitleContext.Provider value={{ title, setTitle }}>
      {children}
    </TitleContext.Provider>
  );
};

export function useTitle() {
  const context = useContext(TitleContext);
  return context;
}
