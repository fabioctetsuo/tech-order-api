export class Cliente {
  private _id: string;
  private _nome: string;
  private _cpf: string;
  private _email: string;
  private _celular: string;
  private _created_at: Date;
  private _updated_at: Date;

  constructor(dados: Partial<Cliente>) {
    if (dados.id) this._id = dados.id;
    if (dados.nome) this.nome = dados.nome;
    if (dados.cpf) this.cpf = dados.cpf;
    if (dados.email) this.email = dados.email;
    if (dados.celular) this.celular = dados.celular;
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get nome(): string {
    return this._nome;
  }

  get cpf(): string {
    return this._cpf;
  }

  get email(): string {
    return this._email;
  }

  get celular(): string {
    return this._celular;
  }

  get created_at(): Date {
    return this._created_at;
  }

  get updated_at(): Date {
    return this._updated_at;
  }

  // Setters
  set nome(nome: string) {
    this._nome = nome;
    this._updated_at = new Date();
  }

  set cpf(cpf: string) {
    this._cpf = cpf;
    this._updated_at = new Date();
  }

  set email(email: string) {
    this._email = email;
    this._updated_at = new Date();
  }

  set celular(celular: string) {
    this._celular = celular;
    this._updated_at = new Date();
  }
}
