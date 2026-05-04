export const envConfig = () => ({
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '1d',
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
  mail: {
    apiKey: process.env.BREVO_API_KEY,
    senderEmail: process.env.MAIL_SENDER_EMAIL,
    senderName: process.env.MAIL_SENDER_NAME,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
  },
 paystack: {
  secretKey: process.env.PAYSTACK_SECRET_KEY,
  publicKey: process.env.PAYSTACK_PUBLIC_KEY,
},
});