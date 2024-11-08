const AWS = require('aws-sdk');
const language = require('@google-cloud/language');

// Initialize DynamoDB and Google Natural Language client
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const client = new language.LanguageServiceClient();

exports.handler = async (event) => {
    // const { text, userId, roomNumber } = JSON.parse(event.body);
    const { text, userId, roomNumber } = event;

    try {
        // Prepare the document for sentiment analysis
        const document = {
            content: text,
            type: 'PLAIN_TEXT',
        };

        // Perform sentiment analysis
        const [result] = await client.analyzeSentiment({ document });
        const sentiment = result.documentSentiment;

        // Data to be added to DynamoDB
        const params = {
            TableName: 'Reviews',
            Item: {
                id: AWS.util.uuid.v4(),
                userId: userId,
                roomNumber: roomNumber + "",
                text: text,
                sentimentScore: sentiment.score,
                sentimentMagnitude: sentiment.magnitude
            }
        };

        // Insert data into DynamoDB
        await dynamoDB.put(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Review added successfully",
                sentimentScore: sentiment.score,
                sentimentMagnitude: sentiment.magnitude
            }),
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            },
        };
    } catch (error) {
        console.error(`Error processing request: ${error.message}`);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Failed to process request"
            }),
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            },
        };
    }
};
