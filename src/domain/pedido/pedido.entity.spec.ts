import { Pedido } from './pedido.entity';
import { PedidoStatus } from './pedido.types';
import { ItemPedido } from './item-pedido.entity';

describe('Pedido Entity', () => {
  describe('Constructor', () => {
    it('should create a pedido with all properties', () => {
      const now = new Date();
      const pedidoData = {
        id: 'pedido-123',
        cliente_id: 'cliente-456',
        status: PedidoStatus.PENDENTE,
        preco: 50.0,
        created_at: now,
        updated_at: now,
        itens: [],
      };

      const pedido = new Pedido(pedidoData);

      expect(pedido.id).toBe('pedido-123');
      expect(pedido.cliente_id).toBe('cliente-456');
      expect(pedido.status).toBe(PedidoStatus.PENDENTE);
      expect(pedido.preco).toBe(50.0);
      expect(pedido.created_at).toBe(now);
      expect(pedido.updated_at).toBe(now);
      expect(pedido.itens).toEqual([]);
    });

    it('should create a pedido with minimal properties', () => {
      const pedido = new Pedido({
        status: PedidoStatus.PENDENTE,
      });

      expect(pedido.status).toBe(PedidoStatus.PENDENTE);
      expect(pedido.id).toBeUndefined();
      expect(pedido.cliente_id).toBeUndefined();
      expect(pedido.preco).toBeUndefined();
    });
  });

  describe('setItens', () => {
    it('should set items and recalculate total price', () => {
      const pedido = new Pedido({ status: PedidoStatus.PENDENTE });

      const items = [
        new ItemPedido({
          pedido_id: 'pedido-123',
          produto_id: 'produto-1',
          quantidade: 2,
          preco_unitario: 15.0,
        }),
        new ItemPedido({
          pedido_id: 'pedido-123',
          produto_id: 'produto-2',
          quantidade: 1,
          preco_unitario: 25.5,
        }),
      ];

      pedido.setItens(items);

      expect(pedido.itens).toEqual(items);
      expect(pedido.preco).toBe(55.5); // (2 * 15.00) + (1 * 25.50)
    });
  });

  describe('addItem', () => {
    it('should add item and recalculate total', () => {
      const pedido = new Pedido({ status: PedidoStatus.PENDENTE });
      pedido.setItens([]);

      const newItem = new ItemPedido({
        pedido_id: 'pedido-123',
        produto_id: 'produto-1',
        quantidade: 3,
        preco_unitario: 10.0,
      });

      pedido.addItem(newItem);

      expect(pedido.itens).toHaveLength(1);
      expect(pedido.itens[0]).toBe(newItem);
      expect(pedido.preco).toBe(30.0);
    });
  });

  describe('removeItem', () => {
    it('should remove item by id and recalculate total', () => {
      const pedido = new Pedido({ status: PedidoStatus.PENDENTE });

      const item1 = new ItemPedido({
        id: 'item-1',
        pedido_id: 'pedido-123',
        produto_id: 'produto-1',
        quantidade: 2,
        preco_unitario: 15.0,
      });

      const item2 = new ItemPedido({
        id: 'item-2',
        pedido_id: 'pedido-123',
        produto_id: 'produto-2',
        quantidade: 1,
        preco_unitario: 25.5,
      });

      pedido.setItens([item1, item2]);
      expect(pedido.preco).toBe(55.5);

      pedido.removeItem('item-1');

      expect(pedido.itens).toHaveLength(1);
      expect(pedido.itens[0]).toBe(item2);
      expect(pedido.preco).toBe(25.5);
    });
  });

  describe('updateStatus', () => {
    it('should update status and set updated_at', () => {
      const pedido = new Pedido({ status: PedidoStatus.PENDENTE });
      const beforeUpdate = new Date();

      pedido.updateStatus(PedidoStatus.CONFIRMADO);

      expect(pedido.status).toBe(PedidoStatus.CONFIRMADO);
      expect(pedido.updated_at).toBeInstanceOf(Date);
      expect(pedido.updated_at.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
    });
  });

  describe('getTempoPreparo', () => {
    it('should calculate preparation time for active orders', () => {
      const createdAt = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
      const pedido = new Pedido({
        status: PedidoStatus.PREPARANDO,
        created_at: createdAt,
      });

      const tempoPreparo = pedido.getTempoPreparo();

      expect(tempoPreparo).toBeGreaterThan(25 * 60 * 1000); // At least 25 minutes
      expect(tempoPreparo).toBeLessThan(35 * 60 * 1000); // Less than 35 minutes
    });

    it('should return 0 for finished orders', () => {
      const pedido = new Pedido({
        status: PedidoStatus.ENTREGUE,
        created_at: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      });

      expect(pedido.getTempoPreparo()).toBe(0);
    });

    it('should return 0 for cancelled orders', () => {
      const pedido = new Pedido({
        status: PedidoStatus.CANCELADO,
        created_at: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      });

      expect(pedido.getTempoPreparo()).toBe(0);
    });

    it('should return 0 for ready orders', () => {
      const pedido = new Pedido({
        status: PedidoStatus.PRONTO,
        created_at: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      });

      expect(pedido.getTempoPreparo()).toBe(0);
    });
  });
});
