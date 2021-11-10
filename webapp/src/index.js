import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import Modal from 'react-modal';
import App from './App';

const appElement = document.getElementById('root');
Modal.setAppElement(appElement)

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  appElement
);

