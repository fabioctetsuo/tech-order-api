import jwt, { JwtPayload } from 'jsonwebtoken';
import { Injectable, Logger } from '@nestjs/common';
import { PedidoRepository } from '../../infrastructure/persistence/repositories/pedido.repository';
import { CreatePedidoDTO } from '../../application/dto/pedido.dto';
import { Pedido } from '../../domain/pedido/pedido.entity';
import { ItemPedido } from '../../domain/pedido/item-pedido.entity';
import { PedidoStatus } from '../../domain/pedido/pedido.types';
import { ValidationErrorType } from '../../domain/exceptions/validation.exception';
import { ValidationException } from '../../domain/exceptions/validation.exception';
import { ClienteUseCases } from '../cliente/cliente.usecases';

interface CustomJwtPayload extends JwtPayload {
  cpf: string;
}

@Injectable()
export class PedidoUseCases {
  private readonly logger = new Logger(PedidoUseCases.name);

  constructor(
    private pedidoRepository: PedidoRepository,
    private clienteUseCases: ClienteUseCases,
  ) {}

  private decodeToken(token: string): CustomJwtPayload {
    try {
      const tokenWithoutBearer = token.replace('Bearer ', '');
      const base64Payload = tokenWithoutBearer.split('.')[1];
      return JSON.parse(atob(base64Payload)) as CustomJwtPayload;
    } catch (error) {
      this.logger.error('Error decoding token:', error);
      throw new ValidationException(ValidationErrorType.UNAUTHORIZED);
    }
  }

  async create(dados: CreatePedidoDTO, auth: string) {
    this.logger.log('Iniciando fluxo de criação de pedido: ', {
      payload: JSON.stringify(dados),
    });

    if (dados.itens && dados.itens?.length === 0) {
      this.logger.error('Erro ao criar pedido: Pedido sem itens');
      throw new ValidationException(ValidationErrorType.PEDIDO_INVALID_ITEMS);
    }

    if (auth) {
      this.logger.log('CPF foi informado pelo cliente');
      this.logger.log('Decodificando token: ', {
        token: auth,
      });
      const { cpf } = this.decodeToken(auth);
      const cliente = await this.clienteUseCases.findByCpf(cpf);

      if (!cliente) {
        this.logger.error('Erro ao criar pedido: Cliente não encontrado');
        throw new ValidationException(ValidationErrorType.CLIENTE_NOT_FOUND);
      } else {
        this.logger.log('Cliente encontrado: ', {
          cliente: JSON.stringify(cliente),
        });
        dados.cliente_id = cliente.id;
      }
    }

    // TODO: Validate products with Product API
    // for (const item of dados.itens ?? []) {
    //   const produto = await this.produtoUseCases.findById(item.produto_id);
    //   if (!produto) {
    //     this.logger.error('Erro ao criar pedido: Produto não encontrado');
    //     throw new ValidationException(ValidationErrorType.PRODUTO_NOT_FOUND);
    //   }
    // }

    const pedido = new Pedido({
      cliente_id: dados.cliente_id,
      status: PedidoStatus.PENDENTE,
    });

    const pedidoItens = dados.itens as [];
    const pedidoItensEntity = pedidoItens.map((item) => new ItemPedido(item));
    pedido.setItens(pedidoItensEntity);

    const createdPedido = await this.pedidoRepository.save(pedido);

    this.logger.log('Pedido criado com sucesso: ', {
      pedido: JSON.stringify(createdPedido),
    });

    return createdPedido;
  }

  async findAll() {
    return this.pedidoRepository.findAll();
  }

  async findById(id: string) {
    this.logger.log(`Buscando pedido pelo ID: ${id}`);
    const pedido = await this.pedidoRepository.findById(id);

    if (!pedido) {
      this.logger.error('Erro ao buscar pedido: Pedido não encontrado');
      throw new ValidationException(ValidationErrorType.PEDIDO_NOT_FOUND);
    }

    this.logger.log('Pedido encontrado');
    return pedido;
  }

  async confirmarPedido(id: string) {
    const pedidoData = await this.findById(id);

    if (!pedidoData) {
      this.logger.error('Erro ao confirmar pedido: Pedido não encontrado');
      throw new ValidationException(ValidationErrorType.PEDIDO_NOT_FOUND);
    }

    const pedido = new Pedido(pedidoData as any);
    pedido.updateStatus(PedidoStatus.CONFIRMADO);

    const pedidoAtualizado = await this.pedidoRepository.update(id, pedido);

    this.logger.log(
      `Pedido ${pedido.id} confirmado - Aguardando recebimento da cozinha`,
    );

    return pedidoAtualizado;
  }

  async receberPedidoConfirmado(id: string) {
    this.logger.log(`Iniciando recebimento do pedido confirmado: ${id}`);
    const pedidoData = await this.findById(id);

    if (!pedidoData) {
      this.logger.error(`Pedido ${id} não encontrado`);
      throw new ValidationException(ValidationErrorType.PEDIDO_NOT_FOUND);
    }

    const pedido = new Pedido(pedidoData as any);

    if (pedido.status !== PedidoStatus.CONFIRMADO) {
      this.logger.error(
        `Status inválido para recebimento. Esperado: ${PedidoStatus.CONFIRMADO}, Atual: ${pedido.status}`,
      );
      throw new ValidationException(ValidationErrorType.PEDIDO_INVALID_STATUS);
    }

    pedido.updateStatus(PedidoStatus.RECEBIDO);

    const pedidoAtualizado = await this.pedidoRepository.update(id, pedido);

    this.logger.log(`Pedido ${pedido.id} recebido pela cozinha`);

    return pedidoAtualizado;
  }

  async iniciarPreparacao(id: string) {
    this.logger.log(`Iniciando preparação do pedido: ${id}`);
    const pedidoData = await this.findById(id);

    if (!pedidoData) {
      this.logger.error(`Iniciar preparação: Pedido ${id} não encontrado`);
      throw new ValidationException(ValidationErrorType.PEDIDO_NOT_FOUND);
    }

    const pedido = new Pedido(pedidoData as any);
    pedido.updateStatus(PedidoStatus.PREPARANDO);

    this.logger.log(`Pedido ${pedido.id} em preparação`);

    return this.pedidoRepository.update(id, pedido);
  }

  async marcarComoPronto(id: string) {
    this.logger.log(`Iniciando marcação do pedido como pronto: ${id}`);
    const pedidoData = await this.findById(id);

    if (!pedidoData) {
      this.logger.error(`Marcar como pronto: Pedido ${id} não encontrado`);
      throw new ValidationException(ValidationErrorType.PEDIDO_NOT_FOUND);
    }

    const pedido = new Pedido(pedidoData as any);
    pedido.updateStatus(PedidoStatus.PRONTO);

    const pedidoAtualizado = await this.pedidoRepository.update(id, pedido);

    this.logger.log(`Pedido ${pedido.id} marcado como pronto`);

    return pedidoAtualizado;
  }

  async marcarComoEntregue(id: string) {
    this.logger.log(`Iniciando marcação do pedido como entregue: ${id}`);
    const pedidoData = await this.findById(id);

    if (!pedidoData) {
      this.logger.error(`Marcar como entregue: Pedido ${id} não encontrado`);
      throw new ValidationException(ValidationErrorType.PEDIDO_NOT_FOUND);
    }

    const pedido = new Pedido(pedidoData as any);
    pedido.updateStatus(PedidoStatus.ENTREGUE);

    const pedidoAtualizado = await this.pedidoRepository.update(id, pedido);

    this.logger.log(`Pedido ${pedido.id} marcado como entregue`);

    return pedidoAtualizado;
  }
}
