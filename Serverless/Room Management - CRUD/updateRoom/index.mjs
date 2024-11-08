import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export const handler = async (event) => {
  const { roomId, roomNumber, roomType, price, features  } = event;
  
  const getItemCommand = new GetItemCommand({
    TableName: "Rooms",
    Key:{ 
      id: {
        S: roomId
      }
    }
  });
  
  let existingRoom = null;
  try{
    existingRoom = await client.send(getItemCommand);
  }catch(error){
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Something went wrong. Unable to find the room." })
    }
  }
  
  if(!existingRoom.Item){
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Room does not exist." })
    }
  }
  
  const updateRoomCommand = new UpdateItemCommand({
    TableName: "Rooms",
    Key: {
      id: {
        S: roomId
      }
    },
    UpdateExpression: "SET roomNumber = :rn, roomType = :rt, price = :p, features = :f",
    ExpressionAttributeValues: {
      ":rn": { N: roomNumber.toString() },
      ":rt": { S: roomType },
      ":p": { N: price.toString() },
      ":f": { SS: features } 
    },
    ReturnValues: "ALL_NEW"
  });
  
  try{
    const updatedRoomDetails = await client.send(updateRoomCommand);
    console.log(updatedRoomDetails.Attributes);
    const roomDetails = {
      roomId: updatedRoomDetails.Attributes.id.S,
      roomNumber: Number(updatedRoomDetails.Attributes.roomNumber.N),
      roomType: updatedRoomDetails.Attributes.roomType.S,
      price: Number(updatedRoomDetails.Attributes.price.N),
      features: updatedRoomDetails.Attributes.features.SS
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Room details updated.", updatedRoomDetails: roomDetails })
    }
  }catch(error){
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Someting went wrong. Unable to update the room details." })
    }
  }
};
