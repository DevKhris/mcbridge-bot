import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { DISCORD_CLIENT } from '../src/discord/client/client.tokens';

describe('AppModule (e2e)', () => {
  let app: INestApplication;
  let client: Record<string, jest.Mock>;

  beforeEach(async () => {
    client = {
      once: jest.fn(),
      on: jest.fn(),
      login: jest.fn().mockResolvedValue(undefined),
      removeAllListeners: jest.fn(),
      destroy: jest.fn().mockResolvedValue(undefined),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DISCORD_CLIENT)
      .useValue(client)
      .overrideProvider(ConfigService)
      .useValue({ getOrThrow: jest.fn().mockReturnValue('test-token') })
      .compile();

    app = moduleFixture.createNestApplication();
    app.enableShutdownHooks();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should boot the module and log the Discord client in', async () => {
    expect(app).toBeDefined();
    expect(client.login).toHaveBeenCalledWith('test-token');
  });

  it('should destroy the Discord client on shutdown', async () => {
    await app.close();

    expect(client.removeAllListeners).toHaveBeenCalled();
    expect(client.destroy).toHaveBeenCalled();
  });
});