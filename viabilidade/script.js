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

    /* ================= HELPERS ================= */
    const el = id => document.getElementById(id);

    const formatarMoeda = v =>
        v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const limparValor = v =>
        Number(String(v).replace(/\D/g, '')) / 100 || 0;

    function aplicarMascaraMoeda(input) {
        input.value = formatarMoeda(0);
        input.addEventListener('input', e => {
            const valor = limparValor(e.target.value);
            e.target.value = formatarMoeda(valor);
            calcularTudo();
        });
    }

    /* ================= INPUTS COM MÁSCARA ================= */
    [
        'valor_aquisicao',
        'custo_por_metro',
        'custo_dinheiro',
        'valor_condominio',
        'valor_agua_energia',
        'vgv'
    ].forEach(id => aplicarMascaraMoeda(el(id)));

    /* ================= BASE OBRA ================= */
    function custoObraBase() {
        const unidades = Number(el('qtd_unidades').value) || 0;
        const area = Number(el('metragem_da_obra').value) || 0;
        const custoMetro = limparValor(el('custo_por_metro').value);
        return unidades * area * custoMetro;
    }

    /* ================= CÁLCULO PRINCIPAL ================= */
    function calcularTudo() {

        /* ---------- TERRENO ---------- */
        const terreno = limparValor(el('valor_aquisicao').value);
        const custoObra = custoObraBase();

        const itbi = terreno * ITBI;
        const rgi = (terreno + custoObra) * RGI;
        const certidao = itbi * CERTIDAO;

        el('itbi_resultado').textContent =
            `Resultado ITBI (2%): ${formatarMoeda(itbi)}`;

        el('rgi').textContent =
            `Resultado RGI (0,75%): ${formatarMoeda(rgi)}`;

        el('certidao_etc').textContent =
            `Certidão (13%): ${formatarMoeda(certidao)}`;

        const totalTerreno = terreno + itbi + rgi + certidao;

        el('custo_total_terreno').textContent =
            `Total: ${formatarMoeda(totalTerreno)}`;

        /* ---------- OBRA ---------- */
        const lucroConstrutor = custoObra * LUCRO_CONSTRUTOR;

        el('lucro_construtor').textContent =
            `Lucro do Construtor 10%: ${formatarMoeda(lucroConstrutor)}`;

        el('custo_total_obra').textContent = `Total ${formatarMoeda(custoObra)}`
            ;

        /* ---------- DESPESAS ---------- */
        const custoDinheiro = limparValor(el('custo_dinheiro').value);
        const condominio = limparValor(el('valor_condominio').value);
        const agua = limparValor(el('valor_agua_energia').value);

        const iptu = terreno * IPTU;
        el('valor_iptu').value = formatarMoeda(iptu);

        const habite = (terreno + custoObra) * HABITE_SE;

        el('habite_se').textContent =
            `HABITE-SE + Averbação + ISS + INSS (despachante): ${formatarMoeda(habite)}`;

        const despesas =
            custoDinheiro + condominio + agua + iptu;

        el('resultado_despesas').textContent =
            `Despesas Do Imóvel: ${formatarMoeda(despesas)}`;

        /* ---------- TOTAL OPERACIONAL (DETALHADO) ---------- */
        el('to_terreno').textContent =
            `Terreno: ${formatarMoeda(terreno)}`;

        el('to_itbi').textContent =
            `ITBI: ${formatarMoeda(itbi)}`;

        el('to_rgi').textContent =
            `RGI: ${formatarMoeda(rgi)}`;

        el('to_certidao').textContent =
            `Certidões: ${formatarMoeda(certidao)}`;

        el('to_custo_obra').textContent =
            `Custo da Obra: ${formatarMoeda(custoObra)}`;

        el('to_lucro_construtor').textContent =
            `Lucro Construtor: ${formatarMoeda(lucroConstrutor)}`;

        el('to_iptu').textContent =
            `IPTU: ${formatarMoeda(iptu)}`;

        el('to_habite').textContent =
            `Habite-se: ${formatarMoeda(habite)}`;

        el('to_condominio').textContent =
            `Condomínio: ${formatarMoeda(condominio)}`;

        el('to_agua_luz').textContent =
            `Água e Luz: ${formatarMoeda(agua)}`;

        el('to_custo_dinheiro').textContent =
            `Custo do Dinheiro: ${formatarMoeda(custoDinheiro)}`;

        const totalOperacional =
            terreno +
            itbi +
            rgi +
            certidao +
            custoObra +
            lucroConstrutor +
            iptu +
            habite +
            condominio +
            agua +
            custoDinheiro;

        el('resultado_operacional').textContent =
            formatarMoeda(totalOperacional);

        /* ---------- CORRETAGEM ---------- */
        const unidades = Number(el('qtd_unidades').value) || 1;
        const vgvUnit = limparValor(el('vgv').value);
        const vgv = vgvUnit * unidades;

        const corretagem = vgv * CORRETOR;
        const propaganda = vgv * PROPAGANDA;
        const totalCorretagem = corretagem + propaganda;

        el('corretor').textContent =
            `Corretor (10%) ${formatarMoeda(corretagem)}`;

        el('propaganda').textContent =
            formatarMoeda(propaganda);

        el('total_corretagem').textContent =
            `Total Corretagem: ${formatarMoeda(totalCorretagem)}`;

        el('resultado_corretagem').textContent =
            `Total Corretagem: ${formatarMoeda(totalCorretagem)}`;

        /* ---------- VALOR FINAL ---------- */
        const lucroBruto = vgv - totalOperacional;
        const imposto = lucroBruto > 0 ? lucroBruto * IR : 0;
        const lucroLiquido = lucroBruto - imposto - totalCorretagem;
        const percentual = vgv > 0 ? (lucroLiquido / vgv) * 100 : 0;

        el('valor_quitacao').textContent =
            `Total Operacional ${formatarMoeda(totalOperacional)}`;

        el('imposto_de_renda').textContent =
            `Imposto de Renda: ${formatarMoeda(imposto)}`;

        el('lucro_bruto').textContent =
            `Lucro Bruto: ${formatarMoeda(lucroBruto)}`;

        el('lucro_liquido').textContent =
            `Lucro Liquido: ${formatarMoeda(lucroLiquido)}`;

        el('percentual_lucro').textContent =
            `Percentual Lucro: ${percentual.toFixed(2)}%`;
    }

    /* ================= EVENTOS ================= */
    ['qtd_unidades', 'metragem_da_obra'].forEach(id =>
        el(id).addEventListener('input', calcularTudo)
    );

    calcularTudo();
});