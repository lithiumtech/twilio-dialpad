import './App.css';

import React from 'react';
import TwilioConference from './js/components/TwilioConference';
import Test from './js/components/Test';

const App = (props) => {
    return <TwilioConference payload={props.payload ? props.payload : 'none'} />;
    // return <Test />;
};

export default App;
