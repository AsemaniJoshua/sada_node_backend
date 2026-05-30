import axios from 'axios';

// ==========================================
// TEST CONFIGURATION
// Replace these values with your actual details
// ==========================================
const API_KEY = '51aeb305805f345849bbaacc633962c990bcd520b1e33baab4f9cd19b22f8593'; 
const SENDER_ID = 'GABONNEY'; // Ensure this sender ID is approved on your SMSOnlineGH dashboard
const PHONE_NUMBER = '233550807914'; // Provide the phone number in international format (e.g. 233241234567)

async function testSMSOnlineGH() {
    console.log(`Starting SMS test to ${PHONE_NUMBER}...`);
    
    try {
        const response = await axios.post('https://api.smsonlinegh.com/v5/message/sms/send', {
            text: "This is a test message from your new SMS provider (SMSOnlineGH).",
            type: 0,
            sender: SENDER_ID,
            destinations: [PHONE_NUMBER]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `key ${API_KEY}`
            }
        });

        console.log('\n--- REQUEST SUCCESSFUL ---');
        console.log('Status Code:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));
        
        // SMSOnlineGH uses a "handshake" object to indicate actual request success beyond HTTP 200
        if (response.data && response.data.handshake && response.data.handshake.id === 0) {
            console.log('\n✅ Success! The SMS request was fully accepted by the server.');
        } else {
            console.log('\n⚠️ Warning: The HTTP request succeeded, but the API returned a non-zero handshake ID:', response.data?.handshake?.label);
        }

    } catch (error) {
        console.log('\n--- REQUEST FAILED ---');
        if (error.response) {
            // The request was made and the server responded with a non-200 status code
            console.log('Error Status Code:', error.response.status);
            console.log('Error Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            // The request was made but no response was received
            console.log('No response received from the server.');
        } else {
            // Something happened in setting up the request
            console.log('Error Message:', error.message);
        }
    }
}

testSMSOnlineGH();
