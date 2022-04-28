import axios from 'axios';

// const twilio = axios.create({
//     baseURL: 'https://7vjssrci6d.execute-api.us-west-2.amazonaws.com/dev/api/v1/twilio',
// });
const twilio = axios.create({
    baseURL: 'https://4fo65fdqv2.execute-api.eu-central-1.amazonaws.com/dev/api/v1/twilio',
});

export const getToken = async (agent) => {
    const response = await twilio.post('/getToken', { agent });

    return response.data.token;
};

export const putUserOnHold = async (conferenceId, CallSid) => {
    const response = await twilio.post('/putUserOnHold', {
        conferenceId,
        CallSid,
    });

    return response.data;
};

export const returnUserToCall = async (conferenceId, CallSid) => {
    const response = await twilio.post('/returnUserToCall', {
        conferenceId,
        CallSid,
    });

    return response.data;
};

export const endConference = async (conferenceId) => {
    const response = await twilio.post('/endConference', {
        conferenceId,
    });

    return response.data;
};

export const addNumberToCall = async (conferenceId, number) => {
    const response = await twilio.post('/addNumberToCall', {
        conferenceId,
        number,
    });

    return response.data;
};

export const checkConferenceStatus = async (conferenceId) => {
    const response = await twilio.post('/checkConferenceStatus', {
        conferenceId,
    });

    console.log('checkConferenceStatus', response.data);
    return response.data;
};
