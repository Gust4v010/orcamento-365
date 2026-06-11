# 📊 Orçamento 365 — Gerenciador de Finanças Pessoais (v4.0 Premium)

O **Orçamento 365** é uma aplicação web interativa focada no controlo financeiro pessoal, projetada para oferecer uma experiência de utilizador fluida, moderna e totalmente inclusiva. O projeto foi desenvolvido de forma incremental, evoluindo de um Produto Mínimo Viável (MVP) até uma plataforma completa com persistência de dados, gráficos analíticos e inteligência preditiva.

---

## 🚀 Funcionalidades Principais

* **🔒 Tela de Autenticação (Login):** Camada inicial de acesso para proteção de dados do utilizador (Credenciais académicas padrão: `admin` / `admin`).
* **💾 Persistência de Dados (LocalStorage):** Gravação definitiva no navegador do utilizador. Os dados não se perdem ao atualizar ou fechar a página.
* **📊 Gráficos Evolutivos Mensais:** Visualização analítica em tempo real de Ganhos vs Gastos com barras dinâmicas construídas nativamente.
* **🔮 Análise de Saúde Preditiva:** Algoritmo que calcula a taxa de sobrevivência do caixa com base nas despesas e receitas, gerando um diagnóstico financeiro automático.
* **🏷️ Histórico com Filtros Dinâmicos:** Permite isolar e listar transações por tipo (Receitas ou Despesas) e exibe o mês de competência.
* **🔀 Arquitetura SPA (Single Page Application):** Navegação fluida entre abas (Painel, Relatórios e Guia) sem necessidade de recarregar a página.

---

##  Acessibilidade & UI/UX (Diretrizes WCAG AA)

O design e o código foram pensados desde a base para respeitar os critérios de acessibilidade digital:
* **Psicologia das Cores & Contraste:** Uso de paleta *Dark Mode* com alto contraste (fundo azul-escuro estável, verde para receitas e vermelho para despesas) validada para legibilidade.
* **Suporte a Daltónicos:** Mensagens por extenso como `(Negativo)` acompanham as variações de cor do saldo, garantindo que a informação não dependa apenas do fator visual cromático.
* **Atributos ARIA & Leitores de Ecrã:** Implementação de `aria-live="polite"` e `aria-live="assertive"` para que softwares de leitura anunciem atualizações de saldo e notificações de forma inteligente.
* **Navegação por Teclado:** Foco visual altamente demarcado com `outline-offset` para utilizadores que navegam exclusivamente via tecla `TAB`.

---

## 🛠️ Tecnologias Utilizadas

* **HTML5** (Estruturação Semântica)
* **Tailwind CSS** (Estilização Responsiva e Utilitária)
* **JavaScript Puro (Vanilla JS)** (Lógica de Programação, Manipulação do DOM e Estado)
* **Web Storage API** (`localStorage` e `sessionStorage`)

---

## 📂 Organização do Projeto

```plaintext
meu-projeto/
│
├── index.html          # Estrutura semântica e views SPA
├── css/
│   └── style.css       # Customizações visuais, animações e regras de foco
└── js/
    └── app.js          # Autenticação, lógica financeira, gráficos e armazenamento
