import { validateCPF } from './cpf.utils';

describe('CPF Utils', () => {
  describe('validateCPF', () => {
    it('should validate valid CPF numbers', () => {
      const validCPFs = [
        '11144477735',
        '111.444.777-35',
        '123.456.789-09',
        '12345678909',
      ];

      validCPFs.forEach((cpf) => {
        expect(validateCPF(cpf)).toBe(true);
      });
    });

    it('should reject invalid CPF numbers', () => {
      const invalidCPFs = [
        '12345678901', // Invalid checksum
        '111.444.777-36', // Invalid checksum
        '000.000.000-00', // All zeros
        '111.111.111-11', // All same digits
        '123.456.789-10', // Invalid checksum
      ];

      invalidCPFs.forEach((cpf) => {
        expect(validateCPF(cpf)).toBe(false);
      });
    });

    it('should reject CPF with incorrect length', () => {
      const shortCPFs = ['123456789', '12345', ''];

      const longCPFs = ['123456789012', '1234567890123'];

      [...shortCPFs, ...longCPFs].forEach((cpf) => {
        expect(validateCPF(cpf)).toBe(false);
      });
    });

    it('should handle CPF with formatting characters', () => {
      expect(validateCPF('111.444.777-35')).toBe(true);
      expect(validateCPF('111-444-777.35')).toBe(true);
      expect(validateCPF('111 444 777 35')).toBe(true);
      expect(validateCPF('111/444/777-35')).toBe(true);
    });

    it('should reject CPF with all same digits', () => {
      const samedigitCPFs = [
        '00000000000',
        '11111111111',
        '22222222222',
        '33333333333',
        '44444444444',
        '55555555555',
        '66666666666',
        '77777777777',
        '88888888888',
        '99999999999',
      ];

      samedigitCPFs.forEach((cpf) => {
        expect(validateCPF(cpf)).toBe(false);
      });
    });

    it('should handle non-numeric characters correctly', () => {
      expect(validateCPF('111abc444def777-35')).toBe(true);
      expect(validateCPF('111@#$444%^&777*()-35')).toBe(true);
    });
  });
});
