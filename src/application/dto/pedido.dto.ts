import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDate,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { PedidoStatus } from '../../domain/pedido/pedido.types';
import { ApiProperty } from '@nestjs/swagger';

export class ItemPedidoDTO {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  pedido_id?: string;

  @IsString()
  produto_id: string;

  @IsNumber()
  quantidade: number;

  @IsNumber()
  preco_unitario: number;

  @IsString()
  @IsOptional()
  observacao?: string;
}

export class PedidoDTO {
  @IsString()
  @IsOptional()
  id?: number;

  @IsString({ message: 'O cliente_id deve ser uma string' })
  cliente_id: string;

  @IsEnum(PedidoStatus, { message: 'Status inválido' })
  status: PedidoStatus;

  @IsNumber()
  @IsOptional()
  preco?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoDTO)
  itens: ItemPedidoDTO[];

  @IsDate()
  @IsOptional()
  created_at?: Date;

  @IsDate()
  @IsOptional()
  updatedAt?: Date;
}

export class CreateItemPedidoDTO {
  @ApiProperty({
    description: 'ID do produto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  produto_id: string;

  @ApiProperty({
    description: 'Quantidade do produto',
    example: 2,
  })
  @IsNumber()
  quantidade: number;

  @ApiProperty({
    description: 'Preço unitário do produto',
    example: 14.9,
  })
  @IsNumber()
  preco_unitario: number;

  @ApiProperty({
    description: 'Observação opcional para o item',
    example: 'Sem cebola',
    required: false,
  })
  @IsString()
  @IsOptional()
  observacao?: string;
}

export class CreatePedidoDTO {
  @ApiProperty({
    description: 'ID do cliente que fez o pedido',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  cliente_id?: string;

  @ApiProperty({
    description: 'Status do pedido',
    example: PedidoStatus.PENDENTE,
  })
  @IsEnum(PedidoStatus)
  status: PedidoStatus;

  @ApiProperty({
    description: 'Lista de produtos do pedido',
    type: [CreateItemPedidoDTO],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemPedidoDTO)
  itens: CreateItemPedidoDTO[];
}

export class UpdatePedidoDTO extends PartialType(PedidoDTO) {}
