import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RABBITMQ_CONSTANTS } from './rabbitmq.config';

@Module({
  imports: [
    RabbitMQModule.forRoot({
      exchanges: [
        {
          name: RABBITMQ_CONSTANTS.EXCHANGES.PEDIDO,
          type: 'topic',
        },
      ],
      uri: process.env.RABBITMQ_URI || 'amqp://localhost:5672',
      connectionInitOptions: {
        wait: false,
        timeout: 20000,
      },
    }),
  ],
  exports: [RabbitMQModule],
})
export class RabbitmqConfigModule {}
