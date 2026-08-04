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
npm run dev
```

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
