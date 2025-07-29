import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { PedidoService } from './pedido.service';
import { PedidoUseCases } from './pedido.usecases';
import { RabbitmqService } from '../../infrastructure/messaging/rabbitmq.service';
import { CreatePedidoDTO } from '../../application/dto/pedido.dto';
import { PedidoStatus } from '../../domain/pedido/pedido.types';

describe('PedidoService', () => {
  let service: PedidoService;
  let pedidoUseCases: jest.Mocked<PedidoUseCases>;
  let rabbitmqService: jest.Mocked<RabbitmqService>;

  const mockPedidoUseCases = {
    findAll: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    confirmarPedido: jest.fn(),
    receberPedidoConfirmado: jest.fn(),
    iniciarPreparacao: jest.fn(),
    marcarComoPronto: jest.fn(),
    marcarComoEntregue: jest.fn(),
  };

  const mockRabbitmqService = {
    publishPedidoConfirmado: jest.fn(),
    publishPedidoRecebido: jest.fn(),
    publishPedidoPreparacao: jest.fn(),
    publishPedidoPronto: jest.fn(),
    publishPedidoEntregue: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PedidoService,
        {
          provide: PedidoUseCases,
          useValue: mockPedidoUseCases,
        },
        {
          provide: RabbitmqService,
          useValue: mockRabbitmqService,
        },
      ],
    }).compile();

    service = module.get<PedidoService>(PedidoService);
    pedidoUseCases = module.get(PedidoUseCases);
    rabbitmqService = module.get(RabbitmqService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should call pedidoUseCases.findAll', async () => {
      const expectedResult = [{ id: '1', status: PedidoStatus.PENDENTE }];
      pedidoUseCases.findAll.mockResolvedValue(expectedResult as any);

      const result = await service.findAll();

      expect(pedidoUseCases.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('create', () => {
    it('should call pedidoUseCases.create with correct parameters', async () => {
      const createDto: CreatePedidoDTO = {
        cliente_id: 'cliente-123',
        status: PedidoStatus.PENDENTE,
        itens: [
          {
            produto_id: 'produto-1',
            quantidade: 2,
            preco_unitario: 15.0,
            observacao: 'Sem cebola',
          },
        ],
      };
      const auth = 'Bearer token';
      const expectedResult = { id: '1', ...createDto };
      pedidoUseCases.create.mockResolvedValue(expectedResult as any);

      const result = await service.create(createDto, auth);

      expect(pedidoUseCases.create).toHaveBeenCalledWith(createDto, auth);
      expect(pedidoUseCases.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findById', () => {
    it('should call pedidoUseCases.findById with correct id', async () => {
      const id = '123';
      const expectedResult = { id, status: PedidoStatus.PENDENTE };
      pedidoUseCases.findById.mockResolvedValue(expectedResult as any);

      const result = await service.findById(id);

      expect(pedidoUseCases.findById).toHaveBeenCalledWith(id);
      expect(pedidoUseCases.findById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('confirmarPedido', () => {
    it('should confirm pedido and publish message successfully', async () => {
      const pedidoId = 'pedido-123';
      const mockPedido = {
        id: pedidoId,
        cliente_id: 'cliente-456',
        status: PedidoStatus.CONFIRMADO,
        preco: 50.0,
        itens: [
          {
            produto_id: 'produto-1',
            quantidade: 2,
            preco_unitario: 15.0,
            observacao: 'Sem cebola',
          },
        ],
      };

      pedidoUseCases.confirmarPedido.mockResolvedValue(mockPedido as any);
      pedidoUseCases.findById.mockResolvedValue(mockPedido as any);
      rabbitmqService.publishPedidoConfirmado.mockResolvedValue(undefined);

      const result = await service.confirmarPedido(pedidoId);

      expect(pedidoUseCases.confirmarPedido).toHaveBeenCalledWith(pedidoId);
      expect(pedidoUseCases.findById).toHaveBeenCalledWith(pedidoId);
      expect(rabbitmqService.publishPedidoConfirmado).toHaveBeenCalledWith({
        pedido_id: pedidoId,
        cliente_id: 'cliente-456',
        itens: mockPedido.itens,
        valor_total: 50.0,
      });
      expect(result).toEqual(mockPedido);
    });

    it('should handle messaging error gracefully', async () => {
      const pedidoId = 'pedido-123';
      const mockPedido = {
        id: pedidoId,
        cliente_id: 'cliente-456',
        status: PedidoStatus.CONFIRMADO,
        preco: 50.0,
        itens: [],
      };

      pedidoUseCases.confirmarPedido.mockResolvedValue(mockPedido as any);
      pedidoUseCases.findById.mockResolvedValue(mockPedido as any);
      rabbitmqService.publishPedidoConfirmado.mockRejectedValue(
        new Error('RabbitMQ error'),
      );

      const loggerSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();

      const result = await service.confirmarPedido(pedidoId);

      expect(result).toEqual(mockPedido);
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Erro ao publicar mensagem de pedido confirmado',
        ),
      );

      loggerSpy.mockRestore();
    });
  });

  describe('receberPedidoConfirmado', () => {
    it('should receive pedido and publish message successfully', async () => {
      const pedidoId = 'pedido-123';
      const mockPedido = {
        id: pedidoId,
        cliente_id: 'cliente-456',
        status: PedidoStatus.RECEBIDO,
        preco: 50.0,
        itens: [
          {
            produto_id: 'produto-1',
            quantidade: 2,
            preco_unitario: 15.0,
            observacao: 'Sem cebola',
          },
        ],
      };

      pedidoUseCases.receberPedidoConfirmado.mockResolvedValue(
        mockPedido as any,
      );
      pedidoUseCases.findById.mockResolvedValue(mockPedido as any);
      rabbitmqService.publishPedidoRecebido.mockResolvedValue(undefined);

      const result = await service.receberPedidoConfirmado(pedidoId);

      expect(pedidoUseCases.receberPedidoConfirmado).toHaveBeenCalledWith(
        pedidoId,
      );
      expect(pedidoUseCases.findById).toHaveBeenCalledWith(pedidoId);
      expect(rabbitmqService.publishPedidoRecebido).toHaveBeenCalledWith({
        pedido_id: pedidoId,
        cliente_id: 'cliente-456',
        itens: mockPedido.itens,
        valor_total: 50.0,
      });
      expect(result).toEqual(mockPedido);
    });

    it('should handle messaging error gracefully', async () => {
      const pedidoId = 'pedido-123';
      const mockPedido = {
        id: pedidoId,
        cliente_id: 'cliente-456',
        status: PedidoStatus.RECEBIDO,
        preco: 50.0,
        itens: [],
      };

      pedidoUseCases.receberPedidoConfirmado.mockResolvedValue(
        mockPedido as any,
      );
      pedidoUseCases.findById.mockResolvedValue(mockPedido as any);
      rabbitmqService.publishPedidoRecebido.mockRejectedValue(
        new Error('RabbitMQ error'),
      );

      const loggerSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();

      const result = await service.receberPedidoConfirmado(pedidoId);

      expect(result).toEqual(mockPedido);
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Erro ao publicar mensagem de pedido recebido'),
      );

      loggerSpy.mockRestore();
    });
  });

  describe('iniciarPreparacao', () => {
    it('should start preparation and publish message successfully', async () => {
      const pedidoId = 'pedido-123';
      const mockPedido = {
        id: pedidoId,
        status: PedidoStatus.PREPARANDO,
      };

      pedidoUseCases.iniciarPreparacao.mockResolvedValue(mockPedido as any);
      rabbitmqService.publishPedidoPreparacao.mockResolvedValue(undefined);

      const result = await service.iniciarPreparacao(pedidoId);

      expect(pedidoUseCases.iniciarPreparacao).toHaveBeenCalledWith(pedidoId);
      expect(rabbitmqService.publishPedidoPreparacao).toHaveBeenCalledWith(
        pedidoId,
      );
      expect(result).toEqual(mockPedido);
    });

    it('should handle messaging error gracefully', async () => {
      const pedidoId = 'pedido-123';
      const mockPedido = {
        id: pedidoId,
        status: PedidoStatus.PREPARANDO,
      };

      pedidoUseCases.iniciarPreparacao.mockResolvedValue(mockPedido as any);
      rabbitmqService.publishPedidoPreparacao.mockRejectedValue(
        new Error('RabbitMQ error'),
      );

      const loggerSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();

      const result = await service.iniciarPreparacao(pedidoId);

      expect(result).toEqual(mockPedido);
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Erro ao publicar mensagem de pedido em preparação',
        ),
      );

      loggerSpy.mockRestore();
    });
  });

  describe('marcarComoPronto', () => {
    it('should mark as ready and publish message successfully', async () => {
      const pedidoId = 'pedido-123';
      const mockPedido = {
        id: pedidoId,
        status: PedidoStatus.PRONTO,
      };

      pedidoUseCases.marcarComoPronto.mockResolvedValue(mockPedido as any);
      rabbitmqService.publishPedidoPronto.mockResolvedValue(undefined);

      const result = await service.marcarComoPronto(pedidoId);

      expect(pedidoUseCases.marcarComoPronto).toHaveBeenCalledWith(pedidoId);
      expect(rabbitmqService.publishPedidoPronto).toHaveBeenCalledWith(
        pedidoId,
      );
      expect(result).toEqual(mockPedido);
    });

    it('should handle messaging error gracefully', async () => {
      const pedidoId = 'pedido-123';
      const mockPedido = {
        id: pedidoId,
        status: PedidoStatus.PRONTO,
      };

      pedidoUseCases.marcarComoPronto.mockResolvedValue(mockPedido as any);
      rabbitmqService.publishPedidoPronto.mockRejectedValue(
        new Error('RabbitMQ error'),
      );

      const loggerSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();

      const result = await service.marcarComoPronto(pedidoId);

      expect(result).toEqual(mockPedido);
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Erro ao publicar mensagem de pedido pronto'),
      );

      loggerSpy.mockRestore();
    });
  });

  describe('marcarComoEntregue', () => {
    it('should mark as delivered and publish message successfully', async () => {
      const pedidoId = 'pedido-123';
      const mockPedido = {
        id: pedidoId,
        status: PedidoStatus.ENTREGUE,
      };

      pedidoUseCases.marcarComoEntregue.mockResolvedValue(mockPedido as any);
      rabbitmqService.publishPedidoEntregue.mockResolvedValue(undefined);

      const result = await service.marcarComoEntregue(pedidoId);

      expect(pedidoUseCases.marcarComoEntregue).toHaveBeenCalledWith(pedidoId);
      expect(rabbitmqService.publishPedidoEntregue).toHaveBeenCalledWith(
        pedidoId,
      );
      expect(result).toEqual(mockPedido);
    });

    it('should handle messaging error gracefully', async () => {
      const pedidoId = 'pedido-123';
      const mockPedido = {
        id: pedidoId,
        status: PedidoStatus.ENTREGUE,
      };

      pedidoUseCases.marcarComoEntregue.mockResolvedValue(mockPedido as any);
      rabbitmqService.publishPedidoEntregue.mockRejectedValue(
        new Error('RabbitMQ error'),
      );

      const loggerSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();

      const result = await service.marcarComoEntregue(pedidoId);

      expect(result).toEqual(mockPedido);
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Erro ao publicar mensagem de pedido entregue'),
      );

      loggerSpy.mockRestore();
    });
  });
});
