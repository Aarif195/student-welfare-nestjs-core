
export const otpEmailTemplate = (firstName: string, otpCode: string) => `
  <p style="font-size: 16px;">Hi ${firstName},</p>
  <div style="margin: 30px 0; padding: 15px; background-color: #f3f4f6; border-radius: 8px; display: inline-block;">
    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4f46e5;">${otpCode}</span>
  </div>
  <p style="font-size: 14px; color: #666;">This code expires in 10 minutes.</p>
`;

export const resendOtpEmailTemplate = (otpCode: string) => `
  <p style="font-size: 16px;">We received a request for a new verification code.</p>
  <div style="margin: 30px 0; padding: 15px; background-color: #f3f4f6; border-radius: 8px; display: inline-block;">
    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4f46e5;">${otpCode}</span>
  </div>
  <p style="font-size: 14px; color: #666;">This code expires in 5 minutes.</p>
`;

export const forgotPasswordEmailTemplate = (otpCode: string) => `
  <p style="font-size: 16px;">We received a request to reset your password. Use the code below to proceed:</p>
  <div style="margin: 30px 0; padding: 15px; background-color: #fef2f2; border-radius: 8px; display: inline-block;">
    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #ef4444;">${otpCode}</span>
  </div>
  <p style="font-size: 14px; color: #666;">This code expires in 5 minutes.</p>
`;