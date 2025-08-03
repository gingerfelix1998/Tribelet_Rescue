import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from datetime import datetime
import boto3
from aws_s3 import s3, AWS_BUCKET
import csv
import io

def send_order_confirmation_email(order_data: dict):
    """Send order confirmation email to customer and business"""
    # Email configuration
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    sender_email = os.getenv("SENDER_EMAIL")
    sender_password = os.getenv("SENDER_PASSWORD")
    
    if not sender_email or not sender_password:
        raise Exception("Email configuration missing")
    
    # Create message
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Tribelet Order Confirmation - {order_data['order_id']}"
    msg["From"] = sender_email
    msg["To"] = order_data['customer_email']
    
    # Create email body
    quantities_text = "\n".join([f"{size}: {qty}" for size, qty in order_data['quantities'].items() if qty > 0])
    
    text = f"""
    Tribelet Order Confirmation
    
    Order ID: {order_data['order_id']}
    
    Hi {order_data['customer_name']},
    
    Thank you for your custom kit order! Here are your order details:
    
    DESIGN DETAILS:
    - Kit Type: {order_data['kit_type']}
    - Team: {order_data['team_name']}
    - Design Name: {order_data['design_name']}
    - Teamwear Color: {order_data['teamwear_color']}
    - Emblem Color: {order_data['emblem_color']}
    
    CUSTOMIZATION:
    - Front Image: {"Yes" if order_data['front_image'] else "No"}
    - Back Image: {"Yes" if order_data['back_image'] else "No"}
    - Back Print: {order_data['back_print_text'] if order_data['back_print_enabled'] else "None"}
    - Back Print Position: {order_data['back_print_position']}%
    
    QUANTITIES:
    {quantities_text}
    
    ORDER TOTAL:
    Subtotal: £{order_data['subtotal']:.2f}
    Tax: £{order_data['tax']:.2f}
    Total: £{order_data['total']:.2f}
    
    We'll process your order and send you updates soon!
    
    Best regards,
    The Tribelet Team
    """
    
    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #A461F9; margin: 0;">Tribelet</h1>
            <p style="color: #666; margin: 5px 0;">Order Confirmation</p>
          </div>
          
          <div style="background-color: #f0e6ff; padding: 15px; border-radius: 5px; text-align: center; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 14px; color: #666;">Order ID</p>
            <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: #333;">{order_data['order_id']}</p>
          </div>
          
          <p>Hi {order_data['customer_name']},</p>
          <p>Thank you for your custom kit order! Here are your order details:</p>
          
          <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Design Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Kit Type:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">{order_data['kit_type']}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Team:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">{order_data['team_name']}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Design Name:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">{order_data['design_name']}</td></tr>
              <tr><td style="padding: 8px 0;"><strong>Teamwear Color:</strong></td><td style="padding: 8px 0;"><span style="display: inline-block; width: 20px; height: 20px; background-color: {order_data['teamwear_color']}; border: 1px solid #ddd; vertical-align: middle; margin-right: 8px;"></span>{order_data['teamwear_color']}</td></tr>
            </table>
          </div>
          
          <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Customization</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="padding: 5px 0;"><span style="color: #A461F9;">✓</span> Front Image: <strong>{"Yes" if order_data['front_image'] else "No"}</strong></li>
              <li style="padding: 5px 0;"><span style="color: #A461F9;">✓</span> Back Image: <strong>{"Yes" if order_data['back_image'] else "No"}</strong></li>
              <li style="padding: 5px 0;"><span style="color: #A461F9;">✓</span> Back Print: <strong>{f'"{order_data["back_print_text"]}" at {order_data["back_print_position"]}%' if order_data['back_print_enabled'] else "None"}</strong></li>
            </ul>
          </div>
          
          <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              {"".join([f'<tr><td style="padding: 5px 0;">{size}:</td><td style="text-align: right;">{qty}</td></tr>' for size, qty in order_data['quantities'].items() if qty > 0])}
              <tr style="border-top: 2px solid #ddd;"><td style="padding: 10px 0 5px 0;"><strong>Subtotal:</strong></td><td style="text-align: right;">£{order_data['subtotal']:.2f}</td></tr>
              <tr><td style="padding: 5px 0;"><strong>Tax:</strong></td><td style="text-align: right;">£{order_data['tax']:.2f}</td></tr>
              <tr style="border-top: 2px solid #333;"><td style="padding: 10px 0 5px 0;"><strong style="color: #A461F9; font-size: 18px;">Total:</strong></td><td style="text-align: right;"><strong style="color: #A461F9; font-size: 18px;">£{order_data['total']:.2f}</strong></td></tr>
            </table>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f0e6ff; border-radius: 5px;">
            <p style="margin: 0; color: #666;">We'll process your order and send you updates soon!</p>
          </div>
          
          <p style="text-align: center; color: #999; margin-top: 30px; font-size: 12px;">
            If you have any questions, please contact us at hello@tribelet.com
          </p>
        </div>
      </body>
    </html>
    """
    
    # Attach parts
    part1 = MIMEText(text, "plain")
    part2 = MIMEText(html, "html")
    msg.attach(part1)
    msg.attach(part2)
    
    # Send email
    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)
            
        # Create a new message for the business copy
        business_msg = MIMEMultipart("alternative")
        business_msg["Subject"] = f"New Order - {order_data['order_id']} from {order_data['customer_name']}"
        business_msg["From"] = sender_email
        business_msg["To"] = sender_email
        
        # Attach the same content
        business_msg.attach(part1)
        business_msg.attach(part2)
        
        # Send the business copy
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(business_msg)
        
        # Create order processing notification for Cam
        processing_msg = MIMEMultipart("alternative")
        processing_msg["Subject"] = f"🚨 New Order to Process - {order_data['order_id']}"
        processing_msg["From"] = sender_email
        processing_msg["To"] = "cam@tribeletco.com"
        
        # Create processing-specific content
        processing_text = f"""
        NEW ORDER ALERT - REQUIRES PROCESSING
        
        Order ID: {order_data['order_id']}
        Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}
        
        CUSTOMER DETAILS:
        - Name: {order_data['customer_name']}
        - Email: {order_data['customer_email']}
        
        ORDER DETAILS:
        - Product: {order_data['kit_type']}
        - Team: {order_data['team_name']}
        - Color: {order_data['teamwear_color']}
        
        CUSTOMIZATION:
        - Front Image: {"YES" if order_data['front_image'] else "NO"}
        - Back Image: {"YES" if order_data['back_image'] else "NO"}
        - Back Print: {order_data['back_print_text'] if order_data['back_print_enabled'] else "NONE"}
        - Print Position: {order_data['back_print_position']}%
        
        QUANTITIES:
        {quantities_text}
        
        FINANCIALS:
        - Subtotal: £{order_data['subtotal']:.2f}
        - Tax: £{order_data['tax']:.2f}
        - TOTAL: £{order_data['total']:.2f}
        
        Please process this order and update the customer.
        """
        
        processing_html = f"""
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="background-color: #ff4444; color: white; padding: 20px; border-radius: 5px; text-align: center; margin-bottom: 20px;">
                <h1 style="margin: 0;">🚨 NEW ORDER TO PROCESS</h1>
                <p style="margin: 5px 0 0 0;">Immediate attention required</p>
              </div>
              
              <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #333;">Order Information</h3>
                <p style="margin: 0;"><strong>Order ID:</strong> {order_data['order_id']}</p>
                <p style="margin: 0;"><strong>Date:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M')}</p>
              </div>
              
              <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #333;">Customer Details</h3>
                <p style="margin: 0;"><strong>Name:</strong> {order_data['customer_name']}</p>
                <p style="margin: 0;"><strong>Email:</strong> <a href="mailto:{order_data['customer_email']}">{order_data['customer_email']}</a></p>
              </div>
              
              <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #333;">Product Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 5px 0;"><strong>Product:</strong></td><td>{order_data['kit_type']}</td></tr>
                  <tr><td style="padding: 5px 0;"><strong>Team:</strong></td><td>{order_data['team_name']}</td></tr>
                  <tr><td style="padding: 5px 0;"><strong>Color:</strong></td><td><span style="display: inline-block; width: 20px; height: 20px; background-color: {order_data['teamwear_color']}; border: 1px solid #ddd; vertical-align: middle; margin-right: 8px;"></span>{order_data['teamwear_color']}</td></tr>
                  <tr><td style="padding: 5px 0;"><strong>Front Image:</strong></td><td>{"✅ YES" if order_data['front_image'] else "❌ NO"}</td></tr>
                  <tr><td style="padding: 5px 0;"><strong>Back Image:</strong></td><td>{"✅ YES" if order_data['back_image'] else "❌ NO"}</td></tr>
                  <tr><td style="padding: 5px 0;"><strong>Back Print:</strong></td><td>{f"{order_data['back_print_text']} (Position: {order_data['back_print_position']}%)" if order_data['back_print_enabled'] else "None"}</td></tr>
                </table>
              </div>
              
              <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #333;">Order Quantities</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  {"".join([f'<tr><td style="padding: 5px 0; font-weight: bold;">{size}:</td><td style="text-align: right;">{qty} units</td></tr>' for size, qty in order_data['quantities'].items() if qty > 0])}
                  <tr style="border-top: 2px solid #ddd;"><td style="padding: 10px 0 0 0; font-weight: bold;">TOTAL ITEMS:</td><td style="padding: 10px 0 0 0; text-align: right; font-weight: bold;">{sum(qty for qty in order_data['quantities'].values() if qty > 0)} units</td></tr>
                </table>
              </div>
              
              <div style="background-color: #ffe6e6; padding: 15px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #ffcccc;">
                <h3 style="margin: 0 0 10px 0; color: #333;">Payment Summary</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 5px 0;">Subtotal:</td><td style="text-align: right;">£{order_data['subtotal']:.2f}</td></tr>
                  <tr><td style="padding: 5px 0;">Tax:</td><td style="text-align: right;">£{order_data['tax']:.2f}</td></tr>
                  <tr style="border-top: 2px solid #333;"><td style="padding: 10px 0 0 0;"><strong style="font-size: 18px;">TOTAL:</strong></td><td style="padding: 10px 0 0 0; text-align: right;"><strong style="font-size: 18px; color: #ff4444;">£{order_data['total']:.2f}</strong></td></tr>
                </table>
              </div>
              
              <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border: 1px solid #ffeaa7; text-align: center;">
                <p style="margin: 0; font-weight: bold;">⚠️ ACTION REQUIRED</p>
                <p style="margin: 5px 0 0 0;">Please process this order and update the customer with shipping information.</p>
              </div>
            </div>
          </body>
        </html>
        """
        
        processing_part1 = MIMEText(processing_text, "plain")
        processing_part2 = MIMEText(processing_html, "html")
        processing_msg.attach(processing_part1)
        processing_msg.attach(processing_part2)
        
        # Send to Cam
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(processing_msg)
            
        return True
            
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        return False


def save_order_to_s3(order_data: dict):
    """Save order details to S3 for record keeping"""
    try:
        # Create CSV row
        row = [
            datetime.utcnow().isoformat(),
            order_data['order_id'],
            order_data['customer_email'],
            order_data['customer_name'],
            order_data['team_name'],
            order_data['kit_type'],
            order_data['teamwear_color'],
            order_data['design_name'],
            order_data.get('back_print_text', ''),
            str(order_data.get('back_print_position', 50)),
            str(order_data['front_image']),
            str(order_data['back_image']),
            str(order_data['quantities']),
            str(order_data['total'])
        ]
        
        # Try to get existing CSV
        try:
            response = s3.get_object(Bucket=AWS_BUCKET, Key="orders/order_log.csv")
            existing_csv = response['Body'].read().decode('utf-8')
        except s3.exceptions.NoSuchKey:
            existing_csv = ""
        
        # Create new CSV with appended row
        output = io.StringIO()
        writer = csv.writer(output)
        
        if not existing_csv:
            # Write header if new file
            writer.writerow([
                "timestamp", "order_id", "customer_email", "customer_name",
                "team_name", "kit_type", "teamwear_color", "design_name",
                "back_print_text", "back_print_position", "front_image", 
                "back_image", "quantities", "total"
            ])
        else:
            output.write(existing_csv.strip() + "\n")
        
        writer.writerow(row)
        
        # Save to S3
        s3.put_object(
            Bucket=AWS_BUCKET,
            Key="orders/order_log.csv",
            Body=output.getvalue(),
            ContentType="text/csv"
        )
        
        return True
        
    except Exception as e:
        print(f"Failed to save order to S3: {str(e)}")
        return False
