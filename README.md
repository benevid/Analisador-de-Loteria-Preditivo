# 🎯 Analisador de Loteria Preditivo

<div align="center">

![Analisador de Loteria](https://img.shields.io/badge/Loteria-Preditivo-cyan?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue?style=for-the-badge&logo=typescript)
![Three.js](https://img.shields.io/badge/Three.js-3D-green?style=for-the-badge&logo=three.js)

**Análise estatística avançada e visualizações 3D interativas para jogos de loteria**

*Descubra padrões, visualize tendências e explore dados da Lotofácil com tecnologia de ponta*

</div>

---

## 📖 **Sobre o Projeto**

O **Analisador de Loteria Preditivo** é uma aplicação web moderna que transforma dados brutos da loteria em insights visuais poderosos. Utilizando algoritmos estatísticos avançados e visualizações 3D interativas, o sistema permite:

- 📊 **Análise de frequência** de números sorteados
- 🔗 **Mapeamento de conexões sequenciais** entre números
- 🎬 **Visualização temporal** da evolução dos padrões
- 🎲 **Geração inteligente** de jogos baseada em estatísticas
- 🤖 **Assistente IA** para análises avançadas

### ✨ **Principais Funcionalidades**

🎯 **5 Tipos de Visualização:**
- **Mapa de Calor**: Grid 5x5 mostrando frequência dos números
- **Matriz 2D**: Conexões sequenciais com curvas elegantes
- **Histograma**: Distribuição de somas dos jogos
- **Grafo 3D**: Rede tridimensional de conexões
- **3D Interativo**: Exploração imersiva com seleção de nós

🎬 **Player Automático:**
- **5 velocidades**: 0.5x a 4x
- **Controles completos**: Play/Pause/Stop
- **Evolução temporal**: Veja padrões se formarem em tempo real

🎲 **Gerador Inteligente:**
- **Filtros avançados**: Evita jogos existentes, sequências
- **Parâmetros configuráveis**: Força mínima de nós e arestas
- **Exportação CSV**: Salve seus jogos gerados

🤖 **Assistente IA:**
- **Google Gemini integrado**: Análises contextuais
- **Insights personalizados**: Interpretação dos padrões
- **Recomendações estratégicas**: Baseadas nos dados

---

## 🚀 **Como Executar o Projeto**

### **📋 Pré-requisitos**

- **Node.js** (versão 18 ou superior) - [Download](https://nodejs.org/)
- **npm** (incluído com Node.js)
- **Navegador moderno** com suporte a WebGL

### **⚡ Instalação e Execução**

1. **Clone o repositório:**
```bash
git clone <url-do-repositorio>
cd Analisador-de-Loteria-Preditivo
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure a chave do Gemini AI (obrigatória para o Assistente IA):**
```bash
# Copie o arquivo de exemplo
cp env.local.example .env.local

# Edite o arquivo .env.local e adicione sua chave do Gemini:
# VITE_GEMINI_API_KEY=sua_chave_do_gemini_aqui
```

**🔑 Como obter a chave do Gemini:**
1. Acesse: [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em **"Create API Key"**
4. Copie a chave gerada
5. Cole no arquivo `.env.local`

4. **Execute o projeto:**
```bash
npm run dev
```

5. **Acesse no navegador:**
```
http://localhost:5173
```

### **🔧 Scripts Disponíveis**

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build
```

---

## 📂 **Preparação dos Dados da Lotofácil**

### **🎯 Dados Oficiais da Caixa Econômica Federal**

Para usar o sistema com dados reais da Lotofácil, siga estes passos:

#### **1. Download dos Dados Oficiais**
1. Acesse o site oficial: [Caixa Econômica Federal - Lotofácil](https://loterias.caixa.gov.br/Paginas/Lotofacil.aspx)
2. Procure por **\"Resultados/Estatísticas\"** ou **\"Baixar Resultados\"**
3. Baixe o arquivo **XLSX** com todos os resultados históricos
4. **Arquivo típico**: `Lotofacil_Resultados_Historicos.xlsx`

#### **2. Conversão XLSX → CSV**

**Opção A - Excel/LibreOffice:**
1. Abra o arquivo `.xlsx` no Excel ou LibreOffice Calc
2. Vá em **Arquivo → Salvar Como**
3. Escolha formato **CSV (separado por vírgulas)**
4. Salve como `lotofacil_resultados.csv`

**Opção B - Online (recomendado):**
1. Use conversores online como [Convertio](https://convertio.co/xlsx-csv/) ou [OnlineConvertFree](https://onlineconvertfree.com/xlsx-to-csv/)
2. Upload do arquivo XLSX
3. Download do CSV resultante

#### **3. Formato CSV Esperado**

O arquivo CSV deve ter esta estrutura:
```csv
Concurso,Data,Bola1,Bola2,Bola3,Bola4,Bola5,Bola6,Bola7,Bola8,Bola9,Bola10,Bola11,Bola12,Bola13,Bola14,Bola15
1,29/09/2003,18,20,25,23,10,11,24,14,6,2,13,9,5,16,15
2,30/09/2003,20,14,15,12,16,18,22,25,4,10,13,5,7,3,23
...
```

**⚠️ Importante:**
- **Separador**: Vírgula (`,`) ou ponto-e-vírgula (`;`)
- **Colunas obrigatórias**: `Bola1` até `Bola15`
- **Valores**: Números de 1 a 25
- **Encoding**: UTF-8 (recomendado)

#### **4. Upload no Sistema**

1. **Execute o projeto** (`npm run dev`)
2. **Clique em \"Importar Dados\"** no cabeçalho
3. **Selecione o arquivo CSV** da Lotofácil
4. **Aguarde o processamento** (pode demorar alguns segundos)
5. **Explore as visualizações!** 🎉

---

## 🏗️ **Arquitetura do Projeto**

### **📁 Estrutura de Arquivos**

```
Analisador-de-Loteria-Preditivo/
├── components/                 # Componentes React
│   ├── Dashboard.tsx          # Dashboard principal
│   ├── NumberGenerator.tsx    # Gerador de jogos
│   ├── Matrix2DView.tsx       # Visualização 2D
│   ├── ThreeScene.tsx         # Visualizações 3D
│   ├── AiAssistant.tsx        # Assistente IA
│   └── UI/                    # Componentes de UI
│       ├── GameSlider.tsx     # Slider com player automático
│       ├── Icons.tsx          # Ícones do sistema
│       └── Notification.tsx   # Sistema de notificações
├── services/                  # Lógica de negócio
│   ├── lotteryService.ts      # Análise estatística
│   └── aiService.ts           # Integração com IA
├── types.ts                   # Definições TypeScript
├── styles.css                 # Estilos globais
├── App.tsx                    # Componente principal
└── index.tsx                  # Entry point
```

### **🛠️ Tecnologias Utilizadas**

**Frontend:**
- ⚛️ **React 18.2.0**: Interface reativa moderna
- 📘 **TypeScript**: Tipagem estática
- 🎨 **Tailwind CSS**: Estilização utilitária
- 📱 **Responsive Design**: Mobile-first

**Visualizações 3D:**
- 🌐 **Three.js**: Renderização 3D
- 🔄 **React Three Fiber**: Integração React + Three.js
- 🎛️ **Drei**: Utilitários para Three.js

**Análise de Dados:**
- 📊 **Algoritmos estatísticos** personalizados
- 📈 **Análise sequencial** de padrões
- 🔢 **Cálculos de frequência** e correlação

**Integrações:**
- 🤖 **Google Gemini**: Assistente IA
- 📄 **PapaParse**: Processamento CSV
- 🔧 **Vite**: Build tool moderna

---

## 📊 **Funcionalidades Detalhadas**

### **🎯 Sistema de Análise**

#### **Análise de Frequência:**
- **Contagem**: Frequência absoluta de cada número (1-25)
- **Normalização**: Valores entre 0 e 1 para comparação
- **Ranking**: Números mais e menos sorteados
- **Tendências**: Evolução temporal das frequências

#### **Análise Sequencial:**
- **Conexões**: Mapeamento de números consecutivos nos sorteios
- **Peso das arestas**: Baseado na repetição das sequências  
- **Caminhos preferenciais**: Rotas mais comuns nos resultados
- **Padrões emergentes**: Detecção automática de tendências

#### **Distribuição de Somas:**
- **Histograma**: Distribuição das somas totais dos jogos
- **Faixas ótimas**: Identificação de somas mais frequentes
- **Outliers**: Detecção de jogos atípicos
- **Probabilidades**: Cálculo de chances por faixa

### **🎬 Player Automático Avançado**

#### **Controles Profissionais:**
- **▶️ Play**: Inicia reprodução automática
- **⏸️ Pause**: Pausa em qualquer momento
- **⏹️ Stop**: Para e volta ao início
- **🔄 Loop**: Reinicia automaticamente no final

#### **Velocidades Personalizáveis:**
- **0.5x** (3s): Análise detalhada - perfeito para estudo
- **0.75x** (2s): Velocidade moderada - boa para observação
- **1x** (1s): Padrão recomendado - velocidade natural
- **2x** (0.5s): Visão rápida - overview dos dados
- **4x** (0.25s): Muito rápido - panorama completo

#### **Feedback Visual:**
- **🟢 Indicador de status**: Verde = rodando, cinza = parado
- **📊 Barra de progresso**: Acompanhe o progresso em tempo real
- **📈 Contador**: Jogos restantes e percentual concluído
- **🎨 Visual dinâmico**: Slider muda de cor durante reprodução

### **🎲 Gerador Inteligente de Jogos**

#### **Algoritmos Avançados:**
- **Força dos nós**: Considera frequência individual dos números
- **Força das arestas**: Pondera conexões sequenciais
- **Evita duplicatas**: Não repete jogos já existentes
- **Anti-sequência**: Evita sequências numéricas óbvias

#### **Filtros Configuráveis:**
- **Evitar existentes**: Toggle para ignorar jogos já sorteados
- **Evitar sequências**: Impede 3+ números consecutivos
- **Força mínima nó**: Slider de 0 a 1 para frequência mínima
- **Força mínima aresta**: Slider para conexões mínimas

#### **Gestão de Jogos:**
- **Prévia**: Veja o jogo antes de salvar
- **Lista**: Gerenciar jogos salvos
- **Exclusão**: Remover jogos individualmente  
- **Exportação**: Download CSV para importar em outros sistemas

### **🤖 Assistente IA Integrado**

#### **Google Gemini Powered:**
- **Contexto completo**: IA tem acesso a todos os dados analisados
- **Insights personalizados**: Interpretações baseadas nos padrões
- **Recomendações**: Sugestões estratégicas para jogos
- **Explicações**: Clarifica conceitos estatísticos complexos

#### **Funcionalidades do Chat:**
- **Perguntas abertas**: \"Quais padrões você identifica?\"
- **Análises específicas**: \"O número 15 é uma boa aposta?\"
- **Comparações**: \"Compare os últimos 50 vs 100 jogos\"
- **Estratégias**: \"Como devo distribuir meus números?\"

---

## 🎨 **Interface e Experiência**

### **📱 Design Responsivo**

#### **Desktop (1024px+):**
- **Layout completo**: Todas as funcionalidades disponíveis
- **Visualizações 3D**: Grafo 3D e 3D Interativo ativos
- **Múltiplas colunas**: Interface otimizada para telas grandes
- **Controles avançados**: Todos os parâmetros acessíveis

#### **Tablet (768px - 1023px):**
- **Layout adaptativo**: Elementos reorganizados para telas médias
- **3D simplificado**: Funcionalidades 3D limitadas
- **Touch-friendly**: Controles otimizados para toque
- **Navegação intuitiva**: Abas e menus colapsáveis

#### **Mobile (< 768px):**
- **Mobile-first**: Interface otimizada para smartphones  
- **3D desabilitado**: Foco em visualizações 2D performáticas
- **Controles grandes**: Botões e sliders touch-friendly
- **Layout vertical**: Elementos empilhados verticalmente

### **🎨 Sistema de Cores e Tema**

#### **Paleta Principal:**
- **Background**: Slate 900 (#0f172a) - Dark theme elegante
- **Cards**: Slate 800 (#1e293b) - Contraste suave
- **Accent**: Cyan 500 (#06b6d4) - Destaque moderno
- **Success**: Green 500 (#10b981) - Feedback positivo
- **Warning**: Orange 500 (#f97316) - Alertas importantes
- **Error**: Red 500 (#ef4444) - Erros e validações

#### **Tipografia:**
- **Títulos**: Inter/System-UI - Clean e profissional
- **Corpo**: Tailwind default - Legibilidade otimizada
- **Código**: Mono - Para dados técnicos

#### **Efeitos Visuais:**
- **Glass morphism**: Cards com transparência e blur
- **Gradientes**: Transições suaves de cor
- **Sombras**: Profundidade e hierarquia visual
- **Animações**: Transições de 200ms para fluidez

---

## 🔧 **Configuração Avançada**

### **⚙️ Variáveis de Ambiente**

Crie um arquivo `.env.local` baseado no `env.local.example`:

```env
# Google Gemini AI API Key (obrigatória para Assistente IA)
VITE_GEMINI_API_KEY=sua_chave_do_gemini_aqui

# Configurações opcionais do projeto
VITE_APP_NAME="Analisador de Loteria Preditivo"
VITE_DEBUG_MODE=false
```

**🔑 Chave do Gemini AI:**
- **Obrigatória**: Para usar o Assistente IA
- **Como obter**: [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Gratuita**: Limits generosos para uso pessoal
- **Segurança**: Nunca commite a chave no repositório

### **🎯 Personalização de Parâmetros**

#### **Análise Estatística:**
```typescript
// Em lotteryService.ts
const LOTTERY_NUMBERS = 25;        // Total de números (1-25)
const GAME_SIZE = 15;              // Números por jogo
const MIN_FREQUENCY = 0.1;         // Frequência mínima para análise
const EDGE_LIMIT = 50;             // Máximo de conexões 3D
```

#### **Interface:**
```typescript
// Em Dashboard.tsx  
const DEFAULT_VIEW = 'heatmap';     // Vista inicial
const MOBILE_BREAKPOINT = 768;     // Breakpoint mobile
const ANIMATION_DURATION = 200;    // Duração das transições
```

#### **Player Automático:**
```typescript
// Em GameSlider.tsx
const DEFAULT_SPEED = 1000;        // 1 segundo por jogo
const SPEED_OPTIONS = [            // Velocidades disponíveis
  { speed: 3000, label: '0.5x' },
  { speed: 2000, label: '0.75x' },
  { speed: 1000, label: '1x' },
  { speed: 500, label: '2x' },
  { speed: 250, label: '4x' }
];
```

---

## 📈 **Performance e Otimização**

### **⚡ Otimizações Implementadas**

#### **React:**
- **Lazy Loading**: Componentes 3D carregados sob demanda
- **Memoização**: React.memo e useMemo para evitar re-renders
- **Debounce**: Operações pesadas com delay
- **Virtual Lists**: Para grandes volumes de dados

#### **Three.js:**
- **Context Recovery**: Recuperação automática de WebGL
- **LOD (Level of Detail)**: Geometrias simplificadas para performance
- **Instancing**: Reutilização de geometrias
- **Frustum Culling**: Renderização apenas do visível

#### **Dados:**
- **Incremental Analysis**: Análise progressiva para não bloquear UI
- **Worker Threads**: Cálculos pesados em background (futuro)
- **Caching**: Resultados intermediários em memória
- **Compression**: Otimização de estruturas de dados

### **📊 Métricas de Performance**

#### **Tempos Típicos:**
- **Carregamento inicial**: < 2s
- **Processamento CSV (1000 jogos)**: < 1s  
- **Mudança de visualização**: < 500ms
- **Player automático**: 60fps constante
- **Análise incremental**: < 100ms por step

#### **Uso de Memória:**
- **Base da aplicação**: ~50MB
- **Dados (1000 jogos)**: ~10MB
- **Visualização 3D**: ~20MB
- **Total típico**: < 100MB

---

## 🧪 **Testes e Validação**

### **✅ Testes Manuais Recomendados**

#### **1. Teste de Dados:**
```bash
# Use dados pequenos primeiro (10-50 jogos)
# Verifique se padrões fazem sentido
# Compare com análise manual dos mesmos dados
```

#### **2. Teste de Performance:**
```bash
# Carregue 1000+ jogos
# Teste todas as visualizações  
# Use player automático em velocidade máxima
# Verifique uso de memória no DevTools
```

#### **3. Teste de Responsividade:**
```bash
# Teste em Chrome, Firefox, Safari
# Redimensione janela dinamicamente
# Teste touch em dispositivos móveis
# Verifique WebGL em diferentes GPUs
```

### **🐛 Debugging**

#### **Console Logs Úteis:**
```javascript
// Dados carregados
console.log('Jogos carregados:', games.length);

// Análise estatística
console.log('Nós:', nodes.length, 'Arestas:', edges.length);

// Performance 3D
console.log('WebGL Context:', gl.getParameter(gl.VERSION));
```

#### **DevTools Tips:**
- **Performance Tab**: Monitor FPS durante animações
- **Memory Tab**: Detectar vazamentos de memória  
- **Network Tab**: Verificar carregamento de assets
- **Console**: Logs detalhados de operações

---

## 🚀 **Deploy e Produção**

### **📦 Build de Produção**

```bash
# Criar build otimizado
npm run build

# Testar build localmente  
npm run preview

# Deploy para serviços estáticos
# Vercel, Netlify, GitHub Pages, etc.
```

### **🌐 Opções de Deploy**

#### **Vercel (Recomendado):**
1. Conecte o repositório
2. Configure build command: `npm run build`
3. Output directory: `dist`
4. Deploy automático

#### **Netlify:**
1. Arraste a pasta `dist` para o dashboard
2. Ou conecte via Git para deploy contínuo
3. Configure redirects se necessário

#### **GitHub Pages:**
```bash
# Instalar gh-pages
npm install --save-dev gh-pages

# Adicionar script ao package.json
"deploy": "gh-pages -d dist"

# Deploy
npm run build && npm run deploy
```

### **⚙️ Configurações de Produção**

#### **Vite Config Otimizado:**
```typescript
// vite.config.ts
export default {
  build: {
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          three: ['three', '@react-three/fiber', '@react-three/drei']
        }
      }
    }
  }
}
```

---

## 🤝 **Contribuição e Desenvolvimento**

### **🔀 Como Contribuir**

1. **Fork** o projeto
2. **Crie uma branch** para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra um Pull Request**

### **📝 Diretrizes de Código**

#### **TypeScript:**
- Use tipagem estrita
- Prefira interfaces a types para objetos
- Documente funções complexas com JSDoc

#### **React:**
- Componentes funcionais com hooks
- Props tipadas com interfaces
- Prefira composição a herança

#### **Estilo:**
- Tailwind CSS para estilização
- Componentes pequenos e focados
- Nomes descritivos para variáveis e funções

### **🛠️ Roadmap de Desenvolvimento**

#### **Próximas Funcionalidades:**
- [ ] **PWA**: Suporte offline e instalação
- [ ] **Mais jogos**: Megasena, Quina, etc.
- [ ] **ML Avançado**: Algoritmos de machine learning
- [ ] **Compartilhamento**: URLs para configurações específicas
- [ ] **Themes**: Modo claro e temas personalizados
- [ ] **Internacionalização**: Múltiplos idiomas
- [ ] **API**: Endpoints para integração externa
- [ ] **Mobile App**: Versão nativa React Native

#### **Melhorias Técnicas:**
- [ ] **Web Workers**: Cálculos em background
- [ ] **WebAssembly**: Performance crítica em WASM
- [ ] **GraphQL**: API mais eficiente
- [ ] **Testing**: Testes unitários e E2E
- [ ] **Monitoring**: Analytics e error tracking

---

## 📞 **Suporte e Contato**

### **🐛 Relatar Bugs**

Se encontrar problemas:
1. **Verifique** se há issues similares
2. **Descreva** o problema detalhadamente
3. **Inclua** passos para reproduzir
4. **Anexe** screenshots se aplicável
5. **Informe** seu navegador/OS

### **💡 Sugerir Funcionalidades**

Para novas ideias:
1. **Pesquise** funcionalidades similares
2. **Explique** o caso de uso
3. **Detalhe** o comportamento esperado
4. **Considere** alternativas existentes

### **🤔 Dúvidas e Discussões**

- **Issues**: Para bugs e features
- **Discussions**: Para dúvidas gerais
- **Email**: Para contato direto
- **Discord/Telegram**: Para chat em tempo real (se disponível)

---

## 📄 **Licença e Uso**

### **📋 Licença**

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

### **⚖️ Termos de Uso**

#### **✅ Permitido:**
- ✅ Uso pessoal e educacional
- ✅ Modificação e distribuição
- ✅ Uso comercial
- ✅ Fork e contribuições

#### **❌ Limitações:**
- ❌ Não é uma ferramenta de aposta
- ❌ Não garante resultados
- ❌ Dados são para análise estatística apenas
- ❌ Jogue com responsabilidade

### **⚠️ Aviso Legal**

> **Este software é para fins educacionais e de entretenimento.**
> 
> **Não oferece garantias sobre resultados futuros de jogos de loteria.**
> 
> **Os padrões identificados são históricos e não preveem sorteios futuros.**
> 
> **Jogue com responsabilidade e dentro de suas possibilidades.**

---

## 🏆 **Créditos e Reconhecimentos**

### **👥 Equipe de Desenvolvimento**

- **Desenvolvedor Principal**: [Seu Nome]
- **UI/UX Design**: Baseado em princípios modernos
- **Análise Estatística**: Algoritmos proprietários
- **Testes**: Comunidade de usuários

### **📚 Tecnologias e Bibliotecas**

Agradecimentos especiais às seguintes tecnologias open-source:

- **⚛️ React Team**: Framework fantástico
- **🌐 Three.js Community**: Visualizações 3D incríveis
- **🎨 Tailwind CSS**: Sistema de design consistente
- **📊 D3.js**: Inspiração para visualizações
- **🤖 Google**: Gemini AI integration
- **🏗️ Vite**: Build tool moderna e rápida

### **🎯 Dados e Referências**

- **📊 Caixa Econômica Federal**: Dados oficiais da Lotofácil
- **📈 Comunidade Estatística**: Métodos de análise
- **🔬 Papers Acadêmicos**: Fundamentos teóricos
- **👥 Beta Testers**: Feedback valioso

---

<div align="center">

### 🎯 **Transforme Dados em Insights**

**Explore padrões • Visualize tendências • Gere estratégias**

---

🌟 **Se este projeto foi útil, considere dar uma ⭐ no GitHub!** 🌟

**Desenvolvido com ❤️ usando React, TypeScript e Three.js**

</div>