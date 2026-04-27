document.addEventListener('DOMContentLoaded', () => {

    const el = id => document.getElementById(id);

    // Remover qualquer fundo amarelo residual
    document.querySelectorAll('*').forEach(item => {
        if (item.style.background === 'yellow') {
            item.style.background = 'transparent';
        }
    });

    // -----------------------------
    // FORMATAÇÕES
    // -----------------------------

    const formatarData = (data) => {
        const date = new Date(data);
        return date.toLocaleDateString('pt-BR');
    };

    const formatarCPF = (valor) => {
        valor = valor.replace(/\D/g, '');
        if (valor.length === 11) {
            return valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        return valor;
    };

    const formatarCNPJ = (valor) => {
        valor = valor.replace(/\D/g, '');
        if (valor.length === 14) {
            return valor.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }
        return valor;
    };

    // Máscara CPF
    const inputCPF = el('cpf_colaborador');
    if (inputCPF) {
        inputCPF.addEventListener('input', (e) => {
            e.target.value = formatarCPF(e.target.value);
        });
    }

    // Máscara CNPJ
    const inputCNPJ = el('empresa_cnpj');
    if (inputCNPJ) {
        inputCNPJ.addEventListener('input', (e) => {
            e.target.value = formatarCNPJ(e.target.value);
        });
    }

    // -----------------------------
    // CAMPOS DINÂMICOS DE EPIs
    // -----------------------------

    function criarCamposEPIs(quantidade) {
        const container = el('epis_container');
        container.innerHTML = '';

        for (let i = 1; i <= quantidade; i++) {

            const label = document.createElement('label');
            label.setAttribute('for', `epi${i}`);
            label.textContent = `${i}º EPI Recebido`;
            label.style.cssText = `
                width: 90%;
                text-align: left;
                font-size: 1vw;
                font-weight: 500;
            `;

            const input = document.createElement('input');
            input.type = 'text';
            input.id = `epi${i}`;
            input.placeholder = `Ex: EPI ${i}`;
            input.required = true;
            input.style.cssText = `
                width: 90%;
                outline: none;
                font-size: 1vw;
                padding: 0.7vw;
                border: none;
                border-radius: 0.2vw;
                font-family: 'Roboto', sans-serif;
                margin-bottom: 1vw;
            `;

            container.appendChild(label);
            container.appendChild(input);
        }
    }

    const selectQuantidade = el('quantidade_epis');
    if (selectQuantidade) {
        selectQuantidade.addEventListener('change', (e) => {
            const quantidade = parseInt(e.target.value);
            if (quantidade > 0) criarCamposEPIs(quantidade);
        });
    }

    // -----------------------------
    // PREENCHER PDF
    // -----------------------------

    function preencherPDF() {
        const getValue = (id, fallback) => {
            const node = el(id);
            if (!node) return fallback;
            return node.value || fallback;
        };

        const nome = getValue('nome_colaborador', '_____________________');
        const cpf = getValue('cpf_colaborador', '________________');
        const empresa = getValue('empresa_nome', '_________________________');
        const cnpj = getValue('empresa_cnpj', '__________________');
        const quantidade = parseInt((el('quantidade_epis') && el('quantidade_epis').value) || 0) || 0;
        const data = (el('data_recebimento') && el('data_recebimento').value) ? formatarData(el('data_recebimento').value) : '_______________';
        const responsavel = getValue('responsavel_empresa', '_______________');

        const setText = (id, text) => {
            const node = el(id);
            if (node) node.textContent = text;
        };

        // Preencher campos principais (se existirem)
        setText('pdf_nome_colaborador', nome);
        setText('pdf_cpf_colaborador', cpf);
        setText('pdf_empresa_nome', empresa);
        setText('pdf_empresa_cnpj', cnpj);
        // Data inline após "EPIs abaixo discriminados"
        setText('pdf_data_inline', data);
        setText('pdf_data_recebimento', data);
        setText('pdf_responsavel_empresa', responsavel);

        // Preencher campos finais (assinaturas) - somente se presentes
        setText('pdf_responsavel_empresa_final', responsavel);
        setText('pdf_data_final', data);

        // Preencher EPIs dinamicamente (proteção contra elementos ausentes)
        for (let i = 1; i <= 6; i++) {
            const pdfEpiElement = el(`pdf_epi${i}`);
            const inputEpi = el(`epi${i}`);
            if (!pdfEpiElement) continue;
            if (i <= quantidade && inputEpi) {
                const epiValue = inputEpi.value || '_________________________________';
                pdfEpiElement.textContent = epiValue;
                if (pdfEpiElement.parentElement) pdfEpiElement.parentElement.style.display = 'list-item';
            } else {
                if (pdfEpiElement.parentElement) pdfEpiElement.parentElement.style.display = 'none';
            }
        }
    }

    // -----------------------------
    // GERAR PDF
    // -----------------------------

    const btnPDF = el('btn_enviar');
    if (btnPDF) {
        btnPDF.addEventListener('click', async () => {
            preencherPDF();

            const elementoParaPDF = el('pdf_content');
            const displayOriginal = elementoParaPDF.style.display;

            elementoParaPDF.style.display = 'block';
            btnPDF.disabled = true;

            const opcoes = {
                margin: 10,
                filename: 'termo_recebimento_epi.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    scrollY: 0,
                    windowHeight: elementoParaPDF.scrollHeight
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait'
                }
            };

            try {
                if (typeof html2pdf === 'undefined') {
                    console.warn('html2pdf não encontrada; tentando carregar dinamicamente...');

                    const loadScript = (src) => new Promise((resolve, reject) => {
                        const s = document.createElement('script');
                        s.src = src;
                        s.async = true;
                        s.onload = () => resolve();
                        s.onerror = () => reject(new Error('Falha ao carregar ' + src));
                        document.head.appendChild(s);
                    });

                    try {
                        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
                        console.log('html2pdf carregado dinamicamente.');
                    } catch (e) {
                        console.warn('Não foi possível carregar html2pdf dinamicamente:', e);
                        // Tentativa de fallback: html2canvas + jsPDF
                        try {
                            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
                            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

                            const canvas = await html2canvas(elementoParaPDF, { scale: 2, useCORS: true });
                            const imgData = canvas.toDataURL('image/jpeg', 0.98);
                            const jsPDFCtor = window.jspdf && window.jspdf.jsPDF ? window.jspdf.jsPDF : null;
                            if (!jsPDFCtor) throw new Error('jsPDF não disponível após carregamento.');

                            const pdf = new jsPDFCtor(opcoes.jsPDF);
                            const imgProps = pdf.getImageProperties(imgData);
                            const pdfWidth = pdf.internal.pageSize.getWidth();
                            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                            pdf.save(opcoes.filename);
                        } catch (err2) {
                            console.error('Fallback jsPDF/html2canvas falhou:', err2);
                            alert('Falha ao carregar bibliotecas necessárias. Veja o console para detalhes.');
                            return;
                        }

                        return;
                    }
                }

                await html2pdf().set(opcoes).from(elementoParaPDF).save();
            } catch (err) {
                console.error('Falha ao gerar PDF:', err);
                alert('Falha ao gerar PDF. Veja o console do navegador para detalhes.');
            } finally {
                elementoParaPDF.style.display = displayOriginal;
                btnPDF.disabled = false;
            }
        });
    }

});
