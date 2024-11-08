const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const axios = require('axios');

exports.handler = async (event) => {
    // Extract the 'booking-context' from outputContexts
    try{
        
        const bookingContext = event.outputContexts.find(context => context.name.includes('booking-context'));

        if (!bookingContext) {
            return { statusCode: 400, fulfillmentText: 'Booking context not found in the request.' };
        }

        const { roomNumber, userId, startDate, endDate, roomType } = bookingContext.parameters;

        // Validate the extracted parameters
        if (!roomNumber || !userId || !startDate || !endDate) {
            return { statusCode: 400, fulfillmentText: 'Missing required booking parameters.' };
        }

        // Retrieve the price for the roomType from Roo table
        const room = await getRoomDetails(roomNumber);
        console.log(room);
        const pricePerDay = room ? room.price : undefined;
        if (!pricePerDay) {
            return { statusCode: 400, fulfillmentText: 'Room number price not found. Please check the room number.' };
        }

        // Calculate the duration in days
        const totalNights = calculateDurationDays(startDate, endDate);
        if (totalNights <= 0) {
            return { statusCode: 400, fulfillmentText: 'Invalid date range. The start date must be before the end date.' };
        }

        // Calculate the total cost
        const totalPrice = pricePerDay * totalNights;

        // Prepare the item to be inserted into DynamoDB
        const item = {
            TableName: 'Booking',
            Item: {
                id: AWS.util.uuid.v4(),  // Generate a unique ID
                userId,
                roomNumber,
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
            return { statusCode: 200, fulfillmentText: `Booking successfully created with ID: ${item.Item.id}, Total Cost: $${totalPrice}, Duration: ${totalNights} days` };
        } catch (error) {
            console.error('Error inserting booking into DynamoDB:', error);
            return { statusCode: 500, fulfillmentText: 'Failed to create booking due to an internal error.' };
        }
    } catch (err) {
        console.error('Error Booking the room:', err);
        return { statusCode: 500, fulfillmentText: 'Failed to create booking due to an internal error.' };
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

// Helper function to calculate duration in days
function calculateDurationDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    console.log(start)
    console.log(end)
    
    const duration = (end - start) / (1000 * 60 * 60 * 24); // Convert milliseconds to days
    return Math.ceil(duration); // Use Math.ceil to round up to the next whole number
}
