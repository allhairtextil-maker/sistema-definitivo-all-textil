// ALL HAIR — Firebase Database Layer
// Substitui localStorage por Firestore em tempo real

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAS9JeVtbfRekXIvKeEvnttTinJ4UT7zko",
  authDomain: "all-hair-sistema-ed955.firebaseapp.com",
  projectId: "all-hair-sistema-ed955",
  storageBucket: "all-hair-sistema-ed955.firebasestorage.app",
  messagingSenderId: "480465865239",
  appId: "1:480465865239:web:6033e24988303beba92a52",
  measurementId: "G-234NGJT237"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ID da empresa (fixo — um único tenant)
const EMPRESA_ID = 'allhair';

// ===== API PÚBLICA =====
// Usa o mesmo padrão do localStorage para não ter que mudar muito código

window.dbReady = false;
window.dbListeners = {};

// GET — lê uma chave (equivale a localStorage.getItem)
window.dbGet = async function(key) {
  try {
    const ref = doc(db, EMPRESA_ID, key);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data().value;
    }
    return null;
  } catch(e) {
    console.warn('dbGet fallback localStorage:', key, e);
    return JSON.parse(localStorage.getItem(key) || 'null');
  }
};

// SET — salva uma chave (equivale a localStorage.setItem)
window.dbSet = async function(key, value) {
  try {
    const ref = doc(db, EMPRESA_ID, key);
    await setDoc(ref, { value: value, updatedAt: new Date().toISOString() });
    // Também salva no localStorage como cache offline
    localStorage.setItem(key, JSON.stringify(value));
  } catch(e) {
    console.warn('dbSet fallback localStorage:', key, e);
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// SYNC — carrega tudo do Firebase para localStorage (ao abrir o sistema)
window.dbSync = async function() {
  const KEYS = [
    'allhair_pedidos','allhair_clientes','allhair_produtos','allhair_producoes2',
    'allhair_estoque_v2','allhair_compras','allhair_fornecedores2','allhair_representantes',
    'allhair_comissoes','allhair_config','allhair_socios','allhair_socios_mov',
    'allhair_movimentos','allhair_caixa','allhair_contas_bancarias','allhair_despesas',
    'allhair_recebimentos','allhair_pagamentos','allhair_apagar','allhair_a_receber',
    'allhair_cores','allhair_embalagens','allhair_etiquetas','allhair_caixas',
    'allhair_reservas','allhair_envios_v2','allhair_faccionistas','allhair_leads',
    'allhair_melhorias','allhair_usuarios','allhair_sessao','allhair_representantes',
  ];

  let loaded = 0;
  const indicator = document.getElementById('db-sync-indicator');
  if(indicator) indicator.textContent = 'Sincronizando...';

  for(const key of KEYS) {
    try {
      const ref = doc(db, EMPRESA_ID, key);
      const snap = await getDoc(ref);
      if(snap.exists()) {
        localStorage.setItem(key, JSON.stringify(snap.data().value));
        loaded++;
      }
    } catch(e) { /* usa o localStorage já existente */ }
  }

  if(indicator) indicator.textContent = '';
  window.dbReady = true;
  console.log(`✅ Firebase sync: ${loaded} chaves carregadas`);
  return loaded;
};

// PUSH — salva dados locais para o Firebase (upload)
window.dbPush = async function() {
  const KEYS = [
    'allhair_pedidos','allhair_clientes','allhair_produtos','allhair_producoes2',
    'allhair_estoque_v2','allhair_compras','allhair_fornecedores2','allhair_representantes',
    'allhair_comissoes','allhair_config','allhair_socios','allhair_socios_mov',
    'allhair_movimentos','allhair_caixa','allhair_contas_bancarias','allhair_despesas',
    'allhair_recebimentos','allhair_pagamentos','allhair_apagar','allhair_a_receber',
    'allhair_cores','allhair_embalagens','allhair_etiquetas','allhair_caixas',
    'allhair_reservas','allhair_envios_v2','allhair_faccionistas','allhair_leads',
    'allhair_melhorias','allhair_usuarios',
  ];

  let saved = 0;
  for(const key of KEYS) {
    const val = localStorage.getItem(key);
    if(val) {
      try {
        await window.dbSet(key, JSON.parse(val));
        saved++;
      } catch(e) {}
    }
  }
  console.log(`☁️ Push: ${saved} chaves salvas no Firebase`);
  return saved;
};

export { db, EMPRESA_ID };
