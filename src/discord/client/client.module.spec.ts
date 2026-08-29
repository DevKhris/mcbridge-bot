import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ClientModule } from './client.module';
import { DISCORD_CLIENT } from './client.tokens';

describe('ClientModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ClientModule],
    })
      .overrideProvider(ConfigService)
      .useValue({ getOrThrow: jest.fn().mockReturnValue('test-token') })
      .compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should provide and export the discord client', () => {
    const client = module.get(DISCORD_CLIENT);

    expect(client).toBeDefined();
    expect(typeof client.login).toBe('function');
  });
});