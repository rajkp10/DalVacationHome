import json
import boto3
import re
from datetime import datetime

sns_client = boto3.client('sns')

def lambda_handler(event, context):
    for record in event['Records']:
        try:
            message = json.loads(record['body'])
            print(f"Processing message: {message}")
            message = json.loads(message['Message'])
            
            if 'booking_id' not in message or 'email' not in message:
                print("Missing booking_id or email in message")
                continue
            
            booking_id = message['booking_id']
            user_email = message['email']
            
            sanitized_email = sanitize_topic_name(user_email)
            
            topic_name = f'UserNotificationTopic_{sanitized_email}'
            topic_arn = get_topic_arn(topic_name)
            
            if not topic_arn:
                print(f"User notification topic not found for {user_email}")
                continue
            
            approval_status = approve_booking(booking_id)
            
            current_time = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')
            
            if approval_status == "approved":
                message_body = f"""
                Dear {user_email},
                
                Your booking with ID {booking_id} has been successfully Approved on {current_time}.
                """
                subject = 'Booking Approval'
            else:
                message_body = f"""
                
                Dear {user_email},
                
                Unfortunately, your booking with ID {booking_id} has failed on {current_time}.
                """
                subject = 'Booking Failure'
            
            message_payload = {
                'default': 'Notification!',
                'email': message_body
            }
            
            response = sns_client.publish(
                TopicArn=topic_arn,
                Message=json.dumps(message_payload),
                MessageStructure='json',
                Subject=subject
            )
            
            print(f"Notification sent to {user_email} with status {approval_status}")
        except Exception as e:
            print(f"Error processing record: {e}")
    
    return {
        'statusCode': 200,
        'body': json.dumps('Booking approval process completed')
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

def approve_booking(booking_id):
    return "approved"  # or "rejected"
