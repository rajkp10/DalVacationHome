const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, xyz, abc) => {
  console.log(event)
  console.log(xyz)
  console.log(abc)
    const { userId } = event.queryStringParameters;  // Assume roomNumber is passed as a query parameter

    if (!userId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Room number is required" })
        };
    }

    try {
        
        const params = {
          TableName: 'Booking',
          // ProjectionExpression: "roomNumber, startDate, endDate",
          FilterExpression: 'userId = :uid',
          ExpressionAttributeValues: {
            ':uid': userId
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
