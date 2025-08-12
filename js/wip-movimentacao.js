// js/wip-movimentacao.js
/* doc-id: 0032 */
document.addEventListener('DOMContentLoaded', () => {
    const userToken = localStorage.getItem('userToken');
    const userName = localStorage.getItem('userName');

    if (!userToken) {
        window.location.href = 'index.html';
        return;
    }

    const headerUserInfo = document.querySelector('.header .user-info');
    headerUserInfo.textContent = userName;

    const googleFormsUrlMovimentacao = 'https://docs.google.com/forms/d/e/1FAIpQLSdzz6aYXT_ADFbujfYQPcjIcbeOoUUg-2Htz7mPGlYmPpdcyA/formResponse';

    const googleFormsEntriesMovimentacao = {
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
    const movimentoButtonContainer = document.getElementById('movimento-buttons');
    const localDestinoSection = document.getElementById('local-destino-section');

    const ruaOptions = ['1', '2', '3', '4', '5'];
    const alturaOptions = ['A', 'B', 'C', 'D'];
    const colunaOptions = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const movimentoOptions = ['ENTRADA', 'SAIDA', 'TRANSFERENCIA'];

    const activeSelections = {
        movimento: 'ENTRADA',
        origem: { rua: null, altura: null, coluna: null },
        destino: { rua: null, altura: null, coluna: null }
    };
    
    const renderButtons = (containerId, options, selectionType, targetLocation = null) => {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        options.forEach(option => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = (containerId === 'movimento-buttons') ? 'btn-movimento' : 'btn-movimentacao';
            button.textContent = option;
            button.dataset.value = option;
            
            if (containerId === 'movimento-buttons' && activeSelections.movimento === option) {
                button.classList.add('active');
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

    renderButtons('movimento-buttons', movimentoOptions, 'movimento');
    renderButtons('rua-buttons-origem', ruaOptions, 'rua', 'origem');
    renderButtons('coluna-buttons-origem', colunaOptions, 'coluna', 'origem');
    renderButtons('altura-buttons-origem', alturaOptions, 'altura', 'origem');
    renderButtons('rua-buttons-destino', ruaOptions, 'rua', 'destino');
    renderButtons('coluna-buttons-destino', colunaOptions, 'coluna', 'destino');
    renderButtons('altura-buttons-destino', alturaOptions, 'altura', 'destino');
    
    localDestinoSection.style.display = (activeSelections.movimento === 'TRANSFERENCIA') ? 'block' : 'none';

    const resetForm = () => {
        form.reset();
        codProdutoInput.focus();
        
        activeSelections.movimento = 'ENTRADA';
        activeSelections.origem = { rua: null, altura: null, coluna: null };
        activeSelections.destino = { rua: null, altura: null, coluna: null };
        
        document.querySelectorAll('.btn-movimento, .btn-movimentacao').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.btn-movimento[data-value="ENTRADA"]').classList.add('active');
        localDestinoSection.style.display = 'none';
    };

    const validateSelections = (location) => {
        if (!activeSelections[location].rua || !activeSelections[location].altura || !activeSelections[location].coluna) {
            return false;
        }
        return true;
    };

    const submitData = async () => {
        const movimento = activeSelections.movimento;
        const codProduto = "'" + codProdutoInput.value;

        if (!validateSelections('origem')) {
            alert('Por favor, selecione a localização completa de origem (Rua, Coluna, Altura).');
            return;
        }

        if (movimento === 'TRANSFERENCIA' && !validateSelections('destino')) {
            alert('Por favor, selecione a localização completa de destino (Rua, Coluna, Altura).');
            return;
        }

        const promises = [];

        const createMovimentacaoFormData = (locationData, movementType) => {
            const formData = new URLSearchParams();
            formData.append(googleFormsEntriesMovimentacao.rua, "'" + locationData.rua);
            formData.append(googleFormsEntriesMovimentacao.altura, locationData.altura);
            formData.append(googleFormsEntriesMovimentacao.coluna, locationData.coluna);
            formData.append(googleFormsEntriesMovimentacao.caixa, locationData.caixa);
            formData.append(googleFormsEntriesMovimentacao.cod_produto, codProduto);
            formData.append(googleFormsEntriesMovimentacao.movimento, movementType);
            formData.append(googleFormsEntriesMovimentacao.token, userToken);
            return formData;
        };
        
        const localOrigem = { ...activeSelections.origem, caixa: caixaOrigemInput.value };
        
        if (movimento === 'ENTRADA') {
            const formData = createMovimentacaoFormData(localOrigem, 'ENTRADA');
            promises.push(fetch(googleFormsUrlMovimentacao, { method: 'POST', body: formData, mode: 'no-cors' }));
            
        } else if (movimento === 'SAIDA') {
            const formData = createMovimentacaoFormData(localOrigem, 'SAIDA');
            promises.push(fetch(googleFormsUrlMovimentacao, { method: 'POST', body: formData, mode: 'no-cors' }));
            
        } else if (movimento === 'TRANSFERENCIA') {
            const localDestino = { ...activeSelections.destino, caixa: caixaDestinoInput.value };
            
            const formDataSaida = createMovimentacaoFormData(localOrigem, 'SAIDA');
            promises.push(fetch(googleFormsUrlMovimentacao, { method: 'POST', body: formDataSaida, mode: 'no-cors' }));
            
            const formDataEntrada = createMovimentacaoFormData(localDestino, 'ENTRADA');
            promises.push(fetch(googleFormsUrlMovimentacao, { method: 'POST', body: formDataEntrada, mode: 'no-cors' }));
        }

        try {
            await Promise.all(promises);
            alert('Movimentação registrada com sucesso!');
            resetForm();
        } catch (error) {
            console.error('Erro no envio:', error);
            alert('Houve um erro ao registrar a movimentação. Verifique a conexão.');
        }
    };
    
    saveButton.addEventListener('click', (e) => {
        e.preventDefault();
        if(codProdutoInput.value){
            submitData();
        } else {
            alert('Por favor, preencha o código do produto.');
            codProdutoInput.focus();
        }
    });
});