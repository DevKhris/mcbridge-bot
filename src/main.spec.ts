import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

jest.mock('./app.module', () => ({ AppModule: {} }));
jest.mock('@nestjs/core', () => ({
  NestFactory: { create: jest.fn() },
}));

describe('main', () => {
  it('should bootstrap the application and start listening', async () => {
    delete process.env.PORT;

    const app = {
      enableShutdownHooks: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
    };
    (NestFactory.create as jest.Mock).mockResolvedValue(app);

    await import('./main');
    await new Promise((resolve) => setImmediate(resolve));

    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
    expect(app.enableShutdownHooks).toHaveBeenCalled();
    expect(app.listen).toHaveBeenCalledWith(3000);
  });
});