/* doc-id: 0010 */
document.addEventListener('DOMContentLoaded', () => {
    const userToken = localStorage.getItem('userToken');
    const userName = localStorage.getItem('userName');

    // Se o token não existir, redireciona para a página de login
    if (!userToken) {
        window.location.href = 'index.html';
        return;
    }

    const headerUserInfo = document.querySelector('.header .user-info');
    headerUserInfo.textContent = userName;

    const dataCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRK3Y4WFLFcmEJFGHYxvfLiFBCx4drvzHo7Y2TUfdCGHKAQ00TlRuijg5k8k56p0VXoGheIA2bgq6jU/pub?gid=1321893719&single=true&output=csv';

    let allData = [];

    const parseCsv = (csvText) => {
        const lines = csvText.trim().split('\n');
        if (lines.length <= 1) return [];
        const headers = lines[0].split(',').map(header => header.trim());
        return lines.slice(1).map(line => {
            const values = line.split(',');
            return headers.reduce((obj, header, index) => {
                obj[header] = values[index] ? values[index].trim() : '';
                return obj;
            }, {});
        });
    };
    
    const renderTable = (data) => {
        const tableBody = document.querySelector('#data-table tbody');
        tableBody.innerHTML = '';
        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="11" style="text-align:center;">Nenhum dado encontrado para os filtros aplicados.</td></tr>`;
            return;
        }
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item['COD_RASTREIO'] || ''}</td>
                <td>${item['COD_E-TICKET'] || ''}</td>
                <td>${item['TIPO'] || ''}</td>
                <td>${item['COD_PRODUTO'] || ''}</td>
                <td>${item['PROJETO'] || ''}</td>
                <td>${item['DESTINO'] || ''}</td>
                <td>${item['DATA_LEITURA'] || ''}</td>
                <td>${item['ANOTACOES'] || ''}</td>
                <td>${item['CAIXA_NUM'] || ''}</td>
                <td>${item['DESCRICAO'] || ''}</td>
                <td>${item['FOLOW-UP'] || ''}</td>
            `;
            tableBody.appendChild(row);
        });
    };

    const fetchAndRenderData = async () => {
        try {
            const response = await fetch(dataCsvUrl);
            if (!response.ok) {
                throw new Error('Falha ao buscar os dados. Status: ' + response.status);
            }
            const csvText = await response.text();
            allData = parseCsv(csvText);
            renderTable(allData);
        } catch (error) {
            console.error('Erro na requisição dos dados:', error);
            const tableBody = document.querySelector('#data-table tbody');
            tableBody.innerHTML = `<tr><td colspan="11" style="text-align:center; color: #f44336;">Não foi possível carregar os dados. Verifique a conexão com a internet ou se o arquivo está sendo executado em um servidor web (protocolo http://).</td></tr>`;
        }
    };
    
    const applyFilters = () => {
        const filters = {
            codRastreio: document.getElementById('filter-cod-rastreio').value.toLowerCase(),
            codEticket: document.getElementById('filter-cod-e-ticket').value.toLowerCase(),
            tipo: document.getElementById('filter-tipo').value.toLowerCase(),
            codProduto: document.getElementById('filter-cod-produto').value.toLowerCase(),
            projeto: document.getElementById('filter-projeto').value.toLowerCase(),
            destino: document.getElementById('filter-destino').value.toLowerCase(),
            dataLeitura: document.getElementById('filter-data-leitura').value.toLowerCase(),
            caixaNum: document.getElementById('filter-caixa-num').value.toLowerCase(),
        };

        const filteredData = allData.filter(item => {
            return (
                (item['COD_RASTREIO'] || '').toLowerCase().includes(filters.codRastreio) &&
                (item['COD_E-TICKET'] || '').toLowerCase().includes(filters.codEticket) &&
                (item['TIPO'] || '').toLowerCase().includes(filters.tipo) &&
                (item['COD_PRODUTO'] || '').toLowerCase().includes(filters.codProduto) &&
                (item['PROJETO'] || '').toLowerCase().includes(filters.projeto) &&
                (item['DESTINO'] || '').toLowerCase().includes(filters.destino) &&
                (item['DATA_LEITURA'] || '').toLowerCase().includes(filters.dataLeitura) &&
                (item['CAIXA_NUM'] || '').toLowerCase().includes(filters.caixaNum)
            );
        });
        renderTable(filteredData);
    };

    const toggleFiltersBtn = document.getElementById('toggle-filters-btn');
    const filterWrapper = document.querySelector('.filter-wrapper');

    toggleFiltersBtn.addEventListener('click', () => {
        filterWrapper.classList.toggle('active');
        if (filterWrapper.classList.contains('active')) {
            toggleFiltersBtn.textContent = 'Ocultar Filtros';
        } else {
            toggleFiltersBtn.textContent = 'Exibir Filtros';
        }
    });

    const filterInputs = document.querySelectorAll('.filter-container input');
    filterInputs.forEach(input => {
        input.addEventListener('input', applyFilters);
    });
    
    // Inicia o carregamento dos dados quando a página é carregada
    fetchAndRenderData();
});