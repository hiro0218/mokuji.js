import React from 'react';
import { createRoot } from 'react-dom/client';

import 'shokika.css';
import '@picocss/pico';
import './App.css';
import App from './App';

const container = document.querySelector('#root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
