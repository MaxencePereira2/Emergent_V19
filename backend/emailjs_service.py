"""
EmailJS Integration Service
Handles email sending for contact forms with dual functionality:
- Notification email to site owner (contact@alesium.fr) using template_4ur9prj  
- Auto-reply confirmation email to client using template_tnqh3o9

Configured with Outlook service: service_jc6o6xn
"""

import httpx
import os
import logging
from typing import Dict, Any, Optional
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmailJSError(Exception):
    """Custom exception for EmailJS related errors"""
    pass

class EmailJSService:
    def __init__(self):
        # EmailJS configuration from environment variables
        self.service_id = os.getenv('EMAILJS_SERVICE_ID')
        self.template_id = os.getenv('EMAILJS_TEMPLATE_ID')  # Notification template
        self.auto_reply_template_id = os.getenv('EMAILJS_AUTO_REPLY_TEMPLATE_ID')  # Auto-reply template
        self.user_id = os.getenv('EMAILJS_USER_ID')
        self.access_token = os.getenv('EMAILJS_ACCESS_TOKEN')
        
        # EmailJS API endpoint
        self.api_url = "https://api.emailjs.com/api/v1.0/email/send"
        
        # Validate required configuration
        if not all([self.service_id, self.template_id, self.user_id]):
            logger.warning("EmailJS configuration incomplete. Email sending will be disabled.")
        else:
            logger.info(f"✅ EmailJS configured with service: {self.service_id}")
    
    def is_configured(self) -> bool:
        """Check if EmailJS is properly configured"""
        return all([self.service_id, self.template_id, self.user_id])
    
    async def send_notification_email(
        self,
        name: str,
        email: str,
        subject: str,
        message: str,
        phone: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send notification email to site owner (contact@alesium.fr)
        """
        
        # Prepare template parameters for notification
        template_params = {
            'to_email': 'contact@alesium.fr',
            'to_name': 'Alesium',
            'from_name': name,
            'from_email': email,
            'subject': subject,
            'message': message,
            'phone': phone or 'Non renseigné',
            'timestamp': datetime.now().strftime('%d/%m/%Y à %H:%M'),
            'site_name': 'Alesium.fr'
        }
        
        return await self._send_email(self.template_id, template_params, f"notification to Alesium for {name}")
    
    async def send_auto_reply_email(
        self,
        name: str,
        email: str,
        subject: str,
        message: str,
        phone: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send auto-reply confirmation email to client
        """
        
        # Prepare template parameters for auto-reply
        template_params = {
            'client_name': name,
            'client_email': email,
            'subject': subject,
            'message': message,
            'phone': phone or 'Non renseigné',
            'timestamp': datetime.now().strftime('%d/%m/%Y à %H:%M'),
        }
        
        return await self._send_email(self.auto_reply_template_id, template_params, f"auto-reply to {name}")
    
    async def _send_email(self, template_id: str, template_params: Dict, description: str) -> Dict[str, Any]:
        """
        Internal method to send email via EmailJS API
        """
        
        # Prepare EmailJS request payload
        payload = {
            'service_id': self.service_id,
            'template_id': template_id,
            'user_id': self.user_id,
            'template_params': template_params
        }
        
        # Add access token for enhanced security
        if self.access_token:
            payload['accessToken'] = self.access_token
        
        try:
            # Send email via EmailJS API
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.api_url,
                    json=payload,
                    headers={
                        'Content-Type': 'application/json',
                        'User-Agent': 'Alesium-Contact-Form/1.0'
                    }
                )
                
                # Check response status
                if response.status_code == 200:
                    logger.info(f"✅ Email sent successfully: {description}")
                    return {
                        'success': True,
                        'message': 'Email envoyé avec succès',
                        'email_id': response.text,
                        'timestamp': datetime.now().isoformat(),
                        'description': description
                    }
                else:
                    error_msg = f"EmailJS API error for {description}: {response.status_code} - {response.text}"
                    logger.error(error_msg)
                    raise EmailJSError(error_msg)
                    
        except httpx.TimeoutException:
            error_msg = f"Timeout lors de l'envoi d'email: {description}"
            logger.error(error_msg)
            raise EmailJSError(error_msg)
        except httpx.RequestError as e:
            error_msg = f"Erreur réseau lors de l'envoi d'email ({description}): {str(e)}"
            logger.error(error_msg)
            raise EmailJSError(error_msg)
        except Exception as e:
            error_msg = f"Erreur inattendue lors de l'envoi d'email ({description}): {str(e)}"
            logger.error(error_msg)
            raise EmailJSError(error_msg)
    
    async def send_contact_emails(
        self,
        name: str,
        email: str,
        subject: str,
        message: str,
        phone: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send both notification and auto-reply emails
        """
        results = {
            'notification_sent': False,
            'auto_reply_sent': False,
            'errors': []
        }
        
        # Send notification email to Alesium
        try:
            notification_result = await self.send_notification_email(name, email, subject, message, phone)
            results['notification_sent'] = True
            results['notification_result'] = notification_result
        except EmailJSError as e:
            results['errors'].append(f"Notification email failed: {str(e)}")
            logger.error(f"❌ Notification email failed: {str(e)}")
        
        # Send auto-reply email to client (only if we have the auto-reply template)
        if self.auto_reply_template_id:
            try:
                auto_reply_result = await self.send_auto_reply_email(name, email, subject, message, phone)
                results['auto_reply_sent'] = True
                results['auto_reply_result'] = auto_reply_result
            except EmailJSError as e:
                results['errors'].append(f"Auto-reply email failed: {str(e)}")
                logger.error(f"❌ Auto-reply email failed: {str(e)}")
        
        # Overall success if at least notification was sent
        results['overall_success'] = results['notification_sent']
        
        return results

# Global EmailJS service instance
emailjs_service = EmailJSService()