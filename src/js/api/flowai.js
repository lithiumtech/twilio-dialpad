import axios from 'axios';

// const flow = axios.create({
//     baseURL: 'https://7vjssrci6d.execute-api.us-west-2.amazonaws.com/dev/api/v1/flowai',
// });
const flow = axios.create({
    baseURL: 'https://4fo65fdqv2.execute-api.eu-central-1.amazonaws.com/dev/api/v1/flowai',
});

export const handBackCall = async (client, metadata) => {
    const { conferenceName, phoneNumber, traceId } = metadata;

    try {
        const response = await flow.post('/handBackCall', {
            client,
            conferenceName,
            phoneNumber,
            traceId,
        });
        console.log('handBackCall', response);
        return response.data;
    } catch (err) {
        console.log('handBackCall error', err);
        return false;
    }
};
