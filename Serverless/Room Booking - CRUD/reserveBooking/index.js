const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const axios = require('axios'); // Assuming Axios is used for HTTP requests

exports.handler = async (event) => {
    // {
    //     "roomNumber": "101",
    //     "startDate": "Mon Jul 29 2024",
    //     "endDate": "Wed Jul 31 2024",
    //     "totalNights": 2,
    //     "totalPrice": 1650,
    //     "userId": "fijata8852@tiervio.com"
    //   }
    const {userId, roomNumber, startDate, endDate, totalPrice, totalNights} = event;
    const roomType = "NA";
    const headers = {
        "Access-Control-Allow-Origin": "*", // Adjust this to a more restrictive setting for production
        "Access-Control-Allow-Credentials": true,
        // "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        // "Access-Control-Allow-Methods": "OPTIONS,POST"
    };
    
    // Validate the input parameters
    if (!roomNumber || !roomType || !startDate || !endDate || !totalPrice || !totalNights) {
        return { statusCode: 400, headers: headers, body: JSON.stringify("Missing required booking details.") };
    }

    // Check if the startDate is before the endDate
    if (new Date(startDate) >= new Date(endDate)) {
        return { statusCode: 400, headers: headers, body: JSON.stringify("Invalid date range. The start date must be before the end date.") };
    }

    // Check if the room exists and get additional room details
    const roomDetails = await getRoomDetails(roomNumber);
    if (!roomDetails) {
        return { statusCode: 404, headers: headers, body: JSON.stringify("Room number does not exist.") };
    }

    // Check room availability
    const availability = await checkRoomAvailability(roomNumber, startDate, endDate);
    if (!availability.available) {
        return { statusCode: 409, headers: headers, body: JSON.stringify("Room is not available for the selected dates.") };
    }

    // Calculate the total cost and duration
    // const durationDays = calculateDurationDays(startDate, endDate);
    // const totalCost = roomDetails.price * durationDays;

    // Prepare the item to be inserted into DynamoDB
    const item = {
        TableName: 'Booking',
        Item: {
            id: AWS.util.uuid.v4(), // Generate a unique ID
            userId,
            roomNumber: roomNumber + "",
            roomType,
            startDate,
            endDate,
            createdAt: new Date().toISOString(),
            totalNights,
            totalPrice,
            status: "Awaiting Approval"
        }
    };

    // Insert the booking into DynamoDB
    try {
        await dynamoDb.put(item).promise();
        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify({
                message: "Reservation successfully created.",
                bookingId: item.Item.id,
                details: item.Item
            })
        };
    } catch (error) {
        console.error('Error inserting booking into DynamoDB:', error);
        return { statusCode: 500, headers: headers, body: JSON.stringify("Failed to create booking due to an internal error.") };
    }
};

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

async function checkRoomAvailability(roomNumber, startDate, endDate) {
    const params = {
        TableName: 'Booking',
        FilterExpression: 'roomNumber = :rn AND (startDate BETWEEN :start AND :end OR endDate BETWEEN :start AND :end)',
        ExpressionAttributeValues: {
            ':rn': roomNumber,
            ':start': startDate,
            ':end': endDate
        }
    };
    const data = await dynamoDb.scan(params).promise();
    return { available: data.Items.length === 0 };
}