import { Test, TestingModule } from '@nestjs/testing';
import { CommandRouterModule } from './command-router.module';
import { CommandRouterService } from './command-router.service';
import { DISCORD_COMMANDS } from './command-router.tokens';

describe('CommandRouterModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CommandRouterModule],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should provide the command map', () => {
    expect(module.get(DISCORD_COMMANDS)).toBeInstanceOf(Map);
  });

  it('should provide and export the command router service', () => {
    const service = module.get(CommandRouterService);

    expect(service).toBeInstanceOf(CommandRouterService);
  });
});