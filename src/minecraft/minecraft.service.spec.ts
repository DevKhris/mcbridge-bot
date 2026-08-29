import { Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MinecraftService } from './minecraft.service';

describe('MinecraftService', () => {
  let service: MinecraftService;
  let configService: { getOrThrow: jest.Mock };
  let httpService: { axiosRef: { get: jest.Mock } };

  beforeEach(async () => {
    configService = {
      getOrThrow: jest
        .fn()
        .mockReturnValueOnce('play.example.com')
        .mockReturnValueOnce('25565'),
    };
    httpService = {
      axiosRef: {
        get: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinecraftService,
        { provide: ConfigService, useValue: configService },
        { provide: HttpService, useValue: httpService },
      ],
    }).compile();

    service = module.get(MinecraftService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buildServerStatusUrl', () => {
    it('should build the URL from config host, port and default query', async () => {
      const url = await service.buildServerStatusUrl('java', {
        baseURL: 'api.mcstatus.io',
      });

      expect(configService.getOrThrow).toHaveBeenCalledWith(
        'MINECRAFT_SERVER_HOST',
      );
      expect(configService.getOrThrow).toHaveBeenCalledWith(
        'MINECRAFT_SERVER_PORT',
      );
      expect(url).toBe(
        'http://api.mcstatus.io/status/java/play.example.com:25565?query=false',
      );
    });

    it('should keep the query flag when provided as true', async () => {
      const url = await service.buildServerStatusUrl('java', {
        baseURL: 'api.mcstatus.io',
        query: true,
      });

      expect(url).toBe(
        'http://api.mcstatus.io/status/java/play.example.com:25565?query=true',
      );
    });

    it('should support bedrock status type', async () => {
      const url = await service.buildServerStatusUrl('bedrock', {
        baseURL: 'api.mcstatus.io',
      });

      expect(url).toContain('/status/bedrock/play.example.com:25565');
    });
  });

  describe('getServerStatus', () => {
    it('should return the server status body on a successful response', async () => {
      httpService.axiosRef.get.mockResolvedValue({
        status: 200,
        data: { body: { online: true } },
      });

      const result = await service.getServerStatus('both', {
        baseURL: 'api.mcstatus.io',
      });

      expect(httpService.axiosRef.get).toHaveBeenCalledWith(
        'http://api.mcstatus.io/status/both/play.example.com:25565?query=false',
      );
      expect(result).toEqual({ online: true });
    });

    it('should throw when the response status is not 200', async () => {
      const error = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();
      httpService.axiosRef.get.mockResolvedValue({
        status: 500,
        data: { body: 'Internal server error' },
      });

      await expect(
        service.getServerStatus('java', { baseURL: 'api.mcstatus.io' }),
      ).rejects.toThrow(
        'Failed to fetch server status: Internal server error',
      );

      expect(error).toHaveBeenCalledWith(
        'Failed to fetch server status: Internal server error',
      );
    });

    it('should throw when the request fails', async () => {
      const error = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();
      httpService.axiosRef.get.mockRejectedValue(
        new Error('Connection refused'),
      );

      await expect(
        service.getServerStatus('bedrock', { baseURL: 'api.mcstatus.io' }),
      ).rejects.toThrow(
        'Failed to fetch server status: Error: Connection refused',
      );

      expect(error).toHaveBeenCalledWith(
        'Failed to fetch server status: Error: Connection refused',
      );
    });
  });
});