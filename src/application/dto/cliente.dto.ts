import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class ClienteDto {
  @IsString()
  @IsOptional()
  id?: number;

  @ApiProperty({
    description: 'Nome do cliente',
    example: 'João da Silva',
  })
  @IsString({ message: 'O nome deve ser uma string' })
  nome: string;

  @ApiProperty({
    description: 'Email do cliente',
    example: 'joao.silva@example.com',
  })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({
    description: 'CPF do cliente',
    example: '12345678901',
  })
  @IsString({ message: 'O CPF deve ser uma string' })
  cpf: string;

  @ApiProperty({
    description: 'Celular do cliente',
    example: '11999999999',
  })
  @IsString({ message: 'O celular deve ser uma string' })
  @IsOptional()
  celular?: string;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;
}

export class CreateClienteDto extends PartialType(ClienteDto) {}

export class UpdateClienteDto extends PartialType(ClienteDto) {}
