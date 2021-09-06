import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import Game from './react/Game';

// start initializing the game once DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
  ReactDOM.render(
    <React.StrictMode>
      <Game />
    </React.StrictMode>,
    document.getElementById('root')
  );
});
