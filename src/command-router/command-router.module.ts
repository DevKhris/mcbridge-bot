import { Module } from '@nestjs/common';
import { CommandRouterService } from './command-router.service';
import { CommandRouterProvider } from './command-router.provider';

@Module({
  providers: [CommandRouterService, CommandRouterProvider],
  exports: [CommandRouterService],
})
export class CommandRouterModule {}
