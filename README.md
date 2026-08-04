# Campo Minado ETEPD

Campo Minado web público para os alunos e comunidade da ETE Porto Digital, com ranking global em tempo real.

## Stack

- **Frontend:** React + Tailwind CSS v4 + Vite
- **Backend (lógica do jogo):** Python + FastAPI
- **Banco de dados (ranking):** Firestore
- **Deploy:** Firebase Hosting (frontend) + Render (backend)

## Estrutura

```
frontend/   # SPA React (Vite + Tailwind)
backend/    # API FastAPI com a lógica do jogo
```

## Rodando localmente

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # preencha as credenciais do Firebase (veja abaixo)
npm run dev
```

#### Configurando o Firebase (ranking)

O ranking usa o Firestore diretamente do frontend, sem passar pelo backend
Python. Para rodar localmente com o ranking funcionando:

1. Crie um projeto em [console.firebase.google.com](https://console.firebase.google.com).
2. Ative o **Firestore Database** (modo produção).
3. Em *Configurações do projeto > Seus apps*, registre um app Web e copie o
   objeto de configuração do SDK.
4. Cole os valores em `frontend/.env` (a partir de `.env.example`):
   `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`,
   `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`,
   `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`.
5. Publique as regras de segurança em [firestore.rules](firestore.rules):
   `firebase deploy --only firestore:rules` (requer a Firebase CLI e
   `firebase init` apontando para este projeto).

Sem essas variáveis preenchidas, o resto do jogo funciona normalmente —
só o "Salvar no ranking" e a tela de Ranking não vão funcionar.

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Deploy

**Por que Render para o backend:** entre Render/Railway/Fly.io (citados no
briefing), o Render foi escolhido por ter o setup mais simples para uma API
Python simples como essa — detecta o `runtime: python` automaticamente, tem
free tier sem cartão de crédito, e o `render.yaml` na raiz já descreve o
serviço (blueprint) — depois é só conectar o repositório.

### Backend (Render)

1. Crie uma conta em [render.com](https://render.com) e conecte este
   repositório GitHub.
2. Render > New > Blueprint, aponte para este repo — ele lê `render.yaml`
   automaticamente (build: `pip install -r requirements.txt`, start:
   `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, `rootDir: backend`).
3. Quando pedir a variável `FRONTEND_ORIGINS`, deixe em branco por enquanto
   (volta nesse passo depois do deploy do frontend, no passo 4 abaixo).
4. Depois do deploy, copie a URL pública (algo como
   `https://campo-minado-etepd-backend.onrender.com`).

### Frontend (Firebase Hosting)

1. `npm install -g firebase-tools` (uma vez só) e `firebase login`.
2. Edite [.firebaserc](.firebaserc) trocando o `default` pelo ID real do seu
   projeto Firebase (ou rode `firebase use --add`).
3. Em `frontend/.env` (produção), aponte `VITE_API_URL` para a URL do
   Render do passo anterior, e preencha as credenciais do Firebase (veja a
   seção acima).
4. Build + deploy:
   ```bash
   cd frontend
   npm run build
   cd ..
   firebase deploy --only hosting,firestore:rules
   ```
5. Copie o domínio publicado (`https://<projeto>.web.app`) e volte no
   Render para preencher `FRONTEND_ORIGINS` com esse domínio (o backend só
   aceita requisições CORS de origens explicitamente permitidas —
   `app/main.py` lê essa variável).

`firebase.json` já configura o Hosting para servir `frontend/dist` com
rewrite de SPA (todas as rotas caem em `index.html`, necessário para o
React Router funcionar em URLs diretas como `/ranking`).

## Decisões de arquitetura

- O backend Python é responsável por toda a lógica do jogo (tabuleiro, bombas, flood fill, vitória/derrota).
- O Firestore é usado exclusivamente para o ranking — o frontend lê e escreve diretamente nele (via `onSnapshot`), sem passar pelo backend Python.
