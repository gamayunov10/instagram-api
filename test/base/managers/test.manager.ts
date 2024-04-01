import { INestApplication } from '@nestjs/common';

export class TestManager {
  constructor(protected readonly app: INestApplication) {}
}
