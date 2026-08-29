import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { ClientModule } from './discord/client/client.module'
import { ConfigModule } from '@nestjs/config';
import { CommandRouterModule } from './command-router/command-router.module';
import { MinecraftModule } from './minecraft/minecraft.module';
export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ClientModule,
    ConfigModule.forRoot({}),
    CommandRouterModule,
    MinecraftModule,
  ],
  providers: [],
})
export class AppModule {}
