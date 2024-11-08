import AWS from 'aws-sdk';

const dynamoDb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
const apiGatewayManagementApi = new AWS.ApiGatewayManagementApi({
  endpoint: "4i88d0ij0b.execute-api.us-east-1.amazonaws.com/deployment/", // Set this to your WebSocket API endpoint
});

export const handler = async (event) => {
  const req = JSON.parse(event.body);
  const { messageId, userId, role, message } = req.data;

  const getParams = {
      TableName: 'Messages',
      Key: { id: messageId },
      ProjectionExpression: 'messages'
    };

    const getResult = await dynamoDb.get(getParams).promise();
    let messages = getResult.Item ? getResult.Item.messages : '[]';
    let messagesArray = JSON.parse(messages);
    messagesArray.push({ [role]: message });
    const updatedMessages = JSON.stringify(messagesArray);

    const updateParams = {
      TableName: 'Messages',
      Key: { id: messageId },
      UpdateExpression: 'SET messages = :updatedMessages',
      ExpressionAttributeValues: {
        ':updatedMessages': updatedMessages
      }
    };

  // const timestamp = new Date().toISOString();
  // const putParams = {
  //   TableName: 'Messages',
  //   Key: { id: messageId },
  //   UpdateExpression: 'SET messages = list_append(messages, :message)',
  //   ExpressionAttributeValues: {
  //     ':message': JSON.stringify({ [role]: message }),
  //   },
  // };

  try {
    await dynamoDb.update(updateParams).promise();

    const connectionsParams = {
      TableName: 'WebSocketConnections',
    };

    const connections = await dynamoDb.scan(connectionsParams).promise();

    const postCalls = connections.Items.map(async ({ connectionId }) => {
      try {
        await apiGatewayManagementApi
          .postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify({ messageId, userId, role, message }),
          })
          .promise();
      } catch (error) {
        if (error.statusCode === 410) {
          await dynamoDb.delete({ TableName: 'WebSocketConnections', Key: { connectionId } }).promise();
        } else {
          console.error(`Error posting to connection ${connectionId}: ${error}`);
        }
      }
    });

    await Promise.all(postCalls);
    return { statusCode: 200, body: 'Message sent and stored.' };
  } catch (error) {
    console.error(`Error sending message: ${error}`);
    return { statusCode: 500, body: 'Failed to send message.' };
  }
};
