import { Test, TestingModule } from '@nestjs/testing';
import { PedidoController } from './pedido.api';
import { PedidoService } from '../../business/pedido/pedido.service';
import { CreatePedidoDTO } from '../dto/pedido.dto';
import { PedidoStatus } from '../../domain/pedido/pedido.types';

describe('PedidoController', () => {
  let controller: PedidoController;
  let pedidoService: jest.Mocked<PedidoService>;

  const mockPedidoService = {
    findAll: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    confirmarPedido: jest.fn(),
    iniciarPreparacao: jest.fn(),
    marcarComoPronto: jest.fn(),
    marcarComoEntregue: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PedidoController],
      providers: [
        {
          provide: PedidoService,
          useValue: mockPedidoService,
        },
      ],
    }).compile();

    controller = module.get<PedidoController>(PedidoController);
    pedidoService = module.get(PedidoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      const expectedResult = [
        { id: '1', status: PedidoStatus.PRONTO, preco: 50.0 },
        { id: '2', status: PedidoStatus.PREPARANDO, preco: 75.0 },
      ];
      pedidoService.findAll.mockResolvedValue(expectedResult as any);

      const result = await controller.findAll();

      expect(pedidoService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('create', () => {
    it('should create a new order without authorization', async () => {
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
      const expectedResult = { id: '1', ...createDto };
      pedidoService.create.mockResolvedValue(expectedResult as any);

      const result = await controller.create(createDto);

      expect(pedidoService.create).toHaveBeenCalledWith(createDto, undefined);
      expect(pedidoService.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should create a new order with authorization', async () => {
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
      const auth = 'Bearer token123';
      const expectedResult = { id: '1', ...createDto };
      pedidoService.create.mockResolvedValue(expectedResult as any);

      const result = await controller.create(createDto, auth);

      expect(pedidoService.create).toHaveBeenCalledWith(createDto, auth);
      expect(pedidoService.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findById', () => {
    it('should return an order by ID', async () => {
      const id = '123';
      const expectedResult = { id, status: PedidoStatus.PENDENTE, preco: 50.0 };
      pedidoService.findById.mockResolvedValue(expectedResult as any);

      const result = await controller.findById(id);

      expect(pedidoService.findById).toHaveBeenCalledWith(id);
      expect(pedidoService.findById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('orderConfirmation', () => {
    it('should confirm an order', async () => {
      const id = '123';
      const expectedResult = { id, status: PedidoStatus.CONFIRMADO };
      pedidoService.confirmarPedido.mockResolvedValue(expectedResult as any);

      const result = await controller.orderConfirmation(id);

      expect(pedidoService.confirmarPedido).toHaveBeenCalledWith(id);
      expect(pedidoService.confirmarPedido).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('markAsPreparing', () => {
    it('should mark an order as preparing', async () => {
      const id = '123';
      const expectedResult = { id, status: PedidoStatus.PREPARANDO };
      pedidoService.iniciarPreparacao.mockResolvedValue(expectedResult as any);

      const result = await controller.markAsPreparing(id);

      expect(pedidoService.iniciarPreparacao).toHaveBeenCalledWith(id);
      expect(pedidoService.iniciarPreparacao).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('markAsDone', () => {
    it('should mark an order as done', async () => {
      const id = '123';
      const expectedResult = { id, status: PedidoStatus.PRONTO };
      pedidoService.marcarComoPronto.mockResolvedValue(expectedResult as any);

      const result = await controller.markAsDone(id);

      expect(pedidoService.marcarComoPronto).toHaveBeenCalledWith(id);
      expect(pedidoService.marcarComoPronto).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('markAsDelivered', () => {
    it('should mark an order as delivered', async () => {
      const id = '123';
      const expectedResult = { id, status: PedidoStatus.ENTREGUE };
      pedidoService.marcarComoEntregue.mockResolvedValue(expectedResult as any);

      const result = await controller.markAsDelivered(id);

      expect(pedidoService.marcarComoEntregue).toHaveBeenCalledWith(id);
      expect(pedidoService.marcarComoEntregue).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });
});
