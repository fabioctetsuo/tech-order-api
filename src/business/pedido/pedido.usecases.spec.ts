import { Test, TestingModule } from '@nestjs/testing';
import { PedidoUseCases } from './pedido.usecases';
import { PedidoRepository } from '../../infrastructure/persistence/repositories/pedido.repository';
import { RabbitmqService } from '../../infrastructure/messaging/rabbitmq.service';
import { ClienteUseCases } from '../cliente/cliente.usecases';
import { CreatePedidoDTO } from '../../application/dto/pedido.dto';
import { PedidoStatus } from '../../domain/pedido/pedido.types';
import { Pedido } from '../../domain/pedido/pedido.entity';

describe('PedidoUseCases', () => {
  let useCases: PedidoUseCases;
  let pedidoRepository: jest.Mocked<PedidoRepository>;
  let clienteUseCases: jest.Mocked<ClienteUseCases>;
  let rabbitmqService: jest.Mocked<RabbitmqService>;

  const mockPedidoRepository = {
    findAll: jest.fn(),
    save: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockClienteUseCases = {
    findAll: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByCpf: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteByCpf: jest.fn(),
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
        PedidoUseCases,
        {
          provide: PedidoRepository,
          useValue: mockPedidoRepository,
        },
        {
          provide: ClienteUseCases,
          useValue: mockClienteUseCases,
        },
        {
          provide: RabbitmqService,
          useValue: mockRabbitmqService,
        },
      ],
    }).compile();

    useCases = module.get<PedidoUseCases>(PedidoUseCases);
    pedidoRepository = module.get(PedidoRepository);
    clienteUseCases = module.get(ClienteUseCases);
    rabbitmqService = module.get(RabbitmqService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCases).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all pedidos', async () => {
      const expectedResult = [
        { id: '1', status: PedidoStatus.PRONTO, preco: 50.0 },
        { id: '2', status: PedidoStatus.PREPARANDO, preco: 75.0 },
      ];
      pedidoRepository.findAll.mockResolvedValue(expectedResult as any);

      const result = await useCases.findAll();

      expect(pedidoRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('create', () => {
    it('should create a new pedido without auth token', async () => {
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
      pedidoRepository.save.mockResolvedValue(expectedResult as any);

      const result = await useCases.create(createDto, undefined);

      expect(pedidoRepository.save).toHaveBeenCalledWith(expect.any(Pedido));
      expect(result).toEqual(expectedResult);
    });

    it('should throw ValidationException when no items provided', async () => {
      const createDto: CreatePedidoDTO = {
        cliente_id: 'cliente-123',
        status: PedidoStatus.PENDENTE,
        itens: [],
      };

      await expect(useCases.create(createDto, undefined)).rejects.toThrow();
      expect(pedidoRepository.save).not.toHaveBeenCalled();
    });

    it('should create pedido with auth token and valid client', async () => {
      const createDto: CreatePedidoDTO = {
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
      const mockClient = { id: 'cliente-123', cpf: '11144477735' };
      const mockToken =
        'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjcGYiOiIxMTE0NDQ3NzczNSJ9.test';

      clienteUseCases.findByCpf.mockResolvedValue(mockClient as any);
      pedidoRepository.save.mockResolvedValue({ id: '1', ...createDto } as any);

      const result = await useCases.create(createDto, mockToken);

      expect(clienteUseCases.findByCpf).toHaveBeenCalledWith('11144477735');
      expect(pedidoRepository.save).toHaveBeenCalledWith(expect.any(Pedido));
      expect(result).toBeDefined();
    });

    it('should throw ValidationException when client not found with auth token', async () => {
      const createDto: CreatePedidoDTO = {
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
      const mockToken =
        'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjcGYiOiIxMTE0NDQ3NzczNSJ9.test';

      clienteUseCases.findByCpf.mockResolvedValue(null);

      await expect(useCases.create(createDto, mockToken)).rejects.toThrow();
      expect(clienteUseCases.findByCpf).toHaveBeenCalledWith('11144477735');
      expect(pedidoRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ValidationException when token is invalid', async () => {
      const createDto: CreatePedidoDTO = {
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
      const invalidToken = 'Bearer invalid-token';

      await expect(useCases.create(createDto, invalidToken)).rejects.toThrow();
      expect(pedidoRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should find pedido by ID', async () => {
      const id = '123';
      const expectedResult = { id, status: PedidoStatus.PENDENTE, preco: 50.0 };
      pedidoRepository.findById.mockResolvedValue(expectedResult as any);

      const result = await useCases.findById(id);

      expect(pedidoRepository.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });

    it('should throw ValidationException when pedido not found', async () => {
      const id = '123';
      pedidoRepository.findById.mockResolvedValue(null);

      await expect(useCases.findById(id)).rejects.toThrow();
      expect(pedidoRepository.findById).toHaveBeenCalledWith(id);
    });
  });

  describe('receberPedidoConfirmado', () => {
    it('should throw ValidationException when pedido not found', async () => {
      const id = '123';
      jest
        .spyOn(useCases, 'findById')
        .mockRejectedValue(new Error('Pedido não encontrado'));

      await expect(useCases.receberPedidoConfirmado(id)).rejects.toThrow();
    });

    it('should throw ValidationException when pedido status is invalid', async () => {
      const id = '123';
      const mockPedido = { id, status: PedidoStatus.PENDENTE };
      jest.spyOn(useCases, 'findById').mockResolvedValue(mockPedido as any);

      await expect(useCases.receberPedidoConfirmado(id)).rejects.toThrow();
    });

    it('should successfully receive confirmed pedido', async () => {
      const id = '123';
      const mockPedido = { id, status: PedidoStatus.CONFIRMADO };
      const updatedPedido = { id, status: PedidoStatus.RECEBIDO };

      jest.spyOn(useCases, 'findById').mockResolvedValue(mockPedido as any);
      pedidoRepository.update.mockResolvedValue(updatedPedido as any);

      const result = await useCases.receberPedidoConfirmado(id);

      expect(pedidoRepository.update).toHaveBeenCalledWith(
        id,
        expect.any(Pedido),
      );
      expect(result).toEqual(updatedPedido);
    });
  });

  describe('confirmarPedido', () => {
    it('should confirm pedido successfully', async () => {
      const id = '123';
      const mockPedidoData = {
        id,
        status: PedidoStatus.PENDENTE,
      };

      pedidoRepository.findById.mockResolvedValue(mockPedidoData as any);
      pedidoRepository.update.mockResolvedValue({
        ...mockPedidoData,
        status: PedidoStatus.CONFIRMADO,
      } as any);

      await useCases.confirmarPedido(id);

      expect(pedidoRepository.findById).toHaveBeenCalledWith(id);
      expect(pedidoRepository.update).toHaveBeenCalledWith(
        id,
        expect.any(Object),
      );
    });
  });

  describe('receberPedidoConfirmado', () => {
    it('should mark pedido as received successfully', async () => {
      const id = '123';
      const mockPedidoData = {
        id,
        status: PedidoStatus.CONFIRMADO,
      };

      pedidoRepository.findById.mockResolvedValue(mockPedidoData as any);
      pedidoRepository.update.mockResolvedValue({
        ...mockPedidoData,
        status: PedidoStatus.RECEBIDO,
      } as any);

      await useCases.receberPedidoConfirmado(id);

      expect(pedidoRepository.findById).toHaveBeenCalledWith(id);
      expect(pedidoRepository.update).toHaveBeenCalledWith(
        id,
        expect.any(Object),
      );
    });
  });

  describe('iniciarPreparacao', () => {
    it('should start preparation successfully', async () => {
      const id = '123';
      const mockPedidoData = {
        id,
        status: PedidoStatus.RECEBIDO,
      };

      pedidoRepository.findById.mockResolvedValue(mockPedidoData as any);
      pedidoRepository.update.mockResolvedValue({
        ...mockPedidoData,
        status: PedidoStatus.PREPARANDO,
      } as any);

      await useCases.iniciarPreparacao(id);

      expect(pedidoRepository.findById).toHaveBeenCalledWith(id);
      expect(pedidoRepository.update).toHaveBeenCalledWith(
        id,
        expect.any(Object),
      );
    });
  });

  describe('marcarComoPronto', () => {
    it('should mark pedido as ready successfully', async () => {
      const id = '123';
      const mockPedidoData = {
        id,
        status: PedidoStatus.PREPARANDO,
      };

      pedidoRepository.findById.mockResolvedValue(mockPedidoData as any);
      pedidoRepository.update.mockResolvedValue({
        ...mockPedidoData,
        status: PedidoStatus.PRONTO,
      } as any);

      await useCases.marcarComoPronto(id);

      expect(pedidoRepository.findById).toHaveBeenCalledWith(id);
      expect(pedidoRepository.update).toHaveBeenCalledWith(
        id,
        expect.any(Object),
      );
    });
  });

  describe('marcarComoEntregue', () => {
    it('should mark pedido as delivered successfully', async () => {
      const id = '123';
      const mockPedidoData = {
        id,
        status: PedidoStatus.PRONTO,
      };

      pedidoRepository.findById.mockResolvedValue(mockPedidoData as any);
      pedidoRepository.update.mockResolvedValue({
        ...mockPedidoData,
        status: PedidoStatus.ENTREGUE,
      } as any);

      await useCases.marcarComoEntregue(id);

      expect(pedidoRepository.findById).toHaveBeenCalledWith(id);
      expect(pedidoRepository.update).toHaveBeenCalledWith(
        id,
        expect.any(Object),
      );
    });
  });
});
