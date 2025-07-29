import { Test, TestingModule } from '@nestjs/testing';
import { ClienteUseCases } from './cliente.usecases';
import { ClienteRepository } from '../../infrastructure/persistence/repositories/cliente.repository';
import {
  CreateClienteDto,
  UpdateClienteDto,
} from '../../application/dto/cliente.dto';
import { ValidationException } from '../../domain/exceptions/validation.exception';
import { Cliente } from '../../domain/cliente/cliente.entity';

describe('ClienteUseCases', () => {
  let useCases: ClienteUseCases;
  let clienteRepository: jest.Mocked<ClienteRepository>;

  const mockClienteRepository = {
    save: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByCpf: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteByCpf: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClienteUseCases,
        {
          provide: ClienteRepository,
          useValue: mockClienteRepository,
        },
      ],
    }).compile();

    useCases = module.get<ClienteUseCases>(ClienteUseCases);
    clienteRepository = module.get(ClienteRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCases).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all clients', async () => {
      const expectedResult = [
        { id: '1', nome: 'João Silva', cpf: '12345678901' },
        { id: '2', nome: 'Maria Santos', cpf: '98765432100' },
      ];
      clienteRepository.findAll.mockResolvedValue(expectedResult as any);

      const result = await useCases.findAll();

      expect(clienteRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('create', () => {
    it('should create a new client successfully', async () => {
      const createDto: CreateClienteDto = {
        nome: 'João Silva',
        cpf: '11144477735', // Valid CPF
        email: 'joao@example.com',
        celular: '11999999999',
      };

      clienteRepository.findByCpf.mockResolvedValue(null);
      clienteRepository.save.mockResolvedValue({
        id: '1',
        ...createDto,
      } as any);

      const result = await useCases.create(createDto);

      expect(clienteRepository.findByCpf).toHaveBeenCalledWith('11144477735');
      expect(clienteRepository.save).toHaveBeenCalledWith(expect.any(Cliente));
      expect(result).toEqual({ id: '1', ...createDto });
    });

    it('should throw ValidationException when CPF already exists', async () => {
      const createDto: CreateClienteDto = {
        nome: 'João Silva',
        cpf: '11144477735', // Valid CPF
        email: 'joao@example.com',
        celular: '11999999999',
      };

      const existingClient = { id: '1', nome: 'Existing', cpf: '11144477735' };
      clienteRepository.findByCpf.mockResolvedValue(existingClient as any);

      await expect(useCases.create(createDto)).rejects.toThrow(
        ValidationException,
      );

      expect(clienteRepository.findByCpf).toHaveBeenCalledWith('11144477735');
      expect(clienteRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should find client by ID', async () => {
      const id = '123';
      const expectedResult = { id, nome: 'João Silva', cpf: '12345678901' };
      clienteRepository.findById.mockResolvedValue(expectedResult as any);

      const result = await useCases.findById(id);

      expect(clienteRepository.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findByCpf', () => {
    it('should find client by CPF', async () => {
      const cpf = '11144477735'; // Valid CPF
      const expectedResult = { id: '1', nome: 'João Silva', cpf };
      clienteRepository.findByCpf.mockResolvedValue(expectedResult as any);

      const result = await useCases.findByCpf(cpf);

      expect(clienteRepository.findByCpf).toHaveBeenCalledWith(cpf);
      expect(result).toEqual(expectedResult);
    });

    it('should throw ValidationException for invalid CPF', async () => {
      const invalidCpf = '12345678901'; // Invalid CPF

      await expect(useCases.findByCpf(invalidCpf)).rejects.toThrow(
        ValidationException,
      );
      expect(clienteRepository.findByCpf).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update client successfully', async () => {
      const id = '123';
      const updateDto: UpdateClienteDto = {
        nome: 'João Silva Updated',
        email: 'joao.updated@example.com',
      };

      const existingClient = {
        id,
        nome: 'João Silva',
        cpf: '11144477735',
        email: 'joao@example.com',
        celular: '11999999999',
      };

      // Mock the cliente that will be found
      clienteRepository.findById.mockResolvedValue(existingClient as any);

      const expectedResult = { id, ...updateDto };
      clienteRepository.update.mockResolvedValue(expectedResult as any);

      const result = await useCases.update(id, {
        ...updateDto,
        cpf: '11144477735',
      });

      expect(clienteRepository.findById).toHaveBeenCalledWith(id);
      expect(clienteRepository.update).toHaveBeenCalledWith(
        id,
        expect.any(Cliente),
      );
      expect(result).toEqual(expectedResult);
    });

    it('should throw ValidationException when client not found', async () => {
      const id = '123';
      const updateDto: UpdateClienteDto = {
        nome: 'João Silva Updated',
        email: 'joao.updated@example.com',
        cpf: '11144477735',
      };

      clienteRepository.findById.mockResolvedValue(null);

      await expect(useCases.update(id, updateDto)).rejects.toThrow(
        ValidationException,
      );
      expect(clienteRepository.findById).toHaveBeenCalledWith(id);
      expect(clienteRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ValidationException when trying to update CPF', async () => {
      const id = '123';
      const updateDto: UpdateClienteDto = {
        nome: 'João Silva Updated',
        email: 'joao.updated@example.com',
        cpf: '22288833396', // Different CPF
      };

      const existingClient = {
        id,
        nome: 'João Silva',
        cpf: '11144477735', // Original CPF
        email: 'joao@example.com',
        celular: '11999999999',
      };

      clienteRepository.findById.mockResolvedValue(existingClient as any);

      await expect(useCases.update(id, updateDto)).rejects.toThrow(
        ValidationException,
      );
      expect(clienteRepository.findById).toHaveBeenCalledWith(id);
      expect(clienteRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete client by ID', async () => {
      const id = '123';
      clienteRepository.delete.mockResolvedValue(undefined);

      await useCases.delete(id);

      expect(clienteRepository.delete).toHaveBeenCalledWith(id);
    });
  });

  describe('deleteByCpf', () => {
    it('should delete client by CPF', async () => {
      const cpf = '11144477735'; // Valid CPF
      clienteRepository.deleteByCpf.mockResolvedValue(undefined);

      await useCases.deleteByCpf(cpf);

      expect(clienteRepository.deleteByCpf).toHaveBeenCalledWith(cpf);
    });

    it('should throw ValidationException for invalid CPF', async () => {
      const invalidCpf = '12345678901'; // Invalid CPF

      await expect(useCases.deleteByCpf(invalidCpf)).rejects.toThrow(
        ValidationException,
      );
      expect(clienteRepository.deleteByCpf).not.toHaveBeenCalled();
    });
  });
});
