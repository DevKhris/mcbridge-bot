import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BedrockStatusOptions } from './interfaces/bedrock.status.options.interface';
import { JavaStatusOptions } from './interfaces/java.status.options.interface';

@Injectable()
export class MinecraftService {
  private readonly logger: Logger = new Logger(MinecraftService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async buildServerStatusUrl(
    type: 'java' | 'bedrock' | 'both',
    options: JavaStatusOptions | BedrockStatusOptions,
  ) {
    const serverOptions = {
      host: this.configService.getOrThrow<string>('MINECRAFT_SERVER_HOST'),
      port: this.configService.getOrThrow<string>('MINECRAFT_SERVER_PORT'),
      query: false,
      ...options,
    };

    const query = serverOptions.query ?? true;
    const hostname = `http://${serverOptions.baseURL}`;
    const route = `/status/${type}/${serverOptions.host}:${serverOptions.port}?query=${query}`;
    const url = `${hostname}${route}`;

    return url;
  }

  async getServerStatus(
    type: 'java' | 'bedrock' | 'both',
    options: JavaStatusOptions | BedrockStatusOptions,
  ): Promise<any> {
    const url = await this.buildServerStatusUrl(type, options);

    try {
      const result = await this.httpService.axiosRef.get(url);

      if (result.status !== 200) {
        this.logger.error(`Failed to fetch server status: ${result.data.body}`);
        throw new Error(`Failed to fetch server status: ${result.data.body}`);
      }

      return result.data.body;
    } catch (error) {
      this.logger.error(`Failed to fetch server status: ${error}`);
      throw new Error(`Failed to fetch server status: ${error}`);
    }
  }
}
