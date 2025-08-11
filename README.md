# WIP (Warehouse Inbound Process)

### Sobre o Projeto

Este é um sistema web simplificado para gerenciamento de entradas em armazém, focado em operações de logística reversa. O projeto emula um WMS (Warehouse Management System) básico, utilizando uma arquitetura leve e totalmente baseada em tecnologias web padrão para garantir rastreabilidade e integridade dos dados.

### Arquitetura e Tecnologias

-   **Frontend:** HTML, CSS e JavaScript puros (sem frameworks).
-   **Backend:** Um Google Form integrado a uma Google Sheet, que atua como banco de dados. Os dados são enviados via requisições assíncronas.
-   **Autenticação:** Baseada em um token de acesso único, armazenado localmente no navegador (`localStorage`) para persistência de sessão.
-   **Hospedagem:** O projeto é projetado para ser servido por um servidor web (como GitHub Pages, Vercel ou um servidor local) para evitar erros de CORS (Cross-Origin Resource Sharing).

### Estrutura de Arquivos

/
├── css/
│   └── style.css
├── js/
│   ├── auth.js
│   ├── wip-reversa.js
│   └── wip-reversa-pesquisa.js
├── index.html
├── home.html
├── wip-reversa.html
├── wip-reversa-pesquisa.html
└── README.md

### Como Usar

#### 1. Configuração do Token

A segurança do sistema é baseada em um token que deve ser gerado e mantido confidencialmente.

-   Abra a página `index.html`.
-   Insira o seu **token de acesso** e, opcionalmente, seu nome.
-   Clique em "Entrar". O token e o nome serão salvos no seu navegador para futuras sessões.

#### 2. Acessando a Aplicação

Devido às restrições de segurança do navegador, a aplicação **não funcionará corretamente se aberta diretamente do sistema de arquivos (`file:///`)**. Você deve hospedá-la em um servidor web.

**Recomendado:**
-   Utilize a extensão **"Live Server"** no Visual Studio Code para rodar o projeto localmente.
-   Hospede os arquivos em um serviço gratuito como **GitHub Pages**.

#### 3. Utilizando os Módulos

Após o login, você será direcionado para `home.html`, onde poderá escolher entre os módulos:

-   **WIP - Reversa (Entrada):** Formulário de conferência de entrada de produtos. Após preencher e salvar, os dados são enviados para a planilha do Google Sheets.
-   **WIP - Reversa (Pesquisa):** Tabela de consulta dos dados já inseridos. Inclui filtros de busca dinâmicos para facilitar a localização de itens.
