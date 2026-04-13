import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const WHATSAPP_API_URL = 'https://graph.facebook.com/v19.0';

export async function sendWhatsApp(
  to: string,
  subscriptionName: string,
  renewalDate: string,
  amount: string
): Promise<void> {
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME || 'subscription_reminder';

  if (!phoneId || !accessToken) {
    console.warn('WhatsApp not configured. Skipping WhatsApp send.');
    return;
  }

  // Clean phone number (remove spaces, dashes, plus sign for API)
  const cleanNumber = to.replace(/[\s\-\+]/g, '');

  try {
    await axios.post(
      `${WHATSAPP_API_URL}/${phoneId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: cleanNumber,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: subscriptionName },
                { type: 'text', text: renewalDate },
                { type: 'text', text: amount },
              ],
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('WhatsApp API error:', error.response?.data || error.message);
    throw new Error(`Failed to send WhatsApp message: ${error.message}`);
  }
}
