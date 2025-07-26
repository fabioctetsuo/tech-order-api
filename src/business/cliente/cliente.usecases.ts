import { Injectable } from '@nestjs/common';
import { Cliente } from '../../domain/cliente/cliente.entity';
import { ClienteRepository } from '../../infrastructure/persistence/repositories/cliente.repository';
import {
  CreateClienteDto,
  UpdateClienteDto,
} from '../../application/dto/cliente.dto';
import {
  ValidationException,
  ValidationErrorType,
} from '../../domain/exceptions/validation.exception';
import { validateCPF } from '../../utils/cpf.utils';

@Injectable()
export class ClienteUseCases {
  constructor(private clienteRepository: ClienteRepository) {}

  private async validateCliente(dados: CreateClienteDto) {
    const cpf = dados.cpf;

    const existingCliente = await this.findByCpf(cpf);

    if (existingCliente) {
      throw new ValidationException(ValidationErrorType.CPF_ALREADY_EXISTS);
    }
  }

  async create(dados: CreateClienteDto) {
    await this.validateCliente(dados);
    const cliente = new Cliente(dados as unknown as Partial<Cliente>);
    return this.clienteRepository.save(cliente);
  }

  async update(id: string, dados: UpdateClienteDto) {
    const cliente = await this.findById(id);

    if (!cliente) {
      throw new ValidationException(ValidationErrorType.CLIENTE_NOT_FOUND);
    }

    if (cliente.cpf !== dados.cpf) {
      throw new ValidationException(ValidationErrorType.UPDATE_CPF_NOT_ALLOWED);
    }

    const { id: _, ...updateData } = dados;

    const updatedCliente = new Cliente(updateData as Partial<Cliente>);

    return this.clienteRepository.update(id, updatedCliente);
  }

  async findAll() {
    return this.clienteRepository.findAll();
  }

  async findById(id: string) {
    return this.clienteRepository.findById(id);
  }

  async findByCpf(cpf: string) {
    if (!validateCPF(cpf)) {
      throw new ValidationException(ValidationErrorType.INVALID_CPF);
    }

    return this.clienteRepository.findByCpf(cpf);
  }

  async delete(id: string) {
    return this.clienteRepository.delete(id);
  }

  async deleteByCpf(cpf: string) {
    if (!validateCPF(cpf)) {
      throw new ValidationException(ValidationErrorType.INVALID_CPF);
    }

    return this.clienteRepository.deleteByCpf(cpf);
  }
}
