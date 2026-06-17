// FORMATADOR E DEFINIÇÕES
const mesesLista = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const selectMesForm = document.getElementById('mes');
if(selectMesForm) {
    mesesLista.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m; opt.innerText = m;
        if(m === "Junho") opt.selected = true; 
        selectMesForm.appendChild(opt);
    });
}
const formatarMoeda = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

let transacoes = [];
let filtroAtivo = 'all'; 
let anoSelecionadoGlobal = '2026';

try {
    if (localStorage.getItem('orc365_v5_transacoes')) {
        transacoes = JSON.parse(localStorage.getItem('orc365_v5_transacoes'));
    }
} catch(e) { console.error(e); }

// ELEMENTOS DOM
const landingPage = document.getElementById('landing-page');
const telaLogin = document.getElementById('tela-login');
const appPrincipal = document.getElementById('app-principal');
const paginaArtigo = document.getElementById('pagina-artigo');
const trackLanding = document.getElementById('carousel-landing');
const formTransacao = document.getElementById('form-transacao');
const listaTransacoes = document.getElementById('lista-transacoes');
const containerAlertas = document.getElementById('container-alertas');
const filtroGlobalAno = document.getElementById('filtro-global-ano');

// FILTRO GLOBAL (ANO)
if(filtroGlobalAno) {
    filtroGlobalAno.addEventListener('change', (e) => {
        anoSelecionadoGlobal = e.target.value;
        document.querySelectorAll('.txt-ano-contexto').forEach(el => el.innerText = anoSelecionadoGlobal);
        renderizarLista(); atualizarPainel();
        gerarGraficosEvolucaoEDetalhe(); calcularPrevisaoFimAno();
    });
}

// CARROSSEL LANDING PAGE
let currentIndex = 0;
document.getElementById('btn-next-landing').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % 3;
    trackLanding.style.transform = `translateX(-${(currentIndex * 100) / 3}%)`;
});
document.getElementById('btn-prev-landing').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + 3) % 3;
    trackLanding.style.transform = `translateX(-${(currentIndex * 100) / 3}%)`;
});

// NAVEGAÇÃO SPA E EXIBIÇÃO DE ARTIGOS DINÂMICOS
function abrirArtigo(idArtigo) {
    // Oculta todos os artigos
    document.getElementById('artigo-1').classList.add('hidden');
    document.getElementById('artigo-2').classList.add('hidden');
    document.getElementById('artigo-3').classList.add('hidden');
    // Mostra o artigo específico
    document.getElementById(`artigo-${idArtigo}`).classList.remove('hidden');

    landingPage.classList.add('hidden'); 
    paginaArtigo.classList.remove('hidden'); 
    window.scrollTo(0, 0); 
}
function fecharArtigo() { paginaArtigo.classList.add('hidden'); landingPage.classList.remove('hidden'); }
function abrirModalLogin() { landingPage.classList.add('hidden'); paginaArtigo.classList.add('hidden'); telaLogin.classList.remove('hidden'); telaLogin.classList.add('flex'); }
function voltarParaLanding() { telaLogin.classList.add('hidden'); telaLogin.classList.remove('flex'); landingPage.classList.remove('hidden'); }

// Listeners de navegação
document.getElementById('btn-abrir-login').addEventListener('click', abrirModalLogin);
document.getElementById('btn-voltar-inicio').addEventListener('click', voltarParaLanding);
document.getElementById('btn-fechar-artigo').addEventListener('click', fecharArtigo);
document.getElementById('btn-artigo-acessar').addEventListener('click', abrirModalLogin);

// Listener do Carrossel que abre artigos específicos
document.getElementById('btn-ler-artigo-1').addEventListener('click', () => abrirArtigo(1));
document.getElementById('btn-ler-artigo-2').addEventListener('click', () => abrirArtigo(2));
document.getElementById('btn-ler-artigo-3').addEventListener('click', () => abrirArtigo(3));


// LOGIN
if (sessionStorage.getItem('logado365') === 'true') {
    landingPage.classList.add('hidden'); telaLogin.classList.add('hidden');
    appPrincipal.classList.remove('hidden'); appPrincipal.classList.add('flex');
}
document.getElementById('form-login').addEventListener('submit', (e) => {
    e.preventDefault();
    if (document.getElementById('login-user').value === 'admin' && document.getElementById('login-pass').value === 'admin') {
        sessionStorage.setItem('logado365', 'true');
        telaLogin.classList.add('hidden'); telaLogin.classList.remove('flex');
        appPrincipal.classList.remove('hidden'); appPrincipal.classList.add('flex');
        renderizarLista(); atualizarPainel();
    } else { document.getElementById('erro-login').classList.remove('hidden'); }
});
document.getElementById('btn-logout').addEventListener('click', () => { sessionStorage.removeItem('logado365'); window.location.reload(); });


// ABAS INTERNAS SPA
const botoesNav = document.querySelectorAll('.nav-btn');
const abas = { 'btn-painel': 'aba-painel', 'btn-relatorios': 'aba-relatorios', 'btn-previsao': 'aba-previsao' };

botoesNav.forEach(btn => {
    btn.addEventListener('click', () => {
        botoesNav.forEach(b => b.className = "nav-btn text-slate-400 hover:text-white text-sm font-medium px-4 py-2 transition");
        btn.className = "nav-btn bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg shadow transition";
        Object.values(abas).forEach(id => document.getElementById(id).classList.add('hidden'));
        document.getElementById(abas[btn.id]).classList.remove('hidden');
        
        if(btn.id === 'btn-relatorios') gerarGraficosEvolucaoEDetalhe();
        if(btn.id === 'btn-previsao') calcularPrevisaoFimAno();
    });
});

// FUNÇÕES DE LÓGICA E ESTADO
function dispararAlerta(mensagem) {
    const alerta = document.createElement('div');
    alerta.className = `p-3 rounded-xl shadow-lg text-sm text-white bg-emerald-600 animate-fade`;
    alerta.innerText = mensagem;
    containerAlertas.appendChild(alerta);
    setTimeout(() => alerta.remove(), 2500);
}

function deletarTransacao(id) {
    transacoes = transacoes.filter(t => t.id !== id);
    localStorage.setItem('orc365_v5_transacoes', JSON.stringify(transacoes));
    renderizarLista(); atualizarPainel();
}
window.deletarTransacao = deletarTransacao;

function filtrarLista(tipo) {
    filtroAtivo = tipo;
    ['all', 'receita', 'despesa'].forEach(f => {
        const btn = document.getElementById(`btn-filtro-${f === 'all' ? 'todos' : f + 's'}`);
        if(f === tipo) btn.className = "bg-blue-600 text-white text-xs px-2.5 py-1 rounded";
        else btn.className = "text-slate-400 text-xs px-2.5 py-1 rounded";
    });
    renderizarLista();
}

function atualizarPainel() {
    let tr = 0, td = 0;
    const dadosAno = transacoes.filter(t => (t.ano || '2026') === anoSelecionadoGlobal);
    dadosAno.forEach(t => t.tipo === 'receita' ? tr += t.valor : td += t.valor);
    const saldo = tr - td;
    
    document.getElementById('balanco-receitas').innerText = formatarMoeda(tr);
    document.getElementById('saldo-total').innerText = formatarMoeda(saldo);
    document.getElementById('barra-lateral-saldo').className = saldo < 0 ? "absolute top-0 left-0 bottom-0 w-1 bg-rose-500" : "absolute top-0 left-0 bottom-0 w-1 bg-emerald-500";
    document.getElementById('saldo-total').className = saldo < 0 ? "text-3xl font-black text-rose-400 mt-2" : "text-3xl font-black text-emerald-400 mt-2";
}

function renderizarLista() {
    if (!listaTransacoes) return;
    listaTransacoes.innerHTML = '';
    
    const filtradas = transacoes.filter(t => {
        const matchAno = (t.ano || '2026') === anoSelecionadoGlobal;
        const matchTipo = filtroAtivo === 'all' || t.tipo === filtroAtivo;
        return matchAno && matchTipo;
    });
    
    if(filtradas.length === 0) {
        listaTransacoes.innerHTML = `<tr><td colspan="3" class="p-6 text-center text-slate-500 italic">Nenhuma movimentação em ${anoSelecionadoGlobal}.</td></tr>`;
        return;
    }

    filtradas.forEach(t => {
        const cor = t.tipo === 'receita' ? 'text-emerald-400' : 'text-rose-400';
        const sinal = t.tipo === 'receita' ? '+' : '-';
        listaTransacoes.innerHTML += `
            <tr class="hover:bg-slate-800/30 border-b border-slate-800/60">
                <td class="p-4 text-slate-300 font-medium">${t.nome}<br><span class="text-[10px] text-slate-500">${t.mes} / Categoria: ${t.categoria || 'Outros'}</span></td>
                <td class="p-4 text-right font-bold ${cor}">${sinal} ${formatarMoeda(t.valor)}</td>
                <td class="p-4 text-center"><button onclick="deletarTransacao(${t.id})" class="text-slate-500 hover:text-rose-400 font-bold p-1">✕</button></td>
            </tr>`;
    });
}

document.getElementById('btn-filtro-todos').addEventListener('click', () => filtrarLista('all'));
document.getElementById('btn-filtro-receitas').addEventListener('click', () => filtrarLista('receita'));
document.getElementById('btn-filtro-despesas').addEventListener('click', () => filtrarLista('despesa'));

// RELATÓRIOS E GRÁFICOS
function gerarGraficosEvolucaoEDetalhe() {
    const containerEvolucao = document.getElementById('container-evolucao-temporal');
    const containerDetalhe = document.getElementById('container-detalhe-gastos');
    if(!containerEvolucao || !containerDetalhe) return;
    
    containerEvolucao.innerHTML = ''; containerDetalhe.innerHTML = '';
    const dadosAno = transacoes.filter(t => (t.ano || '2026') === anoSelecionadoGlobal);

    // Gráfico de Evolução Temporal
    let balancoMensal = {};
    mesesLista.forEach(m => balancoMensal[m] = 0);
    dadosAno.forEach(t => {
        const m = t.mes || "Junho";
        if(balancoMensal[m] !== undefined) balancoMensal[m] += t.tipo === 'receita' ? t.valor : -t.valor;
    });

    let maxValorMensal = 1;
    mesesLista.forEach(m => { if(Math.abs(balancoMensal[m]) > maxValorMensal) maxValorMensal = Math.abs(balancoMensal[m]); });

    mesesLista.forEach(m => {
        const saldoMes = balancoMensal[m];
        if(saldoMes !== 0) {
            const pct = (Math.abs(saldoMes) / maxValorMensal) * 100;
            const corBarra = saldoMes >= 0 ? 'bg-emerald-500' : 'bg-rose-500';
            const corTexto = saldoMes >= 0 ? 'text-emerald-400' : 'text-rose-400';
            
            containerEvolucao.innerHTML += `
                <div class="space-y-1">
                    <div class="flex justify-between text-xs"><span class="text-slate-300 font-medium">${m}</span><span class="${corTexto} font-bold">${formatarMoeda(saldoMes)}</span></div>
                    <div class="bg-slate-800 h-2 rounded-full overflow-hidden"><div class="${corBarra} h-full barra-grafico" style="width: ${pct}%"></div></div>
                </div>`;
        }
    });
    if(containerEvolucao.children.length === 0) containerEvolucao.innerHTML = '<p class="text-xs text-slate-500 italic text-center py-4">Sem dados temporais disponíveis.</p>';

    // Gráfico Detalhamento de Gastos
    let categoriasGastos = { Moradia:0, Alimentação:0, Transporte:0, Lazer:0, Saúde:0, Educação:0, Outros:0 };
    let totalDespesasAno = 0;
    dadosAno.forEach(t => {
        if(t.tipo === 'despesa') {
            const cat = t.categoria || 'Outros';
            if(categoriasGastos[cat] !== undefined) { categoriasGastos[cat] += t.valor; totalDespesasAno += t.valor; }
        }
    });

    Object.keys(categoriasGastos).forEach(cat => {
        const valorCat = categoriasGastos[cat];
        if(valorCat > 0) {
            const pctCat = totalDespesasAno > 0 ? (valorCat / totalDespesasAno) * 100 : 0;
            containerDetalhe.innerHTML += `
                <div class="space-y-1">
                    <div class="flex justify-between text-xs"><span class="text-slate-300 font-medium">${cat}</span><span class="text-slate-400">${formatarMoeda(valorCat)} (${Math.round(pctCat)}%)</span></div>
                    <div class="bg-slate-800 h-2 rounded-full overflow-hidden"><div class="bg-rose-500 h-full barra-grafico" style="width: ${pctCat}%"></div></div>
                </div>`;
        }
    });
    if(containerDetalhe.children.length === 0) containerDetalhe.innerHTML = '<p class="text-xs text-slate-500 italic text-center py-4">Nenhum gasto cadastrado para detalhar.</p>';
}

// PREVISÃO
function calcularPrevisaoFimAno() {
    const dadosAno = transacoes.filter(t => (t.ano || '2026') === anoSelecionadoGlobal);
    let mesesAtivos = new Set();
    let totalReceita = 0; let totalDespesa = 0;

    dadosAno.forEach(t => {
        mesesAtivos.add(t.mes || "Junho");
        if(t.tipo === 'receita') totalReceita += t.valor; else totalDespesa += t.valor;
    });

    const qtdMesesDados = mesesAtivos.size || 1;
    const mediaGanhoMensal = totalReceita / qtdMesesDados;
    const mediaGastoMensal = totalDespesa / qtdMesesDados;
    const mesesRestantes = Math.max(0, 12 - qtdMesesDados);
    
    const saldoAtual = totalReceita - totalDespesa;
    const sobraMensalMedia = mediaGanhoMensal - mediaGastoMensal;
    const resultadoFinalProjetado = saldoAtual + (sobraMensalMedia * mesesRestantes);

    document.getElementById('prev-media-ganho').innerText = formatarMoeda(mediaGanhoMensal);
    document.getElementById('prev-media-gasto').innerText = formatarMoeda(mediaGastoMensal);
    const displayResultadoFinal = document.getElementById('prev-resultado-final');
    displayResultadoFinal.innerText = formatarMoeda(resultadoFinalProjetado);
    displayResultadoFinal.className = resultadoFinalProjetado < 0 ? "text-3xl font-black text-rose-400 mt-3" : "text-3xl font-black text-emerald-400 mt-3";
}

formTransacao.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = parseFloat(document.getElementById('valor').value);
    if(val <= 0 || isNaN(val)) return;
    
    transacoes.push({
        id: Date.now(), nome: document.getElementById('nome').value.trim(), valor: val,
        tipo: document.getElementById('tipo').value, categoria: document.getElementById('categoria').value,
        mes: document.getElementById('mes').value, ano: document.getElementById('ano').value
    });
    
    localStorage.setItem('orc365_v5_transacoes', JSON.stringify(transacoes));
    renderizarLista(); atualizarPainel(); dispararAlerta("Transação adicionada!");
    e.target.reset();
});

renderizarLista(); atualizarPainel();
