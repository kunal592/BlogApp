// Email templates for backend integration
// These can be used with the EmailService in the NestJS backend

export const emailTemplates = {
    welcome: (userName: string) => ({
        subject: "Welcome to Premium Blog Platform",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0B0B0C; color: #F5F5F7; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .logo { font-size: 24px; font-weight: 700; margin-bottom: 32px; }
    .accent { color: #5E9EFF; }
    h1 { font-size: 28px; margin-bottom: 16px; }
    p { color: #A1A1A6; line-height: 1.6; margin-bottom: 24px; }
    .button { display: inline-block; background: #5E9EFF; color: #000; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: 600; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px; color: rgba(255,255,255,0.3); }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">Blog<span class="accent">.</span></div>
    <h1>Welcome, ${userName}!</h1>
    <p>Thank you for joining our community of thoughtful writers and readers. We're excited to have you here.</p>
    <p>Start exploring curated content from the best minds, or share your own ideas with the world.</p>
    <a href="https://blog.example.com/explore" class="button">Start Exploring</a>
    <div class="footer">
      <p>Questions? Reply to this email or visit our help center.</p>
      <p>Premium Blog Platform • Ideas that matter</p>
    </div>
  </div>
</body>
</html>
    `,
    }),

    paymentConfirmation: (userName: string, blogTitle: string, amount: number) => ({
        subject: `Payment Confirmed - ${blogTitle}`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0B0B0C; color: #F5F5F7; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .logo { font-size: 24px; font-weight: 700; margin-bottom: 32px; }
    .accent { color: #5E9EFF; }
    h1 { font-size: 28px; margin-bottom: 16px; }
    p { color: #A1A1A6; line-height: 1.6; margin-bottom: 24px; }
    .receipt { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; margin: 24px 0; }
    .receipt-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
    .receipt-total { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px; font-weight: 600; }
    .button { display: inline-block; background: #5E9EFF; color: #000; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: 600; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px; color: rgba(255,255,255,0.3); }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">Blog<span class="accent">.</span></div>
    <h1>Payment Confirmed ✓</h1>
    <p>Hi ${userName}, your purchase was successful. You now have full access to the article.</p>
    
    <div class="receipt">
      <div class="receipt-row">
        <span style="color: #A1A1A6;">Article</span>
        <span>${blogTitle}</span>
      </div>
      <div class="receipt-row receipt-total">
        <span>Total</span>
        <span>₹${amount}</span>
      </div>
    </div>
    
    <a href="https://blog.example.com/blog/${blogTitle.toLowerCase().replace(/\s+/g, '-')}" class="button">Read Now</a>
    
    <div class="footer">
      <p>This is a receipt for your purchase. No action is required.</p>
      <p>Premium Blog Platform • Ideas that matter</p>
    </div>
  </div>
</body>
</html>
    `,
    }),

    earningsNotification: (authorName: string, amount: number, blogTitle: string) => ({
        subject: `You earned ₹${amount}!`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0B0B0C; color: #F5F5F7; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .logo { font-size: 24px; font-weight: 700; margin-bottom: 32px; }
    .accent { color: #5E9EFF; }
    .amount { font-size: 48px; font-weight: 700; color: #5E9EFF; margin: 24px 0; }
    h1 { font-size: 28px; margin-bottom: 16px; }
    p { color: #A1A1A6; line-height: 1.6; margin-bottom: 24px; }
    .button { display: inline-block; background: #5E9EFF; color: #000; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: 600; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px; color: rgba(255,255,255,0.3); }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">Blog<span class="accent">.</span></div>
    <h1>You earned money! 💰</h1>
    <div class="amount">₹${amount}</div>
    <p>Congratulations ${authorName}! Someone just purchased your article "${blogTitle}".</p>
    <p>This amount has been added to your wallet balance.</p>
    <a href="https://blog.example.com/dashboard/earnings" class="button">View Earnings</a>
    <div class="footer">
      <p>Keep creating great content!</p>
      <p>Premium Blog Platform • Ideas that matter</p>
    </div>
  </div>
</body>
</html>
    `,
    }),
};
