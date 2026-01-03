import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import reportWebVitals from './reportWebVitals';

// Get the root element
const rootElement = document.getElementById('parliament-pg-root');
const view = rootElement?.dataset.view || 'default-view';
const id = rootElement?.dataset.id || '0';

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App view={view} id={id}/>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example, reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
