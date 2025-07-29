import { ItemPedido } from './item-pedido.entity';

describe('ItemPedido Entity', () => {
  describe('Constructor', () => {
    it('should create an item pedido with all properties', () => {
      const itemData = {
        id: '1',
        pedido_id: 'pedido-123',
        produto_id: 'produto-456',
        quantidade: 2,
        preco_unitario: 25.5,
        observacao: 'Sem cebola',
      };

      const item = new ItemPedido(itemData);

      expect(item.id).toBe('1');
      expect(item.pedido_id).toBe('pedido-123');
      expect(item.produto_id).toBe('produto-456');
      expect(item.quantidade).toBe(2);
      expect(item.preco_unitario).toBe(25.5);
      expect(item.observacao).toBe('Sem cebola');
    });

    it('should create an item pedido without optional properties', () => {
      const itemData = {
        pedido_id: 'pedido-123',
        produto_id: 'produto-456',
        quantidade: 1,
        preco_unitario: 15.0,
      };

      const item = new ItemPedido(itemData);

      expect(item.pedido_id).toBe('pedido-123');
      expect(item.produto_id).toBe('produto-456');
      expect(item.quantidade).toBe(1);
      expect(item.preco_unitario).toBe(15.0);
      expect(item.id).toBeUndefined();
      expect(item.observacao).toBeUndefined();
    });
  });

  describe('getSubtotal', () => {
    it('should calculate subtotal correctly', () => {
      const item = new ItemPedido({
        pedido_id: 'pedido-123',
        produto_id: 'produto-456',
        quantidade: 3,
        preco_unitario: 12.5,
      });

      expect(item.getSubtotal()).toBe(37.5);
    });

    it('should handle decimal calculations', () => {
      const item = new ItemPedido({
        pedido_id: 'pedido-123',
        produto_id: 'produto-456',
        quantidade: 2,
        preco_unitario: 15.75,
      });

      expect(item.getSubtotal()).toBe(31.5);
    });
  });

  describe('Setters', () => {
    let item: ItemPedido;

    beforeEach(() => {
      item = new ItemPedido({
        pedido_id: 'pedido-123',
        produto_id: 'produto-456',
        quantidade: 1,
        preco_unitario: 10.0,
      });
    });

    it('should update quantidade', () => {
      item.quantidade = 5;
      expect(item.quantidade).toBe(5);
    });

    it('should update preco_unitario', () => {
      item.preco_unitario = 20.5;
      expect(item.preco_unitario).toBe(20.5);
    });

    it('should update observacao', () => {
      item.observacao = 'Bem passado';
      expect(item.observacao).toBe('Bem passado');
    });

    it('should update produto_id', () => {
      item.produto_id = 'novo-produto-789';
      expect(item.produto_id).toBe('novo-produto-789');
    });
  });
});
