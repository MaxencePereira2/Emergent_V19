"""
EmailJS Integration Service
Handles email sending for contact forms with dual functionality:
- Notification email to site owner (contact@alesium.fr)  
- Auto-confirmation email to client who submitted the form

Requires EmailJS account setup with:
- Gmail/Outlook connected as email service
- Two email templates configured
- API keys configured in environment variables
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
        self.template_id = os.getenv('EMAILJS_TEMPLATE_ID') 
        self.user_id = os.getenv('EMAILJS_USER_ID')
        self.access_token = os.getenv('EMAILJS_ACCESS_TOKEN')
        
        # EmailJS API endpoint
        self.api_url = "https://api.emailjs.com/api/v1.0/email/send"
        
        # Validate required configuration
        if not all([self.service_id, self.template_id, self.user_id]):
            logger.warning("EmailJS configuration incomplete. Email sending will be disabled.")
    
    def is_configured(self) -> bool:
        """Check if EmailJS is properly configured"""
        return all([self.service_id, self.template_id, self.user_id])
    
    async def send_contact_email(
        self,
        name: str,
        email: str,
        subject: str,
        message: str,
        phone: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send contact form email using EmailJS
        
        This will:
        1. Send notification email to contact@alesium.fr
        2. Send auto-confirmation email to the client (if auto-reply is configured)
        
        Args:
            name: Client's name
            email: Client's email address
            subject: Contact subject/reason
            message: Client's message
            phone: Client's phone (optional)
            
        Returns:
            Dict containing success status and details
        """
        
        if not self.is_configured():
            raise EmailJSError("EmailJS service is not properly configured")
        
        # Prepare template parameters
        template_params = {
            # For notification email to site owner
            'to_email': 'contact@alesium.fr',
            'to_name': 'Alesium',
            
            # Client information
            'from_name': name,
            'from_email': email,
            'client_email': email,  # For auto-reply
            'client_name': name,    # For auto-reply personalization
            
            # Message details
            'subject': subject,
            'message': message,
            'phone': phone or 'Non renseigné',
            
            # Additional context
            'timestamp': datetime.now().strftime('%d/%m/%Y à %H:%M'),
            'site_name': 'Alesium.fr'
        }
        
        # Prepare EmailJS request payload
        payload = {
            'service_id': self.service_id,
            'template_id': self.template_id,
            'user_id': self.user_id,
            'template_params': template_params
        }
        
        # Add access token if available (for enhanced security)
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
                    logger.info(f"✅ Email sent successfully for {name} ({email})")
                    return {
                        'success': True,
                        'message': 'Email envoyé avec succès',
                        'email_id': response.text,
                        'timestamp': datetime.now().isoformat()
                    }
                else:
                    error_msg = f"EmailJS API error: {response.status_code} - {response.text}"
                    logger.error(error_msg)
                    raise EmailJSError(error_msg)
                    
        except httpx.TimeoutException:
            error_msg = "Timeout lors de l'envoi d'email"
            logger.error(error_msg)
            raise EmailJSError(error_msg)
        except httpx.RequestError as e:
            error_msg = f"Erreur réseau lors de l'envoi d'email: {str(e)}"
            logger.error(error_msg)
            raise EmailJSError(error_msg)
        except Exception as e:
            error_msg = f"Erreur inattendue lors de l'envoi d'email: {str(e)}"
            logger.error(error_msg)
            raise EmailJSError(error_msg)

# Global EmailJS service instance
emailjs_service = EmailJSService()