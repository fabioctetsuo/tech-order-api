import { Injectable, Logger } from '@nestjs/common';
import { CreatePedidoDTO } from '../../application/dto/pedido.dto';
import { PedidoUseCases } from './pedido.usecases';
import { RabbitmqService } from '../../infrastructure/messaging/rabbitmq.service';

@Injectable()
export class PedidoService {
  private readonly logger = new Logger(PedidoService.name);

  constructor(
    private pedidoUseCases: PedidoUseCases,
    private rabbitmqService: RabbitmqService,
  ) {}

  async findAll() {
    return this.pedidoUseCases.findAll();
  }

  async create(dados: CreatePedidoDTO, auth: string) {
    return this.pedidoUseCases.create(dados, auth);
  }

  async findById(id: string) {
    return this.pedidoUseCases.findById(id);
  }

  async confirmarPedido(id: string) {
    const pedido = await this.pedidoUseCases.confirmarPedido(id);

    try {
      // Get full pedido data with items for messaging
      const fullPedido = await this.pedidoUseCases.findById(id);

      if (fullPedido && fullPedido.itens) {
        // Publish message to RabbitMQ
        await this.rabbitmqService.publishPedidoConfirmado({
          pedido_id: fullPedido.id,
          cliente_id: fullPedido.cliente_id,
          itens: fullPedido.itens.map((item) => ({
            produto_id: item.produto_id,
            quantidade: item.quantidade,
            preco_unitario: item.preco_unitario,
            observacao: item.observacao,
          })),
          valor_total: fullPedido.preco,
        });

        this.logger.log(`Mensagem de pedido confirmado publicada para ${id}`);
      }
    } catch (error) {
      this.logger.error(
        `Erro ao publicar mensagem de pedido confirmado: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      // Don't fail the operation if messaging fails
    }

    return pedido;
  }

  async receberPedidoConfirmado(id: string) {
    const pedido = await this.pedidoUseCases.receberPedidoConfirmado(id);

    try {
      // Get full pedido data with items for messaging
      const fullPedido = await this.pedidoUseCases.findById(id);

      if (fullPedido && fullPedido.itens) {
        // Publish message to RabbitMQ
        await this.rabbitmqService.publishPedidoRecebido({
          pedido_id: fullPedido.id,
          cliente_id: fullPedido.cliente_id,
          itens: fullPedido.itens.map((item) => ({
            produto_id: item.produto_id,
            quantidade: item.quantidade,
            preco_unitario: item.preco_unitario,
            observacao: item.observacao,
          })),
          valor_total: fullPedido.preco,
        });

        this.logger.log(`Mensagem de pedido recebido publicada para ${id}`);
      }
    } catch (error) {
      this.logger.error(
        `Erro ao publicar mensagem de pedido recebido: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      // Don't fail the operation if messaging fails
    }

    return pedido;
  }

  async iniciarPreparacao(id: string) {
    const pedido = await this.pedidoUseCases.iniciarPreparacao(id);

    try {
      // Publish message to RabbitMQ
      await this.rabbitmqService.publishPedidoPreparacao(id);
      this.logger.log(`Mensagem de pedido em preparação publicada para ${id}`);
    } catch (error) {
      this.logger.error(
        `Erro ao publicar mensagem de pedido em preparação: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      // Don't fail the operation if messaging fails
    }

    return pedido;
  }

  async marcarComoPronto(id: string) {
    const pedido = await this.pedidoUseCases.marcarComoPronto(id);

    try {
      // Publish message to RabbitMQ
      await this.rabbitmqService.publishPedidoPronto(id);
      this.logger.log(`Mensagem de pedido pronto publicada para ${id}`);
    } catch (error) {
      this.logger.error(
        `Erro ao publicar mensagem de pedido pronto: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      // Don't fail the operation if messaging fails
    }

    return pedido;
  }

  async marcarComoEntregue(id: string) {
    const pedido = await this.pedidoUseCases.marcarComoEntregue(id);

    try {
      // Publish message to RabbitMQ
      await this.rabbitmqService.publishPedidoEntregue(id);
      this.logger.log(`Mensagem de pedido entregue publicada para ${id}`);
    } catch (error) {
      this.logger.error(
        `Erro ao publicar mensagem de pedido entregue: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      // Don't fail the operation if messaging fails
    }

    return pedido;
  }
}
