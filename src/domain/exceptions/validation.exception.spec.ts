import {
  ValidationException,
  ValidationErrorType,
} from './validation.exception';
import { HttpStatus } from '@nestjs/common';

describe('ValidationException', () => {
  describe('constructor', () => {
    it('should create exception with CPF_ALREADY_EXISTS error type', () => {
      const exception = new ValidationException(
        ValidationErrorType.CPF_ALREADY_EXISTS,
      );

      expect(exception).toBeInstanceOf(ValidationException);
      expect(exception).toBeInstanceOf(Error);
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.message).toContain('Cliente com este CPF já existe');
    });

    it('should create exception with INVALID_CPF error type', () => {
      const exception = new ValidationException(
        ValidationErrorType.INVALID_CPF,
      );

      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.message).toContain('CPF inválido');
    });

    it('should create exception with CLIENTE_NOT_FOUND error type', () => {
      const exception = new ValidationException(
        ValidationErrorType.CLIENTE_NOT_FOUND,
      );

      expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
      expect(exception.message).toContain('Cliente não encontrado');
    });

    it('should create exception with PEDIDO_NOT_FOUND error type', () => {
      const exception = new ValidationException(
        ValidationErrorType.PEDIDO_NOT_FOUND,
      );

      expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
      expect(exception.message).toContain('Pedido não encontrado');
    });

    it('should create exception with PEDIDO_INVALID_STATUS error type', () => {
      const exception = new ValidationException(
        ValidationErrorType.PEDIDO_INVALID_STATUS,
      );

      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.message).toContain('Status do pedido inválido');
    });
  });

  describe('getStatus', () => {
    it('should return 400 for CPF_ALREADY_EXISTS', () => {
      const exception = new ValidationException(
        ValidationErrorType.CPF_ALREADY_EXISTS,
      );
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 for INVALID_CPF', () => {
      const exception = new ValidationException(
        ValidationErrorType.INVALID_CPF,
      );
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return 404 for CLIENTE_NOT_FOUND', () => {
      const exception = new ValidationException(
        ValidationErrorType.CLIENTE_NOT_FOUND,
      );
      expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return 404 for PEDIDO_NOT_FOUND', () => {
      const exception = new ValidationException(
        ValidationErrorType.PEDIDO_NOT_FOUND,
      );
      expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return 400 for PEDIDO_INVALID_STATUS', () => {
      const exception = new ValidationException(
        ValidationErrorType.PEDIDO_INVALID_STATUS,
      );
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return 401 for UNAUTHORIZED', () => {
      const exception = new ValidationException(
        ValidationErrorType.UNAUTHORIZED,
      );
      expect(exception.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should return 400 for UPDATE_CPF_NOT_ALLOWED', () => {
      const exception = new ValidationException(
        ValidationErrorType.UPDATE_CPF_NOT_ALLOWED,
      );
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 for PEDIDO_INVALID_ITEMS', () => {
      const exception = new ValidationException(
        ValidationErrorType.PEDIDO_INVALID_ITEMS,
      );
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('error message mapping', () => {
    it('should have correct error messages for all error types', () => {
      const testCases = [
        {
          type: ValidationErrorType.CPF_ALREADY_EXISTS,
          message: 'Cliente com este CPF já existe',
        },
        { type: ValidationErrorType.INVALID_CPF, message: 'CPF inválido' },
        {
          type: ValidationErrorType.CLIENTE_NOT_FOUND,
          message: 'Cliente não encontrado',
        },
        {
          type: ValidationErrorType.PEDIDO_NOT_FOUND,
          message: 'Pedido não encontrado',
        },
        {
          type: ValidationErrorType.PEDIDO_INVALID_STATUS,
          message: 'Status do pedido inválido',
        },
        { type: ValidationErrorType.UNAUTHORIZED, message: 'Não autorizado' },
        {
          type: ValidationErrorType.UPDATE_CPF_NOT_ALLOWED,
          message: 'CPF não pode ser atualizado',
        },
        {
          type: ValidationErrorType.PEDIDO_INVALID_ITEMS,
          message: 'Itens do pedido inválidos',
        },
      ];

      testCases.forEach(({ type, message }) => {
        const exception = new ValidationException(type);
        expect(exception.message).toContain(message);
      });
    });

    it('should return default error message for unknown error type', () => {
      // Test the fallback case by creating an exception with a non-existent error type
      const unknownErrorType = 'UNKNOWN_ERROR' as ValidationErrorType;
      const exception = new ValidationException(unknownErrorType);

      expect(exception.message).toContain('Erro de validação desconhecido');
    });

    it('should return default status code for unknown error type', () => {
      // Test the fallback case by creating an exception with a non-existent error type
      const unknownErrorType = 'UNKNOWN_ERROR' as ValidationErrorType;
      const exception = new ValidationException(unknownErrorType);

      expect(exception.getStatus()).toBe(400); // HttpStatus.BAD_REQUEST
    });
  });
});
