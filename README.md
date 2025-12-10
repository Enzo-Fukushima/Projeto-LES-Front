# 📚 LES E-commerce - Frontend

Interface moderna e responsiva para e-commerce de livros desenvolvida como projeto da disciplina de Laboratório de Engenharia de Software (LES).

[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.9-38bdf8)](https://tailwindcss.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com)

## 📋 Sobre o Projeto

Interface completa de e-commerce especializado em livros com experiência de usuário moderna, design responsivo e integração total com a API backend. Desenvolvido com Next.js 15 (App Router), TypeScript e componentes reutilizáveis.

## 🚀 Tecnologias Utilizadas

### Core
- **Next.js 15.5.3** - Framework React com App Router
- **React 18.3.1** - Biblioteca JavaScript para interfaces
- **TypeScript 5** - Superset JavaScript com tipagem estática
- **TailwindCSS 4.1.9** - Framework CSS utility-first

### UI Components & Design
- **Radix UI** - Componentes acessíveis e sem estilo
  - Dialog, Dropdown, Select, Toast, Tabs, Avatar, etc.
- **Shadcn/ui** - Sistema de componentes baseado em Radix UI
- **Lucide React** - Ícones modernos e customizáveis
- **next-themes** - Suporte a tema claro/escuro
- **Geist Font** - Tipografia moderna da Vercel
- **Vaul** - Drawer component para mobile
- **Sonner** - Toast notifications elegantes

### Formulários & Validação
- **React Hook Form 7.60.0** - Gerenciamento de formulários performático
- **Zod 3.25.67** - Validação de schemas TypeScript-first
- **@hookform/resolvers** - Integração Zod + React Hook Form

### Data Fetching & State
- **TanStack Query 5.87.1** - Gerenciamento de estado do servidor
- **Axios 1.11.0** - Cliente HTTP
- **React Context API** - Gerenciamento de estado global (via contexts/)

### Visualização de Dados
- **Recharts** - Biblioteca de gráficos para React
- **date-fns 4.1.0** - Manipulação de datas moderna
- **react-day-picker 9.8.0** - Calendário/date picker

### UI/UX Avançado
- **Embla Carousel 8.5.1** - Carrossel performático
- **cmdk 1.0.4** - Command palette (⌘K)
- **input-otp 1.4.1** - Input de código OTP
- **react-resizable-panels 2.1.7** - Painéis redimensionáveis

### Utilities
- **class-variance-authority** - Variantes de componentes tipadas
- **clsx** - Utilitário para classes condicionais
- **tailwind-merge** - Merge de classes Tailwind
- **tailwindcss-animate** - Animações Tailwind

### Testing & Quality
- **Cypress 15.2.0** - Testes E2E
- **ESLint** - Linting
- **Vercel Analytics** - Analytics integrado

## 📦 Pré-requisitos

- Node.js 18 ou superior
- npm, yarn, ou pnpm
- Backend da API rodando (veja [README do Backend](link-para-backend))

## 🔧 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone https://github.com/Enzo-Fukushima/Projeto-LES-Front.git
cd Projeto-LES-Front
```

### 2. Instale as dependências
```bash
# Usando npm
npm install

# Usando yarn
yarn install

# Usando pnpm
pnpm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### 4. Execute o projeto
```bash
# Modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar produção
npm run start
```

A aplicação estará disponível em `http://localhost:3000`

## 🎯 Funcionalidades

### 🏠 Página Inicial
- ✅ Catálogo de livros com grid responsivo
- ✅ Filtros por categoria
- ✅ Busca de livros
- ✅ Destaques e promoções
- ✅ Carrossel de produtos em destaque

### 🔐 Autenticação
- ✅ Cadastro de clientes completo
- ✅ Login com email e senha
- ✅ Gestão de sessão
- ✅ Recuperação de senha
- ✅ Perfil do usuário

### 👤 Área do Cliente
- ✅ Dashboard personalizado
- ✅ Gestão de dados pessoais
- ✅ Múltiplos endereços de entrega
- ✅ Múltiplos cartões de crédito
- ✅ Histórico de pedidos
- ✅ Acompanhamento de entregas
- ✅ Sistema de trocas

### 🛒 Carrinho de Compras
- ✅ Adicionar/remover produtos
- ✅ Atualizar quantidades
- ✅ Cálculo automático de totais
- ✅ Aplicação de cupons de desconto
- ✅ Persistência do carrinho
- ✅ Indicador visual no header

### 💳 Checkout
- ✅ Seleção de endereço de entrega
- ✅ Cadastro de novo endereço no checkout
- ✅ Múltiplas formas de pagamento
- ✅ Pagamento com múltiplos cartões
- ✅ Cadastro de novo cartão no checkout
- ✅ Aplicação de cupons (TROCA, PROMOCIONAL)
- ✅ Resumo detalhado do pedido
- ✅ Validações em tempo real

### 📦 Pedidos
- ✅ Listagem de pedidos
- ✅ Detalhes do pedido
- ✅ Status do pedido (Aberto, Enviado, Entregue)
- ✅ Código de rastreamento
- ✅ Histórico completo

### 🔄 Sistema de Trocas
- ✅ Solicitação de troca de produtos
- ✅ Seleção de itens para trocar
- ✅ Motivo da troca
- ✅ Acompanhamento de status
- ✅ Visualização de cupom gerado
- ✅ Histórico de trocas

### 🤖 Chatbot de Recomendações
- ✅ Interface de chat interativa
- ✅ Recomendações personalizadas por IA
- ✅ Exibição de livros recomendados
- ✅ Adicionar ao carrinho direto do chat
- ✅ Histórico da conversa

### 👨‍💼 Área Administrativa
- ✅ Dashboard com métricas
- ✅ Gestão de pedidos
- ✅ Atualização de status
- ✅ Gestão de trocas
- ✅ Autorização/negação de trocas
- ✅ Confirmação de recebimento
- ✅ Gestão de cupons
- ✅ Analytics de vendas
- ✅ Gráficos interativos (Recharts)

### 🎨 Design & UX
- ✅ Design responsivo (mobile-first)
- ✅ Tema claro/escuro
- ✅ Animações suaves
- ✅ Feedbacks visuais
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error boundaries
- ✅ Acessibilidade (ARIA)

## 📁 Estrutura do Projeto

```
Projeto-LES-Front/
├── app/                          # App Router (Next.js 15)
│   ├── (auth)/                   # Rotas de autenticação
│   │   ├── login/
│   │   └── cadastro/
│   ├── (cliente)/                # Área do cliente
│   │   ├── perfil/
│   │   ├── pedidos/
│   │   ├── trocas/
│   │   └── enderecos/
│   ├── (admin)/                  # Área administrativa
│   │   ├── dashboard/
│   │   ├── pedidos/
│   │   ├── trocas/
│   │   └── analytics/
│   ├── carrinho/
│   ├── checkout/
│   ├── livros/
│   ├── layout.tsx                # Layout principal
│   ├── page.tsx                  # Página inicial
│   └── globals.css               # Estilos globais
├── components/                   # Componentes reutilizáveis
│   ├── ui/                       # Componentes base (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── layout/                   # Componentes de layout
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   ├── carrinho/
│   ├── checkout/
│   ├── livros/
│   └── ...
├── contexts/                     # Context API
│   ├── AuthContext.tsx
│   ├── CartContext.tsx
│   └── ThemeContext.tsx
├── hooks/                        # Custom hooks
│   ├── useAuth.ts
│   ├── useCart.ts
│   └── ...
├── services/                     # Serviços de API
│   ├── api.ts                    # Axios instance
│   ├── clienteService.ts
│   ├── livroService.ts
│   ├── pedidoService.ts
│   ├── cupomService.ts
│   └── trocaService.ts
├── lib/                          # Utilitários
│   ├── utils.ts
│   └── validations.ts
├── styles/                       # Estilos adicionais
├── cypress/                      # Testes E2E
│   ├── e2e/
│   └── support/
├── public/                       # Assets estáticos
├── next.config.mjs               # Configuração Next.js
├── tailwind.config.ts            # Configuração Tailwind
├── tsconfig.json                 # Configuração TypeScript
└── package.json                  # Dependências
```

## 🔗 Integração com Backend

### Configuração da API
O projeto usa Axios para comunicação com o backend. Configure a URL base no arquivo de serviço:

```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Exemplo de Serviço
```typescript
// services/livroService.ts
import api from './api';

export const livroService = {
  listarTodos: async () => {
    const response = await api.get('/livros');
    return response.data;
  },
  
  buscarPorId: async (id: number) => {
    const response = await api.get(`/livros/${id}`);
    return response.data;
  },
};
```

### TanStack Query
```typescript
// hooks/useLivros.ts
import { useQuery } from '@tanstack/react-query';
import { livroService } from '@/services/livroService';

export function useLivros() {
  return useQuery({
    queryKey: ['livros'],
    queryFn: livroService.listarTodos,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
```

## 🎨 Sistema de Design

### Componentes Shadcn/ui
O projeto utiliza componentes do shadcn/ui, que são:
- **Totalmente customizáveis** - código no seu projeto
- **Acessíveis** - baseados em Radix UI
- **Sem dependências ocultas** - você controla tudo
- **Tipados com TypeScript**

### Temas
Suporte a tema claro/escuro usando `next-themes`:

```tsx
import { useTheme } from 'next-themes';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Alternar Tema
    </button>
  );
}
```

### Tailwind CSS
Utility-first CSS com configuração customizada:
- Classes de animação
- Cores personalizadas
- Breakpoints responsivos
- Plugins de animação

## 🧪 Testes

### Cypress E2E
```bash
# Abrir Cypress Test Runner
npx cypress open

# Executar testes em modo headless
npx cypress run
```

Estrutura de testes:
```
cypress/
├── e2e/
│   ├── auth.cy.ts
│   ├── carrinho.cy.ts
│   ├── checkout.cy.ts
│   └── pedidos.cy.ts
└── support/
    └── commands.ts
```

## 📱 Responsividade

O projeto é totalmente responsivo com breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Exemplo de uso:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Conteúdo */}
</div>
```

## 🚀 Deploy

### Vercel (Recomendado)
O projeto está configurado para deploy automático na Vercel:

1. Conecte seu repositório GitHub à Vercel
2. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_API_URL`
3. Deploy automático a cada push na branch `main`

### Build Local
```bash
npm run build
npm run start
```

## 📊 Performance

### Otimizações Next.js 15
- ✅ App Router com Server Components
- ✅ Image Optimization automática
- ✅ Font Optimization (Geist)
- ✅ Bundle splitting automático
- ✅ ISR (Incremental Static Regeneration)

### Best Practices
- ✅ Lazy loading de componentes
- ✅ Code splitting por rota
- ✅ Memoização de componentes pesados
- ✅ Debounce em buscas
- ✅ Virtual scrolling para listas longas

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Cria build de produção

# Produção
npm run start        # Inicia servidor de produção

# Qualidade
npm run lint         # Executa ESLint
```

## 🎯 Roadmap

- [ ] PWA (Progressive Web App)
- [ ] Notificações push
- [ ] Chat em tempo real (WebSocket)
- [ ] Comparação de produtos
- [ ] Lista de desejos
- [ ] Avaliações e comentários
- [ ] Compartilhamento social
- [ ] Internacionalização (i18n)

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 🐛 Reportar Bugs

Encontrou um bug? Abra uma issue detalhando:
- Descrição do problema
- Passos para reproduzir
- Comportamento esperado
- Screenshots (se aplicável)
- Ambiente (navegador, OS)

## 📄 Licença

Projeto acadêmico desenvolvido para a disciplina de Laboratório de Engenharia de Software.

## 👨‍💻 Autores

Desenvolvido como projeto da disciplina LES.

## 🔗 Links Úteis

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Shadcn/ui Documentation](https://ui.shadcn.com)
- [TanStack Query Documentation](https://tanstack.com/query)
- [Backend Repository](link-para-backend)

## 🙏 Agradecimentos

- **v0.dev** - Ferramenta de geração de UI
- **Vercel** - Plataforma de deploy
- **Shadcn** - Sistema de componentes
- **Radix UI** - Primitivos acessíveis
- Disciplina de Laboratório de Engenharia de Software

---

⭐️ Se este projeto foi útil para você, considere dar uma estrela no repositório!

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório do projeto.
