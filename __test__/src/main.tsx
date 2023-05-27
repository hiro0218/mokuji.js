import React from 'react';
import ReactDOM from 'react-dom';
import 'shokika.css';
import '@picocss/pico';
import './App.css';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  // eslint-disable-next-line unicorn/prefer-query-selector
  document.getElementById('root'),
);
