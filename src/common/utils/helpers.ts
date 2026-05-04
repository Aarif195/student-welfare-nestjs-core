import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hashed: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashed);
};

export const generateToken = (jwtService: JwtService, id: number): string => {
  return jwtService.sign({ id });
};

export const verifyPayment = async (reference: string, secretKey: string): Promise<any> => {
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      },
    );

    const data = response.data.data;
    return data.status === 'success' ? data : null;
  } catch (error) {
    console.error('Paystack Verify Error:', error.response?.data?.message || error.message);
    return null;
  }
};

// generate otp 
export const generateOTP = (length: number): string => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return crypto.randomInt(min, max).toString();
};
