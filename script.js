// ============================================
// MOTOCALC - Versão Final com vencimentos
// ============================================

let gastos = JSON.parse(localStorage.getItem('gastos')) || [];
let config = JSON.parse(localStorage.getItem('config')) || {};
let modoAtual = localStorage.getItem('modoAtual') || '';
let diasMes = parseInt(localStorage.getItem('diasMes')) || 26; // padrão dias úteis
let grafico = null;
let editandoId = null;

const inputs = {
  precoCombustivel: document.getElementById('precoCombustivel'),
  kmPorLitro: document.getElementById('kmPorLitro'),
  kmPorDia: document.getElementById('kmPorDia'),
};

// ============================================
// 1. CONFIGURAÇÕES
// ============================================
function carregarConfig() {
  for (let key in inputs) {
    if (config[key] !== undefined) inputs[key].value = config[key];
  }
  if (modoAtual) {
    const radio = document.querySelector(`input[name="modo"][value="${modoAtual}"]`);
    if (radio) { radio.checked = true; aplicarModo(modoAtual); }
  }
  // Marca o cenário salvo
  document.querySelectorAll('.cenario').forEach(c => c.classList.remove('selecionado'));
  const cenarioEl = document.querySelector(`.cenario[data-dias="${diasMes}"]`);
  if (cenarioEl) cenarioEl.classList.add('selecionado');
}

function salvarConfig() {
  for (let key in inputs) {
    config[key] = parseFloat(inputs[key].value) || 0;
  }
  localStorage.setItem('config', JSON.stringify(config));
  calcularTudo();
}

Object.values(inputs).forEach(el => el.addEventListener('input', salvarConfig));

// ============================================
// 2. SELECIONAR CENÁRIO DE DIAS
// ============================================
function selecionarCenario(dias) {
  diasMes = dias;
  localStorage.setItem('diasMes', dias);
  document.querySelectorAll('.cenario').forEach(c => c.classList.remove('selecionado'));
  document.querySelector(`.cenario[data-dias="${dias}"]`).classList.add('selecionado');
  calcularTudo();
}

// ============================================
// 3. GERENCIAR GASTOS (agora com data + prioridade + recorrência)
// ============================================
const nomeGasto = document.getElementById('nomeGasto');
const valorGasto = document.getElementById('valorGasto');
const dataGasto = document.getElementById('dataGasto');
const tipoGasto = document.getElementById('tipoGasto');
const recorrenciaGasto = document.getElementById('recorrenciaGasto');
const prioridadeGasto = document.getElementById('prioridadeGasto');
const listaGastos = document.getElementById('listaGastos');

document.getElementById('btnAddGasto').addEventListener('click', () => {
  const nome = nomeGasto.value.trim();
  const valor = parseFloat(valorGasto.value);
  const data = dataGasto.value;
  const tipo = tipoGasto.value;
  const recorrencia = recorrenciaGasto.value;
  const prioridade = prioridadeGasto.checked;

  if (!nome || isNaN(valor) || valor <= 0) {
    alert('Preencha nome e valor corretamente!');
    return;
  }

  if (editandoId !== null) {
    const g = gastos.find(x => x.id === editandoId);
    Object.assign(g, { nome, valor, data, tipo, recorrencia, prioridade });
    editandoId = null;
    document.getElementById('btnAddGasto').textContent = '+ Adicionar';
  } else {
    gastos.push({ id: Date.now(), nome, valor, data, tipo, recorrencia, prioridade });
  }

  nomeGasto.value = '';
  valorGasto.value = '';
  dataGasto.value = '';
  prioridadeGasto.checked = false;
  salvarGastos();
  renderizarGastos();
  renderizarVencimentos();
  calcularTudo();
});

function salvarGastos() {
  localStorage.setItem('gastos', JSON.stringify(gastos));
}

// Calcula o impacto MENSAL de cada gasto (anual ÷ 12, mensal cheio, única zero)
function impactoMensal(gasto) {
  if (gasto.recorrencia === 'anual') return gasto.valor / 12;
  if (gasto.recorrencia === 'mensal') return gasto.valor;
  return 0; // única não impacta mensal recorrente
}

function renderizarGastos() {
  listaGastos.innerHTML = '';
  gastos.forEach(g => {
    const li = document.createElement('li');
    if (g.prioridade) li.classList.add('prioritario');

    const dataFmt = g.data ? new Date(g.data + 'T00:00:00').toLocaleDateString('pt-BR') : 'sem data';
    const recLabel = g.recorrencia === 'anual' ? '📅 Anual' : g.recorrencia === 'mensal' ? '🔁 Mensal' : '1️⃣ Única';
    const impMensal = impactoMensal(g);

    li.innerHTML = `
      <span class="tag tag-${g.tipo}">${g.tipo === 'moto' ? '🛵' : '👤'}</span>
      <div class="gasto-info">
        <span class="gasto-nome">${g.prioridade ? '🚨 ' : ''}${g.nome}</span>
        <span class="gasto-meta">${recLabel} • Vence: ${dataFmt}${g.recorrencia === 'anual' ? ` • R$ ${impMensal.toFixed(2)}/mês` : ''}</span>
      </div>
      <span><strong>R$ ${g.valor.toFixed(2)}</strong></span>
      <div class="acoes-gasto">
        <button class="btn-editar" onclick="editarGasto(${g.id})">✏️</button>
        <button class="btn-excluir" onclick="excluirGasto(${g.id})">🗑️</button>
      </div>
    `;
    listaGastos.appendChild(li);
  });
}

function editarGasto(id) {
  const g = gastos.find(x => x.id === id);
  nomeGasto.value = g.nome;
  valorGasto.value = g.valor;
  dataGasto.value = g.data || '';
  tipoGasto.value = g.tipo;
  recorrenciaGasto.value = g.recorrencia || 'mensal';
  prioridadeGasto.checked = g.prioridade || false;
  editandoId = id;
  document.getElementById('btnAddGasto').textContent = '💾 Salvar Edição';
}

function excluirGasto(id) {
  if (!confirm('Excluir este gasto?')) return;
  gastos = gastos.filter(x => x.id !== id);
  salvarGastos();
  renderizarGastos();
  renderizarVencimentos();
  calcularTudo();
}

// ============================================
// 4. PRÓXIMOS VENCIMENTOS
// ============================================
function diasAteVencimento(dataStr) {
  if (!dataStr) return null;
  const hoje = new Date();
  hoje.setHours(0,0,0,0);
  const venc = new Date(dataStr + 'T00:00:00');
  return Math.ceil((venc - hoje) / (1000 * 60 * 60 * 24));
}

function renderizarVencimentos() {
  const lista = document.getElementById('listaVencimentos');
  const comData = gastos
    .filter(g => g.data)
    .map(g => ({ ...g, diasRest: diasAteVencimento(g.data) }))
    .filter(g => g.diasRest >= 0)
    .sort((a,b) => a.diasRest - b.diasRest);

  if (comData.length === 0) {
    lista.innerHTML = '<li class="vazio">Nenhum gasto com vencimento futuro</li>';
    document.getElementById('resumoPrazo').classList.remove('ativo');
    return;
  }

  lista.innerHTML = '';
  let totalProx7 = 0;
  let totalProx30 = 0;

  comData.forEach(g => {
    const li = document.createElement('li');
    let nivel = 'tranquilo';
    if (g.prioridade && g.diasRest <= 7) { li.classList.add('urgente'); nivel = 'urgente'; }
    else if (g.diasRest <= 15) { li.classList.add('atencao'); nivel = 'atencao'; }

    const dataFmt = new Date(g.data + 'T00:00:00').toLocaleDateString('pt-BR');
    li.innerHTML = `
      <div class="venc-info">
        <div class="venc-nome">${g.prioridade ? '🚨 ' : ''}${g.nome} - <strong>R$ ${g.valor.toFixed(2)}</strong></div>
        <div class="venc-data">📅 Vence em ${dataFmt}</div>
      </div>
      <span class="venc-dias ${nivel}">
        ${g.diasRest === 0 ? 'HOJE!' : g.diasRest === 1 ? 'Amanhã' : `${g.diasRest} dias`}
      </span>
    `;
    lista.appendChild(li);

    if (g.diasRest <= 7) totalProx7 += g.valor;
    if (g.diasRest <= 30) totalProx30 += g.valor;
  });

  // Resumo de quanto precisa ganhar até x dias
  const { valorMinKm } = obterCustoKm();
  const kmDia = parseFloat(inputs.kmPorDia.value) || 0;
  const resumo = document.getElementById('resumoPrazo');

  if (totalProx7 > 0 && valorMinKm > 0 && kmDia > 0) {
    const kmNecess7 = totalProx7 / valorMinKm;
    const diasTrab = Math.ceil(kmNecess7 / kmDia);
    resumo.innerHTML = `
      💸 Nos próximos <strong>7 dias</strong> vencem <strong>R$ ${totalProx7.toFixed(2)}</strong>.<br>
      Pra cobrir isso você precisa rodar ~<strong>${kmNecess7.toFixed(0)} km</strong>
      (cerca de <strong>${diasTrab} dia(s) de trabalho</strong> no seu ritmo).
    `;
    resumo.classList.add('ativo');
  } else {
    resumo.classList.remove('ativo');
  }
}

// ============================================
// 5. CÁLCULOS PRINCIPAIS
// ============================================
function obterCustoKm() {
  const precoComb = parseFloat(inputs.precoCombustivel.value) || 0;
  const kmL = parseFloat(inputs.kmPorLitro.value) || 1;
  const kmDia = parseFloat(inputs.kmPorDia.value) || 0;

  // Total mensal recorrente (anuais já entram diluídos)
  const totalMensal = gastos.reduce((s, g) => s + impactoMensal(g), 0);

  const custoComb = precoComb / kmL;

  const kmMes = kmDia * diasMes;
  const gastoFixoKm = kmMes > 0 ? totalMensal / kmMes : 0;
  const valorMinKm = custoComb + gastoFixoKm;

  return { custoComb, gastoFixoKm, valorMinKm, kmMes, totalMensal };
}

function calcularTudo() {
  const totalMotoMes = gastos.filter(g => g.tipo === 'moto').reduce((s,g) => s + impactoMensal(g), 0);
  const totalPessoalMes = gastos.filter(g => g.tipo === 'pessoal').reduce((s,g) => s + impactoMensal(g), 0);

  const { custoComb, gastoFixoKm, valorMinKm, kmMes, totalMensal } = obterCustoKm();

  // Dashboard
  document.getElementById('totalMoto').textContent = totalMotoMes.toFixed(2);
  document.getElementById('totalPessoal').textContent = totalPessoalMes.toFixed(2);
  document.getElementById('totalGeral').textContent = totalMensal.toFixed(2);
  document.getElementById('rCustoComb').textContent = `R$ ${custoComb.toFixed(2)}`;
  document.getElementById('rGastoKm').textContent = `R$ ${gastoFixoKm.toFixed(2)}`;
  document.getElementById('rValorMinKm').textContent = `R$ ${valorMinKm.toFixed(2)}`;

  // Cálculo dos 3 cenários (valor mínimo varia com dias trabalhados)
  const kmDia = parseFloat(inputs.kmPorDia.value) || 0;
  [30, 26, 22].forEach(dias => {
    const kmM = kmDia * dias;
    const vMin = kmM > 0 ? custoComb + (totalMensal / kmM) : 0;
    document.getElementById(`vMin${dias}`).textContent = `R$ ${vMin.toFixed(2)}/km`;
  });

  // Alertas
  const alerta = document.getElementById('alertaPrejuizo');
  if (kmDia <= 0) {
    alerta.className = 'alerta ativo perigo';
    alerta.innerHTML = '⚠️ Preencha "quantos KM você roda por dia" pra ver os cálculos!';
  } else if (valorMinKm > 5) {
    alerta.className = 'alerta ativo perigo';
    alerta.innerHTML = `⚠️ Seu valor mínimo (R$ ${valorMinKm.toFixed(2)}/km) tá alto. Tente rodar mais km/dia ou reduzir gastos.`;
  } else if (valorMinKm > 0) {
    alerta.className = 'alerta ativo ok';
    alerta.innerHTML = `✅ Cobre no mínimo <strong>R$ ${valorMinKm.toFixed(2)}/km</strong> e você paga todas as contas trabalhando ${diasMes} dias/mês.`;
  } else {
    alerta.className = 'alerta';
  }

  renderizarVencimentos();
  atualizarGrafico(totalMotoMes, totalPessoalMes);
}

// ============================================
// 6. SELETOR DE MODO
// ============================================
document.querySelectorAll('input[name="modo"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    modoAtual = e.target.value;
    localStorage.setItem('modoAtual', modoAtual);
    aplicarModo(modoAtual);
  });
});

function aplicarModo(modo) {
  const calcDelivery = document.getElementById('calcDelivery');
  const calcPassageiro = document.getElementById('calcPassageiro');
  calcDelivery.classList.add('oculto');
  calcPassageiro.classList.add('oculto');
  if (modo === 'delivery' || modo === 'ambos') calcDelivery.classList.remove('oculto');
  if (modo === 'passageiro' || modo === 'ambos') calcPassageiro.classList.remove('oculto');
}

// ============================================
// 7. CALCULADORA DELIVERY (só distância!)
// ============================================
function calcularDelivery() {
  const dist = parseFloat(document.getElementById('distDelivery').value) || 0;
  const { valorMinKm } = obterCustoKm();

  if (dist <= 0) { alert('Informe a distância da corrida!'); return; }
  if (valorMinKm <= 0) { alert('Preencha primeiro a configuração da moto e seus gastos!'); return; }

  const valor = dist * valorMinKm;

  document.getElementById('resDelivery').innerHTML = `
    <div class="linha"><span>Distância</span><strong>${dist} km</strong></div>
    <div class="linha"><span>Valor mínimo por km</span><strong>R$ ${valorMinKm.toFixed(2)}</strong></div>
    <div class="destaque-final">
      💰 Aceite por NO MÍNIMO: R$ ${valor.toFixed(2)}
    </div>
    <small style="margin-top:10px; text-align:center; color:#7f8c8d;">
      Esse é o valor base que cobre seus custos. Cobrar acima disso = lucro pra você!
    </small>
  `;
  document.getElementById('resDelivery').classList.add('ativo');
}

// ============================================
// 8. CALCULADORA PASSAGEIRO (distância + tempo)
// ============================================
function calcularPassageiro() {
  const dist = parseFloat(document.getElementById('distPass').value) || 0;
  const tempo = parseFloat(document.getElementById('tempoPass').value) || 0;
  const { valorMinKm } = obterCustoKm();

  if (dist <= 0 || tempo <= 0) { alert('Informe distância E tempo!'); return; }
  if (valorMinKm <= 0) { alert('Preencha primeiro a configuração da moto e seus gastos!'); return; }

  // Velocidade urbana média do motoboy = 25 km/h
  // Valor da hora derivado do valor mínimo por km × velocidade
  const velocidadeMedia = 25;
  const valorHora = valorMinKm * velocidadeMedia;
  const custoRota = dist * valorMinKm;
  const custoTempo = (tempo / 60) * valorHora;
  const minimo = custoRota + custoTempo;

  document.getElementById('resPassageiro').innerHTML = `
    <div class="linha"><span>Distância</span><strong>${dist} km</strong></div>
    <div class="linha"><span>Tempo estimado</span><strong>${tempo} min</strong></div>
    <div class="linha"><span>Custo da rota</span><strong>R$ ${custoRota.toFixed(2)}</strong></div>
    <div class="linha"><span>Custo do tempo (R$ ${valorHora.toFixed(2)}/h)</span><strong>R$ ${custoTempo.toFixed(2)}</strong></div>
    <div class="destaque-final">
      💰 Aceite por NO MÍNIMO: R$ ${minimo.toFixed(2)}
    </div>
    <small style="margin-top:10px; text-align:center; color:#7f8c8d;">
      O tempo é calculado automaticamente pelo seu custo/km e velocidade média urbana (25 km/h).
    </small>
  `;
  document.getElementById('resPassageiro').classList.add('ativo');
}

// ============================================
// 9. GRÁFICO
// ============================================
function atualizarGrafico(totalMoto, totalPessoal) {
  const ctx = document.getElementById('graficoGastos');
  if (grafico) grafico.destroy();

  grafico = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Gastos Moto (mensal)', 'Gastos Pessoais (mensal)'],
      datasets: [{
        data: [totalMoto, totalPessoal],
        backgroundColor: ['#e74c3c', '#9b59b6'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

// ============================================
// 10. EXPORTAR PDF
// ============================================
document.getElementById('btnExportarPDF').addEventListener('click', async () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');
  const elementos = document.querySelectorAll('main .card:not(.oculto)');

  let y = 10;
  pdf.setFontSize(18);
  pdf.text('Relatório MotoCalc', 105, y, { align: 'center' });
  y += 10;

  for (const el of elementos) {
    const canvas = await html2canvas(el, { scale: 2 });
    const img = canvas.toDataURL('image/png');
    const largura = 190;
    const altura = (canvas.height * largura) / canvas.width;
    if (y + altura > 280) { pdf.addPage(); y = 10; }
    pdf.addImage(img, 'PNG', 10, y, largura, altura);
    y += altura + 5;
  }
  pdf.save('relatorio-motocalc.pdf');
});

// ============================================
// 11. INICIALIZAÇÃO
// ============================================
carregarConfig();
renderizarGastos();
renderizarVencimentos();
calcularTudo();

// Atualiza vencimentos a cada minuto (caso passe meia-noite)
setInterval(renderizarVencimentos, 60000);

// ============================================
// 12. REGISTRO DO SERVICE WORKER (PWA)
// ============================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('✅ Service Worker registrado:', reg.scope))
      .catch((err) => console.error('❌ Erro ao registrar SW:', err));
  });
}