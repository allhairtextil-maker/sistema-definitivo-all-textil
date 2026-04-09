// ALL HAIR — Auto Sync Firebase
// Insere este script em todas as páginas para sync automático

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
    'allhair_melhorias','allhair_usuarios','allhair_sessao',
  ];

  // Firebase config
  const firebaseConfig = {
    apiKey: "AIzaSyAS9JeVtbfRekXIvKeEvnttTinJ4UT7zko",
    authDomain: "all-hair-sistema-ed955.firebaseapp.com",
    projectId: "all-hair-sistema-ed955",
    storageBucket: "all-hair-sistema-ed955.firebasestorage.app",
    messagingSenderId: "480465865239",
    appId: "1:480465865239:web:6033e24988303beba92a52"
  };

  // Load Firebase dynamically
  async function initFirebase() {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
    const { getFirestore, doc, setDoc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    return { db, doc, setDoc, getDoc };
  }

  // Show sync indicator
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
    if (el) {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 600);
    }
  }

  // DOWNLOAD: Firebase → localStorage (ao abrir a página)
  async function syncDown() {
    try {
      showIndicator('☁️ Sincronizando...', '#6d28d9');
      const { db, doc, getDoc } = await initFirebase();
      let loaded = 0;
      for (const key of KEYS) {
        try {
          const snap = await getDoc(doc(db, EMPRESA, key));
          if (snap.exists()) {
            localStorage.setItem(key, JSON.stringify(snap.data().value));
            loaded++;
          }
        } catch(e) {}
      }
      showIndicator('✅ Sincronizado!', '#059669');
      setTimeout(hideIndicator, 2000);
      // Reload page content after sync
      if (loaded > 0) {
        if (typeof window.render === 'function') window.render();
        else if (typeof window.init === 'function') window.init();
      }
      console.log('Firebase sync down: ' + loaded + ' keys');
    } catch(e) {
      console.warn('Firebase sync failed, using local data:', e);
      hideIndicator();
    }
  }

  // UPLOAD: localStorage → Firebase (ao salvar dados)
  window.fbSave = async function(key, value) {
    // Save to localStorage immediately
    localStorage.setItem(key, JSON.stringify(value));
    // Push to Firebase in background
    try {
      const { db, doc, setDoc } = await initFirebase();
      await setDoc(doc(db, EMPRESA, key), { value: value, updatedAt: new Date().toISOString() });
    } catch(e) {
      console.warn('Firebase save failed, data kept locally:', key);
    }
  };

  // Auto-sync on page load (after DOM ready)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncDown);
  } else {
    // Small delay to let page JS initialize first
    setTimeout(syncDown, 1000);
  }

  // Expose manual sync
  window.fbSync = syncDown;

})();
