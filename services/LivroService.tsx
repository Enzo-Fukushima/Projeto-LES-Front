import api from "@/lib/api";

export const livrosService = {
  list: async () => (await api.get("/livros")).data,
  get: async (id: number) => (await api.get(`/livros/${id}`)).data,
}