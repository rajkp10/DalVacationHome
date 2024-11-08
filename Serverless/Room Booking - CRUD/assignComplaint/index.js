const AWS = require('aws-sdk');
// const uuid = require('uuid');

// Initialize DynamoDB Document Client
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    console.log(event)
    const req = event;
    const pubsubMessage = JSON.parse(Buffer.from(req.message.data, 'base64').toString('utf-8'));
    // const req = JSON.parse(event);
    const { bookingId, senderId, message } = pubsubMessage;

    console.log("Request:", req);
    console.log("Pub/Sub Message:", pubsubMessage);

    // Find agents with the role "Agent"
    const scanUsersParams = {
        TableName: "Users",
        FilterExpression: "#role = :roleValue",
        ExpressionAttributeNames: {
            "#role": "role"
        },
        ExpressionAttributeValues: {
            ":roleValue": "Agent"
        }
    };

    try {
        const agentUsers = await dynamoDb.scan(scanUsersParams).promise();
        const agentIds = agentUsers.Items.map(item => item.userId);
        const agentId = agentIds[Math.floor(Math.random() * agentIds.length)]; // Randomly select an agent
        console.log(agentId, agentIds)

        // Check for existing messages
        const scanMessagesParams = {
            TableName: "Messages",
            FilterExpression: "bookingId = :bId AND senderId = :sId",
            ExpressionAttributeValues: {
                ":bId": bookingId,
                ":sId": senderId
            }
        };

        const scanResult = await dynamoDb.scan(scanMessagesParams).promise();
        console.log(scanResult)

        if (scanResult.Items.length > 0) {
            // Update the first found message
            const messageId = scanResult.Items[0].id;
            let existingMessages = JSON.parse(scanResult.Items[0].messages);
            existingMessages.push({ "Customer": message });
            
            console.log(messageId , existingMessages)

            const updateParams = {
                TableName: "Messages",
                Key: { id: messageId },
                UpdateExpression: "set messages = :msg",
                ExpressionAttributeValues: {
                    ":msg": JSON.stringify(existingMessages)
                }
            };
            await dynamoDb.update(updateParams).promise();
        } else {
            // Create a new message record
            const newId = AWS.util.uuid.v4();
            const putParams = {
                TableName: "Messages",
                Item: {
                    id: newId,
                    bookingId: bookingId,
                    senderId: senderId,
                    receiverId: agentId,
                    messages: JSON.stringify([{ "Customer": message }]),
                    replied: false
                }
            };
            // const putParams = {
            //     TableName: "Messages",
            //     Item: {
            //         id: { S: newId },
            //         bookingId: { S: bookingId },
            //         senderId: { S: senderId },
            //         receiverId: { S: agentId },
            //         messages: { S: JSON.stringify([{ "Customer": message }]) },
            //         replied: { BOOL: false }
            //     }
            // };
            console.log("true")
            await dynamoDb.put(putParams).promise();
        }

        return {
            statusCode: 200,
            fulfillmentText: "Message processed successfully."
        };
    } catch (error) {
        console.log("Error processing message:", error);
        return {
            statusCode: 500,
            fulfillmentText: "Failed to process message due to an internal error."
        };
    }
};
