import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Controller('projects/:projectId/assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  async list(@Req() req: { userId?: string }, @Param('projectId') projectId: string) {
    return this.assetsService.list(req.userId as string, projectId);
  }

  @Get('suggestions')
  async suggestions(@Req() req: { userId?: string }, @Param('projectId') projectId: string) {
    return this.assetsService.suggestions(req.userId as string, projectId);
  }

  @Post()
  async create(
    @Req() req: { userId?: string },
    @Param('projectId') projectId: string,
    @Body() dto: CreateAssetDto,
  ) {
    return this.assetsService.create(req.userId as string, projectId, dto);
  }

  @Post('suggestions/accept')
  async acceptSuggestion(
    @Req() req: { userId?: string },
    @Param('projectId') projectId: string,
    @Body() dto: CreateAssetDto,
  ) {
    return this.assetsService.acceptSuggestion(req.userId as string, projectId, dto);
  }

  @Put(':assetId')
  async update(
    @Req() req: { userId?: string },
    @Param('projectId') projectId: string,
    @Param('assetId') assetId: string,
    @Body() dto: UpdateAssetDto,
  ) {
    return this.assetsService.update(req.userId as string, projectId, assetId, dto);
  }

  @Delete(':assetId')
  async remove(
    @Req() req: { userId?: string },
    @Param('projectId') projectId: string,
    @Param('assetId') assetId: string,
  ) {
    return this.assetsService.remove(req.userId as string, projectId, assetId);
  }
}
