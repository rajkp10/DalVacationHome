import AWS from 'aws-sdk';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const params = {
    TableName: 'WebSocketConnections',
    Item: {
      connectionId,
    },
  };

  try {
    await dynamoDb.put(params).promise();
    return { statusCode: 200, body: 'Connected.' };
  } catch (error) {
    console.error(`Error connecting: ${error}`);
    return { statusCode: 500, body: 'Failed to connect.' };
  }
};
