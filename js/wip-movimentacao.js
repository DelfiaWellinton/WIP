// js/wip-movimentacao.js
/* doc-id: 0020 */
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
    const googleFormsUrlReversa = 'https://docs.google.com/forms/d/e/1FAIpQLScbyNFTprA6F8Ndbq2WKACL4rq6sETPKip32bZr04_xbR9prA/formResponse';

    const googleFormsEntriesMovimentacao = {
        rua: 'entry.1409567212',
        altura: 'entry.1379848018',
        coluna: 'entry.555819332',
        caixa: 'entry.1426872400',
        cod_produto: 'entry.564171710',
        movimento: 'entry.2124001132',
        token: 'entry.217226458'
    };

    const googleFormsEntriesReversa = {
        cod_produto: 'entry.657384190',
        follow_up: 'entry.2124001132',
        token: 'entry.759591489'
    };

    const form = document.getElementById('movimentacao-form');
    const saveButton = document.getElementById('save-button');
    const codProdutoInput = document.getElementById('COD_PRODUTO');
    const caixaOrigemInput = document.getElementById('CAIXA_ORIGEM');
    const caixaDestinoInput = document.getElementById('CAIXA_DESTINO');
    const movimentoRadios = form.querySelectorAll('input[name="movimento"]');
    const localDestinoSection = document.getElementById('local-destino-section');

    const ruaOptions = ['01', '02', '03', '04', '05'];
    const alturaOptions = ['1', '2', '3', '4', '5'];
    const colunaOptions = ['A', 'B', 'C', 'D'];

    const selections = {
        origem: { rua: null, altura: null, coluna: null },
        destino: { rua: null, altura: null, coluna: null }
    };

    const renderButtons = (containerId, options, targetLocation, nextContainerId) => {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        options.forEach(option => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn-movimentacao';
            button.textContent = option;
            button.dataset.value = option;
            button.addEventListener('click', () => {
                // Remove 'active' de todos os botões do mesmo grupo
                container.querySelectorAll('.btn-movimentacao').forEach(btn => btn.classList.remove('active'));
                // Adiciona 'active' ao botão clicado
                button.classList.add('active');
                
                // Salva a seleção
                if (targetLocation === 'origem') {
                    if (containerId.includes('rua')) selections.origem.rua = option;
                    if (containerId.includes('altura')) selections.origem.altura = option;
                    if (containerId.includes('coluna')) selections.origem.coluna = option;
                } else {
                    if (containerId.includes('rua')) selections.destino.rua = option;
                    if (containerId.includes('altura')) selections.destino.altura = option;
                    if (containerId.includes('coluna')) selections.destino.coluna = option;
                }

                // Mostra o próximo grupo de botões
                if (nextContainerId) {
                    const nextContainer = document.getElementById(nextContainerId);
                    nextContainer.parentNode.style.display = 'block';
                }
            });
            container.appendChild(button);
        });
    };

    // Renderiza botões de Rua para Origem ao carregar
    renderButtons('rua-buttons-origem', ruaOptions, 'origem', 'altura-buttons-origem');

    // Renderiza botões de Altura e Coluna, inicialmente escondidos
    renderButtons('altura-buttons-origem', alturaOptions, 'origem', 'coluna-buttons-origem');
    renderButtons('coluna-buttons-origem', colunaOptions, 'origem', null);
    
    // Renderiza botões de Destino (para uso em Transferência)
    renderButtons('rua-buttons-destino', ruaOptions, 'destino', 'altura-buttons-destino');
    renderButtons('altura-buttons-destino', alturaOptions, 'destino', 'coluna-buttons-destino');
    renderButtons('coluna-buttons-destino', colunaOptions, 'destino', null);

    const toggleLocalDestino = () => {
        const isTransferencia = form.querySelector('input[name="movimento"]:checked').value === 'TRANSFERENCIA';
        localDestinoSection.style.display = isTransferencia ? 'block' : 'none';
        
        // Zera as seleções de destino ao desmarcar Transferência
        if (!isTransferencia) {
            selections.destino = { rua: null, altura: null, coluna: null };
            document.querySelectorAll('#local-destino-section .btn-movimentacao').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('#local-destino-section .form-group').forEach((group, index) => {
                if (index > 0) group.style.display = 'none';
            });
        }
    };

    movimentoRadios.forEach(radio => radio.addEventListener('change', toggleLocalDestino));
    toggleLocalDestino();

    const resetForm = () => {
        form.reset();
        selections.origem = { rua: null, altura: null, coluna: null };
        selections.destino = { rua: null, altura: null, coluna: null };
        document.querySelectorAll('.btn-movimentacao').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('#local-origem-section .form-group, #local-destino-section .form-group').forEach((group, index) => {
            if (index > 0) group.style.display = 'none';
        });
        document.getElementById('COD_PRODUTO').focus();
        toggleLocalDestino();
    };

    const validateSelections = (location) => {
        if (!selections[location].rua || !selections[location].altura || !selections[location].coluna) {
            return false;
        }
        return true;
    };

    const submitData = async () => {
        const movimento = form.querySelector('input[name="movimento"]:checked').value;
        const codProduto = "'" + codProdutoInput.value;

        if (!validateSelections('origem')) {
            alert('Por favor, selecione a localização completa de origem (Rua, Altura, Coluna).');
            return;
        }

        if (movimento === 'TRANSFERENCIA' && !validateSelections('destino')) {
            alert('Por favor, selecione a localização completa de destino (Rua, Altura, Coluna).');
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

        const createReversaUpdateData = () => {
            const formData = new URLSearchParams();
            formData.append(googleFormsEntriesReversa.cod_produto, codProduto);
            formData.append(googleFormsEntriesReversa.follow_up, 'movimentado');
            formData.append(googleFormsEntriesReversa.token, userToken);
            return formData;
        };
        
        const localOrigem = { ...selections.origem, caixa: caixaOrigemInput.value };
        
        if (movimento === 'ENTRADA') {
            const formData = createMovimentacaoFormData(localOrigem, 'ENTRADA');
            promises.push(fetch(googleFormsUrlMovimentacao, { method: 'POST', body: formData, mode: 'no-cors' }));
            
            const formDataReversa = createReversaUpdateData();
            promises.push(fetch(googleFormsUrlReversa, { method: 'POST', body: formDataReversa, mode: 'no-cors' }));

        } else if (movimento === 'SAIDA') {
            const formData = createMovimentacaoFormData(localOrigem, 'SAIDA');
            promises.push(fetch(googleFormsUrlMovimentacao, { method: 'POST', body: formData, mode: 'no-cors' }));
            
        } else if (movimento === 'TRANSFERENCIA') {
            const localDestino = { ...selections.destino, caixa: caixaDestinoInput.value };
            
            // SAÍDA da origem
            const formDataSaida = createMovimentacaoFormData(localOrigem, 'SAIDA');
            promises.push(fetch(googleFormsUrlMovimentacao, { method: 'POST', body: formDataSaida, mode: 'no-cors' }));
            
            // ENTRADA no destino
            const formDataEntrada = createMovimentacaoFormData(localDestino, 'ENTRADA');
            promises.push(fetch(googleFormsUrlMovimentacao, { method: 'POST', body: formDataEntrada, mode: 'no-cors' }));

            // Atualização do status no form de reversa
            const formDataReversa = createReversaUpdateData();
            promises.push(fetch(googleFormsUrlReversa, { method: 'POST', body: formDataReversa, mode: 'no-cors' }));
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
        // A validação é feita dentro da função submitData agora
        submitData();
    });
});