import { jsonDecode } from '@del-wang/utils';
import COSClient from 'cos-js-sdk-v5';

interface COSConfig {
  SecretId: string;
  SecretKey: string;
  Bucket: string;
  Region: string;
}

export class COS {
  private client: COSClient;
  private bucket: string;
  private region: string;

  private static _instance?: COS;
  static get instance() {
    if (COS._instance) {
      return COS._instance;
    }
    const config = jsonDecode(localStorage.getItem('config')) ?? {
      SecretId: import.meta.env.VITE_SecretId,
      SecretKey: import.meta.env.VITE_SecretKey,
      Bucket: import.meta.env.VITE_Bucket,
      Region: import.meta.env.VITE_Region,
    };
    COS._instance = new COS(config);
    return COS._instance;
  }

  constructor(config: COSConfig) {
    this.bucket = config.Bucket;
    this.region = config.Region;
    this.client = new COSClient({
      SecretId: config.SecretId,
      SecretKey: config.SecretKey,
    });
  }

  async getFiles() {
    return new Promise<any[]>((resolve, reject) => {
      this.client.getBucket(
        {
          Bucket: this.bucket,
          Region: this.region,
          Prefix: '',
        },
        (err, data) => {
          if (err) reject(err);
          else resolve(data.Contents || []);
        },
      );
    });
  }

  async uploadFile(key: string, body: File | string) {
    return new Promise((resolve, reject) => {
      this.client.putObject(
        {
          Bucket: this.bucket,
          Region: this.region,
          Key: key,
          Body: body,
        },
        (err, data) => {
          if (err) reject(err);
          else resolve(data);
        },
      );
    });
  }

  async deleteFile(key: string) {
    return new Promise((resolve, reject) => {
      this.client.deleteObject(
        {
          Bucket: this.bucket,
          Region: this.region,
          Key: key,
        },
        (err) => {
          if (err) reject(err);
          else resolve(true);
        },
      );
    });
  }

  async getSignedUrl(key: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.getObjectUrl(
        {
          Bucket: this.bucket,
          Region: this.region,
          Key: key,
          Sign: true,
          Expires: 3600,
        },
        (err, data) => {
          if (err) reject(err);
          else resolve(data.Url || '');
        },
      );
    });
  }

  async getObjectContent(key: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.getObject(
        {
          Bucket: this.bucket,
          Region: this.region,
          Key: key,
        },
        (err, data) => {
          if (err) reject(err);
          else resolve(data.Body.toString());
        },
      );
    });
  }
}
