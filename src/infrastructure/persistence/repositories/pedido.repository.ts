import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Pedido } from '../../../domain/pedido/pedido.entity';
import { PedidoStatus } from '../../../domain/pedido/pedido.types';

@Injectable()
export class PedidoRepository {
  constructor(private prisma: PrismaService) {}

  async save(pedido: Pedido) {
    return this.prisma.pedido.create({
      data: {
        cliente_id: pedido.cliente_id,
        status: pedido.status,
        preco: pedido.preco,
        itens: {
          createMany: {
            data: pedido.itens.map((item) => ({
              produto_id: item.produto_id,
              quantidade: item.quantidade,
              preco_unitario: item.preco_unitario,
              observacao: item.observacao,
            })),
          },
        },
      },
      include: {
        itens: true,
      },
    });
  }

  async update(id: string, pedido: Pedido) {
    return this.prisma.pedido.update({
      where: { id },
      data: {
        status: pedido.status,
      },
    });
  }

  async findAll() {
    const statusOrder = {
      [PedidoStatus.PRONTO]: 1,
      [PedidoStatus.PREPARANDO]: 2,
      [PedidoStatus.RECEBIDO]: 3,
    };

    const pedidos = await this.prisma.pedido.findMany({
      include: {
        itens: true,
      },
      where: {
        status: {
          in: [
            PedidoStatus.RECEBIDO,
            PedidoStatus.PREPARANDO,
            PedidoStatus.PRONTO,
          ],
        },
      },
    });

    return pedidos.sort((prev, curr) => {
      const statusComparison =
        statusOrder[prev.status] - statusOrder[curr.status];
      if (statusComparison !== 0) return statusComparison;

      return (
        new Date(prev.created_at).getTime() -
        new Date(curr.created_at).getTime()
      );
    });
  }

  async findById(id: string) {
    return this.prisma.pedido.findUnique({
      where: { id },
      include: {
        itens: true,
      },
    });
  }

  async findByStatus(status: PedidoStatus, minutes: number) {
    const threshold = new Date(Date.now() - minutes * 60 * 1000);

    return this.prisma.pedido.findMany({
      where: { status, created_at: { lt: threshold } },
    });
  }
}
