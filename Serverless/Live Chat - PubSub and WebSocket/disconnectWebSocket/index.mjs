import AWS from 'aws-sdk';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const handler = async (event) => {
const connectionId = event.requestContext.connectionId;
  const params = {
    TableName: 'WebSocketConnections',
    Key: {
      connectionId,
    },
  };

  try {
    await dynamoDb.delete(params).promise();
    return { statusCode: 200, body: 'Disconnected.' };
  } catch (error) {
    console.error(`Error disconnecting: ${error}`);
    return { statusCode: 500, body: 'Failed to disconnect.' };
  }
};
