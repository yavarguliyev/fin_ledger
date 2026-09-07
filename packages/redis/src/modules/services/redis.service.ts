import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { Cluster } from 'ioredis';

@Injectable()
export class RedisService implements OnApplicationShutdown {
  private client: Redis | Cluster;

  constructor (private config: ConfigService) {
    const clusterNodes = this.config.get<string>('REDIS_CLUSTER_NODES');
    const password = this.config.get<string>('REDIS_PASSWORD') || undefined;

    if (clusterNodes) {
      const nodes = clusterNodes.split(',').map(node => {
        const [host, port] = node.split(':');
        return { host, port: parseInt(port || '6379') };
      });

      this.client = new Redis.Cluster(nodes, { redisOptions: { password } });
    } else {
      this.client = new Redis({
        host: this.config.get('REDIS_HOST'),
        port: this.config.get('REDIS_PORT', 6379),
        password,
        db: this.config.get('REDIS_DB', 0)
      });
    }
  }

  getClient = (): Redis | Cluster => this.client;

  async onApplicationShutdown (): Promise<void> {
    await this.client.quit();
  }

  async getMemoryUsage (): Promise<number> {
    try {
      const info = await this.client.info('memory');
      const usedMemory = info.match(/used_memory:(\d+)/)?.[1];
      return usedMemory ? parseInt(usedMemory, 10) : 0;
    } catch {
      return 0;
    }
  }
}
