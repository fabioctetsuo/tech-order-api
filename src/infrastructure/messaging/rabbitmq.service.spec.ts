import { Test, TestingModule } from '@nestjs/testing';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { RabbitmqService } from './rabbitmq.service';

describe('RabbitmqService', () => {
  let service: RabbitmqService;
  let amqpConnection: jest.Mocked<AmqpConnection>;

  const mockAmqpConnection = {
    publish: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RabbitmqService,
        {
          provide: AmqpConnection,
          useValue: mockAmqpConnection,
        },
      ],
    }).compile();

    service = module.get<RabbitmqService>(RabbitmqService);
    amqpConnection = module.get(AmqpConnection);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('publishPedidoConfirmado', () => {
    it('should publish pedido confirmado message', async () => {
      const pedidoData = {
        pedido_id: 'pedido-123',
        cliente_id: 'cliente-456',
        itens: [
          {
            produto_id: 'produto-1',
            quantidade: 2,
            preco_unitario: 15.0,
            observacao: 'Sem cebola',
          },
        ],
        valor_total: 30.0,
      };

      amqpConnection.publish.mockResolvedValue(undefined);

      await service.publishPedidoConfirmado(pedidoData);

      expect(amqpConnection.publish).toHaveBeenCalledWith(
        'pedido.exchange',
        'pedido.status.confirmado',
        expect.objectContaining({
          ...pedidoData,
          timestamp: expect.any(String) as string,
        }),
      );
      expect(amqpConnection.publish).toHaveBeenCalledTimes(1);
    });
  });

  describe('publishPedidoRecebido', () => {
    it('should publish pedido recebido message', async () => {
      const pedidoData = {
        pedido_id: 'pedido-123',
        cliente_id: 'cliente-456',
        itens: [
          {
            produto_id: 'produto-1',
            quantidade: 2,
            preco_unitario: 15.0,
            observacao: 'Sem cebola',
          },
        ],
        valor_total: 30.0,
      };

      amqpConnection.publish.mockResolvedValue(undefined);

      await service.publishPedidoRecebido(pedidoData);

      expect(amqpConnection.publish).toHaveBeenCalledWith(
        'pedido.exchange',
        'pedido.status.recebido',
        expect.objectContaining({
          ...pedidoData,
          timestamp: expect.any(String) as string,
        }),
      );
      expect(amqpConnection.publish).toHaveBeenCalledTimes(1);
    });
  });

  describe('publishPedidoPreparacao', () => {
    it('should publish pedido preparacao message', async () => {
      const pedidoId = 'pedido-123';

      amqpConnection.publish.mockResolvedValue(undefined);

      await service.publishPedidoPreparacao(pedidoId);

      expect(amqpConnection.publish).toHaveBeenCalledWith(
        'pedido.exchange',
        'pedido.status.preparacao',
        expect.objectContaining({
          pedido_id: pedidoId,
          timestamp: expect.any(String) as string,
        }),
      );
      expect(amqpConnection.publish).toHaveBeenCalledTimes(1);
    });
  });

  describe('publishPedidoPronto', () => {
    it('should publish pedido pronto message', async () => {
      const pedidoId = 'pedido-123';

      amqpConnection.publish.mockResolvedValue(undefined);

      await service.publishPedidoPronto(pedidoId);

      expect(amqpConnection.publish).toHaveBeenCalledWith(
        'pedido.exchange',
        'pedido.status.pronto',
        expect.objectContaining({
          pedido_id: pedidoId,
          timestamp: expect.any(String) as string,
        }),
      );
      expect(amqpConnection.publish).toHaveBeenCalledTimes(1);
    });
  });

  describe('publishPedidoEntregue', () => {
    it('should publish pedido entregue message', async () => {
      const pedidoId = 'pedido-123';

      amqpConnection.publish.mockResolvedValue(undefined);

      await service.publishPedidoEntregue(pedidoId);

      expect(amqpConnection.publish).toHaveBeenCalledWith(
        'pedido.exchange',
        'pedido.status.entregue',
        expect.objectContaining({
          pedido_id: pedidoId,
          timestamp: expect.any(String) as string,
        }),
      );
      expect(amqpConnection.publish).toHaveBeenCalledTimes(1);
    });
  });
});
