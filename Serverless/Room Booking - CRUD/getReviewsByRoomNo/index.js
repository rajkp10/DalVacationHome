const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    console.log(event)
    const { roomNumber } = event.queryStringParameters;  // Assume roomNumber is passed as a query parameter

    if (!roomNumber) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            },
            body: JSON.stringify({ message: "Room number is required" })
        };
    }

    try {
        const params = {
          TableName: 'Reviews',
          FilterExpression: 'roomNumber = :rn',
          ExpressionAttributeValues: {
            ':rn': roomNumber
          }
        };

        const data = await dynamoDb.scan(params).promise();
        console.log(data)
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            },
            body: JSON.stringify({ message: "Successfully retrieved bookings", data: data.Items })
        };
    } catch (error) {
        console.error('Error retrieving bookings:', error);
        return {
            statusCode: 500,
             headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            },
            body: JSON.stringify({ message: "Failed to retrieve bookings due to an internal error" })
        };
    }
};
