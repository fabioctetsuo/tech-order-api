import { Test, TestingModule } from '@nestjs/testing';
import { ClienteController } from './cliente.api';
import { ClienteService } from '../../business/cliente/cliente.service';
import { CreateClienteDto, UpdateClienteDto } from '../dto/cliente.dto';

describe('ClienteController', () => {
  let controller: ClienteController;
  let clienteService: jest.Mocked<ClienteService>;

  const mockClienteService = {
    findAll: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByCpf: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteByCpf: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClienteController],
      providers: [
        {
          provide: ClienteService,
          useValue: mockClienteService,
        },
      ],
    }).compile();

    controller = module.get<ClienteController>(ClienteController);
    clienteService = module.get(ClienteService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all clients', async () => {
      const expectedResult = [
        { id: '1', nome: 'João Silva', cpf: '12345678901' },
        { id: '2', nome: 'Maria Santos', cpf: '98765432100' },
      ];
      clienteService.findAll.mockResolvedValue(expectedResult as any);

      const result = await controller.findAll();

      expect(clienteService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('create', () => {
    it('should create a new client', async () => {
      const createDto: CreateClienteDto = {
        nome: 'João Silva',
        cpf: '12345678901',
        email: 'joao@example.com',
        celular: '11999999999',
      };
      const expectedResult = { id: '1', ...createDto };
      clienteService.create.mockResolvedValue(expectedResult as any);

      const result = await controller.create(createDto);

      expect(clienteService.create).toHaveBeenCalledWith(createDto);
      expect(clienteService.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findById', () => {
    it('should return a client by ID', async () => {
      const id = '123';
      const expectedResult = { id, nome: 'João Silva', cpf: '12345678901' };
      clienteService.findById.mockResolvedValue(expectedResult as any);

      const result = await controller.findById(id);

      expect(clienteService.findById).toHaveBeenCalledWith(id);
      expect(clienteService.findById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findByCpf', () => {
    it('should return a client by CPF', async () => {
      const cpf = '12345678901';
      const expectedResult = { id: '1', nome: 'João Silva', cpf };
      clienteService.findByCpf.mockResolvedValue(expectedResult as any);

      const result = await controller.findByCpf(cpf);

      expect(clienteService.findByCpf).toHaveBeenCalledWith(cpf);
      expect(clienteService.findByCpf).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a client', async () => {
      const id = '123';
      const updateDto: UpdateClienteDto = {
        nome: 'João Silva Updated',
        email: 'joao.updated@example.com',
      };
      const expectedResult = { id, ...updateDto };
      clienteService.update.mockResolvedValue(expectedResult as any);

      const result = await controller.update(id, updateDto);

      expect(clienteService.update).toHaveBeenCalledWith(id, updateDto);
      expect(clienteService.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('delete', () => {
    it('should delete a client by ID', async () => {
      const id = '123';
      clienteService.delete.mockResolvedValue(undefined);

      await controller.delete(id);

      expect(clienteService.delete).toHaveBeenCalledWith(id);
      expect(clienteService.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteByCpf', () => {
    it('should delete a client by CPF', async () => {
      const cpf = '12345678901';
      clienteService.deleteByCpf.mockResolvedValue(undefined);

      await controller.deleteByCpf(cpf);

      expect(clienteService.deleteByCpf).toHaveBeenCalledWith(cpf);
      expect(clienteService.deleteByCpf).toHaveBeenCalledTimes(1);
    });
  });
});
