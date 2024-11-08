import { DynamoDBClient, ScanCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import {v4 as uuid} from "uuid";

const client = new DynamoDBClient({});

export const handler = async (event) => {
  const req = JSON.parse(event.body);
  const pubsubMessage = JSON.parse(Buffer.from(req.message.data, 'base64').toString('utf-8'));
  const {bookingId, senderId, message} = pubsubMessage;
  
  console.log(req);
  console.log(pubsubMessage);
  
  const getCommand = new ScanCommand({
    TableName: "Users",
    FilterExpression: '#role = :role',
    ExpressionAttributeNames: {
      '#role': 'role' 
    },
    ExpressionAttributeValues: {
      ':role': { S: 'Agent' }
    }
  })
  
  try{
    const agentUsers = await client.send(getCommand);
    const agentIds = agentUsers.Items.map(item => item.id.S);
    
    const agentId = agentIds[Math.floor(Math.random()*agentIds.length)];

    const id = req.message.messageId;
    const addCommand = new PutItemCommand({
    TableName: "Messages",
    Item: {
     id: { S: id },
     bookingId: { S: bookingId },
     senderId: { S: senderId },
     receiverId: { S: agentId },
     messages: { S: JSON.stringify([{Customer: message}]) },
    }});
    
    await client.send(addCommand);
    
    return {
      statusCode:200,
      body: JSON.stringify("message received.")
    }
  }
  catch(error){
    console.log("error", error)
    return {
      statusCode:200,
      body: JSON.stringify("Parse Error.")
    }
  }
};

