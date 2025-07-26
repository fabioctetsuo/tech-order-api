import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { RABBITMQ_CONSTANTS } from './rabbitmq.config';

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
}

@Injectable()
export class RabbitmqService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publishPedidoConfirmado(
    message: PedidoConfirmadoMessage,
  ): Promise<void> {
    await this.amqpConnection.publish(
      RABBITMQ_CONSTANTS.EXCHANGES.PEDIDO,
      RABBITMQ_CONSTANTS.ROUTING_KEYS.PEDIDO_CONFIRMADO,
      {
        ...message,
        timestamp: new Date().toISOString(),
      },
    );
  }

  async publishPedidoRecebido(message: PedidoConfirmadoMessage): Promise<void> {
    await this.amqpConnection.publish(
      RABBITMQ_CONSTANTS.EXCHANGES.PEDIDO,
      RABBITMQ_CONSTANTS.ROUTING_KEYS.PEDIDO_RECEBIDO,
      {
        ...message,
        timestamp: new Date().toISOString(),
      },
    );
  }

  async publishPedidoPreparacao(pedidoId: string): Promise<void> {
    await this.amqpConnection.publish(
      RABBITMQ_CONSTANTS.EXCHANGES.PEDIDO,
      RABBITMQ_CONSTANTS.ROUTING_KEYS.PEDIDO_PREPARACAO,
      {
        pedido_id: pedidoId,
        timestamp: new Date().toISOString(),
      },
    );
  }

  async publishPedidoPronto(pedidoId: string): Promise<void> {
    await this.amqpConnection.publish(
      RABBITMQ_CONSTANTS.EXCHANGES.PEDIDO,
      RABBITMQ_CONSTANTS.ROUTING_KEYS.PEDIDO_PRONTO,
      {
        pedido_id: pedidoId,
        timestamp: new Date().toISOString(),
      },
    );
  }

  async publishPedidoEntregue(pedidoId: string): Promise<void> {
    await this.amqpConnection.publish(
      RABBITMQ_CONSTANTS.EXCHANGES.PEDIDO,
      RABBITMQ_CONSTANTS.ROUTING_KEYS.PEDIDO_ENTREGUE,
      {
        pedido_id: pedidoId,
        timestamp: new Date().toISOString(),
      },
    );
  }
}
