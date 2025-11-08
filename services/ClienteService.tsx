import api from "@/lib/api";
import type {
  ClienteDTO,
  ClienteDetalhadoDTO,
  ClienteUpdateDTO,
  CreateClienteDTO,
  ClienteUpdateSenhaDTO,
  User,
  CreateEnderecoDTO,
} from "@/lib/types";

export const clientesService = {
  /** 🔹 Lista todos os clientes */
  async list(): Promise<ClienteDTO[]> {
    try {
      const { data } = await api.get<ClienteDTO[]>("/clientes");
      return data;
    } catch (error) {
      console.error("Erro ao listar clientes:", error);
      throw error;
    }
  },

  /** 🔹 Busca cliente por ID */
  async getById(id: number): Promise<ClienteDetalhadoDTO> {
    try {
      const { data } = await api.get<ClienteDetalhadoDTO>(`/clientes/${id}`);
      return data;
    } catch (error) {
      console.error(`Erro ao buscar cliente ${id}:`, error);
      throw error;
    }
  },

  /** 🔹 Cria novo cliente */
  async create(userData: Partial<User>): Promise<ClienteDetalhadoDTO> {
    try {
      const payload: CreateClienteDTO = {
        id: userData.id,
        nome: userData.nome ?? "",
        cpf: userData.cpf ?? "",
        genero: userData.genero ?? "OUTRO",
        dataNascimento:
          userData.dataNascimento ?? new Date().toISOString().split("T")[0],
        email: userData.email ?? "",
        senha: userData.senha ?? "",
        tipoTelefone: userData.tipoTelefone ?? "CELULAR",
        ddd: userData.ddd ?? "11",
        numeroTelefone: userData.numeroTelefone ?? "",
        ativo: userData.ativo ?? true,
        ranking: userData.ranking ?? 0,
        enderecos:
          userData.enderecos?.map<CreateEnderecoDTO>((e) => ({
            tipoEndereco: e.tipoEndereco ?? "ENTREGA",
            tipoResidencia: e.tipoResidencia ?? "CASA",
            tipoLogradouro: e.tipoLogradouro ?? "RUA",
            logradouro: e.logradouro,
            numero: e.numero,
            apelido: e.apelido,
            bairro: e.bairro,
            cidade: e.cidade,
            estado: e.estado,
            cep: e.cep,
            pais: e.pais ?? "Brasil",
          })) ?? [],
      };

      const { data } = await api.post<ClienteDetalhadoDTO>(
        "/clientes",
        payload
      );
      return data;
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      throw error;
    }
  },

  /** 🔹 Atualiza dados do cliente */
  async update(
    id: number,
    payload: ClienteUpdateDTO
  ): Promise<ClienteDetalhadoDTO> {
    try {
      const { data } = await api.put<ClienteDetalhadoDTO>(
        `/clientes/${id}`,
        payload
      );
      return data;
    } catch (error) {
      console.error(`Erro ao atualizar cliente ${id}:`, error);
      throw error;
    }
  },

  /** 🔹 Altera senha do cliente */
  async changePassword(
    id: number,
    payload: ClienteUpdateSenhaDTO
  ): Promise<ClienteDetalhadoDTO> {
    try {
      const { data } = await api.put<ClienteDetalhadoDTO>(
        `/clientes/${id}/senha`,
        payload
      );
      return data;
    } catch (error) {
      console.error(`Erro ao alterar senha do cliente ${id}:`, error);
      throw error;
    }
  },

  /** 🔹 Inativa cliente */
  async deactivate(id: number): Promise<void> {
    try {
      await api.put(`/clientes/${id}/inativar`);
    } catch (error) {
      console.error(`Erro ao inativar cliente ${id}:`, error);
      throw error;
    }
  },

  /** 🔹 Ativa cliente */
  async activate(id: number): Promise<void> {
    try {
      await api.put(`/clientes/${id}/ativar`);
    } catch (error) {
      console.error(`Erro ao ativar cliente ${id}:`, error);
      throw error;
    }
  },

  /** 🔹 Realiza login do cliente */
  async login(payload: {
    email: string;
    senha: string;
  }): Promise<ClienteDetalhadoDTO> {
    console.log(payload)
    try {
      const { data } = await api.post<ClienteDetalhadoDTO>(
        "/clientes/login",
        payload
      );
      return data;
    } catch (error) {
      console.error("Erro ao realizar login:", error);
      throw error;
    }
  },
};
