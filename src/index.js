import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

// if hosted on the main page for development
const root = document.getElementById('root');
if (root) {
    console.log('found root');
    ReactDOM.render(<App payload={{ local: true, caseId: { a: 2976069 }, authorId: { a: 1234 } }} />, root);
}

// hook for ic-backend-ui to call
window.loadVoiceControl = function (element, props) {
    ReactDOM.render(<App payload={props} />, element);
};
