import { Injectable } from '@nestjs/common';
import {
  CreateClienteDto,
  UpdateClienteDto,
} from '../../application/dto/cliente.dto';
import { ClienteUseCases } from './cliente.usecases';

@Injectable()
export class ClienteService {
  constructor(private clienteUseCases: ClienteUseCases) {}

  async findAll() {
    return this.clienteUseCases.findAll();
  }

  async create(dados: CreateClienteDto) {
    return this.clienteUseCases.create(dados);
  }

  async findById(id: string) {
    return this.clienteUseCases.findById(id);
  }

  async findByCpf(cpf: string) {
    return this.clienteUseCases.findByCpf(cpf);
  }

  async update(id: string, dados: UpdateClienteDto) {
    return this.clienteUseCases.update(id, dados);
  }

  async delete(id: string) {
    return this.clienteUseCases.delete(id);
  }

  async deleteByCpf(cpf: string) {
    return this.clienteUseCases.deleteByCpf(cpf);
  }
}
