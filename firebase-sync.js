// ALL HAIR — Auto Sync Firebase
(function() {
  const EMPRESA = 'allhair';
  const KEYS = [
    'allhair_pedidos','allhair_clientes','allhair_produtos','allhair_producoes2',
    'allhair_estoque_v2','allhair_compras','allhair_fornecedores2','allhair_representantes',
    'allhair_comissoes','allhair_config','allhair_socios','allhair_socios_mov',
    'allhair_movimentos','allhair_caixa','allhair_contas_bancarias','allhair_despesas',
    'allhair_recebimentos','allhair_pagamentos','allhair_apagar','allhair_a_receber',
    'allhair_cores','allhair_embalagens','allhair_etiquetas','allhair_caixas',
    'allhair_reservas','allhair_envios_v2','allhair_faccionistas','allhair_leads',
    'allhair_melhorias',
  ];

  // Track local modifications — key: timestamp
  // When save() is called locally, register the key as recently modified
  window._localModified = window._localModified || {};
  const PROTECT_MS = 60000; // 60 seconds protection after local save

  // Patch localStorage.setItem to track modifications
  const _origSet = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function(key, value) {
    if (KEYS.includes(key)) {
      window._localModified[key] = Date.now();
    }
    return _origSet(key, value);
  };

  function isRecentlyModified(key) {
    var t = window._localModified[key];
    return t && (Date.now() - t) < PROTECT_MS;
  }

  const firebaseConfig = {
    apiKey: "AIzaSyAS9JeVtbfRekXIvKeEvnttTinJ4UT7zko",
    authDomain: "all-hair-sistema-ed955.firebaseapp.com",
    projectId: "all-hair-sistema-ed955",
    storageBucket: "all-hair-sistema-ed955.firebasestorage.app",
    messagingSenderId: "480465865239",
    appId: "1:480465865239:web:6033e24988303beba92a52"
  };

  async function initFirebase() {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
    const { getFirestore, doc, setDoc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    return { db, doc, setDoc, getDoc };
  }

  function showIndicator(msg, color) {
    let el = document.getElementById('firebase-indicator');
    if (!el) {
      el = document.createElement('div');
      el.id = 'firebase-indicator';
      el.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;padding:8px 18px;border-radius:20px;font-size:12px;font-weight:700;z-index:99999;transition:opacity .5s;font-family:DM Sans,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,0.3)';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.background = color || '#1e293b';
    el.style.opacity = '1';
  }

  function hideIndicator() {
    const el = document.getElementById('firebase-indicator');
    if (el) { el.style.opacity = '0'; setTimeout(() => el.remove(), 600); }
  }

  // UPLOAD: localStorage → Firebase
  async function syncUp() {
    try {
      showIndicator('⬆️ Enviando...', '#6d28d9');
      const { db, doc, setDoc } = await initFirebase();
      for (const key of KEYS) {
        const val = localStorage.getItem(key);
        if (val) {
          try {
            await setDoc(doc(db, EMPRESA, key), { value: JSON.parse(val) });
          } catch(e) {}
        }
      }
      showIndicator('✅ Salvo na nuvem!', '#10b981');
      setTimeout(hideIndicator, 2000);
    } catch(e) {
      showIndicator('❌ Erro ao enviar', '#ef4444');
      setTimeout(hideIndicator, 3000);
    }
  }

  // DOWNLOAD: Firebase → localStorage (skip recently modified keys)
  async function syncDown() {
    try {
      showIndicator('☁️ Sincronizando...', '#6d28d9');
      const { db, doc, getDoc } = await initFirebase();
      let loaded = 0;
      for (const key of KEYS) {
        // SKIP if key was modified locally in last 60s
        if (isRecentlyModified(key)) {
          console.log('[Sync] Skipping', key, '— modified locally');
          continue;
        }
        try {
          const snap = await getDoc(doc(db, EMPRESA, key));
          if (snap.exists()) {
            _origSet(key, JSON.stringify(snap.data().value));
            loaded++;
          }
        } catch(e) {}
      }
      showIndicator('✅ Sincronizado!', '#10b981');
      setTimeout(hideIndicator, 2000);
      if (loaded > 0) {
        if (typeof window.render === 'function') window.render();
        else if (typeof window.init === 'function') window.init();
      }
    } catch(e) {
      showIndicator('⚠️ Sem conexão', '#f59e0b');
      setTimeout(hideIndicator, 3000);
    }
  }

  // Expose manual sync
  window.syncUp = syncUp;
  window.syncDown = syncDown;

  // Auto sync on page load (after 1s delay)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(syncDown, 1000));
  } else {
    setTimeout(syncDown, 1000);
  }
})();
