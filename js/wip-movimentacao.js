// js/wip-movimentacao.js
/* doc-id: 0042 */
document.addEventListener('DOMContentLoaded', () => {
    const userToken = localStorage.getItem('userToken');
    const userName = localStorage.getItem('userName');

    if (!userToken) {
        window.location.href = 'index.html';
        return;
    }

    const headerUserInfo = document.querySelector('.header .user-info');
    headerUserInfo.textContent = userName;

    // URL do endpoint de submissão do formulário
    const googleFormsUrlMovimentacao = 'https://docs.google.com/forms/d/e/1FAIpQLSdzz6aYXT_ADFbujfYQPcjIcbeOoUUg-2Htz7mPGlYmPpdcyA/formResponse';

    // Mapeamento corrigido das entradas do Google Forms
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
    const localDestinoSection = document.getElementById('local-destino-section');

    // Elementos do modal
    const modal = document.getElementById('confirmation-modal');
    const modalSummary = document.getElementById('modal-summary');
    const sendModalButton = document.getElementById('send-modal');
    const cancelModalButton = document.getElementById('cancel-modal');

    // Opções de localização agora corrigidas, seguindo a instrução original
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
    renderButtons('altura-buttons-origem', alturaOptions, 'altura', 'origem');
    renderButtons('coluna-buttons-origem', colunaOptions, 'coluna', 'origem');
    renderButtons('rua-buttons-destino', ruaOptions, 'rua', 'destino');
    renderButtons('altura-buttons-destino', alturaOptions, 'altura', 'destino');
    renderButtons('coluna-buttons-destino', colunaOptions, 'coluna', 'destino');
    
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
    
    const showConfirmationModal = () => {
        const movimento = activeSelections.movimento;
        const codProduto = codProdutoInput.value;
        const localOrigem = activeSelections.origem;
        const caixaOrigem = caixaOrigemInput.value;

        if (!validateSelections('origem')) {
            alert('Por favor, selecione a localização completa de origem (Rua, Altura, Coluna).');
            return;
        }
        
        let summaryHtml = `
            <p><strong>Tipo:</strong> ${movimento}</p>
            <p><strong>Produto:</strong> ${codProduto}</p>
            <p><strong>Local Origem:</strong> ${localOrigem.rua}-${localOrigem.altura}-${localOrigem.coluna} (Caixa: ${caixaOrigem})</p>
        `;

        if (movimento === 'TRANSFERENCIA') {
            const localDestino = activeSelections.destino;
            const caixaDestino = caixaDestinoInput.value;
            if (!validateSelections('destino')) {
                alert('Por favor, selecione a localização completa de destino (Rua, Altura, Coluna).');
                return;
            }
            summaryHtml += `<p><strong>Local Destino:</strong> ${localDestino.rua}-${localDestino.altura}-${localDestino.coluna} (Caixa: ${caixaDestino})</p>`;
        }

        modalSummary.innerHTML = summaryHtml;
        modal.style.display = 'block';
    };

    const submitData = async () => {
        const movimento = activeSelections.movimento;
        const codProduto = codProdutoInput.value;
        const localOrigem = { ...activeSelections.origem, caixa: caixaOrigemInput.value };
        const promises = [];

        const createMovimentacaoFormData = (locationData, movementType) => {
            const formData = new URLSearchParams();
            formData.append(googleFormsEntriesMovimentacao.rua, locationData.rua);
            formData.append(googleFormsEntriesMovimentacao.altura, locationData.altura);
            formData.append(googleFormsEntriesMovimentacao.coluna, locationData.coluna);
            formData.append(googleFormsEntriesMovimentacao.caixa, locationData.caixa);
            formData.append(googleFormsEntriesMovimentacao.cod_produto, codProduto);
            formData.append(googleFormsEntriesMovimentacao.movimento, movementType);
            formData.append(googleFormsEntriesMovimentacao.token, userToken);
            return formData;
        };
        
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
        } finally {
            modal.style.display = 'none';
        }
    };
    
    saveButton.addEventListener('click', (e) => {
        e.preventDefault();
        if(codProdutoInput.value){
            showConfirmationModal();
        } else {
            alert('Por favor, preencha o código do produto.');
            codProdutoInput.focus();
        }
    });

    sendModalButton.addEventListener('click', submitData);

    cancelModalButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
});