import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Headers,
} from '@nestjs/common';
import { CreatePedidoDTO } from '../dto/pedido.dto';
import { PedidoService } from '../../business/pedido/pedido.service';
import { ApiOperation, ApiResponse, ApiHeader, ApiTags } from '@nestjs/swagger';

@ApiTags('Pedidos')
@Controller('pedidos')
export class PedidoController {
  constructor(private pedidoService: PedidoService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar todos os pedidos' })
  @ApiResponse({
    status: 200,
    description:
      'Retorna todos os pedidos seguindo a regra de negócio: Retorna apenas os pedidos prontos, em preparação e recebidos.',
  })
  async findAll() {
    return this.pedidoService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Criar um novo pedido' })
  @ApiHeader({
    name: 'authorization',
    description: 'Authorization header (optional)',
    required: false,
  })
  @ApiResponse({
    status: 201,
    description: 'Pedido criado com sucesso',
  })
  @ApiResponse({ status: 400, description: 'Requisição inválida' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async create(
    @Body() createPedidoDto: CreatePedidoDTO,
    @Headers('authorization') auth?: string,
  ) {
    return this.pedidoService.create(createPedidoDto, auth);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um pedido pelo ID' })
  @ApiResponse({
    status: 200,
    description: 'Retorna o pedido por ID',
  })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  async findById(@Param('id') id: string) {
    return this.pedidoService.findById(id);
  }

  @Put(':id/confirmar')
  @ApiOperation({
    summary: 'Confirmar recebimento do pedido após pagamento confirmado',
  })
  @ApiResponse({
    status: 204,
    description: 'Pedido confirmado',
  })
  async orderConfirmation(@Param('id') id: string) {
    return this.pedidoService.confirmarPedido(id);
  }

  @Put(':id/preparar')
  @ApiOperation({ summary: 'Marcar um pedido como preparando' })
  @ApiResponse({
    status: 204,
    description: 'Pedido marcado como preparando',
  })
  async markAsPreparing(@Param('id') id: string) {
    return this.pedidoService.iniciarPreparacao(id);
  }

  @Put(':id/pronto')
  @ApiOperation({ summary: 'Marcar um pedido como pronto' })
  @ApiResponse({
    status: 204,
    description: 'Pedido marcado como pronto',
  })
  async markAsDone(@Param('id') id: string) {
    return this.pedidoService.marcarComoPronto(id);
  }

  @Put(':id/entregue')
  @ApiOperation({ summary: 'Marcar um pedido como entregue' })
  @ApiResponse({
    status: 204,
    description: 'Pedido marcado como entregue',
  })
  async markAsDelivered(@Param('id') id: string) {
    return this.pedidoService.marcarComoEntregue(id);
  }
}
