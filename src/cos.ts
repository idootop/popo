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
    const config = jsonDecode(localStorage.getItem('config'));
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

  getUrl(
    key: string,
    { download = false }: { download?: boolean } = {},
  ): string {
    return this.client.getObjectUrl(
      {
        Bucket: this.bucket,
        Region: this.region,
        Key: key,
        Sign: download,
        Query: download
          ? {
              'response-content-disposition': `attachment; filename="${encodeURIComponent(key)}"`,
            }
          : undefined,
      },
      () => {},
    );
  }

  async list() {
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

  async upload(key: string, body: File | string) {
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

  async delete(key: string) {
    return new Promise((resolve, reject) => {
      this.client.deleteObject(
        {
          Bucket: this.bucket,
          Region: this.region,
          Key: key,
        },
        (err) => {
          if (err) {
            reject(err);
          } else {
            this.cache.delete(key);
            resolve(true);
          }
        },
      );
    });
  }

  private cache = new Map<string, string>();
  async readString(key: string): Promise<string> {
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }
    return new Promise((resolve, reject) => {
      this.client.getObject(
        {
          Bucket: this.bucket,
          Region: this.region,
          Key: key,
        },
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            const content = data.Body.toString();
            this.cache.set(key, content);
            resolve(content);
          }
        },
      );
    });
  }

  async writeString(key: string, text: string) {
    await this.upload(key, text);
    this.cache.set(key, text);
  }

  async rename(oldKey: string, newKey: string) {
    if (oldKey === newKey) return true;

    // 1. 复制文件到新路径
    await new Promise((resolve, reject) => {
      this.client.putObjectCopy(
        {
          Bucket: this.bucket,
          Region: this.region,
          Key: newKey,
          CopySource: `${this.bucket}.cos.${this.region}.myqcloud.com/${encodeURIComponent(oldKey)}`,
        },
        (err, data) => {
          if (err) reject(err);
          else resolve(data);
        },
      );
    });

    // 2. 删除原文件
    const content = this.cache.get(oldKey);

    await this.delete(oldKey);

    // 3. 同步更新缓存
    if (content) {
      this.cache.set(newKey, content);
    }

    return true;
  }
}
