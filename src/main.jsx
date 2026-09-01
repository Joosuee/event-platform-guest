import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  < React.StrictMode >

    <div class="disco-light light-a"></div>
    <div class="disco-light light-b"></div>

    <img class="disco-ball" src="/disco-ball.png" alt="" aria-hidden="true"></img>

    <div className='hero-content'>
      <App />
    </div>
  </React.StrictMode >
);
