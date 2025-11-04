// lib/types.ts
// ✅ Sincronizado com DTOs do backend Java

// ==========================
// Enums
// ==========================
export type TipoTelefone = "RESIDENCIAL" | "CELULAR" | "COMERCIAL";
export type Genero = "MASCULINO" | "FEMININO" | "OUTRO";
export type TipoEndereco = "ENTREGA" | "COBRANCA";
export type TipoResidencia = "CASA" | "APARTAMENTO" | "OUTRO";
export type TipoLogradouro =
  | "RUA"
  | "AVENIDA"
  | "TRAVESSA"
  | "ALAMEDA"
  | "OUTRO";
export type BandeiraCartao =
  | "VISA"
  | "MASTERCARD"
  | "ELO"
  | "AMEX"
  | "HIPERCARD";
export type TipoCupom = "TROCA" | "PROMOCIONAL";

// Estados brasileiros
export type Estado =
  | "AC"
  | "AL"
  | "AP"
  | "AM"
  | "BA"
  | "CE"
  | "DF"
  | "ES"
  | "GO"
  | "MA"
  | "MT"
  | "MS"
  | "MG"
  | "PA"
  | "PB"
  | "PR"
  | "PE"
  | "PI"
  | "RJ"
  | "RN"
  | "RS"
  | "RO"
  | "RR"
  | "SC"
  | "SP"
  | "SE"
  | "TO";

// ==========================
// Cliente / User
// ==========================
export interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  genero: Genero;
  dataNascimento: string; // LocalDate do backend vem como string ISO
  email: string;
  tipoTelefone: TipoTelefone;
  ddd: string;
  numeroTelefone: string;
  ativo: boolean;
  ranking: number;
  enderecos?: Endereco[];
  cartoes?: CartaoCredito[];
  senha?: string;
}

// Alias para compatibilidade
export type User = Cliente;

export interface ClienteDTO {
  id: number;
  nome: string;
  cpf: string;
  genero: Genero;
  dataNascimento: string;
  email: string;
  tipoTelefone: TipoTelefone;
  ddd: string;
  numeroTelefone: string;
  ativo: boolean;
  ranking: number;
}

export interface ClienteDetalhadoDTO extends ClienteDTO {
  enderecos: Endereco[];
  cartoes: CartaoCredito[];
}

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
  enderecos?: CreateClienteEnderecoDTO[];
}

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

export interface ClienteUpdateSenhaDTO {
  senhaAtual: string;
  novaSenha: string;
  confirmaSenha: string;
}

export interface LoginDTO {
  email: string;
  senha: string;
}

// ==========================
// Endereço
// ==========================
export interface Endereco {
  id: number;
  tipoResidencia: TipoResidencia;
  tipoLogradouro: TipoLogradouro;
  tipoEndereco: TipoEndereco;
  apelido: string;
  logradouro: string;
  numero: number;
  bairro: string;
  cep: string;
  cidade: string;
  estado: Estado;
  pais: string;
  clienteId: number;
}

export interface EnderecoDTO {
  id?: number;
  tipoResidencia: TipoResidencia;
  tipoLogradouro: TipoLogradouro;
  tipoEndereco: TipoEndereco;
  apelido: string;
  logradouro: string;
  numero: number;
  bairro: string;
  cep: string;
  cidade: string;
  estado: Estado;
  pais: string;
  clienteId?: number;
}

export interface CreateClienteEnderecoDTO {
  id?: number;
  apelido: string;
  tipoResidencia: TipoResidencia;
  tipoLogradouro: TipoLogradouro;
  tipoEndereco: TipoEndereco;
  logradouro: string;
  numero: number;
  bairro: string;
  cep: string;
  cidade: string;
  estado: Estado;
  pais: string;
}

// ==========================
// Cartão de Crédito
// ==========================
export interface CartaoCredito {
  id: number;
  numero: string;
  numeroMascarado?: string;
  nomeTitular: string;
  codigoSeguranca: string;
  bandeira: BandeiraCartao;
  clienteId: number;
}

export interface CartaoCreditoDTO {
  nomeImpresso: string;
  numeroCartao: any;
  id?: number;
  numero: string;
  nomeTitular: string;
  validade: string;
  codigoSeguranca: string;
  bandeira: string;
  clienteId: number;
}
export interface NovoCardDTO {
  numero: string;
  nomeTitular: string;
  validade: string; // MM/YY ou MM/YYYY
  codigoSeguranca: string;
  bandeira?: BandeiraCartao;
}

export interface CartaoPagamentoDTO {
  cartaoId?: number;
  newCard?: NovoCardDTO;
  parcelas?: number;
  valor: number;
}

export interface CartaoReferenceDTO {
  cartaoId: number;
}

// ==========================
// Carrinho
// ==========================
export interface CarrinhoDTO {
  id: number;
  clienteId: number;
  itens: CarrinhoItemDTO[];
  desconto?: number;
  cupomCodigo?: string;
}

export interface CarrinhoItemDTO {
  id?: number;
  clienteId?: number;

  livroId: number;
  quantidade: number;
  titulo?: string;
  precoUnitario?: number;
  autor: string;
  editora: string;
  imagemUrl: string;
}

export interface CarrinhoUpdateItemDTO {
  carrinhoId: number;
  livroId: number;
  quantidade: number; // 0 para remover
}

// ==========================
// Livros e Categorias
// ==========================
export interface LivroDTO {
  id: number;
  titulo: string;
  autor: string;
  descricao?: string;
  editoraId: number;
  preco: number;
  publicacao: string;
  estoque: number;
  peso: number;
  categoriaIds?: number[];
  categoriaNomes?: string[];
  imagemUrl?: string;
}

export interface CategoriaDTO {
  id: number;
  nome: string;
}

// ==========================
// Cupons
// ==========================
export interface CupomUseDTO {
  cupomId?: number;
  codigo?: string;
  tipoCupom?: TipoCupom;
}

export interface CouponDTO {
  id: number;
  codigo: string;
  tipo: string;
  valor: number;
  percentual: boolean;
  valorMinimo?: number;
  ativo: boolean;
  singleUse?: boolean;
  dataValidade?: string;
}

// ==========================
// Checkout e Pedidos
// ==========================
export interface CheckoutRequestDTO {
  clienteId?: number;
  carrinhoId: number;
  enderecoEntregaId?: number;
  novoEnderecoEntrega?: EnderecoDTO;
  cartoesPagamento?: CartaoPagamentoDTO[];
  cupons?: CupomUseDTO[];
  cupomPromocionalCodigo?: string;
  valorTotal?: number;
  observacoes?: string;
}

export interface CheckoutResponseDTO {
  pedidoId: number;
  status: string;
  valorTotal: number;
  valorPago: number;
  mensagem?: string;
}

export interface OrderDTO {
  id: number;
  clienteId: number;
  enderecoEntrega: EnderecoDTO;
  itens: OrderItemDTO[];
  cupons?: CupomUseDTO[];
  valorTotal: number;
  status: string;
  dataCriacao: string;
}

export interface OrderItemDTO {
  id?: number;
  livroId: number;
  titulo: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  preco_total: number;
}

  

export interface PedidoDTO {
  id: number;
  status: string;
  clienteId: number;
  itens: {
    precoUnitario: number;
    id: number;
    livroId: number;
    titulo?: string;
    subtotal?: number;
    preco_total?: number;
    quantidade: number;
  }[];
  valorTotal?: number;
  valorFrete?: number;
  codigoRastreamento?: string;
  dataPedido?: string;
  dataEntrega?: string;
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
  updateUser: (updatedUserData: Partial<User>) => Promise<void>;
}

// ==========================
// Tipos auxiliares (Frontend)
// ==========================
export interface ShippingOption {
  id: string;
  label: string;
  price: number;
}

export interface CartItem {
  id: number;
  livroId: number;
  book_id: number;
  quantidade: number;
  price: number;
  titulo?: string;
  autor?: string;
  imagemUrl?: string;
}

// ==========================
// Tipos de resposta da API
// ==========================
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}


export interface Livro {
  id: number;
  titulo: string;
  autor: string;
  descricao: string;
  editoraId: number;
  preco: number;
  publicacao: string;
  estoque: number;
  peso: number;
  categoriaIds: number[];
  imagemUrl: string;
}