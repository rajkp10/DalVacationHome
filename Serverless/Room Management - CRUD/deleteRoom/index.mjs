import { DynamoDBClient, DeleteItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export const handler = async (event) => {
  console.log(event);
  const { roomId } = event.queryStringParameters;
  
  if(!roomId){
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid room id." })
    }
  }
  
  const deleteItemCommand = new DeleteItemCommand({
    TableName: "Rooms",
    Key:{
      id: {
        S: roomId
      }
    }
  });
  
  try{
    await client.send(deleteItemCommand);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Room deleted successfully." })
    }
  }catch(error){
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Something went wrong. Unable to delete the room." })
    }
  }
};
