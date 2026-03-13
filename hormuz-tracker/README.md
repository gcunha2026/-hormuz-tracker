# Hormuz Monitor — Deploy na Vercel

## Estrutura do projeto
```
hormuz-tracker/
├── vercel.json          ← config de rotas
├── public/
│   └── index.html       ← o dashboard
└── api/
    ├── intelligence.js  ← Vercel Function: AI brief
    └── prices.js        ← Vercel Function: preços de energia
```

## Deploy em 5 passos

### 1. Instala a Vercel CLI
```bash
npm install -g vercel
```

### 2. Faz login
```bash
vercel login
```

### 3. Entra na pasta do projeto
```bash
cd hormuz-tracker
```

### 4. Faz o deploy
```bash
vercel deploy --prod
```
A Vercel vai perguntar algumas coisas na primeira vez — aceita os defaults (Enter em tudo).

### 5. Adiciona a chave da API Anthropic
Depois do deploy, vai no dashboard da Vercel:
- **Settings → Environment Variables**
- Adiciona: `ANTHROPIC_API_KEY` = `sk-ant-...` (sua chave de https://console.anthropic.com)
- Clica em **Save** e faz **Redeploy**

## Pronto!
Você vai receber uma URL tipo `hormuz-tracker.vercel.app`.

## Onde pegar a chave de API Anthropic
1. Acessa https://console.anthropic.com
2. Menu **API Keys** → **Create Key**
3. Copia a chave (começa com `sk-ant-`)

## Atualizar depois
Qualquer mudança no código → roda `vercel deploy --prod` de novo.
