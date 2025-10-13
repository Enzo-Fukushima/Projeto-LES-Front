<<<<<<< HEAD
// ==========================
// Tipos básicos / enums
// ==========================
=======
// src/lib/types.ts

export type User = Cliente; // Alias para seu tipo de cliente

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
}

>>>>>>> 6f32a6fafdf73cbb4587be3532fa2d236b454a4f
export type TipoTelefone = "RESIDENCIAL" | "CELULAR" | "COMERCIAL";
export type Genero = "MASCULINO" | "FEMININO" | "OUTRO";

export type TipoEndereco = "ENTREGA" | "COBRANCA";
export type TipoResidencia = "RESIDENCIAL" | "COMERCIAL" | "OUTRO";
export type TipoLogradouro =
  | "RUA"
  | "AVENIDA"
  | "TRAVESSA"
  | "ALAMEDA"
  | "OUTRO";

// ==========================
// Endereços
// ==========================

export interface Endereco {
  id: number;
<<<<<<< HEAD
  tipoEndereco: TipoEndereco;
  tipoResidencia?: TipoResidencia;
  tipoLogradouro?: TipoLogradouro;
  logradouro: string;
  numero: string;
  complemento?: string;
  apelido?: string;
=======
 apelido?: string;
  tipoResidencia: "CASA" | "APARTAMENTO";
  tipoLogradouro: "RUA" | "AVENIDA" | "TRAVESSA" | "ALAMEDA" | "OUTRO";
  tipoEndereco: "ENTREGA" | "COBRANCA";
  logradouro: string;
  numero: number;
>>>>>>> 6f32a6fafdf73cbb4587be3532fa2d236b454a4f
  bairro: string;
  cep: string;
<<<<<<< HEAD
  pais?: string;
  principal: boolean;
  user_id: number;
=======
  cidade: string;
  estado: string; // 2 letras
  pais?: string;
  clienteId: number; // Para associar ao cliente
>>>>>>> 6f32a6fafdf73cbb4587be3532fa2d236b454a4f
}

export interface EnderecoDTO {
  id?: number;
  tipoEndereco: TipoEndereco;
  logradouro: string;
  numero: string;
  complemento?: string;
  apelido?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  pais?: string;
  principal: boolean;
  user_id: number;
}

export interface CreateEnderecoDTO {
  tipoEndereco: TipoEndereco;
  logradouro: string;
  numero: string;
  complemento?: string;
  apelido?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  pais?: string;
  principal: boolean;
  user_id: number;
}

// ==========================
// Cartões de crédito
// ==========================
export interface CartaoCredito {
  id: number;
  numero: string;
  nomeTitular: string;
  validade: string; // MM/AA
  codigoSeguranca: string;
  bandeira: string;
  clienteId: number;
}

export interface CartaoCreditoDTO {
  id?: number;
  numero: string;
  nomeTitular: string;
  validade: string; // MM/AA
  cvv: string;
  bandeira: string;
  clienteId: number;
}

// ==========================
// Clientes
// ==========================
export interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  genero: Genero;
  dataNascimento: string; // ISO YYYY-MM-DD
  email: string;
  tipoTelefone: TipoTelefone;
  ddd: string;
  numeroTelefone: string;
  telefone?: string;
  ativo: boolean;
  ranking: number;
  enderecos?: Endereco[];
  cartoes?: CartaoCredito[];
}

export type ClienteDTO = Omit<Cliente, "enderecos" | "cartoes" | "telefone">;

export interface ClienteUpdateDTO {
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

<<<<<<< HEAD
=======
export interface EnderecoCreateDTO {
  apelido?: string;
  tipoResidencia: "CASA" | "APARTAMENTO";
  tipoLogradouro: "RUA" | "AVENIDA" | "TRAVESSA" | "ALAMEDA" | "OUTRO";
  tipoEndereco: "ENTREGA" | "COBRANCA";
  logradouro: string;
  numero: number;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string; // 2 letras
  pais?: string;
  clienteId: number; // Para associar ao cliente
}

>>>>>>> 6f32a6fafdf73cbb4587be3532fa2d236b454a4f
export interface CreateClienteDTO {
  id?: number;
  nome: string;
  cpf: string;
  genero: Genero;
  dataNascimento: string;
  email: string;
  senha: string;
  tipoTelefone: TipoTelefone;
  ddd: string;
  numeroTelefone: string;
  ativo?: boolean;
  ranking?: number;
<<<<<<< HEAD
  enderecos: CreateEnderecoDTO[];
=======
  enderecos: CreateClienteDTO[];
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
>>>>>>> 6f32a6fafdf73cbb4587be3532fa2d236b454a4f
}

export interface ClienteDetalhadoDTO {
  id: number;
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

// ==========================
// User (extends ClienteDetalhadoDTO)
// ==========================
export interface User extends ClienteDetalhadoDTO {
  codigo_cliente?: string; // código interno
  senha_hash?: string; // senha armazenada (hash)
  data_criacao?: Date;
  data_atualizacao?: Date;
}

// ==========================
// Contexto de Autenticação
// ==========================
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Partial<User>) => Promise<boolean>;
  logout: () => void;
  updateUser: (updatedUserData: Partial<User>) => void;
}

// ==========================
// Carrinho
// ==========================
export interface CarrinhoItemDTO {
  id: number;
  livroId: number;
  titulo: string;
  autor: string;
  editora: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  imagemUrl: string;
}

export interface CarrinhoDTO {
  id: number;
  clienteId: number;
  itens: CarrinhoItemDTO[];
  desconto?: number;
}

// ==========================
// Livros
// ==========================
export interface Livro {
  id: number;
  titulo: string;
  autor: string;
  descricao?: string;
  editora: string;
  preco: number;
  publicacao: string;
  estoque: number;
  peso?: number;
  categoria_id: string;
  imagem_url?: string;
}

// ==========================
// DTO de atualização de senha
// ==========================
export interface ClienteUpdateSenhaDTO {
  senhaAtual: string;
  novaSenha: string;
  confirmaSenha: string;
}

// src/lib/types.ts
export interface CouponDTO {
  code: string; // Código do cupom, ex: "WELCOME10"
  discount: number; // Valor do desconto (R$ ou percentual)
  type: "fixed" | "percentage"; // Tipo do desconto
  valid: boolean; // Se o cupom é válido
  expiresAt?: string; // Data de expiração (opcional)
}

export interface CartaoPagamentoDTO {
  cartaoId?: number; // ID do cartão já cadastrado
  newCard?: Omit<CartaoCreditoDTO, "id" | "clienteId">; // Novo cartão a ser cadastrado
  valor: number; // Valor pago com este cartão
  parcelas?: number; // Número de parcelas
}

export interface CupomUseDTO {
  cupomId: number;
}

export interface CheckoutRequestDTO {
  carrinhoId: number;
  enderecoEntregaId?: number;
  novoEnderecoEntrega?: Omit<EnderecoDTO, "id" | "clienteId">;
  cartoesPagamento?: CartaoPagamentoDTO[];
  cupons?: CupomUseDTO[];
  cupomPromocionalCodigo?: string;
}

export interface CheckoutResponseDTO {
  pedidoId: number;
  status: string;
  valorTotal: number;
  valorPago: number;
}

export interface OrderItemDTO {
  livroId: number;
  titulo: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface PedidoDTO {
  id: number;
  status: string;
  clienteId: number;
  itens: OrderItemDTO[];
  valorTotal?: number;
  valorFrete?: number;
  codigoRastreamento?: string;
  dataPedido?: string;
  dataEntrega?: string;
}
