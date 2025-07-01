
export const whatsappService = {
  // Test webhook connection
  testWebhook: async () => {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/whatsapp-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: 'whatsapp:+5511999999999',
          Body: 'Test message',
          NumMedia: '0'
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error testing webhook:', error);
      return false;
    }
  },

  // Get webhook URL for Twilio configuration
  getWebhookUrl: () => {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    return `${SUPABASE_URL}/functions/v1/whatsapp-webhook`;
  }
};
