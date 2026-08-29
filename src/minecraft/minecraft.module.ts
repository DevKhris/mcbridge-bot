import { Module } from '@nestjs/common';
import { MinecraftService } from './minecraft.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule.register({ 
    timeout: 5000, 
    maxRedirects: 3 
  })],
  providers: [MinecraftService]
})
export class MinecraftModule {}
