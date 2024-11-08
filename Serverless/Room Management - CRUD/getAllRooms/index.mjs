import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export const handler = async (event) => {
  const getAllRoomsCommand = new ScanCommand({
    TableName: "Rooms"
  })
  
  try{
    const data = await client.send(getAllRoomsCommand);
    
    const rooms = data.Items.map(item => ({
      id: item.id.S,
      roomNumber: Number(item.roomNumber.N),
      roomType: item.roomType.S,
      price: Number(item.price.N),
      features: item.features.SS,
      roomPicture: item.roomPicture.S
    }));
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Room details fetched successfully.", data:rooms })
    }
  }catch(error){
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Something went worng. Unable to fetch rooms." })
    }
  }
};
