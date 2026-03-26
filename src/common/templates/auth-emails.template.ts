
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

export const googleWelcomeEmailTemplate = (firstName: string) => `
  <p style="font-size: 16px;">Hi ${firstName},</p>
  <p>Your account has been successfully created via Google.</p>
 
`;

export const hostelApprovedEmailTemplate = (hostelName: string) => `
  <div style="font-family: sans-serif; color: #333; line-height: 1.6;">
    <p style="font-size: 16px; font-weight: bold;">Hello,</p>
    <p>Great news! Your hostel <strong>${hostelName}</strong> has been <strong>approved</strong> and is now visible to students on the platform.</p>
    <p style="margin-top: 20px; font-size: 12px; color: #777;">Student Welfare Platform Team</p>
  </div>
`;

export const hostelRejectedEmailTemplate = (hostelName: string, reason: string) => `
  <div style="font-family: sans-serif; color: #333; line-height: 1.6;">
    <p style="font-size: 16px; font-weight: bold;">Hello,</p>
    <p>We regret to inform you that your hostel application for <strong>${hostelName}</strong> has been <strong>rejected</strong>.</p>
    <p style="background: #f8f8f8; padding: 10px; border-left: 4px solid #e74c3c;">
      <strong>Reason:</strong> ${reason}
    </p>
    <p>Please address these issues and re-submit your application.</p>
  </div>
`;

export const bookingApprovedEmailTemplate = (bookingId: number) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9;">
    <h1 style="color: #2c3e50;">Congratulations!</h1>
    <p>Your booking for <strong>Booking ID: ${bookingId}</strong> has been approved.</p>
    <p>You can now proceed with the necessary arrangements.</p>
    <p style="margin-top: 20px; font-size: 12px; color: #777;">Student Welfare Platform Team</p>
  </div>
`;

export const bookingRejectedEmailTemplate = (firstName: string, roomNumber: string, reason: string) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #fdf2f2;">
    <h1 style="color: #c53030;">Booking Update</h1>
    <p>Hello ${firstName},</p>
    <p>We regret to inform you that your booking for room <strong>${roomNumber}</strong> has been <strong>rejected</strong>.</p>
    <p style="background: #fff; padding: 10px; border-left: 4px solid #c53030;">
      <strong>Reason:</strong> ${reason}
    </p>
    <p><strong>Refund Info:</strong> Your payment has been successfully refunded to your account.</p>
    <p style="margin-top: 20px; font-size: 12px; color: #777;">Student Welfare Platform Team</p>
  </div>
`;