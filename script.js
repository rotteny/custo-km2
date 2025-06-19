document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos do DOM
    const inputs = {
        taxaAplicativo: document.getElementById('taxaAplicativo'),
        kmMes: document.getElementById('kmMes'),
        valorVeiculo: document.getElementById('valorVeiculo'),
        depreciacao: document.getElementById('depreciacao'),
        financiamento: document.getElementById('financiamento'),
        lucroEsperado: document.getElementById('lucroEsperado'), // ID no HTML
        licenciamentoAnual: document.getElementById('licenciamentoAnual'), // ID no HTML
        seguroAnual: document.getElementById('seguroAnual'),         // ID no HTML
        custoPneus: document.getElementById('custoPneus'),
        vidaUtilPneus: document.getElementById('vidaUtilPneus'),
        custoOleo: document.getElementById('custoOleo'),
        frequenciaOleo: document.getElementById('frequenciaOleo'),
        manutencaoAnual: document.getElementById('manutencaoAnual'), // ID no HTML
        valorCombustivel: document.getElementById('valorCombustivel'),
        consumoCombustivel: document.getElementById('consumoCombustivel'),
        custoTotalKm: document.getElementById('custoTotalKm'),
    };

    const btnSalvar = document.getElementById('btnSalvar');
    const btnCarregar = document.getElementById('btnCarregar');

    // Estado inicial do sistema (valores padrão)
    let automovel = {
        km_mes: 5000,
        valor: 50000,
        depreciacao: 12, // %
        financiamento: 0,
        lucro: 4000, // Propriedade usada no JS
        licenciamento: 1300, // Propriedade usada no JS
        seguro: 2000, // Propriedade usada no JS
        pneus_custo: 2500, // Custo do conjunto de pneus
        pneus_vida: 50000, // Km
        oleo_custo: 400,
        oleo_frequencia: 10000, // Km
        outros: 3000, // Manutenção anual (propriedade 'outros' no JS)
        consumo_combustivel: 11, // Km/L
    };

    let combustivel = {
        valor: 5.80, // R$
    };

    let taxaAplicativo = 10; // %

    // --- Funções de Cálculo ---
    function calcularCustoVeiculo() {
        const depreciacaoAnual = (automovel.valor * automovel.depreciacao) / 100;
        const depreciacaoPorKm = automovel.km_mes ? depreciacaoAnual / (automovel.km_mes * 12) : 0;
        const parcelaPorKm = automovel.km_mes ? automovel.financiamento / automovel.km_mes : 0;
        return depreciacaoPorKm + parcelaPorKm;
    }

    function calcularCustoTerceiros() {
        if (!automovel.km_mes) return 0;
        const totalAnual = (automovel.licenciamento || 0) + (automovel.seguro || 0); // Usa automovel.licenciamento e automovel.seguro
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
        return kmAnual ? (automovel.outros || 0) / kmAnual : 0; // Usa automovel.outros
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

    // Atualiza os campos do HTML com os valores do estado
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
        inputs.manutencaoAnual.value = automovel.outros; // Renderiza para o ID correto
        inputs.valorCombustivel.value = combustivel.valor;
        inputs.consumoCombustivel.value = automovel.consumo_combustivel;

        atualizarCustoTotalDisplay();
    }

    // Atualiza o campo de custo total no display
    function atualizarCustoTotalDisplay() {
        const total = calcularCustoTotal();
        inputs.custoTotalKm.value = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }

    // Carrega dados do localStorage
    function carregarDados() {
        const savedAutomovel = localStorage.getItem('automovelData');
        const savedCombustivel = localStorage.getItem('combustivelData');
        const savedTaxa = localStorage.getItem('taxaAplicativo');

        automovel = savedAutomovel ? JSON.parse(savedAutomovel) : { ...automovel };
        combustivel = savedCombustivel ? JSON.parse(savedCombustivel) : { ...combustivel };
        taxaAplicativo = savedTaxa ? parseFloat(savedTaxa) : taxaAplicativo;

        renderizarCampos();
    }

    // Salva dados no localStorage
    function salvarDados() {
        localStorage.setItem('automovelData', JSON.stringify(automovel));
        localStorage.setItem('combustivelData', JSON.stringify(combustivel));
        localStorage.setItem('taxaAplicativo', taxaAplicativo.toString());
        alert('Informações salvas com sucesso!');
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

                // Tratamento específico para cada ID que precisa de mapeamento diferente
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
                        automovel.licenciamento = value; // Corrigido o mapeamento
                        break;
                    case 'seguroAnual':
                        automovel.seguro = value; // Corrigido o mapeamento
                        break;
                    case 'manutencaoAnual':
                        automovel.outros = value; // Corrigido o mapeamento
                        break;
                    default:
                        // Para os demais, tenta o mapeamento automático
                        const propName = event.target.id.replace(/([A-Z])/g, '_$1').toLowerCase();
                        automovel[propName] = value;
                        break;
                }
                atualizarCustoTotalDisplay();
            });
        }
    });

    btnSalvar.addEventListener('click', salvarDados);
    btnCarregar.addEventListener('click', carregarDados);

    // Carrega os dados ao iniciar a página ou renderiza os padrões
    carregarDados();
});