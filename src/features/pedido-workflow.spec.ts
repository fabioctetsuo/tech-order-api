import { defineFeature, loadFeature } from 'jest-cucumber';
import { Pedido } from '../domain/pedido/pedido.entity';
import { ItemPedido } from '../domain/pedido/item-pedido.entity';
import { PedidoStatus } from '../domain/pedido/pedido.types';

const feature = loadFeature('./src/features/pedido-workflow.feature');

defineFeature(feature, (test) => {
  let pedido: Pedido;
  let orderData: {
    cliente_id: string;
    status: PedidoStatus;
    created_at: Date;
    itens: ItemPedido[];
  };
  let preparationTime: number;

  test('Create a new order successfully', ({ given, and, when, then }) => {
    given('the order management system is available', () => {
      // System setup - no specific implementation needed for unit test
    });

    given('I have valid order data with customer ID "cliente-123"', () => {
      orderData = {
        cliente_id: 'cliente-123',
        status: PedidoStatus.PENDENTE,
        created_at: new Date(),
        itens: [],
      };
    });

    and('the order contains 2 items with total value 50.00', () => {
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
        preco_unitario: 20.0,
      });

      orderData.itens = [item1, item2];
    });

    when('I create a new order', () => {
      pedido = new Pedido(orderData);
      pedido.setItens(orderData.itens);
    });

    then('the order should be created with status "PENDENTE"', () => {
      expect(pedido.status).toBe(PedidoStatus.PENDENTE);
    });

    and('the order should have 2 items', () => {
      expect(pedido.itens).toHaveLength(2);
    });

    and('the total price should be 50.00', () => {
      expect(pedido.preco).toBe(50.0);
    });
  });

  test('Complete order workflow from creation to delivery', ({
    given,
    when,
    then,
  }) => {
    given('the order management system is available', () => {
      // System setup - no specific implementation needed for unit test
    });

    given('I have a pending order with ID "pedido-123"', () => {
      pedido = new Pedido({
        id: 'pedido-123',
        status: PedidoStatus.PENDENTE,
        created_at: new Date(),
      });
    });

    when('I confirm the order', () => {
      pedido.updateStatus(PedidoStatus.CONFIRMADO);
    });

    then('the order status should be "CONFIRMADO"', () => {
      expect(pedido.status).toBe(PedidoStatus.CONFIRMADO);
    });

    when('I mark the order as received', () => {
      pedido.updateStatus(PedidoStatus.RECEBIDO);
    });

    then('the order status should be "RECEBIDO"', () => {
      expect(pedido.status).toBe(PedidoStatus.RECEBIDO);
    });

    when('I start order preparation', () => {
      pedido.updateStatus(PedidoStatus.PREPARANDO);
    });

    then('the order status should be "PREPARANDO"', () => {
      expect(pedido.status).toBe(PedidoStatus.PREPARANDO);
    });

    when('I mark the order as ready', () => {
      pedido.updateStatus(PedidoStatus.PRONTO);
    });

    then('the order status should be "PRONTO"', () => {
      expect(pedido.status).toBe(PedidoStatus.PRONTO);
    });

    when('I mark the order as delivered', () => {
      pedido.updateStatus(PedidoStatus.ENTREGUE);
    });

    then('the order status should be "ENTREGUE"', () => {
      expect(pedido.status).toBe(PedidoStatus.ENTREGUE);
    });
  });

  test('Calculate preparation time for active orders', ({
    given,
    and,
    when,
    then,
  }) => {
    given('the order management system is available', () => {
      // System setup - no specific implementation needed for unit test
    });

    given('I have an order that was created 30 minutes ago', () => {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      pedido = new Pedido({
        id: 'pedido-123',
        status: PedidoStatus.PREPARANDO,
        created_at: thirtyMinutesAgo,
      });
    });

    and('the order status is "PREPARANDO"', () => {
      expect(pedido.status).toBe(PedidoStatus.PREPARANDO);
    });

    when('I check the preparation time', () => {
      preparationTime = pedido.getTempoPreparo();
    });

    then('the preparation time should be approximately 30 minutes', () => {
      const thirtyMinutesInMs = 30 * 60 * 1000;
      expect(preparationTime).toBeGreaterThan(thirtyMinutesInMs - 5000); // Allow 5 second variance
      expect(preparationTime).toBeLessThan(thirtyMinutesInMs + 5000);
    });
  });

  test('Preparation time should be zero for completed orders', ({
    given,
    and,
    when,
    then,
  }) => {
    given('the order management system is available', () => {
      // System setup - no specific implementation needed for unit test
    });

    given('I have a completed order that was created 60 minutes ago', () => {
      const sixtyMinutesAgo = new Date(Date.now() - 60 * 60 * 1000);
      pedido = new Pedido({
        id: 'pedido-123',
        status: PedidoStatus.ENTREGUE,
        created_at: sixtyMinutesAgo,
      });
    });

    and('the order status is "ENTREGUE"', () => {
      expect(pedido.status).toBe(PedidoStatus.ENTREGUE);
    });

    when('I check the preparation time', () => {
      preparationTime = pedido.getTempoPreparo();
    });

    then('the preparation time should be 0', () => {
      expect(preparationTime).toBe(0);
    });
  });

  test('Add items to order and recalculate total', ({
    given,
    when,
    then,
    and,
  }) => {
    given('the order management system is available', () => {
      // System setup - no specific implementation needed for unit test
    });

    given('I have an order with 1 item worth 25.00', () => {
      const item = new ItemPedido({
        id: 'item-1',
        pedido_id: 'pedido-123',
        produto_id: 'produto-1',
        quantidade: 1,
        preco_unitario: 25.0,
      });

      pedido = new Pedido({
        id: 'pedido-123',
        status: PedidoStatus.PENDENTE,
        itens: [item],
      });
      pedido.setItens([item]);
    });

    when('I add another item worth 30.00', () => {
      const newItem = new ItemPedido({
        id: 'item-2',
        pedido_id: 'pedido-123',
        produto_id: 'produto-2',
        quantidade: 1,
        preco_unitario: 30.0,
      });

      pedido.addItem(newItem);
    });

    then('the order should have 2 items', () => {
      expect(pedido.itens).toHaveLength(2);
    });

    and('the total price should be 55.00', () => {
      expect(pedido.preco).toBe(55.0);
    });
  });

  test('Remove items from order and recalculate total', ({
    given,
    when,
    then,
    and,
  }) => {
    given('the order management system is available', () => {
      // System setup - no specific implementation needed for unit test
    });

    given('I have an order with 2 items worth 55.00 total', () => {
      const item1 = new ItemPedido({
        id: 'item-1',
        pedido_id: 'pedido-123',
        produto_id: 'produto-1',
        quantidade: 1,
        preco_unitario: 25.0,
      });

      const item2 = new ItemPedido({
        id: 'item-2',
        pedido_id: 'pedido-123',
        produto_id: 'produto-2',
        quantidade: 1,
        preco_unitario: 30.0,
      });

      pedido = new Pedido({
        id: 'pedido-123',
        status: PedidoStatus.PENDENTE,
        itens: [item1, item2],
      });
      pedido.setItens([item1, item2]);
    });

    when('I remove 1 item worth 25.00', () => {
      pedido.removeItem('item-1');
    });

    then('the order should have 1 item', () => {
      expect(pedido.itens).toHaveLength(1);
    });

    and('the total price should be 30.00', () => {
      expect(pedido.preco).toBe(30.0);
    });
  });
});
