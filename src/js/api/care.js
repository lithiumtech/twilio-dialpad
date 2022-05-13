import axios from 'axios';

const clientMap = {
    'manual-c01': {
        url: 'https://manual-c01.sdxdemo.com/api/v2',
    },
    'samsungbnl-dev': {
        baseUrl: 'https://samsungbnl-dev.response.lithium.com',
        apiUrl: 'https://samsungbnl-dev.response.lithium.com/api/v2',
    },
    flowai: {
        baseUrl: 'https://flowai.response.lithium.com',
        apiUrl: 'https://flowai.response.lithium.com/api/v2',
    },
};

// const care = axios.create({
//     baseURL: 'https://7vjssrci6d.execute-api.us-west-2.amazonaws.com/dev/api/v1',
// });
const care = axios.create({
    baseURL: 'https://4fo65fdqv2.execute-api.eu-central-1.amazonaws.com/dev/api/v1',
});

export const setAgentState = async (client, email, stateId) => {
    try {
        const response = await care.post('/care/setAgentStateByEmail', {
            client,
            email,
            stateUUID: stateId,
        });
        console.log('setAgentState', response);
        return response.data;
    } catch (err) {
        console.log('setAgentState error', err);
        return false;
    }
};

export const getConversation = async (client, conversationId) => {
    try {
        const response = await care.post('/care/getConversation', {
            client,
            conversationId,
        });
        console.log('getConversation', response);
        return response.data;
    } catch (err) {
        console.log('getConversation error', err);
        return false;
    }
};

export const postInternalNote = async (client, conversationId, note) => {
    try {
        const response = await care.post('/care/postInternalNote', {
            client,
            conversationId,
            note,
        });
        return response.data;
    } catch (err) {
        return false;
    }
};

export const getCaseDetails = async (client, caseId) => {
    try {
        console.log('getCaseDetails', {
            method: 'get',
            url: `${clientMap[client].baseUrl}/case/details/${caseId}`,
        });
        const response = await axios({
            method: 'get',
            url: `${clientMap[client].baseUrl}/case/details/${caseId}`,
        });

        return response.data;
    } catch (err) {
        console.log('error case', err);
        return false;
    }
};

export const unassignCase = async (client, caseId) => {
    try {
        console.log('getCaseDetails', {
            method: 'get',
            url: `${clientMap[client].baseUrl}/case/unclaim/${caseId}`,
        });
        const response = await axios({
            method: 'get',
            url: `${clientMap[client].baseUrl}/case/unclaim/${caseId}`,
        });

        return response.data;
    } catch (err) {
        console.log('error case', err);
        return false;
    }
};
