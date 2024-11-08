const { PubSub } = require('@google-cloud/pubsub');
const path = require('path');

// Setting the environment variable within the code
// process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, 'tempo_key.json');

exports.handler = async (event) => {

// const funct = async (event) => {
    const pubSubClient = new PubSub();

    const {reference_number, complaint, userId} = event.parameters;

    // const topicName = 'projects/csci5410project-425016/topics/test-topic'; // Replace with your Pub/Sub topic name
    const topicName = process.env.PUBSUB_TOPIC_NAME; // Replace with your Pub/Sub topic name
    const messageData = {
        bookingId: reference_number,
        senderId: userId,
        message: complaint
    };

    console.log("messageData", messageData);

    try {
        const dataBuffer = Buffer.from(JSON.stringify(messageData));
        const messageId = await pubSubClient.topic(topicName).publish(dataBuffer);
        console.log(`Message ${messageId} published.`);
        return {
            statusCode: 200,
            fulfillmentText: `Complaint published successfully. The admin will get back to you soon.`
        };
    } catch (error) {
        console.error(`Received error while publishing complaint: ${error.message}`);
        console.error(error)
        return {
            statusCode: 500,
            fulfillmentText: `Error publishing complaint: ${error.message}`
        };
    }
};


// funct({"data": "test"});