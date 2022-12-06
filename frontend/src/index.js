// import React from 'react';
// import ReactDOM from 'react-dom';
// import '@fortawesome/fontawesome-free/css/all.min.css';
// import './assets/css/index.css';
// import App from './App';

// ReactDOM.render(<App />, document.getElementById('root'));

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './assets/css/index.css'

import App from './App'

// 👇️ make sure to use the correct root element ID
// from your public/index.html file
const rootElement = document.getElementById('root')
const root = createRoot(rootElement)

root.render(
  <StrictMode>
    <App />
  </StrictMode>
)
