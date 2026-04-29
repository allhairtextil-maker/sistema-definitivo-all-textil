/**
 * mes-global.js — ALL HAIR
 * Seletor de mês compartilhado entre todas as páginas.
 * Salva em localStorage: allhair_mes_sel = {mes, ano}
 *
 * API:
 *   MG.getMes()          → {mes:0-11, ano:2025}
 *   MG.getMesAno()       → "2025-04"
 *   MG.getNome()         → "Abril de 2025"
 *   MG.anterior()        → vai ao mês anterior e dispara evento
 *   MG.proximo()         → vai ao próximo (máx: mês atual) e dispara evento
 *   MG.noMesSel(str)     → true se a data string pertence ao mês selecionado
 *   MG.ehMesAtual()      → true se o mês selecionado é o mês atual
 *   MG.renderSeletor(el) → injeta o HTML do seletor no elemento
 *
 * Evento: window dispara 'mesChanged' quando o mês muda.
 */
(function(){
  var STORAGE_KEY = 'allhair_mes_sel';

  function carregar(){
    try{
      var raw = localStorage.getItem(STORAGE_KEY);
      if(raw){
        var obj = JSON.parse(raw);
        if(typeof obj.mes==='number' && typeof obj.ano==='number') return obj;
      }
    }catch(e){}
    var n = new Date();
    return {mes: n.getMonth(), ano: n.getFullYear()};
  }

  function salvar(obj){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); }catch(e){}
  }

  function disparar(){
    window.dispatchEvent(new CustomEvent('mesChanged', {detail: MG.getMes()}));
  }

  var MG = {
    getMes: function(){
      return carregar();
    },

    getMesAno: function(){
      var s = carregar();
      var m = s.mes + 1;
      return s.ano + '-' + (m < 10 ? '0' + m : m);
    },

    getNome: function(){
      var s = carregar();
      var d = new Date(s.ano, s.mes, 1);
      return d.toLocaleDateString('pt-BR', {month:'long', year:'numeric'});
    },

    ehMesAtual: function(){
      var s = carregar();
      var n = new Date();
      return s.mes === n.getMonth() && s.ano === n.getFullYear();
    },

    anterior: function(){
      var s = carregar();
      if(s.mes === 0){ s.mes = 11; s.ano--; }
      else { s.mes--; }
      salvar(s);
      MG.atualizarUI();
      disparar();
    },

    proximo: function(){
      var s = carregar();
      if(s.mes === 11){ s.mes = 0; s.ano++; }
      else { s.mes++; }
      salvar(s);
      MG.atualizarUI();
      disparar();
    },

    noMesSel: function(dateStr){
      if(!dateStr) return false;
      var s = carregar();
      // Aceita "YYYY-MM-DD", "YYYY-MM-DDTHH:MM", etc.
      var prefix = dateStr.substring(0, 7); // "YYYY-MM"
      var m = s.mes + 1;
      var expected = s.ano + '-' + (m < 10 ? '0' + m : m);
      return prefix === expected;
    },

    // Retorna o primeiro e último dia do mês selecionado como strings "YYYY-MM-DD"
    intervalo: function(){
      var s = carregar();
      var primeiro = new Date(s.ano, s.mes, 1);
      var ultimo   = new Date(s.ano, s.mes + 1, 0);
      function pad(d){ return new Date(d).toISOString().split('T')[0]; }
      return { inicio: pad(primeiro), fim: pad(ultimo) };
    },

    // Injeta o seletor de mês num elemento (passando o elemento ou id)
    renderSeletor: function(elOrId){
      var el = typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;
      if(!el) return;

      var s = carregar();
      var n = new Date();
      var ehAtual = MG.ehMesAtual();
      var ehFuturo = (s.ano > n.getFullYear()) || (s.ano === n.getFullYear() && s.mes > n.getMonth());
      var nome = MG.getNome();

      el.innerHTML =
        '<div id="mg-seletor" style="display:flex;align-items:center;gap:4px;background:' + (ehFuturo ? '#f0ebff' : '#f1f5f9') + ';border:1px solid ' + (ehFuturo ? '#c4b5fd' : '#e2e8f0') + ';border-radius:10px;padding:4px 6px;">' +
          '<button onclick="MG.anterior()" style="background:none;border:none;cursor:pointer;font-size:18px;color:#8b5cf6;padding:2px 6px;border-radius:6px;font-weight:700;line-height:1;" title="Mês anterior">‹</button>' +
          '<span id="mg-nome" style="font-size:12px;font-weight:700;color:' + (ehFuturo ? '#7c3aed' : '#1e293b') + ';min-width:130px;text-align:center;text-transform:capitalize;">' +
            (ehFuturo ? '📅 ' : ehAtual ? '' : '') + nome +
          '</span>' +
          '<button onclick="MG.proximo()" style="background:none;border:none;cursor:pointer;font-size:18px;color:#8b5cf6;padding:2px 6px;border-radius:6px;font-weight:700;line-height:1;" title="Próximo mês">›</button>' +
          (!ehAtual ? '<button onclick="MG.irParaHoje()" style="background:#8b5cf6;color:#fff;border:none;cursor:pointer;font-size:10px;font-weight:700;padding:3px 8px;border-radius:6px;margin-left:2px;" title="Ir para mês atual">Hoje</button>' : '') +
        '</div>';
    },

    irParaHoje: function(){
      var n = new Date();
      salvar({mes: n.getMonth(), ano: n.getFullYear()});
      MG.atualizarUI();
      disparar();
    },

    atualizarUI: function(){
      var el = document.getElementById('mg-seletor');
      if(!el) return;
      var container = el.parentElement;
      if(container) MG.renderSeletor(container);
    },
  };

  window.MG = MG;

  // Auto-renderiza qualquer elemento com id="mg-container" quando o DOM carrega
  document.addEventListener('DOMContentLoaded', function(){
    var cont = document.getElementById('mg-container');
    if(cont) MG.renderSeletor(cont);
  });
})();
