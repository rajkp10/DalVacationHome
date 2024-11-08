import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export const handler = async (event) => {
  console.log(event);
  const { messageId } = event.queryStringParameters;
  
  const getCommand = new GetItemCommand({
    TableName: "Messages",
    Key:{
      id:{
        S: messageId
      }
    }
  })
  
  try{
    const data = await client.send(getCommand);
    
    const chat = {
      messageId: data.Item.id.S,
      bookingId: data.Item.bookingId.S,
      receiverId: data.Item.receiverId.S,
      senderId: data.Item.senderId.S,
      messages: JSON.parse(data.Item.messages.S)
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({data:chat})
    }
  }catch(error){
    return {
      statusCode: 500,
      body: JSON.stringify({message: "Something went wrong."})
    }
  }
};
