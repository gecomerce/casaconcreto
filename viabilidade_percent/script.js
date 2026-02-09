
document.addEventListener('DOMContentLoaded', () => {

    /* ================= CONSTANTES ================= */
    const ITBI = 0.02;
    const RGI = 0.0075;
    const CERTIDAO = 0.13;
    const LUCRO_CONSTRUTOR = 0.10;
    const IPTU = 0.007;
    const HABITE_SE = 0.04;
    const CORRETOR = 0.10;
    const PROPAGANDA = 0.01;
    const IR = 0.15;
    const AGUA_ENERGIA_FIXO = 1000;
    const FATOR_VGV = 1.574;

    const el = id => document.getElementById(id);

    const formatarMoeda = v =>
        v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const limparValor = v =>
        Number(String(v).replace(/\D/g, '')) / 100 || 0;

    /* ================= DROPDOWN ================= */
    function getCustoMetro() {
        return Number(el('custo_por_metro').value) || 0;
    }

    /* ================= BASE OBRA ================= */
    function custoObraBase() {
        const unidades = Number(el('qtd_unidades').value) || 0;
        const area = Number(el('metragem_da_obra').value) || 0;
        return unidades * area * getCustoMetro();
    }

    /* ================= INPUTS ================= */
    function aplicarMascaraMoeda(input) {
        if (!input) return;
        input.value = formatarMoeda(0);
        input.addEventListener('input', e => {
            const valor = limparValor(e.target.value);
            e.target.value = formatarMoeda(valor);
            calcularTudo();
        });
    }

    aplicarMascaraMoeda(el('valor_aquisicao'));

    /* ================= CÁLCULO PRINCIPAL ================= */
    function calcularTudo() {

        const terreno = limparValor(el('valor_aquisicao').value);
        const custoObra = custoObraBase();

        const itbi = terreno * ITBI;
        const rgi = (terreno + custoObra) * RGI;
        const certidao = itbi * CERTIDAO;

        el('itbi_resultado').textContent = `Resultado ITBI (2%): ${formatarMoeda(itbi)}`;
        el('rgi').textContent = `Resultado RGI (0,75%): ${formatarMoeda(rgi)}`;
        el('certidao_etc').textContent = `Certidão (13%): ${formatarMoeda(certidao)}`;

        const totalTerreno = terreno + itbi + rgi + certidao;
        el('custo_total_terreno').textContent = `Total: ${formatarMoeda(totalTerreno)}`;

        const lucroConstrutor = custoObra * LUCRO_CONSTRUTOR;
        el('lucro_construtor').textContent = `Lucro do Construtor 10%: ${formatarMoeda(lucroConstrutor)}`;
        el('custo_total_obra').textContent = `Total ${formatarMoeda(custoObra)}`;

        const iptu = terreno * IPTU;
        el('valor_iptu').value = formatarMoeda(iptu);

        const habite = (terreno + custoObra) * HABITE_SE;
        el('habite_se').textContent =
            `HABITE-SE + Averbação + ISS + INSS: ${formatarMoeda(habite)}`;

        const despesas = AGUA_ENERGIA_FIXO + iptu;
        el('resultado_despesas').textContent =
            `Despesas Do Imóvel: ${formatarMoeda(despesas)}`;

        const totalOperacional =
            terreno + itbi + rgi + certidao +
            custoObra + lucroConstrutor +
            iptu + habite + AGUA_ENERGIA_FIXO;

        el('resultado_operacional').textContent = formatarMoeda(totalOperacional);

        const vgv = totalOperacional * FATOR_VGV;
        el('vgv_resultado').textContent = formatarMoeda(vgv);

        const corretagem = vgv * CORRETOR;
        const propaganda = vgv * PROPAGANDA;
        const totalCorretagem = corretagem + propaganda;

        el('corretor').textContent = `Corretor (10%): ${formatarMoeda(corretagem)}`;
        el('propaganda').textContent = formatarMoeda(propaganda);
        el('total_corretagem').textContent = `Total Corretagem: ${formatarMoeda(totalCorretagem)}`;

        const lucroBruto = vgv - totalOperacional;
        const imposto = lucroBruto > 0 ? lucroBruto * IR : 0;
        const lucroLiquido = lucroBruto - imposto - totalCorretagem;
        const percentual = (lucroLiquido / vgv) * 100;

        el('lucro_bruto').textContent = `Lucro Bruto: ${formatarMoeda(lucroBruto)}`;
        el('lucro_liquido').textContent = `Lucro Liquido: ${formatarMoeda(lucroLiquido)}`;
        el('percentual_lucro').textContent = `Percentual: ${percentual.toFixed(2)}%`;

        /* ---------- DETALHE ---------- */
        el('to_terreno').textContent = `Terreno: ${formatarMoeda(terreno)}`;
        el('to_itbi').textContent = `ITBI: ${formatarMoeda(itbi)}`;
        el('to_rgi').textContent = `RGI: ${formatarMoeda(rgi)}`;
        el('to_certidao').textContent = `Certidões: ${formatarMoeda(certidao)}`;
        el('to_custo_obra').textContent = `Custo da Obra: ${formatarMoeda(custoObra)}`;
        el('to_lucro_construtor').textContent = `Lucro Construtor: ${formatarMoeda(lucroConstrutor)}`;
        el('to_iptu').textContent = `IPTU: ${formatarMoeda(iptu)}`;
        el('to_habite').textContent = `Habite-se: ${formatarMoeda(habite)}`;
        el('to_agua_luz').textContent = `Água e Luz: ${formatarMoeda(AGUA_ENERGIA_FIXO)}`;
    }

    ['qtd_unidades', 'metragem_da_obra', 'custo_por_metro'].forEach(id =>
        el(id).addEventListener('input', calcularTudo)
    );

    calcularTudo();
});

