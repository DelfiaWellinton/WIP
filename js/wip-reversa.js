/* doc-id: 0009 */
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

    const productList = document.getElementById('product-list');
    const addProductBtn = document.querySelector('.btn-add-product');
    const form = document.getElementById('invoice-form');
    const saveButton = document.getElementById('save-button');
    const toggleViewBtn = document.getElementById('toggle-view-btn');
    const formSection = document.getElementById('form-section');
    const dataSection = document.getElementById('data-section');
    const summaryModal = document.getElementById('summary-modal');
    const modalBody = document.getElementById('modal-body');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const modalSubmitBtn = document.getElementById('modal-submit-btn');

    const googleFormsUrl = 'https://docs.google.com/forms/d/e/1FAIpQLScbyNFTprA6F8Ndbq2WKACL4rq6sETPKip32bZr04_xbR9prA/formResponse';
    
    // Esta parte do código de pesquisa foi movida para o arquivo 'wip-reversa-pesquisa.js'
    // E os botões de toggle de visualização e filtros foram removidos desta página

    const googleFormsEntries = {
        cod_rastreio: 'entry.1568760186',
        cod_e_ticket: 'entry.765395476',
        tipo_cod: 'entry.607990619',
        cod_produto: 'entry.657384190',
        projeto: 'entry.507328715',
        destino: 'entry.1045144616',
        data_leitura: 'entry.2096164784',
        token: 'entry.759591489',
        anotacoes: 'entry.903981620',
        descricao: 'entry.2129716067',
        caixa: 'entry.340994985'
    };

    const createProductLine = () => {
        const productLine = document.createElement('div');
        productLine.classList.add('product-line');
        const uniqueId = Date.now();
        productLine.innerHTML = `
            <button type="button" class="btn-remove">X</button>
            <div class="form-group">
                <label>5. TIPO:</label>
                <div class="radio-option-group">
                    <div>
                        <input type="radio" name="TIPO_COD_${uniqueId}" value="Serial Number" required checked>
                        <label>Serial Number</label>
                    </div>
                    <div>
                        <input type="radio" name="TIPO_COD_${uniqueId}" value="SGP">
                        <label>SGP</label>
                    </div>
                    <div>
                        <input type="radio" name="TIPO_COD_${uniqueId}" value="OUTRO">
                        <label>Outro...</label>
                    </div>
                </div>
                <input type="text" class="TIPO_COD_OUTRO other-input" style="display: none;" placeholder="Descreva o tipo">
            </div>
            <div class="form-group">
                <label>6. CÓDIGO PRODUTO:</label>
                <input type="text" class="COD_PRODUTO" placeholder="Escanear código do produto" required>
            </div>
            <div class="form-group">
                <label>7. DESCRIÇÃO:</label>
                <input type="text" class="DESCRICAO" placeholder="Ex: Roteador, Bateria, etc.">
            </div>
            <div class="form-group">
                <label>8. CAIXA:</label>
                <input type="number" class="CAIXA" min="1" placeholder="Nº da caixa (ex: 1)" required>
            </div>
            <div class="form-group">
                <label>9. DESTINO:</label>
                <div class="radio-option-group">
                    <div>
                        <input type="radio" name="DESTINO_${uniqueId}" value="DEFINIR" required checked>
                        <label>DEFINIR</label>
                    </div>
                    <div>
                        <input type="radio" name="DESTINO_${uniqueId}" value="ARMAZENAMENTO" required>
                        <label>ARMAZENAMENTO</label>
                    </div>
                    <div>
                        <input type="radio" name="DESTINO_${uniqueId}" value="LABORATÓRIO">
                        <label>LABORATÓRIO</label>
                    </div>
                    <div>
                        <input type="radio" name="DESTINO_${uniqueId}" value="OUTRO">
                        <label>Outro...</label>
                    </div>
                </div>
                <input type="text" class="DESTINO_OUTRO other-input" style="display: none;" placeholder="Descreva o destino">
            </div>
            <div class="form-group">
                <label>10. ANOTAÇÕES:</label>
                <textarea class="ANOTACOES" placeholder="Detalhes ou observações sobre o produto"></textarea>
            </div>
        `;
        productList.appendChild(productLine);

        productLine.querySelector('.btn-remove').addEventListener('click', () => {
            productLine.remove();
            if (productList.children.length === 0) {
                createProductLine();
            }
        });

        const setupOtherOption = (radioGroupName, otherInputEl) => {
            const radioButtons = productLine.querySelectorAll(`input[name^="${radioGroupName}"]`);
            radioButtons.forEach(radio => {
                radio.addEventListener('change', () => {
                    if (radio.value === 'OUTRO') {
                        otherInputEl.style.display = 'block';
                        otherInputEl.setAttribute('required', 'required');
                    } else {
                        otherInputEl.style.display = 'none';
                        otherInputEl.removeAttribute('required');
                    }
                });
            });
        };

        setupOtherOption('TIPO_COD', productLine.querySelector('.TIPO_COD_OUTRO'));
        setupOtherOption('DESTINO', productLine.querySelector('.DESTINO_OUTRO'));
    };

    const setupHeaderOtherOption = (selectId, otherInputId) => {
        const selectEl = document.getElementById(selectId);
        const otherInputEl = document.getElementById(otherInputId);
        if (selectEl && otherInputEl) {
            selectEl.addEventListener('change', () => {
                if (selectEl.value === 'OUTRO') {
                    otherInputEl.style.display = 'block';
                    otherInputEl.setAttribute('required', 'required');
                } else {
                    otherInputEl.style.display = 'none';
                    otherInputEl.removeAttribute('required');
                }
            });
        }
    };

    const resetAndReload = () => {
        form.reset();
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('dataLeitura').value = today;
        document.getElementById('PROJETO_OUTRO').style.display = 'none';
        productList.innerHTML = '';
        createProductLine();
        document.getElementById('COD_RASTREIO').focus();
    };

    setupHeaderOtherOption('PROJETO', 'PROJETO_OUTRO');
    createProductLine();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dataLeitura').value = today;
    document.getElementById('COD_RASTREIO').focus();

    addProductBtn.addEventListener('click', createProductLine);
    saveButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (form.checkValidity()) {
            showSummaryModal();
        } else {
            form.reportValidity();
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        showSummaryModal();
    });

    modalCancelBtn.addEventListener('click', () => {
        summaryModal.style.display = 'none';
    });

    modalSubmitBtn.addEventListener('click', () => {
        submitFormData();
    });

    const showSummaryModal = () => {
        modalBody.innerHTML = '';
        const productLines = document.querySelectorAll('.product-line');
        if (productLines.length === 0) {
            alert('Adicione pelo menos um produto!');
            return;
        }

        const headerData = {
            cod_rastreio: document.getElementById('COD_RASTREIO').value,
            cod_e_ticket: document.getElementById('COD_E_TICKET').value,
            projeto: document.getElementById('PROJETO').value === 'OUTRO' ? 
                     document.getElementById('PROJETO_OUTRO').value : 
                     document.getElementById('PROJETO').value,
            data_leitura: document.getElementById('dataLeitura').value,
        };
        
        let summaryHTML = `
            <div class="modal-item"><strong>Cód. Rastreio:</strong> ${headerData.cod_rastreio}</div>
            <div class="modal-item"><strong>Cód. E-Ticket:</strong> ${headerData.cod_e_ticket}</div>
            <div class="modal-item"><strong>Projeto:</strong> ${headerData.projeto}</div>
            <div class="modal-item"><strong>Data de Leitura:</strong> ${headerData.data_leitura}</div>
            <hr>
        `;

        productLines.forEach((line, index) => {
            const tipoCodRadio = line.querySelector('input[name^="TIPO_COD"]:checked');
            const tipoCod = tipoCodRadio.value === 'OUTRO' ? 
                            line.querySelector('.TIPO_COD_OUTRO').value : 
                            tipoCodRadio.value;
            
            const destinoRadio = line.querySelector('input[name^="DESTINO"]:checked');
            const destino = destinoRadio.value === 'OUTRO' ?
                            line.querySelector('.DESTINO_OUTRO').value :
                            destinoRadio.value;
            
            summaryHTML += `
                <div class="modal-item">
                    <h4>Produto ${index + 1}</h4>
                    <div><strong>Tipo:</strong> ${tipoCod}</div>
                    <div><strong>Cód. Produto:</strong> ${line.querySelector('.COD_PRODUTO').value}</div>
                    <div><strong>Descrição:</strong> ${line.querySelector('.DESCRICAO').value || 'N/A'}</div>
                    <div><strong>Caixa:</strong> ${line.querySelector('.CAIXA').value}</div>
                    <div><strong>Destino:</strong> ${destino}</div>
                    <div><strong>Anotações:</strong> ${line.querySelector('.ANOTACOES').value || 'N/A'}</div>
                </div>
            `;
        });
        modalBody.innerHTML = summaryHTML;
        summaryModal.style.display = 'flex';
    };

    const submitFormData = () => {
        summaryModal.style.display = 'none';

        const productLines = document.querySelectorAll('.product-line');
        const headerData = {
            cod_rastreio: "'" + document.getElementById('COD_RASTREIO').value,
            cod_e_ticket: "'" + document.getElementById('COD_E_TICKET').value,
            projeto: document.getElementById('PROJETO').value === 'OUTRO' ? 
                     document.getElementById('PROJETO_OUTRO').value : 
                     document.getElementById('PROJETO').value,
            data_leitura: document.getElementById('dataLeitura').value,
        };
        
        const promises = [];
        productLines.forEach(line => {
            const tipoCodRadio = line.querySelector('input[name^="TIPO_COD"]:checked');
            const tipoCod = tipoCodRadio.value === 'OUTRO' ? 
                            line.querySelector('.TIPO_COD_OUTRO').value : 
                            tipoCodRadio.value;
            
            const destinoRadio = line.querySelector('input[name^="DESTINO"]:checked');
            const destino = destinoRadio.value === 'OUTRO' ?
                            line.querySelector('.DESTINO_OUTRO').value :
                            destinoRadio.value;

            const lineData = {
                ...headerData,
                tipo_cod: tipoCod,
                cod_produto: "'" + line.querySelector('.COD_PRODUTO').value,
                descricao: line.querySelector('.DESCRICAO').value,
                caixa: line.querySelector('.CAIXA').value,
                destino: destino,
                anotacoes: "'" + line.querySelector('.ANOTACOES').value
            };

            const formData = new URLSearchParams();
            formData.append(googleFormsEntries.cod_rastreio, lineData.cod_rastreio);
            formData.append(googleFormsEntries.cod_e_ticket, lineData.cod_e_ticket);
            formData.append(googleFormsEntries.tipo_cod, lineData.tipo_cod);
            formData.append(googleFormsEntries.cod_produto, lineData.cod_produto);
            formData.append(googleFormsEntries.projeto, lineData.projeto);
            formData.append(googleFormsEntries.destino, lineData.destino);
            formData.append(googleFormsEntries.data_leitura, lineData.data_leitura);
            formData.append(googleFormsEntries.token, userToken);
            formData.append(googleFormsEntries.anotacoes, lineData.anotacoes);
            formData.append(googleFormsEntries.descricao, lineData.descricao);
            formData.append(googleFormsEntries.caixa, lineData.caixa);

            promises.push(
                fetch(googleFormsUrl, {
                    method: 'POST',
                    body: formData,
                    mode: 'no-cors'
                })
            );
        });

        Promise.all(promises)
            .then(() => {
                alert('Dados enviados com sucesso!');
                resetAndReload();
            })
            .catch(error => {
                console.error('Erro no envio:', error);
                alert('Houve um erro ao enviar os dados. Verifique a conexão.');
            });
    };
});