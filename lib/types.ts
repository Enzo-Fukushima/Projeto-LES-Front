// src/lib/types.ts
export interface Cliente {
  id: number
  nome: string
  cpf: string
  genero: string
  dataNascimento: string // LocalDate no backend, vem como string ISO
  email: string
  tipoTelefone: string // TipoTelefoneEnum convertido para string
  ddd: string
  numeroTelefone: string
  ativo: boolean
  ranking: number
  enderecos?: Endereco[]
  cartoes?: CartaoCredito[]
  // campo auxiliar para exibir telefone completo
  telefone?: string
}

export interface Endereco {
  id: number
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  cep: string
}

export interface CartaoCredito {
  id: number
  numero: string
  nomeTitular: string
  validade: string
  codigoSeguranca: string
}
