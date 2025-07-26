import { HttpException, HttpStatus } from '@nestjs/common';

export enum ValidationErrorType {
  CPF_ALREADY_EXISTS = 'CPF_ALREADY_EXISTS',
  INVALID_CPF = 'INVALID_CPF',
  CLIENTE_NOT_FOUND = 'CLIENTE_NOT_FOUND',
  UPDATE_CPF_NOT_ALLOWED = 'UPDATE_CPF_NOT_ALLOWED',
  PEDIDO_INVALID_ITEMS = 'PEDIDO_INVALID_ITEMS',
  PEDIDO_NOT_FOUND = 'PEDIDO_NOT_FOUND',
  PEDIDO_INVALID_STATUS = 'PEDIDO_INVALID_STATUS',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

export class ValidationException extends HttpException {
  constructor(errorType: ValidationErrorType) {
    const message = ValidationException.getErrorMessage(errorType);
    const statusCode = ValidationException.getStatusCode(errorType);
    super(
      {
        statusCode,
        message,
        error: errorType,
      },
      statusCode,
    );
    this.name = 'ValidationException';
  }

  private static getErrorMessage(errorType: ValidationErrorType): string {
    const errorMessages = {
      [ValidationErrorType.CPF_ALREADY_EXISTS]:
        'Cliente com este CPF já existe',
      [ValidationErrorType.INVALID_CPF]: 'CPF inválido',
      [ValidationErrorType.CLIENTE_NOT_FOUND]: 'Cliente não encontrado',
      [ValidationErrorType.UPDATE_CPF_NOT_ALLOWED]:
        'CPF não pode ser atualizado',
      [ValidationErrorType.PEDIDO_INVALID_ITEMS]: 'Itens do pedido inválidos',
      [ValidationErrorType.PEDIDO_NOT_FOUND]: 'Pedido não encontrado',
      [ValidationErrorType.PEDIDO_INVALID_STATUS]: 'Status do pedido inválido',
      [ValidationErrorType.UNAUTHORIZED]: 'Não autorizado',
    };

    return errorMessages[errorType] || 'Erro de validação desconhecido';
  }

  private static getStatusCode(errorType: ValidationErrorType): number {
    const statusCodes = {
      [ValidationErrorType.CPF_ALREADY_EXISTS]: HttpStatus.BAD_REQUEST,
      [ValidationErrorType.INVALID_CPF]: HttpStatus.BAD_REQUEST,
      [ValidationErrorType.CLIENTE_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [ValidationErrorType.UPDATE_CPF_NOT_ALLOWED]: HttpStatus.BAD_REQUEST,
      [ValidationErrorType.PEDIDO_INVALID_ITEMS]: HttpStatus.BAD_REQUEST,
      [ValidationErrorType.PEDIDO_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [ValidationErrorType.PEDIDO_INVALID_STATUS]: HttpStatus.BAD_REQUEST,
      [ValidationErrorType.UNAUTHORIZED]: HttpStatus.UNAUTHORIZED,
    };

    return statusCodes[errorType] || HttpStatus.BAD_REQUEST;
  }
}
