// frontend/src/App.js
import React, { useEffect, useState } from 'react';
import './App.css';
import config from './config';

export default function App() {
  const [text, setText] = useState('Fetching...');

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${config.backendUrl}/status`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        setText(data.message ?? JSON.stringify(data));
      } catch (e) {
        setText(`Error: ${e.message}`);
      }
    })();
  }, []); // run once

  return <div className="App">{text}</div>;
}
