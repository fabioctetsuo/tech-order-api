import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ClienteService } from '../../business/cliente/cliente.service';
import { CreateClienteDto, UpdateClienteDto } from '../dto/cliente.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Clientes')
@Controller('clientes')
export class ClienteController {
  constructor(private clienteService: ClienteService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar todos os clientes' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos os clientes',
  })
  async findAll() {
    return this.clienteService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Criar um novo cliente' })
  @ApiResponse({
    status: 201,
    description: 'Cliente criado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  async create(@Body() createClienteDto: CreateClienteDto) {
    return this.clienteService.create(createClienteDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um cliente pelo ID' })
  @ApiResponse({
    status: 200,
    description: 'Retorna um cliente específico',
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente não encontrado',
  })
  async findById(@Param('id') id: string) {
    return this.clienteService.findById(id);
  }

  @Get('cpf/:cpf')
  @ApiOperation({ summary: 'Buscar um cliente pelo CPF' })
  @ApiResponse({
    status: 200,
    description: 'Retorna um cliente específico',
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente não encontrado',
  })
  async findByCpf(@Param('cpf') cpf: string) {
    return this.clienteService.findByCpf(cpf);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um cliente' })
  @ApiResponse({
    status: 200,
    description: 'Cliente atualizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente não encontrado',
  })
  async update(
    @Param('id') id: string,
    @Body() updateClienteDto: UpdateClienteDto,
  ) {
    return this.clienteService.update(id, updateClienteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir um cliente' })
  @ApiResponse({
    status: 204,
    description: 'Cliente excluído com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente não encontrado',
  })
  async delete(@Param('id') id: string) {
    return this.clienteService.delete(id);
  }

  @Delete('cpf/:cpf')
  @ApiOperation({ summary: 'Excluir um cliente pelo CPF' })
  @ApiResponse({
    status: 204,
    description: 'Cliente excluído com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente não encontrado',
  })
  async deleteByCpf(@Param('cpf') cpf: string) {
    return this.clienteService.deleteByCpf(cpf);
  }
}
