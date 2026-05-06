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
    }

    loadExcelData();
});
