import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';

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

export const verifyPayment = async (reference: string): Promise<boolean> => {
  // Logic for external API call (Paystack/Flutterwave)
  return true; 
};

export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};