import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('check', () => {
    it('should return health status object', () => {
      const result = service.check();

      expect(result).toEqual({
        status: 'ok',
        timestamp: expect.any(String) as string,
      });
    });

    it('should return current timestamp', () => {
      const before = new Date();
      const result = service.check();
      const after = new Date();

      const resultTimestamp = new Date(result.timestamp);
      expect(resultTimestamp.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(resultTimestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });
});
