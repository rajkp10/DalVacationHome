const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const referenceNumber = event.parameters.ReferenceNumber;

    const params = {
        TableName: 'Booking',
        FilterExpression: '#rn = :id',
        ExpressionAttributeNames: {
            '#rn': 'id',
        },
        ExpressionAttributeValues: {
            ':id': referenceNumber,
        }
    };

    try {
        const data = await dynamoDb.scan(params).promise();
        console.log(data)
        if (data.Count != 1) {
            return { fulfillmentText: "No booking found with that reference number." };
        }
        const item = data.Items[0]
        return { fulfillmentText: `Booking details: \n\tRoom Number - ${item.roomNumber}, \n\tStart Date - ${item.startDate}, \n\tEnd Date - ${item.endDate}, \n\tPrice - ${item.totalPrice}` };
    } catch (error) {
        console.error("Error: ", error);
        return { fulfillmentText: "Failed to retrieve booking details due to an internal error." };
    }
};
