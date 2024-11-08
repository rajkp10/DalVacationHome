import json
import boto3
import re
from datetime import datetime

sns_client = boto3.client('sns')

def lambda_handler(event, context):
    user_data = json.loads(event['body'])
    user_email = user_data['email']
    
    sanitized_email = sanitize_topic_name(user_email)
    
    topic_name = f'UserNotificationTopic_{sanitized_email}'
    topic_arn = get_topic_arn(topic_name)
    
    if not topic_arn:
        return {
            'statusCode': 404,
            'body': json.dumps('User notification topic not found')
        }
    
    current_time = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')
    
    plain_text_message = f"Login Successful\n\nDear {user_email},\nYou have successfully logged into Dal Vacation Home on {current_time}."
    
    message_payload = {
        'default': 'Login successful!',
        'email': plain_text_message
    }
    
    response = sns_client.publish(
        TopicArn=topic_arn,
        Message=json.dumps(message_payload),
        MessageStructure='json',
        Subject='Login Successful'
    )
    
    return {
        'statusCode': 200,
        'body': json.dumps('Login successful!')
    }

def get_topic_arn(topic_name):
    response = sns_client.list_topics()
    topics = response['Topics']
    for topic in topics:
        if topic_name in topic['TopicArn']:
            return topic['TopicArn']
    return None

def sanitize_topic_name(email):
    return re.sub(r'[^a-zA-Z0-9_-]', '_', email)
