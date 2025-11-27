import { API_BASE_URL } from "../Funcoes/seletorProd_local.js";
import { gerarSidebar } from "../Funcoes/sidebar.js";
import { verificarAutenticacao } from "../Funcoes/autenticacao.js";
import { inicializarNavbarETema } from "../Funcoes/navbar.js";

inicializarNavbarETema();
verificarAutenticacao(API_BASE_URL);
gerarSidebar();

/* ====== util de datas ====== */
const fmtBR = d => d.toLocaleDateString('pt-BR');
const toISO = d => d.toISOString().slice(0,10);
const fromISO = s => new Date(`${s}T00:00:00`);

function startOfWeek(d){
  const x = new Date(d);
  const day = x.getDay(); // 0 dom, 1 seg
  const diff = (day === 0 ? -6 : 1 - day);
  x.setDate(x.getDate() + diff);
  x.setHours(0,0,0,0);
  return x;
}
function endOfWeek(d){ const i = startOfWeek(d); const f = new Date(i); f.setDate(i.getDate()+6); return f; }
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
const DIA_LABELS = ["SEG","TER","QUA","QUI","SEX","SÁB","DOM"];

/* ====== estado ====== */
const ALUNO_ID = JSON.parse(localStorage.getItem("user_aluno_id") || "2001");
const st = { diaAtualISO: toISO(new Date()) };

/* ====== storage keys (somente EXERCÍCIO) ====== */
const keyPlano   = (id, iso)=>`plano_${id}_${iso}`;  // plano do professor
const keyAcertos = (id, iso)=>`exec_${id}_${iso}`;   // execução do aluno

/* ====== helpers ====== */
function formatarTempo(min){
  const m = parseInt(min);
  if (isNaN(m) || m <= 0) return null;
  const h = Math.floor(m/60), r = m%60;
  return h>0 && r>0 ? `${h}h ${r}min` : h>0 ? `${h}h` : `${r}min`;
}
function extrairMinutos(texto){
  const mm = /(\d+)\s*min/.exec(texto);
  const hh = /(\d+)\s*h/.exec(texto);
  const m = mm ? parseInt(mm[1]) : 0;
  const h = hh ? parseInt(hh[1])*60 : 0;
  return m + h;
}
const num = v => (v===''||v==null)?0:Number(v);

/* ====== seed/fallback de plano ====== */
const GRUPOS_DEMO = {
  peito:  [
    { nome:"Supino reto",      desc:"3x10 • 20kg • 10min" },
    { nome:"Crucifixo",        desc:"3x12 • 8kg • 8min" }
  ],
  costas: [
    { nome:"Remada curvada",   desc:"4x8 • 30kg • 12min" }
  ],
  pernas: [
    { nome:"Agachamento",      desc:"4x6 • 40kg • 15min" }
  ]
};
function getPlano(){
  const raw = localStorage.getItem(keyPlano(ALUNO_ID, st.diaAtualISO));
  if (!raw) return {};
  try{ return JSON.parse(raw) || {}; }catch{ return {}; }
}
function setPlano(obj){
  localStorage.setItem(keyPlano(ALUNO_ID, st.diaAtualISO), JSON.stringify(obj));
}
function seedPlanoExemplo(){
  setPlano(GRUPOS_DEMO);
}
function getAcertos(){
  const raw = localStorage.getItem(keyAcertos(ALUNO_ID, st.diaAtualISO));
  if (!raw) return {};
  try{ return JSON.parse(raw) || {}; }catch{ return {}; }
}
function setAcertos(obj){
  localStorage.setItem(keyAcertos(ALUNO_ID, st.diaAtualISO), JSON.stringify(obj));
}

/* ====== barra da semana ====== */
function renderSemanaBar(){
  const base = fromISO(st.diaAtualISO);
  const ini = startOfWeek(base), fim = endOfWeek(base);

  document.getElementById('rangeSemana').textContent = `${fmtBR(ini)} — ${fmtBR(fim)}`;
  const box = document.getElementById('semanaDias');
  box.innerHTML = '';

  for (let i=0;i<7;i++){
    const d = addDays(ini,i); const iso = toISO(d);
    const b = document.createElement('button');
    b.className = 'alu-pill'+(iso===st.diaAtualISO?' active':'');
    b.innerHTML = `<small>${DIA_LABELS[i]}</small><br>${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
    b.addEventListener('click', ()=>{
      st.diaAtualISO = iso;
      document.getElementById('dataPicker').value = iso;
      renderSemanaBar();
      renderPlano();
    });
    box.appendChild(b);
  }

  document.getElementById('dataPicker').value = st.diaAtualISO;
}
function bindSemana(){
  document.getElementById('semanaAnterior').addEventListener('click', ()=>{
    const d=fromISO(st.diaAtualISO);
    st.diaAtualISO = toISO(addDays(startOfWeek(d), -7));
    renderSemanaBar(); renderPlano();
  });
  document.getElementById('semanaSeguinte').addEventListener('click', ()=>{
    const d=fromISO(st.diaAtualISO);
    st.diaAtualISO = toISO(addDays(startOfWeek(d), 7));
    renderSemanaBar(); renderPlano();
  });
  document.getElementById('btnHoje').addEventListener('click', ()=>{
    st.diaAtualISO = toISO(new Date());
    renderSemanaBar(); renderPlano();
  });
  document.getElementById('dataPicker').addEventListener('change', (e)=>{
    if (e.target.value){
      st.diaAtualISO = e.target.value;
      renderSemanaBar(); renderPlano();
    }
  });
}

/* ====== render ====== */
function renderPlano(){
  const grupos  = getPlano();
  const acertos = getAcertos();

  const wrap = document.getElementById("listaGrupos");
  wrap.innerHTML = "";

  // se não tem plano -> mostra card "sem plano"
  if (!grupos || Object.keys(grupos).length === 0){
    const col = document.createElement('div'); col.className = 'col-12';
    col.innerHTML = `
      <div class="blank-card">
        <h6>Nenhum plano de exercícios para ${fmtBR(fromISO(st.diaAtualISO))}</h6>
        <p class="small mb-3">Peça ao professor para publicar o plano deste dia, ou carregue um exemplo para testar a tela.</p>
        <button id="btnSeed" class="btn btn-sm btn-outline-success">Carregar exemplo</button>
      </div>`;
    wrap.appendChild(col);
    col.querySelector('#btnSeed').addEventListener('click', ()=>{ seedPlanoExemplo(); renderPlano(); });
    // zera resumo
    document.getElementById("tempoTotal").textContent  = "0min";
    document.getElementById("volumeTotal").textContent = "0 kg";
    document.getElementById("totalDone").textContent   = "0/0";
    document.getElementById("resumoPorGrupo").innerHTML = "";
    return;
  }

  let totalTempo=0, totalVolume=0, totalItens=0, totalConcl=0;
  const resumoPorGrupo = {};

  Object.entries(grupos).forEach(([gid, lista])=>{
    const col = document.createElement("div"); col.className = "col-12";
    const card = document.createElement("div"); card.className="ex-card"; col.appendChild(card);
    const titulo = gid.charAt(0).toUpperCase()+gid.slice(1);
    card.innerHTML = `<h6>${titulo}</h6>`;

    lista.forEach((it, idx)=>{
      const key = `${gid}:${idx}`;
      const done = !!acertos[key]?.done;

      const tempo = acertos[key]?.tempo ?? extrairMinutos(it.desc||"") ?? 0;
      const series= num(acertos[key]?.series);
      const reps  = num(acertos[key]?.reps);
      const carga = num(acertos[key]?.carga);
      const volume= (series*reps*carga) || 0;

      totalTempo += tempo;
      totalVolume += volume;
      totalItens += 1;
      if (done) totalConcl += 1;

      if (!resumoPorGrupo[gid]) resumoPorGrupo[gid] = { tempo:0, volume:0, concl:0, total:0 };
      resumoPorGrupo[gid].tempo  += tempo;
      resumoPorGrupo[gid].volume += volume;
      resumoPorGrupo[gid].total  += 1;
      if (done) resumoPorGrupo[gid].concl += 1;

      const row = document.createElement("div");
      row.className = "ex-item";
      row.innerHTML = `
        <div>
          <strong>${it.nome}</strong>
          <div class="meta">
            <span class="badge badge-status ${done?'concluido':'pendente'}">${done?'Concluído':'Pendente'}</span>
            <span class="badge bg-secondary">Tempo: ${formatarTempo(tempo)||'0min'}</span>
            <span class="badge bg-info">Volume: ${volume} kg</span>
          </div>
          <div class="small text-muted mt-1">${it.desc || ''}</div>
        </div>
        <div class="d-flex flex-column gap-2">
          <button class="btn btn-sm btn-outline-success" data-acertar>Acertar</button>
        </div>
      `;
      row.querySelector("[data-acertar]").addEventListener("click", ()=>{
        abrirModalAcerto({ gid, idx, nome: it.nome, sugestaoDesc: it.desc||"", atual: acertos[key]||{} });
      });

      card.appendChild(row);
    });

    wrap.appendChild(col);
  });

  // Resumo lateral (tempo/volume/concluídos)
  document.getElementById("tempoTotal").textContent  = formatarTempo(totalTempo) || "0min";
  document.getElementById("volumeTotal").textContent = `${totalVolume} kg`;
  document.getElementById("totalDone").textContent   = `${totalConcl}/${totalItens}`;

  const boxRG = document.getElementById("resumoPorGrupo");
  boxRG.innerHTML = "";
  Object.entries(resumoPorGrupo).forEach(([gid, r])=>{
    const nome = gid.charAt(0).toUpperCase()+gid.slice(1);
    const chip = document.createElement("div");
    chip.className = "ex-chip";
    chip.innerHTML = `<span>${nome}</span><strong>${r.concl}/${r.total} • ${formatarTempo(r.tempo)||'0min'} • ${r.volume} kg</strong>`;
    boxRG.appendChild(chip);
  });
}

/* ====== modal acerto ====== */
let bsModal;
function abrirModalAcerto({ gid, idx, nome, sugestaoDesc, atual }){
  document.getElementById("modalTitulo").textContent = `Acertar: ${nome}`;
  document.getElementById("acertoNome").value   = nome;
  document.getElementById("acertoSeries").value = atual?.series ?? '';
  document.getElementById("acertoReps").value   = atual?.reps ?? '';
  document.getElementById("acertoCarga").value  = atual?.carga ?? '';
  document.getElementById("acertoTempo").value  = atual?.tempo ?? (extrairMinutos(sugestaoDesc)||'');
  document.getElementById("acertoRPE").value    = atual?.rpe ?? '';
  document.getElementById("acertoObs").value    = atual?.obs ?? '';
  document.getElementById("acertoGid").value    = gid;
  document.getElementById("acertoIdx").value    = String(idx);

  const updatePreview = ()=>{
    const s=num(document.getElementById("acertoSeries").value);
    const r=num(document.getElementById("acertoReps").value);
    const c=num(document.getElementById("acertoCarga").value);
    document.getElementById("acertoVolumePreview").textContent = `${(s*r*c)||0} kg`;
  };
  ["acertoSeries","acertoReps","acertoCarga"].forEach(id=>{
    document.getElementById(id).removeEventListener?.("input", updatePreview);
    document.getElementById(id).addEventListener("input", updatePreview);
  });
  updatePreview();

  const el = document.getElementById("modalAcerto");
  bsModal = new bootstrap.Modal(el);
  bsModal.show();
}

document.getElementById("formAcerto").addEventListener("submit", (e)=>{
  e.preventDefault();
  const gid = document.getElementById("acertoGid").value;
  const idx = document.getElementById("acertoIdx").value;
  const key = `${gid}:${idx}`;

  const series = num(document.getElementById("acertoSeries").value);
  const reps   = num(document.getElementById("acertoReps").value);
  const carga  = num(document.getElementById("acertoCarga").value);
  const tempo  = num(document.getElementById("acertoTempo").value);
  const rpe    = num(document.getElementById("acertoRPE").value);
  const obs    = document.getElementById("acertoObs").value.trim();

  const execs = getAcertos();
  execs[key] = {
    series, reps, carga, tempo, rpe, obs,
    volume: (series*reps*carga)||0,
    done: 1, updatedAt: Date.now()
  };
  setAcertos(execs);

  bsModal?.hide();
  renderPlano();
});

/* ====== boot ====== */
document.addEventListener("DOMContentLoaded", ()=>{
  bindSemana();
  renderSemanaBar();
  renderPlano();
});
