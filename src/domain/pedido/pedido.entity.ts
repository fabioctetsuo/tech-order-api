import { Cliente } from '../cliente/cliente.entity';
import { ItemPedido } from './item-pedido.entity';
import { PedidoStatus } from './pedido.types';

export class Pedido {
  private _id: string;
  private _cliente_id?: string;
  private _status: PedidoStatus;
  private _preco: number;
  private _created_at: Date;
  private _updated_at: Date;
  private _itens: ItemPedido[];
  private _cliente?: Cliente;

  constructor(props: {
    id?: string;
    cliente_id?: string;
    status: PedidoStatus;
    preco?: number;
    created_at?: Date;
    updated_at?: Date;
    itens?: ItemPedido[];
    cliente?: Cliente;
  }) {
    if (props.id) this._id = props.id;
    if (props.cliente_id) this._cliente_id = props.cliente_id;
    if (props.status) this._status = props.status;
    if (props.preco !== undefined) this._preco = props.preco;
    if (props.created_at) this._created_at = props.created_at;
    if (props.updated_at) this._updated_at = props.updated_at;
    if (props.itens) this._itens = props.itens;
    if (props.cliente) this._cliente = props.cliente;
  }

  get id(): string {
    return this._id;
  }

  get cliente_id(): string | undefined {
    return this._cliente_id;
  }

  get status(): PedidoStatus {
    return this._status;
  }

  get preco(): number {
    return this._preco;
  }

  get created_at(): Date {
    return this._created_at;
  }

  get updated_at(): Date {
    return this._updated_at;
  }

  get itens(): ItemPedido[] {
    return this._itens;
  }

  get cliente(): Cliente | undefined {
    return this._cliente;
  }

  set cliente_id(value: string | undefined) {
    this._cliente_id = value;
  }

  set status(value: PedidoStatus) {
    this._status = value;
  }

  set preco(value: number) {
    this._preco = value;
  }

  set created_at(value: Date) {
    this._created_at = value;
  }

  set updated_at(value: Date) {
    this._updated_at = value;
  }

  set itens(value: ItemPedido[]) {
    this._itens = value;
  }

  set cliente(value: Cliente | undefined) {
    this._cliente = value;
  }

  private recalculateTotal() {
    this._preco = this._itens.reduce(
      (total, item) => total + item.preco_unitario * item.quantidade,
      0,
    );
  }

  setItens(items: ItemPedido[]) {
    this._itens = items;
    this.recalculateTotal();
  }

  getTempoPreparo() {
    const statusToNotCalculate = [
      PedidoStatus.ENTREGUE,
      PedidoStatus.CANCELADO,
      PedidoStatus.PRONTO,
    ];

    if (!statusToNotCalculate.includes(this._status)) {
      const now = new Date();
      return now.getTime() - this._created_at.getTime();
    }

    return 0;
  }

  addItem(item: ItemPedido) {
    this._itens.push(item);
    this.recalculateTotal();
  }

  removeItem(itemId: string) {
    this._itens = this._itens.filter((item) => item.id !== itemId);
    this.recalculateTotal();
  }

  updateStatus(updatedStatus: PedidoStatus) {
    this._status = updatedStatus;
    this._updated_at = new Date();
  }
}
