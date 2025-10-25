import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import settings
import logging

logger = logging.getLogger(__name__)

async def send_email(to_email: str, subject: str, html_content: str):
    """
    Send an email using SMTP
    """
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        logger.warning("SMTP credentials not configured. Email not sent.")
        raise Exception("Configurazione email non completa. Verifica le variabili SMTP nel file .env")

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    message["To"] = to_email

    html_part = MIMEText(html_content, "html")
    message.attach(html_part)

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USERNAME,
            password=settings.SMTP_PASSWORD,
            start_tls=True,
        )
        logger.info(f"Email sent successfully to {to_email}")
    except Exception as e:
        logger.error(f"Error sending email to {to_email}: {str(e)}")
        raise Exception(f"Errore nell'invio dell'email: {str(e)}")


def generate_shopping_list_invitation_email(list_name: str, inviter_name: str, share_token: str, frontend_url: str = "http://localhost:3000") -> str:
    """
    Generate HTML content for shopping list invitation email
    """
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }}
            .content {{
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }}
            h1 {{
                color: #3498db;
                margin-bottom: 20px;
            }}
            .token-box {{
                background-color: #ecf0f1;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
                word-break: break-all;
                font-family: monospace;
                font-size: 14px;
            }}
            .button {{
                display: inline-block;
                padding: 12px 24px;
                background-color: #3498db;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
            }}
            .footer {{
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                font-size: 12px;
                color: #777;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="content">
                <h1>Invito a Lista della Spesa</h1>
                <p>Ciao!</p>
                <p><strong>{inviter_name}</strong> ti ha invitato a collaborare alla lista della spesa: <strong>{list_name}</strong></p>

                <h3>Come accedere:</h3>
                <ol>
                    <li>Accedi o registrati su <a href="{frontend_url}">{frontend_url}</a></li>
                    <li>Vai su "Lista Spesa"</li>
                    <li>Clicca su "Accedi con Token"</li>
                    <li>Inserisci il seguente token:</li>
                </ol>

                <div class="token-box">
                    {share_token}
                </div>

                <p>Potrai visualizzare e modificare gli articoli della lista in tempo reale insieme agli altri partecipanti!</p>

                <div class="footer">
                    <p>Questo messaggio è stato inviato da Gestionale App. Se non hai richiesto questo invito, puoi ignorare questa email.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    return html_content
