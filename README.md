🚀 RDTrackR — Sistema Gestão de Estoque Empresarial


📌 Índice

Sobre o Projeto
Como Acessar o Sistema em Produção
Usuário Demo para Testes
Funcionalidades Principais
Screenshots
Arquitetura e Stack Tecnológica
Modelagem (UML e C4)
Requisitos Funcionais e Não Funcionais
Segurança
Próximos Passos
Documentação Completa
Autor

📙 Sobre o Projeto

O RDTrackR é um sistema web profissional de gestão de estoque voltado para empresas de usinagem, indústrias e operações logísticas.
Ele oferece rastreabilidade completa, operações em tempo real, controle multi-depósito, gestão de pedidos de compra, notificações automáticas e um dashboard tático.

Desenvolvido com:
Backend: .NET 8 (Clean Architecture + EF Core + SQL Server)
Frontend: React + TypeScript + Vite + Tailwind
Notificações: SignalR em tempo real
Qualidade: Testes automatizados + SonarCloud
Ambiente: Docker + GitHub Actions (CI/CD)

A solução reduz perdas, melhora rastreamento e aumenta eficiência operacional.
🌐 Como Acessar o Sistema em Produção
A aplicação está disponível em ambiente cloud:
http://3.129.244.42:5173/(em breve https://rdtrackr.com.br)
🔐 Usuário Demo para Testes
Para facilitar a avaliação do sistema:
👤 Usuário: usinagemrd2@hotmail.com
🔑 Senha: Demo@123

Este usuário possui permissões completas e pode:

✔️ Criar produtos
✔️ Registrar movimentações
✔️ Criar pedidos de compra
✔️ Ver notificações em tempo real
✔️ Explorar dashboards

✨ Funcionalidades Principais
🔧 Gestão de Produtos
Cadastro completo (SKU, unidade, localização, categorias)
Controle de ativos/inativos
Estoque mínimo e ponto de reposição

📦 Movimentações de Estoque
Entradas e saídas
Depósito origem/destino
Auditoria automática
Atualizações em tempo real

🏭 Multi-Depósito
Gerenciamento de almoxarifados
Vínculo de produtos por localização
Visão consolidada e detalhada

🛒 Pedidos de Compra (PO)
Fluxo completo de criação, aprovação, itens e fornecedores
Totais automáticos
Histórico e acompanhamento

📊 Dashboard Inteligente
Produtos ativos
Movimentações recentes
Itens críticos
Total em estoque
Comparações e evolução

🔔 Notificações em Tempo Real
Implementado com SignalR
Alertas de estoque baixo
Movimentações instantâneas

🔐 Autenticação e Segurança
JWT
RBAC (perfís e permissões)

Algumas Funcionalidades

Tela de Dashboard
![Tela de Dashboard](docs/Estoque-visão-geral.png)
A tela de Dashboard apresenta uma visão geral do sistema, reunindo métricas essenciais para análise rápida:
Resumo geral de estoque
Itens com baixa disponibilidade
Indicadores de movimentações recentes
Gráficos e estatísticas de desempenho
Acompanhamento rápido das principais KPIs do sistema
Ideal para que o usuário tenha uma visão completa da operação em poucos segundos.

Cadastro de Produtos
![Cadastro de Produtos](docs/itens.png)

A tela de Cadastro de Produtos permite gerenciar todo o catálogo de itens do sistema:
Inserção de novos produtos
Edição de informações existentes
Controle de SKU, nome, categorias e unidades
Gerenciamento de níveis mínimos de estoque
Consulta rápida via busca e filtros avançados
É a base para garantir que os itens estejam devidamente registrados no sistema.

Movimentações do Estoque
![Movimentações](docs/movimentações.png)
A tela de Movimentações registra todas as entradas e saídas de estoque:
Entrada manual de produtos
Saída por consumo, perda, ajuste ou transferência
Histórico completo e auditável
Filtros por data, tipo de movimentação e produto
Informações detalhadas para rastreamento de operações
Permite acompanhar o fluxo real de mercadorias no sistema com total transparência.

Pedidos de Compra (PO)
![Pedidos de Compra (PO)](docs/movimentações.png)
A tela de Pedidos de Compra (Purchase Orders) centraliza todo o processo de aquisição:
Criação de novos pedidos para fornecedores
Definição de quantidades, preços e prazos
Status do PO (Criado, Enviado, Recebido, Cancelado)
Histórico completo de negociações
Integração com movimentações de entrada
Facilita o controle de aquisição de materiais e reposição do estoque.

🧱 Arquitetura e Stack Tecnológica
Padrões
Clean Architecture
Domain-Driven Design (DDD Light)
Repository Pattern
Event-driven com SignalR

Stack
Camada	Tecnologias
Frontend	React, TypeScript, Vite, Tailwind, ShadCN
Backend	.NET 8 API, EF Core, FluentValidation
Banco	SQL Server / PostgreSQL
Comunicação	SignalR (WebSockets)
Infra	Docker, Docker Compose, GitHub Actions
Qualidade	Testes Automatizados + SonarCloud
🧩 Modelagem (UML e C4)
Diagramas de Caso de Uso

🔒 Considerações de Segurança
Uso obrigatório de HTTPS
Tokens JWT com validade curta
Controle por papéis (RBAC)
Logs estruturados
Policies CORS controladas por ambiente
Prevenção contra SQL Injection e XSS

📚 Documentação Completa

Toda a documentação detalhada está disponível em:

[Documentação ](docs/rdtrackr-doc.md)

Incluindo:
✔️ Requisitos
✔️ Diagramas UML
✔️ C4
✔️ Estudos e justificativas
✔️ Arquitetura completa

👤 Autor
João Antonio David
Engenharia de Software – Católica de Santa Catarina
Orientador: Prof. Diogo Vinícius Winck
