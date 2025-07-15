// Validação do formulário
        const NomeJogadorInput = document.getElementById('NomeJogador');
        const botaoplay = document.getElementById('botaoplay');
        
        NomeJogadorInput.addEventListener('input', function() {
            const name = this.value.trim();
            if (name.length >= 2) {
                botaoplay.disabled = false;
                botaoplay.style.opacity = '1';
            } else {
                botaoplay.disabled = true;
                botaoplay.style.opacity = '0.6';
            }
        });
        
        // Função para iniciar o jogo
        function Comecar() {
            const NomeJogador = NomeJogadorInput.value.trim();
            
            if (NomeJogador.length < 2) {
                alert('Por favor, insira um nome com pelo menos 2 caracteres!');
                return;
            }
            
            // Salvar dados do jogador
            localStorage.setItem('NomeJogador', NomeJogador);
            localStorage.setItem('gameStartTime', new Date().toISOString());
            
            // Redirecionar para o jogo
            window.location.href = '../HTML/Game.html';
        }
        
        // Carregar nome salvo se existir
        window.addEventListener('load', function() {
            const savedNome = localStorage.getItem('NomeJogador');
            if (savedNome) {
                NomeJogadorInput.value = savedNome;
                botaoplay.disabled = false;
                botaoplay.style.opacity = '1';
            }
        });
        
        // Enter para submeter
        NomeJogadorInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !botaoplay.disabled) {
                Comecar();
            }
        });