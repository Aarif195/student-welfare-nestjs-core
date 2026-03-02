import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get('CLOUDINARY_API_KEY'),
      api_secret: this.config.get('CLOUDINARY_API_SECRET'),
    });
  }

  generateSignature(folder: string) {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      this.config.get('CLOUDINARY_API_SECRET')!,
    );

    return {
      signature,
      timestamp,
      folder,
      cloudName: this.config.get('CLOUDINARY_CLOUD_NAME'),
      apiKey: this.config.get('CLOUDINARY_API_KEY'),
    };
  }
}