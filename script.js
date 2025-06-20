document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos do DOM
    const inputs = {
        taxaAplicativo: document.getElementById('taxaAplicativo'),
        kmMes: document.getElementById('kmMes'),
        valorVeiculo: document.getElementById('valorVeiculo'),
        depreciacao: document.getElementById('depreciacao'),
        financiamento: document.getElementById('financiamento'),
        lucroEsperado: document.getElementById('lucroEsperado'),
        licenciamentoAnual: document.getElementById('licenciamentoAnual'),
        seguroAnual: document.getElementById('seguroAnual'),
        custoPneus: document.getElementById('custoPneus'),
        vidaUtilPneus: document.getElementById('vidaUtilPneus'),
        custoOleo: document.getElementById('custoOleo'),
        frequenciaOleo: document.getElementById('frequenciaOleo'),
        manutencaoAnual: document.getElementById('manutencaoAnual'),
        valorCombustivel: document.getElementById('valorCombustivel'),
        consumoCombustivel: document.getElementById('consumoCombustivel'),
        custoTotalKm: document.getElementById('custoTotalKm'),
    };

    const btnSalvar = document.getElementById('btnSalvar');

    // Estado inicial do sistema (valores padrão)
    // Estes são os valores DEFAULTS se não houver nada salvo
    let automovelDefault = {
        km_mes: 5000,
        valor: 50000,
        depreciacao: 12, // %
        financiamento: 0,
        lucro: 4000,
        licenciamento: 1300,
        seguro: 2000,
        pneus_custo: 2500, // Custo do conjunto de pneus
        pneus_vida: 50000, // Km
        oleo_custo: 400,
        oleo_frequencia: 10000, // Km
        outros: 3000, // Manutenção anual
        consumo_combustivel: 11, // Km/L
    };

    let combustivelDefault = {
        valor: 5.80, // R$
    };

    let taxaAplicativoDefault = 10; // %

    // Variáveis que vão armazenar os dados ATUAIS do formulário
    let automovel = { ...automovelDefault };
    let combustivel = { ...combustivelDefault };
    let taxaAplicativo = taxaAplicativoDefault;

    // --- Funções de Cálculo ---
    // (Estas funções permanecem as mesmas, pois a lógica de cálculo já está correta)
    function calcularCustoVeiculo() {
        const depreciacaoAnual = (automovel.valor * automovel.depreciacao) / 100;
        const depreciacaoPorKm = automovel.km_mes ? depreciacaoAnual / (automovel.km_mes * 12) : 0;
        const parcelaPorKm = automovel.km_mes ? automovel.financiamento / automovel.km_mes : 0;
        return depreciacaoPorKm + parcelaPorKm;
    }

    function calcularCustoTerceiros() {
        if (!automovel.km_mes) return 0;
        const totalAnual = (automovel.licenciamento || 0) + (automovel.seguro || 0);
        const kmAnual = automovel.km_mes * 12;
        return kmAnual ? totalAnual / kmAnual : 0;
    }

    function calcularCustoPneus() {
        if (!automovel.pneus_vida) return 0;
        return (automovel.pneus_custo || 0) / automovel.pneus_vida;
    }

    function calcularCustoOleo() {
        if (!automovel.oleo_frequencia) return 0;
        return (automovel.oleo_custo || 0) / automovel.oleo_frequencia;
    }

    function calcularCustoOutros() {
        if (!automovel.km_mes) return 0;
        const kmAnual = automovel.km_mes * 12;
        return kmAnual ? (automovel.outros || 0) / kmAnual : 0;
    }

    function calcularCustoLucro() {
        if (!automovel.km_mes) return 0;
        return (automovel.lucro || 0) / automovel.km_mes;
    }

    function calcularCustoCombustivel() {
        if (!automovel.consumo_combustivel || !combustivel.valor) return 0;
        return combustivel.valor / automovel.consumo_combustivel;
    }

    function calcularCustoTotal() {
        const custoBase =
            calcularCustoVeiculo() +
            calcularCustoTerceiros() +
            calcularCustoPneus() +
            calcularCustoOleo() +
            calcularCustoOutros() +
            calcularCustoLucro() +
            calcularCustoCombustivel();

        return custoBase * (1 + (taxaAplicativo / 100));
    }

    // --- Funções de Sincronização e Eventos ---

    // Atualiza os campos do HTML com os valores do estado atual (automovel, combustivel, taxaAplicativo)
    function renderizarCampos() {
        inputs.taxaAplicativo.value = taxaAplicativo;
        inputs.kmMes.value = automovel.km_mes;
        inputs.valorVeiculo.value = automovel.valor;
        inputs.depreciacao.value = automovel.depreciacao;
        inputs.financiamento.value = automovel.financiamento;
        inputs.lucroEsperado.value = automovel.lucro;
        inputs.licenciamentoAnual.value = automovel.licenciamento;
        inputs.seguroAnual.value = automovel.seguro;
        inputs.custoPneus.value = automovel.pneus_custo;
        inputs.vidaUtilPneus.value = automovel.pneus_vida;
        inputs.custoOleo.value = automovel.oleo_custo;
        inputs.frequenciaOleo.value = automovel.oleo_frequencia;
        inputs.manutencaoAnual.value = automovel.outros;
        inputs.valorCombustivel.value = combustivel.valor;
        inputs.consumoCombustivel.value = automovel.consumo_combustivel;

        atualizarCustoTotalDisplay();
    }

    // Atualiza o campo de custo total no display
    function atualizarCustoTotalDisplay() {
        const total = calcularCustoTotal();
        inputs.custoTotalKm.value = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }

    // Carrega dados do localStorage ou usa defaults
    function carregarDados() {
        const savedAutomovel = localStorage.getItem('automovelData');
        const savedCombustivel = localStorage.getItem('combustivelData');
        const savedTaxa = localStorage.getItem('taxaAplicativo');

        // Se houver dados salvos, carrega. Caso contrário, usa os defaults definidos no script.
        automovel = savedAutomovel ? JSON.parse(savedAutomovel) : { ...automovelDefault };
        combustivel = savedCombustivel ? JSON.parse(savedCombustivel) : { ...combustivelDefault };
        taxaAplicativo = savedTaxa ? parseFloat(savedTaxa) : taxaAplicativoDefault;

        renderizarCampos(); // Renderiza os dados carregados ou defaults na tela
    }

    // Salva dados do localStorage
    function salvarDados() {
        // Itera sobre os inputs e atualiza os objetos 'automovel', 'combustivel' e 'taxaAplicativo'
        // com os valores ATUAIS do formulário antes de salvar.
        taxaAplicativo = parseFloat(inputs.taxaAplicativo.value) || 0;
        combustivel.valor = parseFloat(inputs.valorCombustivel.value) || 0;
        automovel.consumo_combustivel = parseFloat(inputs.consumoCombustivel.value) || 0;
        automovel.km_mes = parseFloat(inputs.kmMes.value) || 0;
        automovel.valor = parseFloat(inputs.valorVeiculo.value) || 0;
        automovel.depreciacao = parseFloat(inputs.depreciacao.value) || 0;
        automovel.financiamento = parseFloat(inputs.financiamento.value) || 0;
        automovel.lucro = parseFloat(inputs.lucroEsperado.value) || 0;
        automovel.licenciamento = parseFloat(inputs.licenciamentoAnual.value) || 0;
        automovel.seguro = parseFloat(inputs.seguroAnual.value) || 0;
        automovel.pneus_custo = parseFloat(inputs.custoPneus.value) || 0;
        automovel.vida_util_pneus = parseFloat(inputs.vidaUtilPneus.value) || 0; // Correção no nome da propriedade
        automovel.oleo_custo = parseFloat(inputs.custoOleo.value) || 0;
        automovel.oleo_frequencia = parseFloat(inputs.frequenciaOleo.value) || 0;
        automovel.outros = parseFloat(inputs.manutencaoAnual.value) || 0;


        localStorage.setItem('automovelData', JSON.stringify(automovel));
        localStorage.setItem('combustivelData', JSON.stringify(combustivel));
        localStorage.setItem('taxaAplicativo', taxaAplicativo.toString());
        alert('Informações salvas com sucesso!');
        atualizarCustoTotalDisplay(); // Re-calcula e exibe após salvar (garantia)
    }

    // --- Event Listeners ---
    // Adiciona listener para todos os campos de input
    Object.keys(inputs).forEach(key => {
        if (inputs[key] !== inputs.custoTotalKm) {
            inputs[key].addEventListener('input', (event) => {
                let value = event.target.value;

                if (event.target.type === 'number') {
                    value = parseFloat(value);
                    if (isNaN(value)) {
                        value = 0;
                    }
                }

                // Ajusta os valores diretamente nos objetos automovel, combustivel e taxaAplicativo
                switch (event.target.id) {
                    case 'taxaAplicativo':
                        taxaAplicativo = value;
                        break;
                    case 'valorCombustivel':
                        combustivel.valor = value;
                        break;
                    case 'consumoCombustivel':
                        automovel.consumo_combustivel = value;
                        break;
                    case 'lucroEsperado':
                        automovel.lucro = value;
                        break;
                    case 'licenciamentoAnual':
                        automovel.licenciamento = value;
                        break;
                    case 'seguroAnual':
                        automovel.seguro = value;
                        break;
                    case 'manutencaoAnual':
                        automovel.outros = value;
                        break;
                    case 'vidaUtilPneus': // Mapeamento correto
                        automovel.pneus_vida = value;
                        break;
                    default:
                        const propName = event.target.id.replace(/([A-Z])/g, '_$1').toLowerCase();
                        if (automovel.hasOwnProperty(propName)) { // Só atualiza se a propriedade existir
                            automovel[propName] = value;
                        }
                        break;
                }
                atualizarCustoTotalDisplay();
            });
        }
    });

    btnSalvar.addEventListener('click', salvarDados);

    // Carrega os dados ao iniciar a página ou renderiza os padrões
    carregarDados();
});