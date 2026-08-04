import {
  addDoc,
  collection,
  limit as fsLimit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'

import { db } from './firebase'

const SCORES_COLLECTION = 'scores'
const SAVE_TIMEOUT_MS = 10_000

// O SDK do Firestore não rejeita rápido quando o projeto está mal
// configurado ou inacessível — ele fica tentando reconectar
// indefinidamente. Sem esse timeout, o botão "Salvando…" ficaria preso
// para sempre nesse cenário.
export function saveScore({ playerName, grade, className, difficulty, timeSeconds }) {
  const write = addDoc(collection(db, SCORES_COLLECTION), {
    playerName,
    // Campos opcionais: as regras do Firestore rejeitam string vazia com
    // tamanho inválido, então só mandamos quando o jogador preencheu.
    ...(grade ? { grade } : {}),
    ...(className ? { className } : {}),
    difficulty,
    timeSeconds,
    createdAt: serverTimestamp(),
  })
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Tempo esgotado ao salvar no ranking.')), SAVE_TIMEOUT_MS)
  })
  return Promise.race([write, timeout])
}

// onChange recebe a lista atual (até `count` posições) sempre que o
// ranking daquela dificuldade muda — inclui as atualizações em tempo real
// entre máquinas diferentes via onSnapshot.
export function subscribeToRanking(difficulty, count, onChange, onError) {
  const rankingQuery = query(
    collection(db, SCORES_COLLECTION),
    where('difficulty', '==', difficulty),
    orderBy('timeSeconds', 'asc'),
    fsLimit(count),
  )

  return onSnapshot(
    rankingQuery,
    (snapshot) => {
      onChange(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    },
    onError,
  )
}
