import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export const handler = async (event) => {
  const { roomId } = event.queryStringParameters;
  
  const getRoomCommand = new GetItemCommand({
    TableName: "Rooms",
    Key:{
      id: {
        S: roomId
      }
    }
  });
  
  try{
    const existingRoom = await client.send(getRoomCommand);

    const roomDetails = {
      roomId: existingRoom.Item.id.S,
      roomNumber: existingRoom.Item.roomNumber.N,
      roomType: existingRoom.Item.roomType.S,
      price: existingRoom.Item.price.N,
      features: existingRoom.Item.features.SS,
      roomPicture: existingRoom.Item.roomPicture.S
    }
    
    console.log(roomDetails)
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Room fetched successfully.", roomDetails })
    };
  }catch(error){
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Something went wrong. Unable to fetch Room details." })
    };
  }
};
