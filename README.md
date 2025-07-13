# Gerenciador de Cronograma

Um sistema web para gerenciar cronogramas de atividades e alocação de pessoas por funções.

## 📋 Funcionalidades

- **Cadastro de Pessoas**: Adicione, edite e remova pessoas do sistema
- **Cadastro de Funções**: Gerencie diferentes tipos de funções com cores automáticas
- **Gerenciamento de Dias**: Crie cronogramas por data e período (Manhã, Tarde, Noite, Dia todo)
- **Alocação de Pessoas**: Arraste e solte ou use o modal para alocar pessoas em dias específicos
- **Exportação PDF**: Gere relatórios em PDF com layout profissional
- **Limpeza Seletiva**: Remova dados específicos com opções personalizáveis
- **Persistência Local**: Dados salvos automaticamente no navegador

## 🗂️ Estrutura do Projeto

```
crono/
├── index.html                 # Arquivo principal da aplicação
├── cronograma.html           # Arquivo original (pode ser removido)
├── assets/
│   ├── css/
│   │   └── styles.css        # Estilos da aplicação
│   └── js/
│       ├── data-manager.js   # Gerenciamento de dados e persistência
│       ├── ui-manager.js     # Gerenciamento da interface
│       ├── pdf-export.js     # Exportação para PDF
│       └── schedule-manager.js # Controlador principal
└── README.md                 # Documentação
```

## 🚀 Como Usar

1. **Abrir a Aplicação**: Abra o arquivo `index.html` em um navegador web moderno

2. **Cadastrar Pessoas**:

   - Digite o nome no campo "Nome da pessoa"
   - Clique em "Adicionar" ou pressione Enter

3. **Cadastrar Funções**:

   - Digite o nome da função no campo correspondente
   - A função receberá automaticamente uma cor única

4. **Adicionar Dias**:

   - Selecione uma data no calendário
   - Escolha o período (Manhã, Tarde, Noite, Dia todo)
   - Clique em "Adicionar"

5. **Alocar Pessoas**:

   - **Arrastar e Soltar**: Arraste uma pessoa da lista para um dia
   - **Modal**: Clique no botão "+" em um dia para usar o modal de adição
   - **Mover**: Arraste pessoas entre diferentes dias

6. **Limpeza Seletiva**:
   - Clique em "Limpar Dados" na barra de ferramentas
   - Selecione o que deseja remover com os checkboxes:
     - **Pessoas**: Remove todas as pessoas e suas alocações
     - **Dias**: Remove todos os dias do cronograma
     - **Funções**: Remove funções personalizadas (mantém padrão)
     - **Apenas Alocações**: Remove pessoas dos dias, mantendo cadastros
   - Use "Marcar Todos" / "Desmarcar Todos" para facilitar a seleção
   - Confirme a ação (irreversível)

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura da aplicação
- **CSS3**: Estilos e layout responsivo
- **JavaScript ES6+**: Lógica da aplicação com classes
- **Bootstrap 5**: Framework CSS para componentes
- **Font Awesome**: Ícones
- **jsPDF**: Geração de PDFs
- **LocalStorage**: Persistência de dados local

## 📐 Arquitetura

A aplicação segue o padrão de separação de responsabilidades:

### DataManager

- Gerencia persistência no LocalStorage
- Controla paleta de cores das funções
- Operações de CRUD dos dados

### UIManager

- Renderização de componentes
- Manipulação do DOM
- Formatação de datas e dados para exibição

### PDFExportManager

- Geração de relatórios em PDF
- Layout profissional com estatísticas
- Suporte a múltiplas páginas e colunas

### ScheduleManager

- Controlador principal
- Coordena todas as operações
- Gerencia eventos e interações

## 🎨 Funcionalidades Avançadas

### Cores Automáticas

- Cada função recebe automaticamente uma cor única
- Paleta de 24 cores predefinidas
- Detecção automática de cor clara/escura para o texto

### Drag and Drop

- Arraste pessoas da lista para os dias
- Mova pessoas entre diferentes dias
- Interface intuitiva e responsiva

### Exportação PDF

- Layout em duas colunas
- Cabeçalho e rodapé profissionais
- Estatísticas automáticas
- Quebra de página inteligente

### Limpeza Seletiva de Dados

- **Pessoas**: Remove todas as pessoas e suas alocações
- **Dias**: Remove todos os dias do cronograma
- **Funções**: Remove funções personalizadas (mantém padrão)
- **Apenas Alocações**: Remove pessoas dos dias, mantendo pessoas e dias cadastrados
- **Controles Inteligentes**: Opções mutuamente exclusivas e validação

### Responsividade

- Design responsivo para desktop e mobile
- Cards adaptáveis
- Scrollbars customizadas

## 💾 Persistência de Dados

Os dados são salvos automaticamente no LocalStorage do navegador:

- `cron_people`: Lista de pessoas
- `cron_days`: Dias do cronograma
- `cron_roles`: Funções disponíveis
- `cron_role_colors`: Cores das funções

## 🔧 Personalização

### Adicionar Novas Cores

Edite a propriedade `colorPalette` em `data-manager.js`:

```javascript
this.colorPalette = [
  "#28a745",
  "#fd7e14", // cores existentes
  "#sua-nova-cor", // adicione aqui
];
```

### Modificar Períodos

Edite os arrays `periodOrder` nos arquivos relevantes:

```javascript
const periodOrder = {
  Manhã: 1,
  Tarde: 2,
  Noite: 3,
  "Dia todo": 4,
  "Seu Período": 5, // adicione aqui
};
```

## 📱 Compatibilidade

- **Navegadores**: Chrome, Firefox, Safari, Edge (versões modernas)
- **Dispositivos**: Desktop, tablet, mobile
- **Impressão**: Suporte otimizado para impressão em papel A4

## ⚡ Performance

- **Carregamento**: Sem dependências pesadas
- **Operações**: Otimizadas para grandes quantidades de dados
- **Memória**: Uso eficiente do LocalStorage

## 🔒 Privacidade

- **Dados Locais**: Todos os dados ficam no navegador do usuário
- **Sem Servidor**: Não há envio de dados para servidores externos
- **Offline**: Funciona completamente offline

## 🐛 Resolução de Problemas

### Dados Não Salvam

- Verifique se o LocalStorage está habilitado
- Certifique-se de que há espaço disponível no navegador

### PDF Não Gera

- Verifique a conexão com a CDN do jsPDF
- Teste em navegador atualizado

### Layout Quebrado

- Limpe o cache do navegador
- Verifique se os arquivos CSS/JS estão sendo carregados

## 📄 Licença

Este projeto é de uso livre para fins educacionais e pessoais.
