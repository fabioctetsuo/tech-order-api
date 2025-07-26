import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { RABBITMQ_CONSTANTS } from '../rabbitmq.config';
import { PedidoUseCases } from '../../../business/pedido/pedido.usecases';
import { RetryService } from '../retry.service';

interface PedidoConfirmadoMessage {
  pedido_id: string;
  cliente_id?: string;
  itens: Array<{
    produto_id: string;
    quantidade: number;
    preco_unitario: number;
    observacao?: string;
  }>;
  valor_total: number;
  timestamp: string;
}

@Injectable()
export class PedidoConsumer {
  private readonly logger = new Logger(PedidoConsumer.name);

  constructor(
    private pedidoUseCases: PedidoUseCases,
    private retryService: RetryService,
  ) {}

  @RabbitSubscribe({
    exchange: RABBITMQ_CONSTANTS.EXCHANGES.PEDIDO,
    routingKey: RABBITMQ_CONSTANTS.ROUTING_KEYS.PEDIDO_CONFIRMADO,
    queue: RABBITMQ_CONSTANTS.QUEUES.PEDIDO_CONFIRMADO,
    queueOptions: {
      deadLetterExchange: RABBITMQ_CONSTANTS.EXCHANGES.PEDIDO,
      deadLetterRoutingKey:
        RABBITMQ_CONSTANTS.DLQ_ROUTING_KEYS.PEDIDO_CONFIRMADO,
      messageTtl: RABBITMQ_CONSTANTS.TIMEOUT,
    },
  })
  async handlePedidoRecebido(message: PedidoConfirmadoMessage) {
    this.logger.log(`Processando pedido: ${message.pedido_id}`);

    try {
      await this.retryService.executeWithRetry(async () => {
        const result = await this.pedidoUseCases.receberPedidoConfirmado(
          message.pedido_id,
        );

        if (!result) {
          throw new Error(
            `Falha ao processar pedido ${message.pedido_id} - Executando retry`,
          );
        }

        this.logger.log(`Pedido ${message.pedido_id} processado com sucesso`);
        return result;
      });
    } catch (error) {
      this.logger.error(
        `Erro ao processar pedido ${message.pedido_id}:`,
        error,
      );
      throw error;
    }
  }
}
