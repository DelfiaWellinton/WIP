// js/wip-movimentacao.js
/* doc-id: 0051 */
document.addEventListener('DOMContentLoaded', () => {
    const userToken = localStorage.getItem('userToken');
    const userName = localStorage.getItem('userName');

    if (!userToken) {
        window.location.href = 'index.html';
        return;
    }

    const headerUserInfo = document.querySelector('.header .user-info');
    headerUserInfo.textContent = userName;

    const googleFormsUrlBase = 'https://docs.google.com/forms/d/e/1FAIpQLSdzz6aYXT_ADFbujfYQPcjIcbeOoUUg-2Htz7mPGlYmPpdcyA/formResponse';

    const googleFormsEntries = {
        rua: 'entry.1409567212',
        altura: 'entry.1379848018',
        coluna: 'entry.555819332',
        caixa: 'entry.1426872400',
        cod_produto: 'entry.564171710',
        movimento: 'entry.2124001132',
        token: 'entry.217226458'
    };

    const form = document.getElementById('movimentacao-form');
    const saveButton = document.getElementById('save-button');
    const codProdutoInput = document.getElementById('COD_PRODUTO');
    const caixaOrigemInput = document.getElementById('CAIXA_ORIGEM');
    const caixaDestinoInput = document.getElementById('CAIXA_DESTINO');
    const localDestinoSection = document.getElementById('local-destino-section');
    const urlOutput = document.getElementById('url-output');

    const ruaOptions = ['1', '2', '3', '4', '5'];
    const alturaOptions = ['A', 'B', 'C', 'D'];
    const colunaOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    const movimentoOptions = ['ENTRADA', 'SAIDA', 'TRANSFERENCIA'];

    const activeSelections = {
        movimento: 'ENTRADA',
        origem: { rua: null, altura: null, coluna: null },
        destino: { rua: null, altura: null, coluna: null }
    };
    
    const renderButtons = (containerId, options, selectionType, targetLocation = null) => {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        options.forEach((option, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn-movimentacao';
            button.textContent = option;
            button.dataset.value = option;
            
            // Lógica para definir o botão como ativo ao carregar
            if (selectionType === 'movimento' && activeSelections.movimento === option) {
                button.classList.add('active');
            } else if (targetLocation && !activeSelections[targetLocation][selectionType] && index === 0) {
                button.classList.add('active');
                activeSelections[targetLocation][selectionType] = option;
            }
            
            button.addEventListener('click', () => {
                container.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                if (selectionType === 'movimento') {
                    activeSelections.movimento = option;
                    localDestinoSection.style.display = (option === 'TRANSFERENCIA') ? 'block' : 'none';
                } else if (targetLocation) {
                    activeSelections[targetLocation][selectionType] = option;
                }
            });
            container.appendChild(button);
        });
    };

    const setupUI = () => {
        // Redefine as seleções para o valor inicial para garantir que o primeiro botão seja selecionado
        activeSelections.movimento = 'ENTRADA';
        activeSelections.origem = { rua: null, altura: null, coluna: null };
        activeSelections.destino = { rua: null, altura: null, coluna: null };
        
        renderButtons('movimento-buttons', movimentoOptions, 'movimento');
        renderButtons('rua-buttons-origem', ruaOptions, 'rua', 'origem');
        renderButtons('altura-buttons-origem', alturaOptions, 'altura', 'origem');
        renderButtons('coluna-buttons-origem', colunaOptions, 'coluna', 'origem');
        renderButtons('rua-buttons-destino', ruaOptions, 'rua', 'destino');
        renderButtons('altura-buttons-destino', alturaOptions, 'altura', 'destino');
        renderButtons('coluna-buttons-destino', colunaOptions, 'coluna', 'destino');
        
        localDestinoSection.style.display = (activeSelections.movimento === 'TRANSFERENCIA') ? 'block' : 'none';
    };

    const validateSelections = (location) => {
        if (!activeSelections[location].rua || !activeSelections[location].altura || !activeSelections[location].coluna) {
            return false;
        }
        return true;
    };
    
    const generateAndDisplayUrls = () => {
        const movimento = activeSelections.movimento;
        const codProduto = codProdutoInput.value;
        const localOrigem = { ...activeSelections.origem, caixa: caixaOrigemInput.value };
        
        if (!codProduto) {
            alert('Por favor, preencha o código do produto.');
            codProdutoInput.focus();
            return;
        }

        if (!validateSelections('origem')) {
            alert('Por favor, selecione a localização completa de origem (Rua, Altura, Coluna).');
            return;
        }

        const createMovimentacaoFormData = (locationData, movementType) => {
            const formData = new URLSearchParams();
            formData.append(googleFormsEntries.rua, locationData.rua);
            formData.append(googleFormsEntries.altura, locationData.altura);
            formData.append(googleFormsEntries.coluna, locationData.coluna);
            formData.append(googleFormsEntries.caixa, locationData.caixa);
            formData.append(googleFormsEntries.cod_produto, codProduto);
            formData.append(googleFormsEntries.movimento, movementType);
            formData.append(googleFormsEntries.token, userToken);
            return formData;
        };

        let outputHtml = '<h4>URLs Geradas (para Depuração):</h4>';

        if (movimento === 'ENTRADA') {
            const formData = createMovimentacaoFormData(localOrigem, 'ENTRADA');
            outputHtml += `<p><strong>ENTRADA:</strong> <a href="${googleFormsUrlBase}?${formData.toString()}" target="_blank">${googleFormsUrlBase}?${formData.toString()}</a></p>`;
        } else if (movimento === 'SAIDA') {
            const formData = createMovimentacaoFormData(localOrigem, 'SAIDA');
            outputHtml += `<p><strong>SAÍDA:</strong> <a href="${googleFormsUrlBase}?${formData.toString()}" target="_blank">${googleFormsUrlBase}?${formData.toString()}</a></p>`;
        } else if (movimento === 'TRANSFERENCIA') {
            const localDestino = { ...activeSelections.destino, caixa: caixaDestinoInput.value };
            if (!validateSelections('destino')) {
                alert('Por favor, selecione a localização completa de destino (Rua, Altura, Coluna).');
                return;
            }
            
            const formDataSaida = createMovimentacaoFormData(localOrigem, 'SAIDA');
            const formDataEntrada = createMovimentacaoFormData(localDestino, 'ENTRADA');
            
            outputHtml += `<p><strong>SAÍDA (Origem):</strong> <a href="${googleFormsUrlBase}?${formDataSaida.toString()}" target="_blank">${googleFormsUrlBase}?${formDataSaida.toString()}</a></p>`;
            outputHtml += `<p><strong>ENTRADA (Destino):</strong> <a href="${googleFormsUrlBase}?${formDataEntrada.toString()}" target="_blank">${googleFormsUrlBase}?${formDataEntrada.toString()}</a></p>`;
        }

        urlOutput.innerHTML = outputHtml;
    };
    
    saveButton.addEventListener('click', (e) => {
        e.preventDefault();
        generateAndDisplayUrls();
    });
    
    setupUI();
});