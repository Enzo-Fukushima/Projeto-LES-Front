// src/lib/types.ts

export type TipoTelefone = "RESIDENCIAL" | "CELULAR" | "COMERCIAL";
export type Genero = "MASCULINO" | "FEMININO" | "OUTRO";

export interface Endereco {
  id: number;
  tipoResidencia: "RESIDENCIAL" | "COMERCIAL" | "OUTRO";
  tipoLogradouro: "RUA" | "AVENIDA" | "TRAVESSA" | "ALAMEDA" | "OUTRO";
  tipoEndereco: "ENTREGA" | "COBRANCA";
  logradouro: string;
  numero: string;
  apelido?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface CartaoCredito {
  id: number;
  numero: string;
  nomeTitular: string;
  validade: string; // MM/AA
  codigoSeguranca: string;
}

export interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  genero: Genero;
  dataNascimento: string; // LocalDate no backend, vem como ISO string
  email: string;
  tipoTelefone: TipoTelefone;
  ddd: string;
  numeroTelefone: string;
  ativo: boolean;
  ranking: number;
  enderecos?: Endereco[];
  cartoes?: CartaoCredito[];
  telefone?: string; // campo auxiliar para exibir telefone completo
}

export type ClienteDTO = Omit<Cliente, "enderecos" | "cartoes" | "telefone">;

export type ClienteUpdateDTO = {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  senha?: string;
  tipoTelefone: TipoTelefone;
  ddd: string;
  numeroTelefone: string;
  ativo: boolean;
  ranking?: number;
}

export interface CreateClienteEnderecoDTO {
  cep: string;
  apelido?: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  tipo?: "COBRANCA" | "ENTREGA";
}

export interface CreateClienteDTO {
  id?: number;
  nome: string;
  cpf: string;
  genero: Genero;
  dataNascimento: string; // YYYY-MM-DD
  email: string;
  senha: string;
  tipoTelefone: TipoTelefone;
  ddd: string; // 2 dígitos
  numeroTelefone: string; // 8 ou 9 dígitos
  ativo?: boolean;
  ranking?: number;
  enderecos: CreateClienteEnderecoDTO[];
}

export interface EnderecoDTO {
  id?: number;
  tipo: "COBRANCA" | "ENTREGA";
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais?: string;
  apelido?: string;
}

export interface CartaoCreditoDTO {
  id?: number;
  numero: string;
  nomeTitular: string;
  validade: string; // MM/AA
  cvv: string;
}

export interface ClienteDetalhadoDTO {
  id?: number;
  nome: string;
  cpf: string;
  genero: Genero;
  dataNascimento: string;
  email: string;
  tipoTelefone: TipoTelefone;
  ddd: string;
  numeroTelefone: string;
  ativo?: boolean;
  ranking?: number;
  enderecos: EnderecoDTO[];
  cartoes: CartaoCreditoDTO[];
}
