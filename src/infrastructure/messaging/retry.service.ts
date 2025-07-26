import { Injectable, Logger } from '@nestjs/common';
import { RABBITMQ_CONSTANTS } from './rabbitmq.config';

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries = RABBITMQ_CONSTANTS.RETRY.MAX_RETRIES,
  ): Promise<T> {
    let lastError: Error | null = null;
    let delay = RABBITMQ_CONSTANTS.RETRY.INITIAL_RETRY_DELAY;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        const err = error instanceof Error ? error : new Error(String(error));
        lastError = err;
        this.logger.warn(
          `Tentativa ${attempt} de ${maxRetries} falhou. Erro: ${err.message}`,
        );

        if (attempt < maxRetries) {
          await this.sleep(delay);
          delay = Math.min(delay * 2, RABBITMQ_CONSTANTS.RETRY.MAX_RETRY_DELAY);
        }
      }
    }

    throw new Error(
      `Operação falhou após ${maxRetries} tentativas. Último erro: ${lastError?.message}`,
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
