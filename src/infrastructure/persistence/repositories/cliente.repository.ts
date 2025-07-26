import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cliente } from '../../../domain/cliente/cliente.entity';

@Injectable()
export class ClienteRepository {
  constructor(private prisma: PrismaService) {}

  async save(cliente: Cliente) {
    return this.prisma.cliente.create({
      data: {
        nome: cliente.nome,
        email: cliente.email,
        celular: cliente.celular,
        cpf: cliente.cpf,
      },
    });
  }

  async update(id: string, cliente: Cliente) {
    return this.prisma.cliente.update({
      where: { id },
      data: {
        nome: cliente.nome,
        email: cliente.email,
        celular: cliente.celular,
      },
    });
  }

  async findAll() {
    return this.prisma.cliente.findMany();
  }

  async findById(id: string) {
    return this.prisma.cliente.findUnique({
      where: { id },
    });
  }

  async findByCpf(cpf: string) {
    return this.prisma.cliente.findFirst({
      where: { cpf },
    });
  }

  async delete(id: string) {
    return this.prisma.cliente.delete({
      where: { id },
    });
  }

  async deleteByCpf(cpf: string) {
    return this.prisma.cliente.delete({
      where: { cpf },
    });
  }
}
