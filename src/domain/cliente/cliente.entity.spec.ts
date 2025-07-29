import { Cliente } from './cliente.entity';

describe('Cliente Entity', () => {
  describe('Constructor', () => {
    it('should create a cliente with all properties', () => {
      const clienteData = {
        id: '123',
        nome: 'João Silva',
        cpf: '12345678901',
        email: 'joao@example.com',
        celular: '11999999999',
      };

      const cliente = new Cliente(clienteData);

      expect(cliente.id).toBe('123');
      expect(cliente.nome).toBe('João Silva');
      expect(cliente.cpf).toBe('12345678901');
      expect(cliente.email).toBe('joao@example.com');
      expect(cliente.celular).toBe('11999999999');
    });

    it('should create a cliente with partial properties', () => {
      const clienteData = {
        nome: 'Maria Santos',
        cpf: '98765432100',
      };

      const cliente = new Cliente(clienteData);

      expect(cliente.nome).toBe('Maria Santos');
      expect(cliente.cpf).toBe('98765432100');
      expect(cliente.id).toBeUndefined();
      expect(cliente.email).toBeUndefined();
      expect(cliente.celular).toBeUndefined();
    });
  });

  describe('Setters', () => {
    let cliente: Cliente;

    beforeEach(() => {
      cliente = new Cliente({
        nome: 'Test User',
        cpf: '12345678901',
      });
    });

    it('should update nome and set updated_at', () => {
      const beforeUpdate = new Date();

      cliente.nome = 'Updated Name';

      expect(cliente.nome).toBe('Updated Name');
      expect(cliente.updated_at).toBeInstanceOf(Date);
      expect(cliente.updated_at.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
    });

    it('should update cpf and set updated_at', () => {
      const beforeUpdate = new Date();

      cliente.cpf = '98765432100';

      expect(cliente.cpf).toBe('98765432100');
      expect(cliente.updated_at).toBeInstanceOf(Date);
      expect(cliente.updated_at.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
    });

    it('should update email and set updated_at', () => {
      const beforeUpdate = new Date();

      cliente.email = 'new@example.com';

      expect(cliente.email).toBe('new@example.com');
      expect(cliente.updated_at).toBeInstanceOf(Date);
      expect(cliente.updated_at.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
    });

    it('should update celular and set updated_at', () => {
      const beforeUpdate = new Date();

      cliente.celular = '11888888888';

      expect(cliente.celular).toBe('11888888888');
      expect(cliente.updated_at).toBeInstanceOf(Date);
      expect(cliente.updated_at.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
    });
  });
});
