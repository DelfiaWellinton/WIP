/* doc-id: 0008 */
document.addEventListener('DOMContentLoaded', () => {
    const tokenForm = document.getElementById('login-form');
    const tokenInput = document.getElementById('user-token');
    const nameInput = document.getElementById('user-name');
    const storedToken = localStorage.getItem('userToken');

    // Se o token já existe no armazenamento local, redireciona o usuário
    if (storedToken) {
        window.location.href = 'home.html';
    }

    if (tokenForm) {
        tokenForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Evita o envio padrão do formulário

            const token = tokenInput.value.trim();
            const userName = nameInput.value.trim() || 'Usuário';

            if (token) {
                // Salva o token e o nome do usuário no armazenamento local
                localStorage.setItem('userToken', token);
                localStorage.setItem('userName', userName);
                
                // Redireciona para a página principal após salvar
                window.location.href = 'home.html';
            } else {
                alert('Por favor, insira um token válido.');
            }
        });
    }
});