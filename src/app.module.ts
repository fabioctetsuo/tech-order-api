import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';
import { ClienteController } from './application/rest/cliente.api';
import { ClienteService } from './business/cliente/cliente.service';
import { ClienteRepository } from './infrastructure/persistence/repositories/cliente.repository';
import { ClienteUseCases } from './business/cliente/cliente.usecases';
import { PedidoService } from './business/pedido/pedido.service';
import { PedidoRepository } from './infrastructure/persistence/repositories/pedido.repository';
import { PedidoUseCases } from './business/pedido/pedido.usecases';
import { PedidoController } from './application/rest/pedido.api';
import { HealthModule } from './infrastructure/health/health.module';
import { RabbitmqConfigModule } from './infrastructure/messaging/rabbitmq.module';
import { RabbitmqService } from './infrastructure/messaging/rabbitmq.service';
import { RetryService } from './infrastructure/messaging/retry.service';
import { PedidoConsumer } from './infrastructure/messaging/consumers/pedido.consumer';

@Module({
  imports: [PrismaModule, HealthModule, RabbitmqConfigModule],
  controllers: [ClienteController, PedidoController],
  providers: [
    ClienteService,
    ClienteRepository,
    ClienteUseCases,
    PedidoService,
    PedidoRepository,
    PedidoUseCases,
    RabbitmqService,
    RetryService,
    PedidoConsumer,
  ],
})
export class AppModule {}
