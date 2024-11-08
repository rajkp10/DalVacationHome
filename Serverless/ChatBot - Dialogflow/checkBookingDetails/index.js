const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const axios = require('axios');

exports.handler = async (event) => {
    // Extract parameters from the event
    const {status, data, parameters, queryText, action, allRequiredParamsPresent, outputContexts, intent} = event;
    const { userId, roomNumber, roomType, startDate, endDate } = parameters;

    // Validate the input parameters
    if (!roomNumber || !userId || !startDate || !endDate) {
        return { fulfillmentText: "Missing required booking details. Please provide room number, userId, start date, and end date." };
    }

    // Check if the startDate is before the endDate
    if (new Date(startDate) >= new Date(endDate)) {
        return { fulfillmentText: "Invalid date range. The start date must be before the end date." };
    }

    // Check room availability in the DynamoDB "Bookings" table
    try {
        // First check if the room number exists
        const roomDetails = await getRoomDetails(roomNumber);
        if (!roomDetails) {
            return { fulfillmentText: JSON.stringify(`Room number ${roomNumber} does not exist. Enter a valid one.`) };
        }
        // const roomExists = await checkRoomExists(roomNumber);
        // if (!roomExists) {
        //     return {fulfillmentText: `Room number ${roomNumber} does not exist. Enter a valid one`};
        // }
        
        const response = await checkRoomAvailability(roomNumber, startDate, endDate);
        if (response.available) {
            return { fulfillmentText: `The room ${roomNumber} of type ${roomType} is available from ${startDate} to ${endDate}. Do you want to proceed with the booking...? (yes/no)` };
        } else {
            return { fulfillmentText: `The room ${roomNumber} is not available from ${startDate} to ${endDate}. Please choose different dates or another room.` };
        }
        
    } catch (error) {
        console.error("Error checking room availability:", error);
        return { fulfillmentText: `Failed to check room availability due to an internal error. ${error}` };
    }
};

// Function to check room exists
// async function checkRoomExists(roomNumber) {
//     const params = {
//         TableName: 'Room',
//         FilterExpression: '#rn = :roomNumber',
//         ExpressionAttributeNames: {
//             '#rn': 'roomNumber',
//         },
//         ExpressionAttributeValues: {
//             ':roomNumber': roomNumber,
//         }
//     };

//     try {
//         const data = await dynamoDb.scan(params).promise();
//         console.log(data)
//         return data.Count == 1;  // Return true if the item exists, false otherwise
//     } catch (error) {
//         console.error('Error checking if room exists:', error);
//         throw new Error('Error querying DynamoDB to check if room exists.');
//     }
// }

async function getRoomDetails(roomNumber) {
    try {
        const response = await axios.get('https://6rofxd33q8.execute-api.us-east-1.amazonaws.com/development/rooms');
        // console.log(response)
        const rooms = JSON.parse(response.data.body).data;
        // console.log(rooms);
        const room = rooms.find(room => room.roomNumber == roomNumber);
        return room || null;
    } catch (error) {
        console.error('Error fetching room details:', error);
        return null;
    }
}

// Function to check room availability
async function checkRoomAvailability(roomNumber, startDate, endDate) {
    const params = {
        TableName: 'Booking',
        FilterExpression: '#rn = :roomNumber',
        ExpressionAttributeNames: {
            '#rn': 'roomNumber',
        },
        ExpressionAttributeValues: {
            ':roomNumber': roomNumber,
        }
    };
    // const data = await dynamoDb.query(params).promise();

    try {
        const data = await dynamoDb.scan(params).promise();
        // Check each booking to see if there is a conflict
        for (const booking of data.Items) {
            if ((startDate < booking.endDate && startDate >= booking.startDate) ||
                (endDate > booking.startDate && endDate <= booking.endDate) ||
                (startDate <= booking.startDate && endDate >= booking.endDate)) {
                return { available: false };
            }
        }
        return { available: true };
    } catch (error) {
        console.error("Error querying DynamoDB:", error);
        throw new Error("Error querying DynamoDB for room availability.");
    }
}
