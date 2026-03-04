import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get('cloudinary.cloud_name'),
      api_key: this.config.get('cloudinary.api_key'),
      api_secret: this.config.get('cloudinary.api_secret'),
    });
  }

  generateSignature(folder: string) {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      this.config.get('cloudinary.api_secret')!,
    );

    return {
      signature,
      timestamp,
      folder,
      cloudName: this.config.get('cloudinary.cloud_name'),
      apiKey: this.config.get('cloudinary.api_key'),
    };
  }
}