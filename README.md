# Campo Minado ETEPD

Campo Minado web público para os alunos e comunidade da ETE Porto Digital, com ranking global em tempo real.

## Stack

- **Frontend:** React + Tailwind CSS v4 + Vite
- **Backend (lógica do jogo):** Python + FastAPI
- **Banco de dados (ranking):** Firestore
- **Deploy:** Firebase Hosting (frontend) + serviço a definir para o backend Python

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

## Decisões de arquitetura

- O backend Python é responsável por toda a lógica do jogo (tabuleiro, bombas, flood fill, vitória/derrota).
- O Firestore é usado exclusivamente para o ranking — o frontend lê e escreve diretamente nele (via `onSnapshot`), sem passar pelo backend Python.
