import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({});
const s3Client = new S3Client({});
const BUCKET_NAME = "dalvacationhome-image-bucket";

export const handler = async (event) => {
  const {userId, roomNumber, roomType, price, features, image} = event;
  const roomId = randomUUID();
  const base64Image = image.replace(/^data:image\/\w+;base64,/, '');
  const imageBuffer = Buffer.from(base64Image, 'base64');
  const s3Key = `${roomId}.jpg`;
  
  const s3Params = {
    Bucket: BUCKET_NAME,
    Key: s3Key,
    Body: imageBuffer,
    ContentEncoding: 'base64',
    ContentType: 'image/jpeg',
    ACL: 'public-read',
  };
  
  try{
    await s3Client.send(new PutObjectCommand(s3Params));
    const s3Url = `https://${BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;

    const command = new PutItemCommand({
      TableName: "Rooms",
      Item: {
        id: { S: roomId },
        agentId: { S: userId },
        roomNumber: { N: roomNumber.toString() }, 
        roomType: { S: roomType },
        price: { N: price.toString() },
        features: { SS: features },    
        roomPicture: { S: s3Url }
      }
    }); 
  
    await client.send(command);
    console.log("command")
    return {
      statusCode:201,
      body:JSON.stringify({message:"Room added successfully."})
    };
  }catch(error){
    console.log(error);
    return {
      statusCode:500,
      body:JSON.stringify({message:"Something went wrong."})
    };
  }
};
