import json
import boto3
import re

sns_client = boto3.client('sns')

def lambda_handler(event, context):
    user_data = json.loads(event['body'])
    user_email = user_data['email']
    
    sanitized_email = sanitize_topic_name(user_email)
    
    topic_name = f'UserNotificationTopic_{sanitized_email}'
    topic_arn = get_or_create_topic(topic_name)
    
    subscription_arn = subscribe_email_to_topic(topic_arn, user_email)
    
    response = sns_client.publish(
        TopicArn=topic_arn,
        Message=json.dumps({'default': json.dumps(user_data)}),
        MessageStructure='json'
    )
    
    return {
        'statusCode': 200,
        'body': json.dumps('Registration successful!')
    }

def get_or_create_topic(topic_name):
    response = sns_client.list_topics()
    topics = response['Topics']
    for topic in topics:
        if topic_name in topic['TopicArn']:
            return topic['TopicArn']
    
    response = sns_client.create_topic(Name=topic_name)
    return response['TopicArn']

def subscribe_email_to_topic(topic_arn, email):
    response = sns_client.subscribe(
        TopicArn=topic_arn,
        Protocol='email',
        Endpoint=email,
        ReturnSubscriptionArn=True 
    )
    return response['SubscriptionArn']

def sanitize_topic_name(email):
    return re.sub(r'[^a-zA-Z0-9_-]', '_', email)
