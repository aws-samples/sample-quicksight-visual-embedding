# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import os
import json
import boto3
import logging

# Configure logger
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def create_response(status_code, msg, data=None):
    if data is None:
        data = {}
        
    log_info(f"Status_code: {status_code} Response: {msg}")
    
    response_body = {
        "statusCode": status_code,
        "msg": msg,
        "data": data
    }
    
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
            'Content-Type': 'application/json',
            'X-Content-Type-Options': 'nosniff',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
            'Cache-Control': 'no-cache,no-store, max-age=0'
        },
        'body': json.dumps(response_body)
    }

def log_info(message):
    logger.info(message)

def get_or_create_quicksight_user(client, aws_account_id, email):
    try:
        # First, try to get the user to see if they exist
        response = client.describe_user(
            AwsAccountId=aws_account_id,
            Namespace='default',
            UserName=email
        )
        log_info(f"User {email} already exists in QuickSight")
        return {"success": True, "user_arn": response['User']['Arn']}
    except client.exceptions.ResourceNotFoundException:
        # User doesn't exist, register them
        log_info(f"User {email} not found, registering new user")
        try:
            response = client.register_user(
                IdentityType='IAM',
                Email=email,
                UserRole='READER',
                AwsAccountId=aws_account_id,
                Namespace='default',
                UserName=email
            )
            log_info(f"Successfully registered user {email}")
            return {"success": True, "user_arn": response['User']['Arn']}
        except Exception as e:
            log_info(f"Failed to register user: {str(e)}")
            return {"success": False, "error": str(e)}
    except Exception as e:
        log_info(f"Error checking user existence: {str(e)}")
        return {"success": False, "error": str(e)}

def generate_embed_url(client, visual_data, email):
    try:
        # Get account ID and admin user ARN from environment variables
        aws_account_id = os.environ.get('AWS_ACCOUNT_ID')
        
        if not aws_account_id:
            return {
                "success": False,
                "error": "Missing required environment variables: AWS_ACCOUNT_ID"
            }
        
        # Extract visual data
        dashboard_id = visual_data.get('dashboard_id')
        sheet_id = visual_data.get('sheet_id')
        visual_id = visual_data.get('visual_id')
        
        if not all([dashboard_id, sheet_id, visual_id]):
            return {
                "success": False,
                "error": "Missing required parameters: dashboard_id, sheet_id, or visual_id"
            }
        
        # Get or create the user
        user_result = get_or_create_quicksight_user(client, aws_account_id, email)

        if not user_result["success"]:
            return {
                "success": False,
                "error": f"Failed to get or create QuickSight user: {user_result.get('error')}"
            }
        
        user_arn = user_result["user_arn"]

        # Configure the experience for a single visual
        experience_config = {
            'DashboardVisual': {
                'InitialDashboardVisualId': {
                    'DashboardId': dashboard_id,
                    'SheetId': sheet_id,
                    'VisualId': visual_id
                }
            }
        }
        
        # Generate the embed URL
        response = client.generate_embed_url_for_registered_user(
            AwsAccountId=aws_account_id,
            SessionLifetimeInMinutes=600,
            UserArn=user_arn,
            ExperienceConfiguration=experience_config,
        )

        return {
            "embedUrl": response['EmbedUrl'],
            "dashboard_id": dashboard_id,
            "sheet_id": sheet_id,
            "visual_id": visual_id,
            "success": True
        }
        
    except Exception as e:
        error_str = str(e)            
        return {
            "success": False,
            "error": error_str,
            "dashboard_id": visual_data.get('dashboard_id'),
            "sheet_id": visual_data.get('sheet_id'),
            "visual_id": visual_data.get('visual_id')
        }

def handle_visual_embed_request(body, client):
    if not body:
        return create_response(400, "Bad Request", {"error": "Missing request body"})
    
    # Validate required fields
    if not all(key in body for key in ['dashboard_id', 'sheet_id', 'visual_id', 'email']):
        return create_response(400, "Bad Request", 
                              {"error": "Missing required parameters: dashboard_id, sheet_id, visual_id or email"})
    
    email = body.get('email')
    log_info(f"Generating embed URL for user: {email}, visual: {body.get('visual_id')} in dashboard: {body.get('dashboard_id')}")
    
    # Generate embed URL for the single visual
    result = generate_embed_url(client, body, email)
    
    if result.get('success'):
        log_info(f"Successfully generated embed URL for visual: {body.get('visual_id')}")
        return create_response(200, "Success", result)
    else:
        log_info(f"Failed to generate embed URL: {result.get('error')}")
        return create_response(400, "Failed to generate embed URL", result)

# Add the Lambda handler function
def lambda_handler(event, context):
    """
    Lambda function handler to generate QuickSight embed URL for a single visual
    """
    try:
        # Initialize QuickSight client
        quicksight_client = boto3.client('quicksight')
        
        # Parse request body
        if 'body' in event:
            try:
                body = json.loads(event['body'])
            except:
                return create_response(400, "Bad Request", {"error": "Invalid JSON in request body"})
        else:
            body = event
        
        # Process the request
        return handle_visual_embed_request(body, quicksight_client)
        
    except Exception as e:
        log_info(f"Error in lambda_handler: {str(e)}")
        return create_response(500, "Internal Server Error", {"error": str(e)})
