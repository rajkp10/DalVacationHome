import json
import boto3
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("Users")


def lambda_handler(event, context):
    role = event.get("queryStringParameters", {}).get("role")

    if role:
        response = table.scan(
            FilterExpression=Attr("role").eq(role),
            ProjectionExpression="userId, #r",
            ExpressionAttributeNames={"#r": "role"},
        )
    else:
        response = table.scan(
            ProjectionExpression="userId, #r", ExpressionAttributeNames={"#r": "role"}
        )

    items = response.get("Items", [])

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
        },
        "body": json.dumps(items),
    }
