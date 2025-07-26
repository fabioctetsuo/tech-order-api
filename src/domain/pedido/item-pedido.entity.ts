import { Pedido } from './pedido.entity';

export class ItemPedido {
  private _id: string;
  private _pedido_id: string;
  private _produto_id: string;
  private _quantidade: number;
  private _preco_unitario: number;
  private _observacao?: string;
  private _pedido?: Pedido;

  constructor(props: {
    id?: string;
    pedido_id: string;
    produto_id: string;
    quantidade: number;
    preco_unitario: number;
    observacao?: string;
    pedido?: Pedido;
  }) {
    if (props.id) this._id = props.id;
    if (props.pedido_id) this._pedido_id = props.pedido_id;
    if (props.produto_id) this._produto_id = props.produto_id;
    if (props.quantidade) this._quantidade = props.quantidade;
    if (props.preco_unitario) this._preco_unitario = props.preco_unitario;
    if (props.observacao) this._observacao = props.observacao;
    if (props.pedido) this._pedido = props.pedido;
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get pedido_id(): string {
    return this._pedido_id;
  }

  get produto_id(): string {
    return this._produto_id;
  }

  get quantidade(): number {
    return this._quantidade;
  }

  get preco_unitario(): number {
    return this._preco_unitario;
  }

  get observacao(): string | undefined {
    return this._observacao;
  }

  get pedido(): Pedido | undefined {
    return this._pedido;
  }

  // Setters
  set pedido_id(value: string) {
    this._pedido_id = value;
  }

  set produto_id(value: string) {
    this._produto_id = value;
  }

  set quantidade(value: number) {
    this._quantidade = value;
  }

  set preco_unitario(value: number) {
    this._preco_unitario = value;
  }

  set observacao(value: string | undefined) {
    this._observacao = value;
  }

  set pedido(value: Pedido | undefined) {
    this._pedido = value;
  }

  // Helper method to calculate total price for this item
  getSubtotal(): number {
    return this._quantidade * this._preco_unitario;
  }
}
