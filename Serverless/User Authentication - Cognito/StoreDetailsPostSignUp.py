import boto3
from botocore.exceptions import ClientError

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("Users")


def lambda_handler(event, context):
    user_id = event["request"]["userAttributes"]["email"]  # Use email as the userId
    custom_question = event["request"]["userAttributes"].get("custom:question")
    custom_answer = event["request"]["userAttributes"].get("custom:answer")
    cipher_key = event["request"]["userAttributes"].get("custom:cipherKey")
    role = event["request"]["userAttributes"].get("custom:role")

    item = {
        "userId": user_id,  # Use email as the userId
        "customQuestion": custom_question,
        "customAnswer": custom_answer,
        "cipherKey": cipher_key,
        "role": role,
    }

    try:
        table.put_item(Item=item)
        print(f"User details for {user_id} stored successfully.")
    except ClientError as e:
        print(f"Error storing user details: {e.response['Error']['Message']}")

    return event
