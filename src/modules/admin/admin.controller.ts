import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Delete,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SendBulkMailDto } from './dto/send-bulk-mail';
import { SendBulkSmsDto } from './dto/send-bulk-sms';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Admin - Bulk Notifications')
@Controller('admin/notify')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('mail')
  @ApiOperation({ summary: 'Send bulk mail to all users (or limited)' })
  @ApiResponse({ status: 200, description: 'Number of queued mail jobs' })
  @UseGuards(JwtAuthGuard)
  async sendMail(@Body() dto: SendBulkMailDto) {
    return this.adminService.sendBulkMail(dto);
  }

  @Post('sms')
  @ApiOperation({ summary: 'Send bulk sms to users (or random phones)' })
  @ApiResponse({ status: 200, description: 'Number of queued sms jobs' })
  @UseGuards(JwtAuthGuard)
  async sendSms(@Body() dto: SendBulkSmsDto) {
    return this.adminService.sendBulkSms(dto);
  }

  @Post('pause/:queueName')
  @ApiOperation({ summary: 'Pause a queue' })
  pauseQueue(@Param('queueName') queueName: string) {
    return this.adminService.pauseQueue(queueName);
  }

  @Post('resume/:queueName')
  @ApiOperation({ summary: 'Resume a queue' })
  resumeQueue(@Param('queueName') queueName: string) {
    return this.adminService.resumeQueue(queueName);
  }

  @Post('clean/:queueName')
  @ApiOperation({ summary: 'Clean completed and failed jobs from a queue' })
  cleanQueue(@Param('queueName') queueName: string) {
    return this.adminService.cleanQueue(queueName);
  }

  @Delete('job/:queueName/:jobId')
  @ApiOperation({ summary: 'Remove job by ID' })
  removeJob(
    @Param('queueName') queueName: string,
    @Param('jobId') jobId: string,
  ) {
    return this.adminService.removeJob(queueName, jobId);
  }

  @Get('stats/:queueName')
  @ApiOperation({ summary: 'Get queue stats' })
  getQueueStats(@Param('queueName') queueName: string) {
    return this.adminService.getQueueStats(queueName);
  }

  @Get('jobs/:queueName')
  @ApiOperation({ summary: 'Get all jobs for a queue' })
  getAllJobs(@Param('queueName') queueName: string) {
    return this.adminService.getAllJobs(queueName);
  }
}
