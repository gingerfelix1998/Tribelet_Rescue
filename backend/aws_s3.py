import boto3
import os
from datetime import datetime
import json
import csv
import io
import hashlib
import requests
import base64

# Use the S3 client:
s3 = boto3.client(
    "s3"
)

AWS_BUCKET = "tribelet-resources"

# --- Users ---

# Password encoding:
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# Save the user:
def save_user_to_s3(user_data):
    row = [
        datetime.utcnow().isoformat(),
        user_data.get("username", ""),
        user_data.get("email", ""),
        hash_password(user_data.get("password", ""))
    ]

    try:
        response = s3.get_object(Bucket=AWS_BUCKET, Key="users/user_log.csv")
        existing_csv = response['Body'].read().decode('utf-8')
    except s3.exceptions.NoSuchKey:
        existing_csv = ""
    
    output = io.StringIO()
    writer = csv.writer(output)

    if not existing_csv:
        writer.writerow(["timestamp",
                         "username",
                         "email",
                         "password_hash"])
    else:
        output.write(existing_csv.strip() + "\n")
    
    writer.writerow(row)

    s3.put_object(
        Bucket=AWS_BUCKET,
        Key="users/user_log.csv",
        Body=output.getvalue(),
        ContentType="text/csv"
    )

# validate our user login:
def validate_user_login(email: str, password: str) -> str | None:
    try:
        response = s3.get_object(Bucket=AWS_BUCKET,
                                 Key="users/user_log.csv")
        csv_text = response['Body'].read().decode('utf-8')
        reader = csv.DictReader(io.StringIO(csv_text))
        hashed = hash_password(password)

        for row in reader:
            if row['email'] == email and row['password_hash'] == hashed:
                return row["username"]
    except s3.exceptions.NoSuchKey:
        pass
    
    return None

# Get user by credentials (used in team creation process):
def get_user_by_credentials(email: str, password: str) -> dict | None:
    try:
        response = s3.get_object(Bucket=AWS_BUCKET, Key="users/user_log.csv")
        csv_text = response['Body'].read().decode('utf-8')
        reader = csv.DictReader(io.StringIO(csv_text))
        hashed = hash_password(password)

        for row in reader:
            if row['email'] == email and row['password_hash'] == hashed:
                return row
    except s3.exceptions.NoSuchKey:
        pass

    return None


# --- Teams ---

# Save our promts to S3:
def save_prompt_to_s3(prompt: str):
    try:
        response = s3.get_object(Bucket=AWS_BUCKET, Key="prompt_log.json")
        body = response['Body'].read().decode('utf-8')
        logs = json.loads(body)
    except s3.exceptions.NoSuchKey:
        logs = []

    logs.append({
        "timestamp": datetime.utcnow().isoformat(),
        "prompt": prompt
    })

    s3.put_object(
        Bucket=AWS_BUCKET,
        Key="prompt_log.json",
        Body=json.dumps(logs, indent=2),
        ContentType="application/json"
    )

# Check team names:
def check_team_name_in_s3(name):
    try:
        response = s3.get_object(Bucket=AWS_BUCKET, Key="teams/team_log.csv")
        csv_text = response["Body"].read().decode("utf-8")
        reader = csv.DictReader(io.StringIO(csv_text))
        for row in reader:
            if row.get("team_name", "").strip().lower() == name.strip().lower():
                return True
        return False
    except s3.exceptions.NoSuchKey:
        return False
    except botocore.exceptions.ClientError as error:
        # Log this error and return a safe JSON response for browser:
        print(f"S3 ClientError: {error}")
        return False
    except Exception as e:
        # Log unexpected errors:
        print("Unexpected error: {e}")
        return False

# Save the team to S3:
def save_team_to_s3(team_data):
    row = [
        datetime.utcnow().isoformat(),
        team_data.get("team_name", ""),
        team_data.get("summary", ""),
        team_data.get("logo_url", ""),
        team_data.get("email", ""),
        team_data.get("team_id", ""),
        team_data.get("team_lead", "")
    ]

    try:
        response = s3.get_object(Bucket=AWS_BUCKET, Key="teams/team_log.csv")
        existing_csv = response["Body"].read().decode("utf-8")
    except s3.exceptions.NoSuchKey:
        existing_csv = ""

    output = io.StringIO()
    writer = csv.writer(output)

    if not existing_csv:
        writer.writerow(["timestamp", "team_name", "summary", "logo_url", "email", "team_id", "team_lead"])
    else:
        output.write(existing_csv.strip() + "\n")

    writer.writerow(row)

    s3.put_object(
        Bucket=AWS_BUCKET,
        Key="teams/team_log.csv",
        Body=output.getvalue(),
        ContentType="text/csv"
    )

# Save the team logo locally in AWS blob:
def upload_logo_from_url(external_url: str, team_id: str) -> str:
    response = requests.get(external_url)
    if response.status_code != 200:
        raise Exception("Failed to download logo image from OpenAI URL")

    key = f"logos/{team_id}.png"
    s3.put_object(
        Bucket=AWS_BUCKET,
        Key=key,
        Body=response.content,
        ContentType="image/png"
    )
    return f"https://{AWS_BUCKET}.s3.amazonaws.com/{key}"


# Retrieve existing teams from aws:
def get_teams_by_email(email: str) -> list[dict]:
    try:
        response = s3.get_object(Bucket=AWS_BUCKET, Key="teams/team_log.csv")
        csv_text = response["Body"].read().decode("utf-8")
        reader = csv.DictReader(io.StringIO(csv_text))
        return [row for row in reader if row.get("email") == email]
    except s3.exceptions.NoSuchKey:
        return []
    

# Logo upload from base64:
def upload_logo_from_base64(base64_data: str, team_id: str) -> str:
    """
    Upload a base64-encoded logo directly to S3.
    
    Args:
        base64_data (str): Base64 encoded image data
        team_id (str): Unique team ID for the filename
    
    Returns:
        str: Public S3 URL of the uploaded logo
    """
    try:
        # Decode base64 data
        image_data = base64.b64decode(base64_data)
        
        # Generate S3 key
        key = f"logos/{team_id}.png"
        
        # Upload to S3
        s3.put_object(
            Bucket=AWS_BUCKET,
            Key=key,
            Body=image_data,
            ContentType="image/png"
        )
        
        # Return public URL
        return f"https://{AWS_BUCKET}.s3.amazonaws.com/{key}"
        
    except Exception as e:
        print(f"Base64 logo upload failed: {e}")
        raise Exception(f"Failed to upload logo: {str(e)}")