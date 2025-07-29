import { Test, TestingModule } from '@nestjs/testing';
import { ClienteService } from './cliente.service';
import { ClienteUseCases } from './cliente.usecases';
import {
  CreateClienteDto,
  UpdateClienteDto,
} from '../../application/dto/cliente.dto';

describe('ClienteService', () => {
  let service: ClienteService;
  let clienteUseCases: jest.Mocked<ClienteUseCases>;

  const mockClienteUseCases = {
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
      providers: [
        ClienteService,
        {
          provide: ClienteUseCases,
          useValue: mockClienteUseCases,
        },
      ],
    }).compile();

    service = module.get<ClienteService>(ClienteService);
    clienteUseCases = module.get(ClienteUseCases);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should call clienteUseCases.findAll', async () => {
      const expectedResult = [{ id: '1', nome: 'Test' }];
      clienteUseCases.findAll.mockResolvedValue(expectedResult as any);

      const result = await service.findAll();

      expect(clienteUseCases.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('create', () => {
    it('should call clienteUseCases.create with correct parameters', async () => {
      const createDto: CreateClienteDto = {
        nome: 'João Silva',
        cpf: '12345678901',
        email: 'joao@example.com',
        celular: '11999999999',
      };
      const expectedResult = { id: '1', ...createDto };
      clienteUseCases.create.mockResolvedValue(expectedResult as any);

      const result = await service.create(createDto);

      expect(clienteUseCases.create).toHaveBeenCalledWith(createDto);
      expect(clienteUseCases.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findById', () => {
    it('should call clienteUseCases.findById with correct id', async () => {
      const id = '123';
      const expectedResult = { id, nome: 'Test Cliente' };
      clienteUseCases.findById.mockResolvedValue(expectedResult as any);

      const result = await service.findById(id);

      expect(clienteUseCases.findById).toHaveBeenCalledWith(id);
      expect(clienteUseCases.findById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findByCpf', () => {
    it('should call clienteUseCases.findByCpf with correct cpf', async () => {
      const cpf = '12345678901';
      const expectedResult = { id: '1', cpf, nome: 'Test Cliente' };
      clienteUseCases.findByCpf.mockResolvedValue(expectedResult as any);

      const result = await service.findByCpf(cpf);

      expect(clienteUseCases.findByCpf).toHaveBeenCalledWith(cpf);
      expect(clienteUseCases.findByCpf).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should call clienteUseCases.update with correct parameters', async () => {
      const id = '123';
      const updateDto: UpdateClienteDto = {
        nome: 'João Silva Updated',
        email: 'joao.updated@example.com',
      };
      const expectedResult = { id, ...updateDto };
      clienteUseCases.update.mockResolvedValue(expectedResult as any);

      const result = await service.update(id, updateDto);

      expect(clienteUseCases.update).toHaveBeenCalledWith(id, updateDto);
      expect(clienteUseCases.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('delete', () => {
    it('should call clienteUseCases.delete with correct id', async () => {
      const id = '123';
      clienteUseCases.delete.mockResolvedValue(undefined);

      await service.delete(id);

      expect(clienteUseCases.delete).toHaveBeenCalledWith(id);
      expect(clienteUseCases.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteByCpf', () => {
    it('should call clienteUseCases.deleteByCpf with correct cpf', async () => {
      const cpf = '12345678901';
      clienteUseCases.deleteByCpf.mockResolvedValue(undefined);

      await service.deleteByCpf(cpf);

      expect(clienteUseCases.deleteByCpf).toHaveBeenCalledWith(cpf);
      expect(clienteUseCases.deleteByCpf).toHaveBeenCalledTimes(1);
    });
  });
});
