// js/wip-movimentacao.js
/* doc-id: 0017 */
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
        token: 'entry.1691243355'
    };

    const googleFormsEntriesReversa = {
        cod_produto: 'entry.657384190',
        follow_up: 'entry.2124001132',
        token: 'entry.759591489'
    };

    const form = document.getElementById('movimentacao-form');
    const saveButton = document.getElementById('save-button');
    const movimentoRadios = form.querySelectorAll('input[name="movimento"]');
    const localDestinoSection = document.getElementById('local-destino-section');

    const toggleLocalDestino = () => {
        const isTransferencia = form.querySelector('input[name="movimento"]:checked').value === 'TRANSFERENCIA';
        localDestinoSection.style.display = isTransferencia ? 'block' : 'none';
        
        const destinoInputs = localDestinoSection.querySelectorAll('input, select');
        destinoInputs.forEach(input => {
            if (isTransferencia) {
                input.setAttribute('required', 'required');
            } else {
                input.removeAttribute('required');
            }
        });
    };

    movimentoRadios.forEach(radio => radio.addEventListener('change', toggleLocalDestino));
    toggleLocalDestino();

    const resetForm = () => {
        form.reset();
        toggleLocalDestino();
        document.getElementById('COD_PRODUTO').focus();
    };

    const submitData = async () => {
        const promises = [];
        const movimento = form.querySelector('input[name="movimento"]:checked').value;
        const codProduto = "'" + document.getElementById('COD_PRODUTO').value;

        const createMovimentacaoFormData = (rua, altura, coluna, caixa, movimento) => {
            const formData = new URLSearchParams();
            formData.append(googleFormsEntriesMovimentacao.rua, "'" + rua);
            formData.append(googleFormsEntriesMovimentacao.altura, altura);
            formData.append(googleFormsEntriesMovimentacao.coluna, coluna);
            formData.append(googleFormsEntriesMovimentacao.caixa, caixa);
            formData.append(googleFormsEntriesMovimentacao.cod_produto, codProduto);
            formData.append(googleFormsEntriesMovimentacao.movimento, movimento);
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

        const localOrigem = {
            rua: document.getElementById('RUA_ORIGEM').value,
            altura: document.getElementById('ALTURA_ORIGEM').value,
            coluna: document.getElementById('COLUNA_ORIGEM').value,
            caixa: document.getElementById('CAIXA_ORIGEM').value
        };

        if (movimento === 'ENTRADA') {
            const formData = createMovimentacaoFormData(localOrigem.rua, localOrigem.altura, localOrigem.coluna, localOrigem.caixa, 'ENTRADA');
            promises.push(fetch(googleFormsUrlMovimentacao, { method: 'POST', body: formData, mode: 'no-cors' }));
            
            const formDataReversa = createReversaUpdateData();
            promises.push(fetch(googleFormsUrlReversa, { method: 'POST', body: formDataReversa, mode: 'no-cors' }));

        } else if (movimento === 'SAIDA') {
            const formData = createMovimentacaoFormData(localOrigem.rua, localOrigem.altura, localOrigem.coluna, localOrigem.caixa, 'SAIDA');
            promises.push(fetch(googleFormsUrlMovimentacao, { method: 'POST', body: formData, mode: 'no-cors' }));
            
        } else if (movimento === 'TRANSFERENCIA') {
            const localDestino = {
                rua: document.getElementById('RUA_DESTINO').value,
                altura: document.getElementById('ALTURA_DESTINO').value,
                coluna: document.getElementById('COLUNA_DESTINO').value,
                caixa: document.getElementById('CAIXA_DESTINO').value
            };
            
            // SAÍDA da origem
            const formDataSaida = createMovimentacaoFormData(localOrigem.rua, localOrigem.altura, localOrigem.coluna, localOrigem.caixa, 'SAIDA');
            promises.push(fetch(googleFormsUrlMovimentacao, { method: 'POST', body: formDataSaida, mode: 'no-cors' }));
            
            // ENTRADA no destino
            const formDataEntrada = createMovimentacaoFormData(localDestino.rua, localDestino.altura, localDestino.coluna, localDestino.caixa, 'ENTRADA');
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
        if (form.checkValidity()) {
            submitData();
        } else {
            form.reportValidity();
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (form.checkValidity()) {
            submitData();
        } else {
            form.reportValidity();
        }
    });
});