// ALL HAIR — Firebase Sync
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
    'allhair_melhorias','allhair_precificacao',
  ];

  let firebaseReady = null;
  let uploadTimer = null;
  let uploading = false;

  const firebaseConfig = {
    apiKey: "AIzaSyAS9JeVtbfRekXIvKeEvnttTinJ4UT7zko",
    authDomain: "all-hair-sistema-ed955.firebaseapp.com",
    projectId: "all-hair-sistema-ed955",
    storageBucket: "all-hair-sistema-ed955.firebasestorage.app",
    messagingSenderId: "480465865239",
    appId: "1:480465865239:web:6033e24988303beba92a52"
  };

  async function getFirebase() {
    if (!firebaseReady) {
      firebaseReady = (async () => {
        const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
        const { getFirestore, doc, setDoc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
        const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
        const db = getFirestore(app);
        return { db, doc, setDoc, getDoc };
      })();
    }
    return firebaseReady;
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

  // AUTO-UPLOAD: whenever localStorage changes, upload after 2s debounce
  const _origSet = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function(key, value) {
    _origSet(key, value);
    if (KEYS.includes(key)) {
      scheduleUpload();
    }
  };

  function scheduleUpload() {
    if (uploadTimer) clearTimeout(uploadTimer);
    uploadTimer = setTimeout(flushUpload, 2000);
  }

  async function flushUpload() {
    if (uploading) return;
    uploading = true;
    try {
      const { db, doc, setDoc } = await getFirebase();
      for (const key of KEYS) {
        const val = localStorage.getItem(key);
        if (val && val !== '[]' && val !== '{}') {
          try {
            await setDoc(doc(db, EMPRESA, key), { value: JSON.parse(val) });
          } catch(e) {}
        }
      }
    } catch(e) {}
    uploading = false;
  }

  // MANUAL DOWNLOAD: only when user clicks Sincronizar
  async function syncDown() {
    try {
      showIndicator('⬇️ Baixando dados...', '#6d28d9');
      const { db, doc, getDoc } = await getFirebase();
      let loaded = 0;
      for (const key of KEYS) {
        try {
          const snap = await getDoc(doc(db, EMPRESA, key));
          if (snap.exists()) {
            _origSet(key, JSON.stringify(snap.data().value));
            loaded++;
          }
        } catch(e) {}
      }
      showIndicator('✅ Dados atualizados!', '#10b981');
      setTimeout(hideIndicator, 2000);
      if (loaded > 0) {
        if (typeof window.render === 'function') window.render();
        else location.reload();
      }
    } catch(e) {
      showIndicator('❌ Erro na sincronização', '#ef4444');
      setTimeout(hideIndicator, 3000);
    }
  }

  // MANUAL UPLOAD
  async function syncUp() {
    try {
      showIndicator('⬆️ Enviando dados...', '#6d28d9');
      await flushUpload();
      showIndicator('✅ Enviado!', '#10b981');
      setTimeout(hideIndicator, 2000);
    } catch(e) {
      showIndicator('❌ Erro ao enviar', '#ef4444');
      setTimeout(hideIndicator, 3000);
    }
  }

  window.syncUp = syncUp;
  window.syncDown = syncDown;

  // NO AUTO SYNC DOWN ON PAGE LOAD
  // Data is always read from localStorage (which persists between pages)
  // User clicks "Sincronizar" to pull latest from Firebase when switching devices

})();
