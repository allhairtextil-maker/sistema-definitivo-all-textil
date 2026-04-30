/**
 * mes-global.js — ALL HAIR
 * Seletor de mês global — fixo no topo, único para todo o sistema.
 * Muda o mês em todas as páginas simultaneamente.
 */
(function(){
  var STORAGE_KEY = 'allhair_mes_sel';

  function carregar(){
    try{
      var raw = localStorage.getItem(STORAGE_KEY);
      if(raw){ var obj=JSON.parse(raw); if(typeof obj.mes==='number'&&typeof obj.ano==='number') return obj; }
    }catch(e){}
    var n=new Date(); return {mes:n.getMonth(),ano:n.getFullYear()};
  }
  function salvar(obj){ try{localStorage.setItem(STORAGE_KEY,JSON.stringify(obj));}catch(e){} }
  function disparar(){ window.dispatchEvent(new CustomEvent('mesChanged',{detail:MG.getMes()})); }

  var MG = {
    getMes:    function(){ return carregar(); },
    getMesAno: function(){ var s=carregar(); var m=s.mes+1; return s.ano+'-'+(m<10?'0'+m:m); },
    getNome:   function(){ var s=carregar(); return new Date(s.ano,s.mes,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'}); },
    ehMesAtual:function(){ var s=carregar(),n=new Date(); return s.mes===n.getMonth()&&s.ano===n.getFullYear(); },
    ehFuturo:  function(){ var s=carregar(),n=new Date(); return s.ano>n.getFullYear()||(s.ano===n.getFullYear()&&s.mes>n.getMonth()); },

    anterior: function(){
      var s=carregar();
      if(s.mes===0){s.mes=11;s.ano--;} else s.mes--;
      salvar(s); MG.atualizarUI(); disparar();
    },
    proximo: function(){
      var s=carregar();
      if(s.mes===11){s.mes=0;s.ano++;} else s.mes++;
      salvar(s); MG.atualizarUI(); disparar();
    },
    irParaHoje: function(){
      var n=new Date(); salvar({mes:n.getMonth(),ano:n.getFullYear()});
      MG.atualizarUI(); disparar();
    },

    noMesSel: function(dateStr){
      if(!dateStr) return false;
      var s=carregar(); var m=s.mes+1;
      return dateStr.substring(0,7)===s.ano+'-'+(m<10?'0'+m:m);
    },
    intervalo: function(){
      var s=carregar();
      var ini=new Date(s.ano,s.mes,1);
      var fim=new Date(s.ano,s.mes+1,0);
      function pad(d){return new Date(d).toISOString().split('T')[0];}
      return {inicio:pad(ini),fim:pad(fim)};
    },

    renderSeletor: function(elOrId){
      var el=typeof elOrId==='string'?document.getElementById(elOrId):elOrId;
      if(!el) return;

      var ehAtual=MG.ehMesAtual();
      var ehFut=MG.ehFuturo();
      var nome=MG.getNome();
      // Capitaliza primeira letra
      nome=nome.charAt(0).toUpperCase()+nome.slice(1);

      // Cores por estado
      var bgPill   = ehFut ? '#ede9fe' : ehAtual ? '#f0fdf4' : '#f1f5f9';
      var bdPill   = ehFut ? '#c4b5fd' : ehAtual ? '#a7f3d0' : '#e2e8f0';
      var corTexto = ehFut ? '#6d28d9' : ehAtual ? '#065f46' : '#374151';
      var corBtn   = '#6d28d9';
      var ponto    = ehFut ? '📅' : ehAtual ? '🟢' : '⏪';

      el.innerHTML =
        '<div id="mg-seletor" style="display:inline-flex;align-items:center;gap:0;background:'+bgPill+';border:1.5px solid '+bdPill+';border-radius:12px;padding:0;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.06)">' +
          '<button onclick="MG.anterior()" style="background:none;border:none;border-right:1px solid '+bdPill+';cursor:pointer;padding:6px 12px;color:'+corBtn+';font-size:16px;font-weight:700;line-height:1;display:flex;align-items:center;" title="Mês anterior">‹</button>' +
          '<div style="display:flex;align-items:center;gap:6px;padding:6px 14px;min-width:160px;justify-content:center;">' +
            '<span style="font-size:13px">' + ponto + '</span>' +
            '<span id="mg-nome" style="font-size:13px;font-weight:700;color:'+corTexto+';white-space:nowrap;">' + nome + '</span>' +
          '</div>' +
          '<button onclick="MG.proximo()" style="background:none;border:none;border-left:1px solid '+bdPill+';cursor:pointer;padding:6px 12px;color:'+corBtn+';font-size:16px;font-weight:700;line-height:1;display:flex;align-items:center;" title="Próximo mês">›</button>' +
          (!ehAtual ?
            '<button onclick="MG.irParaHoje()" style="background:'+corBtn+';color:#fff;border:none;border-left:1px solid '+bdPill+';cursor:pointer;padding:6px 12px;font-size:11px;font-weight:700;white-space:nowrap;font-family:inherit;" title="Ir para o mês atual">Hoje</button>'
          : '') +
        '</div>';
    },

    atualizarUI: function(){
      var el=document.getElementById('mg-seletor');
      if(!el) return;
      MG.renderSeletor(el.parentElement);
    },
  };

  window.MG = MG;

  // Injeta CSS global para a barra fixa de mês no topo
  function injetarBarraTopo(){
    // Cria a barra de mês fixa acima do topbar
    var barra = document.createElement('div');
    barra.id = 'mg-barra-global';
    barra.style.cssText = [
      'position:fixed',
      'top:0',
      'left:232px',  // largura da sidebar
      'right:0',
      'height:44px',
      'background:#fff',
      'border-bottom:1.5px solid #e8eaf0',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'z-index:999',
      'box-shadow:0 1px 4px rgba(15,17,23,.06)',
      'gap:8px',
    ].join(';');

    // Label
    var label = document.createElement('span');
    label.style.cssText = 'font-size:11px;font-weight:600;color:#7c8299;text-transform:uppercase;letter-spacing:.6px;';
    label.textContent = 'Período:';
    barra.appendChild(label);

    // Container do seletor
    var cont = document.createElement('div');
    cont.id = 'mg-container';
    barra.appendChild(cont);

    document.body.insertBefore(barra, document.body.firstChild);

    // Empurra o conteúdo da .main para baixo
    var style = document.createElement('style');
    style.textContent = '.main{padding-top:44px!important;} .topbar{top:44px!important;} .tabs,.tabs-bar{top:98px!important;}';
    document.head.appendChild(style);

    MG.renderSeletor(cont);
  }

  document.addEventListener('DOMContentLoaded', function(){
    injetarBarraTopo();
  });
})();
