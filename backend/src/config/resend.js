const { Resend } = require('resend');

// Lazy singleton — only instantiated when first used, so a missing key
// won't crash the server on startup (it will only fail when sending email)
let _client = null;

const getResendClient = () => {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_your_resend_api_key_here') {
    throw new Error(
      'RESEND_API_KEY is not configured. Add your key to .env: RESEND_API_KEY=re_xxxx'
    );
  }
  if (!_client) {
    _client = new Resend(process.env.RESEND_API_KEY);
  }
  return _client;
};

module.exports = getResendClient;
