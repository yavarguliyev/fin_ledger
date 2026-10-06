import { BeforeApplicationShutdown, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DiscoveryService, Reflector } from '@nestjs/core';

import { BACKGROUND_WORKER } from '../constants/lifecycle/background-worker.constant';
import { ProcessRole } from '../enums/common/process-role.enum';
import { BackgroundTask } from '../interfaces/background-task.interface';
import { ProcessRoleFilterDto } from '../dtos/background/process-role-filter.dto';
import { BaseHelper } from '../helpers/base.helper';

@Injectable()
export class BackgroundRunner implements OnApplicationBootstrap, BeforeApplicationShutdown {
  private readonly logger = new Logger(BackgroundRunner.name);
  private started: BackgroundTask[] = [];

  constructor (
    private readonly discovery: DiscoveryService,
    private readonly reflector: Reflector,
    private readonly config: ConfigService
  ) {}

  async onApplicationBootstrap (): Promise<void> {
    const roles = this.config.get<ProcessRole[]>(BACKGROUND_WORKER.ROLES_KEY) ?? [];
    for (const task of this.tasksFor({ roles })) {
      await task.start();
      this.started.push(task);
    }
    this.logger.log(`Started ${this.started.length} background workers for ${roles.join(BACKGROUND_WORKER.SEPARATOR)}`);
  }

  async beforeApplicationShutdown (): Promise<void> {
    await this.stopAll();
  }

  async stopAll (): Promise<void> {
    const running = this.started.reverse();
    this.started = [];
    for (const task of running) {
      try {
        await task.stop();
      } catch (error) {
        this.logger.error(`Background worker ${task.constructor.name} failed to stop: ${BaseHelper.errorResponse({ error }).message}`);
      }
    }
  }

  private tasksFor ({ roles }: ProcessRoleFilterDto): BackgroundTask[] {
    return this.discovery
      .getProviders()
      .map(wrapper => wrapper.instance as BackgroundTask | undefined)
      .filter((instance): instance is BackgroundTask => {
        if (!instance?.constructor) return false;
        const role = this.reflector.get<ProcessRole | undefined>(BACKGROUND_WORKER.ROLE_METADATA, instance.constructor);
        return role !== undefined && roles.includes(role);
      });
  }
}
