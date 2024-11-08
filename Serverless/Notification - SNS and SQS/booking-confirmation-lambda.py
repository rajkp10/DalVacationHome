import json
import boto3
import re
from datetime import datetime

sns_client = boto3.client('sns')

def lambda_handler(event, context):
    event_data = json.loads(event['body'])
    event_type = event_data['event_type']
    user_email = event_data['email']
    
    sanitized_email = sanitize_topic_name(user_email)
    
    topic_name = f'UserNotificationTopic_{sanitized_email}'
    topic_arn = get_topic_arn(topic_name)
    
    if not topic_arn:
        return {
            'statusCode': 404,
            'body': json.dumps('User notification topic not found')
        }
    
    current_time = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')
    
    if event_type == 'booking_confirmation':
        booking_id = event_data['booking_id']
        booking_details = event_data['booking_details']
        plain_text_message = f"""
        Booking Confirmation
        
        Dear {user_email},
        
        Your booking with ID {booking_id} has been successfully confirmed on {current_time}.
        
        Booking Details:
        {booking_details}
        """
        subject = 'Booking Confirmation'
    elif event_type == 'booking_failure':
        booking_id = event_data['booking_id']
        plain_text_message = f"""
        Booking Failure
        
        Dear {user_email},
        
        Unfortunately, your booking with ID {booking_id} has failed on {current_time}.
        
        """
        subject = 'Booking Failure'
    else:
        return {
            'statusCode': 400,
            'body': json.dumps('Invalid event type')
        }
    
    message_payload = {
        'default': 'Notification!',
        'email': plain_text_message
    }
    
    response = sns_client.publish(
        TopicArn=topic_arn,
        Message=json.dumps(message_payload),
        MessageStructure='json',
        Subject=subject
    )
    
    return {
        'statusCode': 200,
        'body': json.dumps('Notification sent!')
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
