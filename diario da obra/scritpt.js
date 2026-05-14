window.addEventListener("DOMContentLoaded", async function () {
    async function getSheetUrl() {
        try {
            const response = await fetch('base.json');
            if (!response.ok) throw new Error(`Erro ao carregar JSON: ${response.statusText}`);

            const data = await response.json();
            return data.sheetUrl;
        } catch (error) {
            console.error(`Erro ao obter URL da planilha: ${error.message}`);
            alert('Erro ao carregar a configuração da planilha.');
            return null;
        }
    }

    async function loadExcelData() {
        try {
            const fileUrl = await getSheetUrl();
            if (!fileUrl) return;

            const response = await fetch(fileUrl);
            if (!response.ok) throw new Error(`Erro ao baixar a planilha: ${response.statusText}`);

            const csvData = await response.text();
            const rows = csvData.split('\n').filter(row => row.trim() !== '')
                .map(row => row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(cell => cell.replace(/^"|"$/g, '').trim()));

            if (rows.length === 0) throw new Error('O CSV está vazio ou inválido.');

            const headers = rows.shift();
            const jsonData = rows.map(row => Object.fromEntries(headers.map((h, i) => [h, row[i] || ''])));

            renderTable(headers, jsonData);
        } catch (error) {
            console.error(`Erro ao carregar os dados: ${error.message}`);
            alert('Erro ao carregar os dados da planilha.');
        }
    }

    function renderTable(headers, data) {
        const tableHeader = document.getElementById('tableHeader');
        const tableBody = document.getElementById('tableBody');

        tableHeader.innerHTML = headers.map(h => `<th>${h}</th>`).join('');
        tableBody.innerHTML = data.map(row => `<tr>${headers.map(h => `<td>${row[h]}</td>`).join('')}</tr>`).join('');
        // Após renderizar a tabela, tentamos calcular a menor e maior data
        try {
            const range = computeDateRange(headers, data);
            const cont = document.getElementById('contagem');
            if (cont) {
                if (range && range.min != null && range.max != null) {
                    const days = daysBetween(range.min, range.max, !!range.numeric);
                    cont.innerText = `${days} ${days === 1 ? 'Dia' : 'Dias'}`;
                } else {
                    cont.innerText = 'Sem datas';
                }
            }
            console.log('computeDateRange result:', range);
        } catch (err) {
            console.error('Erro ao calcular intervalo de datas:', err);
        }
    }

    function tryParseDate(value) {
        if (!value) return null;
        value = String(value).trim();

        // Primeiro: formatos explícitos dd/mm/yyyy ou dd-mm-yyyy ou d/m/yy
        const m = value.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
        if (m) {
            let day = parseInt(m[1], 10);
            let month = parseInt(m[2], 10) - 1;
            let year = parseInt(m[3], 10);
            if (year < 100) year += 2000;
            const d = new Date(year, month, day);
            if (!isNaN(d)) return d;
        }

        // Pontos como separador
        const alt = value.replace(/\./g, '/');
        const m2 = alt.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
        if (m2) {
            let day = parseInt(m2[1], 10);
            let month = parseInt(m2[2], 10) - 1;
            let year = parseInt(m2[3], 10);
            if (year < 100) year += 2000;
            const d = new Date(year, month, day);
            if (!isNaN(d)) return d;
        }

        // Por fim tenta parse genérico/ISO
        const d2 = new Date(value);
        if (!isNaN(d2)) return d2;

        return null;
    }

    function computeDateRange(headers, data) {
        // 1) Prioriza cabeçalho exatamente "DATA"
        const exactDataIdx = headers.findIndex(h => /^data$/i.test(h));
        const triedKeys = new Set();

        const tryKeys = [];
        if (exactDataIdx !== -1) tryKeys.push(headers[exactDataIdx]);

        // 2) Em seguida, qualquer cabeçalho que pareça conter data
        headers.forEach(h => {
            if (!tryKeys.includes(h) && /data|date|dia/i.test(h)) tryKeys.push(h);
        });

        // Tenta parse de datas em cada chave candidata
        for (const key of tryKeys) {
            triedKeys.add(key);
            const dates = data.map(row => tryParseDate(row[key])).filter(d => d instanceof Date && !isNaN(d));
            if (dates.length > 0) {
                let min = dates[0], max = dates[0];
                dates.forEach(d => {
                    if (d < min) min = d;
                    if (d > max) max = d;
                });
                return { min, max, numeric: false };
            }
        }

        // 3) Se não houver datas, tenta usar coluna `DIA` como números
        const diaIdx = headers.findIndex(h => /^dia$/i.test(h));
        if (diaIdx !== -1) {
            const key = headers[diaIdx];
            const nums = data.map(row => {
                const v = row[key];
                if (v == null) return null;
                const s = String(v).replace(/[^0-9\-\.]/g, '').trim();
                const n = s === '' ? null : Number(s);
                return Number.isFinite(n) ? n : null;
            }).filter(n => n != null);
            if (nums.length > 0) {
                return { min: Math.min(...nums), max: Math.max(...nums), numeric: true };
            }
        }

        return null;
    }

    function daysBetween(min, max, numeric = false) {
        if (numeric) {
            return Math.round(Math.abs(max - min)) + 1;
        }
        const msPerDay = 24 * 60 * 60 * 1000;
        // Use UTC dates to avoid timezone/DST issues
        const utcMin = Date.UTC(min.getFullYear(), min.getMonth(), min.getDate());
        const utcMax = Date.UTC(max.getFullYear(), max.getMonth(), max.getDate());
        return Math.floor((utcMax - utcMin) / msPerDay) + 1;
    }

    loadExcelData();
});
