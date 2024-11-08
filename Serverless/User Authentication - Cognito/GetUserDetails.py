import json
import boto3
import logging
from botocore.exceptions import ClientError

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("Users")


def lambda_handler(event, context):
    logger.info("Received event: %s", json.dumps(event))

    # Parse the body to get the userId
    try:
        body = json.loads(event["body"])
        user_id = body.get("userId")
    except (KeyError, TypeError, json.JSONDecodeError) as e:
        logger.error("Error parsing event body: %s", str(e))
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Invalid request body"}),
        }

    if not user_id:
        logger.error("Missing userId in event body")
        return {"statusCode": 400, "body": json.dumps({"error": "Missing userId"})}

    try:
        response = table.get_item(Key={"userId": user_id})
        if "Item" in response:
            logger.info("User found: %s", json.dumps(response["Item"]))
            return {"statusCode": 200, "body": json.dumps(response["Item"])}
        else:
            logger.warning("User not found: %s", user_id)
            return {"statusCode": 404, "body": json.dumps({"error": "User not found"})}
    except Exception as e:
        logger.error("Exception: %s", str(e))
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
