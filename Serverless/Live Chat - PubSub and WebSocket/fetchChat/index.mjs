import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export const handler = async (event) => {
  console.log(event);
  const { userId, role } = event;
  
  
  let getCommand;
  
  if(role === "customer"){
    getCommand = new ScanCommand({
      TableName: "Messages",
      FilterExpression: "senderId = :userId",
      ExpressionAttributeValues: {
        ":userId": { S: userId }
      }
    })
  }else if(role === "agent"){
    getCommand = new ScanCommand({
      TableName: "Messages",
      FilterExpression: "receiverId = :userId",
      ExpressionAttributeValues:{
        ":userId": { S: userId }
      }
    })
  }
  
  let data
  try{
    data = await client.send(getCommand);
  }catch(error){
    return {
      statusCode: 500,
      body: JSON.stringify({message:"Internal Server Error"})
    }
  }

  const chats = data.Items.map(item=>({
    messageId: item.id.S,
    bookingId: item.bookingId.S,
    messages: JSON.parse(item.messages.S),
    receiverId: item.receiverId.S,
    senderId: item.senderId.S
  }))
  return {
    statusCode: 200,
    body: JSON.stringify({data:chats})
  }
};
