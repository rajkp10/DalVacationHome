import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export const handler = async (event) => {
  // const { userId } = JSON.parse(event.body);
  console.log(event);
  const { userId } = event.queryStringParameters;
  console.log(userId);
  const getAllRoomsCommand = new ScanCommand({
    TableName: "Rooms",
    FilterExpression: "#agentId = :userId",
    ExpressionAttributeNames: {
      "#agentId": "agentId",
    },
    ExpressionAttributeValues: {
      ":userId": { S: userId },
    },
  })
  
  let data
  try{
    data = await client.send(getAllRoomsCommand);
    console.log(data);
  }catch(error){
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Something went wrong. Unable to fetch rooms." })
    }
  }
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
};
