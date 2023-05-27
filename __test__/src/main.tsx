import React from 'react';
import { createRoot } from 'react-dom/client';

import 'shokika.css';
import '@picocss/pico';
import './App.css';
import App from './App';

const container = document.querySelector('#root');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);

root.render(<App />);
