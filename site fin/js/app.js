// Inicialização do LocalStorage
let transacoes = [];
let filtroAtivo = 'todos';

try {
    const dadosSalvos = localStorage.getItem('orcamento365_transacoes');
    if (dadosSalvos) transacoes = JSON.parse(dadosSalvos);
} catch (e) {
    console.error(e);
}

// ELEMENTOS DE AUTENTICAÇÃO (LOGIN)
const telaLogin = document.getElementById('tela-login');
const appPrincipal = document.getElementById('app-principal');
const formLogin = document.getElementById('form-login');
const loginUser = document.getElementById('login-user');
const loginPass = document.getElementById('login-pass');
const erroLogin = document.getElementById('erro-login');
const btnLogout = document.getElementById('btn-logout');

// Controle de Sessão Básica por SessionStorage
if (sessionStorage.getItem('logado365') === 'true') {
    telaLogin.classList.add('hidden');
    appPrincipal.classList.remove('hidden');
}

formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    // Credencial padrão definida para fins acadêmicos
    if (loginUser.value === 'admin' && loginPass.value === 'admin') {
        sessionStorage.setItem('logado365', 'true');
        telaLogin.classList.add('hidden');
        appPrincipal.classList.remove('hidden');
        dispararAlerta("Login efetuado com sucesso!");
        renderizarLista();
        atualizarPainel();
    } else {
        erroLogin.classList.remove('hidden');
    }
});

btnLogout.addEventListener('click', () => {
    sessionStorage.removeItem('logado365');
    window.location.reload();
});

// Elementos Principais do App
const form = document.getElementById('form-transacao');
const inputNome = document.getElementById('nome');
const inputValor = document.getElementById('valor');
const inputTipo = document.getElementById('tipo');
const inputMes = document.getElementById('mes');
const listaTransacoes = document.getElementById('lista-transacoes');
const displayReceitas = document.getElementById('balanco-receitas');
const displaySaldo = document.getElementById('saldo-total');
const cardSaldoTotal = document.getElementById('card-saldo-total');
const barraLateralSaldo = document.getElementById('barra-lateral-saldo');
const containerAlertas = document.getElementById('container-alertas');

// Gerenciador de Abas SPA
const botoesNav = document.querySelectorAll('.nav-btn');
const abas = {
    'btn-painel': document.getElementById('aba-painel'),
    'btn-relatorios': document.getElementById('aba-relatorios'),
    'btn-guia': document.getElementById('aba-guia')
};

botoesNav.forEach(botao => {
    botao.addEventListener('click', () => {
        botoesNav.forEach(b => b.className = "nav-btn text-slate-400 hover:text-white text-sm font-medium px-4 py-2 transition");
        botao.className = "nav-btn bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg shadow transition";
        Object.values(abas).forEach(aba => { if(aba) aba.classList.add('hidden'); });
        if(abas[botao.id]) abas[botao.id].classList.remove('hidden');

        if(botao.id === 'btn-relatorios') gerarGraficoEMediaMensal();
    });
});

// FUNÇÃO SURPRESA E COMPILADOR DE GRÁFICOS POR MÊS
function gerarGraficoEMediaMensal() {
    const containerGrafico = document.getElementById('container-grafico');
    const textoIA = document.getElementById('texto-ia');
    if (!containerGrafico) return;
    
    containerGrafico.innerHTML = '';

    const mesesLista = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    
    let dadosPorMes = {};
    mesesLista.forEach(m => dadosPorMes[m] = { receita: 0, despesa: 0 });

    let totalGeralReceita = 0;
    let totalGeralDespesa = 0;

    transacoes.forEach(t => {
        const m = t.mes || "Junho";
        if (dadosPorMes[m]) {
            if (t.tipo === 'receita') {
                dadosPorMes[m].receita += t.valor;
                totalGeralReceita += t.valor;
            } else {
                dadosPorMes[m].despesa += t.valor;
                totalGeralDespesa += t.valor;
            }
        }
    });

    // Função Surpresa: IA de Saúde Preditiva Baseada em Sobrevivência de Caixa
    if (transacoes.length === 0) {
        textoIA.innerText = "Nenhum dado registrado para calcular a saúde preditiva.";
    } else {
        const saldoSobras = totalGeralReceita - totalGeralDespesa;
        if (totalGeralDespesa === 0 && totalGeralReceita > 0) {
            textoIA.innerText = "Excelente! Você não possui despesas registradas. Seus aportes atuais rendem 100% de capacidade livre.";
        } else if (saldoSobras <= 0) {
            textoIA.innerText = "Atenção: Seu balanço preditivo aponta déficit ou margem zerada. Evite novos parcelamentos imediatamente.";
        } else {
            const mesesReserva = (saldoSobras / totalGeralDespesa).toFixed(1);
            textoIA.innerText = `Análise Preditiva: Suas sobras atuais cobririam cerca de ${mesesReserva} meses do seu custo fixo médio demonstrado. Status: Saudável.`;
        }
    }

    // Desenhar Gráfico de Barras Dinâmicas por Mês
    mesesLista.forEach(m => {
        const rec = dadosPorMes[m].receita;
        const desp = dadosPorMes[m].despesa;

        if (rec > 0 || desp > 0) {
            const maxValor = Math.max(rec, desp);
            const pctRec = (rec / maxValor) * 100;
            const pctDesp = (desp / maxValor) * 100;

            const divMes = document.createElement('div');
            divMes.className = 'p-3 bg-slate-900/40 rounded-xl border border-slate-800 space-y-2';
            divMes.innerHTML = `
                <div class="text-xs font-bold text-slate-400 mb-1">${m}</div>
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="w-16 text-[10px] text-emerald-400 font-bold">Ganho:</span>
                        <div class="flex-grow bg-slate-800 h-2.5 rounded-full overflow-hidden">
                            <div class="bg-emerald-500 h-full barra-grafico" style="width: ${pctRec}%"></div>
                        </div>
                        <span class="text-[10px] text-slate-400 min-w-[50px] text-right">${rec.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="w-16 text-[10px] text-rose-400 font-bold">Gasto:</span>
                        <div class="flex-grow bg-slate-800 h-2.5 rounded-full overflow-hidden">
                            <div class="bg-rose-500 h-full barra-grafico" style="width: ${pctDesp}%"></div>
                        </div>
                        <span class="text-[10px] text-slate-400 min-w-[50px] text-right">${desp.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</span>
                    </div>
                </div>
            `;
            containerGrafico.appendChild(divMes);
        }
    });

    if (containerGrafico.children.length === 0) {
        containerGrafico.innerHTML = `<p class="text-xs text-slate-500 italic text-center py-4">Insira transações em meses variados para gerar as barras evolutivas.</p>`;
    }
}

// Filtro da lista da tabela principal
function filtrarLista(tipo) {
    filtroAtivo = tipo;
    const filtros = ['todos', 'receita', 'despesa'];
    filtros.forEach(f => {
        const btn = document.getElementById(`filtro-${f === 'todos' ? 'todos' : f + 's'}`);
        if(btn) {
            if(f === tipo) btn.className = "bg-blue-600 text-white text-xs px-2.5 py-1 rounded font-medium shadow transition";
            else btn.className = "text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded font-medium transition";
        }
    });
    renderizarLista();
}

function dispararAlerta(mensagem, tipo = 'sucesso') {
    if (!containerAlertas) return;
    const alerta = document.createElement('div');
    alerta.className = `p-3 rounded-xl shadow-lg text-sm font-semibold text-white flex justify-between items-center transition-all bg-slate-800 border ${
        tipo === 'sucesso' ? 'border-emerald-500/30 text-emerald-400' : 'border-rose-500/30 text-rose-400'
    }`;
    alerta.innerHTML = `<span>${mensagem}</span>`;
    containerAlertas.appendChild(alerta);
    setTimeout(() => { alerta.remove(); }, 2500);
}

function salvarNoLocalStorage() {
    localStorage.setItem('orcamento365_transacoes', JSON.stringify(transacoes));
}

function deletarTransacao(id, nomeItem) {
    transacoes = transacoes.filter(t => t.id !== Number(id));
    salvarNoLocalStorage();
    renderizarLista();
    atualizarPainel();
    dispararAlerta(`"${nomeItem}" removido.`, 'erro');
}

function atualizarPainel() {
    let totalReceitas = 0;
    let totalDespesas = 0;

    transacoes.forEach(t => {
        if (t.tipo === 'receita') totalReceitas += t.valor;
        else totalDespesas += t.valor;
    });

    const saldoTotal = totalReceitas - totalDespesas;
    const valorFormatado = saldoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    if (displayReceitas) displayReceitas.innerText = totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    if (displaySaldo) {
        if (saldoTotal < 0) {
            displaySaldo.className = "text-3xl font-black text-rose-400 mt-2";
            if (barraLateralSaldo) barraLateralSaldo.className = "absolute top-0 left-0 bottom-0 w-1 bg-rose-500";
            displaySaldo.innerText = `${valorFormatado} (Negativo)`;
        } else {
            displaySaldo.className = "text-3xl font-black text-emerald-400 mt-2";
            if (barraLateralSaldo) barraLateralSaldo.className = "absolute top-0 left-0 bottom-0 w-1 bg-emerald-500";
            displaySaldo.innerText = valorFormatado;
        }
    }
}

function renderizarLista() {
    if (!listaTransacoes) return;
    listaTransacoes.innerHTML = '';

    const transacoesFiltradas = transacoes.filter(t => {
        if (filtroAtivo === 'todos') return true;
        return t.tipo === filtroAtivo;
    });

    if (transacoesFiltradas.length === 0) {
        listaTransacoes.innerHTML = `<tr><td colspan="3" class="p-6 text-center text-slate-500 italic">Nenhuma movimentação encontrada.</td></tr>`;
        return;
    }

    transacoesFiltradas.forEach(t => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-800/30 transition-all border-b border-slate-800/60';
        const classeCor = t.tipo === 'receita' ? 'text-emerald-400' : 'text-rose-400';
        const sinal = t.tipo === 'receita' ? '+' : '-';
        const valorFormatado = t.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const mesTag = t.mes ? ` (${t.mes})` : ' (Junho)';

        tr.innerHTML = `
            <td class="p-4 text-slate-300 font-medium">${t.nome}<span class="text-[11px] text-slate-500 block">${mesTag}</span></td>
            <td class="p-4 text-right font-bold ${classeCor}">${sinal} ${valorFormatado}</td>
            <td class="p-4 text-center">
                <button onclick="deletarTransacao(${t.id}, '${t.nome}')" class="text-slate-500 hover:text-rose-400 p-1 font-bold">✕</button>
            </td>
        `;
        listaTransacoes.appendChild(tr);
    });
}

if (form) {
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const nomeTratado = inputNome.value.trim();
        const valorTratado = parseFloat(inputValor.value);

        if (valorTratado <= 0 || isNaN(valorTratado)) return;

        const novaTransacao = {
            id: Date.now(),
            nome: nomeTratado,
            valor: valorTratado,
            tipo: inputTipo.value,
            mes: inputMes.value
        };

        transacoes.push(novaTransacao);
        salvarNoLocalStorage();
        renderizarLista();
        atualizarPainel();
        dispararAlerta(`"${nomeTratado}" adicionado!`);
        form.reset();
        inputNome.focus();
    });
}

renderizarLista();
atualizarPainel();