class JogoSequencia {
            constructor() {
                this.sequenciaCorreta = this.gerarSequencia();
                this.linhaAtual = 0;
                this.colunaAtual = 0;
                this.vidas = 4;
                this.fimJogo = false;
                this.pontos = 0;
                this.nomeJogador = localStorage.getItem('nomeJogador') || 'Jogador';
                
                this.inicializarGrade();
                this.configurarEventos();
                this.atualizarPontos();
                
                console.log('Sequência correta:', this.sequenciaCorreta); // Para debug
            }
            
            gerarSequencia() {
                // Gera uma sequência aleatória de 5 números (0-9)
                return Array.from({length: 5}, () => Math.floor(Math.random() * 10));
            }
            
            inicializarGrade() {
                const grade = document.getElementById('gradeJogo');
                grade.innerHTML = '';
                
                for (let linha = 0; linha < 4; linha++) {
                    for (let coluna = 0; coluna < 5; coluna++) {
                        const celula = document.createElement('div');
                        celula.className = 'celula-grade';
                        celula.dataset.linha = linha;
                        celula.dataset.coluna = coluna;
                        
                        if (linha === 0 && coluna === 0) {
                            celula.classList.add('ativa');
                        }
                        
                        grade.appendChild(celula);
                    }
                }
            }
            
            configurarEventos() {
                const entradaNumero = document.getElementById('entradaNumero');
                const botaoEnviar = document.getElementById('botaoEnviar');
                
                // Aceita apenas números de 0 a 9 digitados
                entradaNumero.addEventListener('input', (e) => {
                    let valor = e.target.value.replace(/\D/g, ''); // remove qualquer não número
                    if (valor.length > 1) valor = valor[0];
                    e.target.value = valor;
                    if (valor !== '') {
                        this.preencherCelulaAtual(parseInt(valor));
                    }
                });
                
                entradaNumero.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.enviarPalpite();
                    }
                });
                
                botaoEnviar.addEventListener('click', () => {
                    this.enviarPalpite();
                });
                
                // Permite clicar na célula ativa para alterar valor
                document.getElementById('gradeJogo').addEventListener('click', (e) => {
                    const celula = e.target.closest('.celula-grade');
                    if (celula &&
                        parseInt(celula.dataset.linha) === this.linhaAtual &&
                        parseInt(celula.dataset.coluna) < this.colunaAtual &&
                        !celula.classList.contains('desabilitada')) {
                        
                        this.colunaAtual = parseInt(celula.dataset.coluna);
                        this.definirCelulaAtiva(this.linhaAtual, this.colunaAtual);
                        entradaNumero.value = '';
                        entradaNumero.focus();
                    }
                });
            }
            
            preencherCelulaAtual(valor) {
                if (this.fimJogo) return;
                
                const celula = document.querySelector(`[data-linha="${this.linhaAtual}"][data-coluna="${this.colunaAtual}"]`);
                if (celula && !celula.classList.contains('desabilitada')) {
                    celula.textContent = valor;
                    celula.dataset.valor = valor;
                    
                    // Limpa o input imediatamente após preencher
                    document.getElementById('entradaNumero').value = '';
                    
                    // Move para a próxima célula
                    this.moverParaProximaCelula();
                }
            }
            
            moverParaProximaCelula() {
                const celulaAtual = document.querySelector(`[data-linha="${this.linhaAtual}"][data-coluna="${this.colunaAtual}"]`);
                if (celulaAtual) {
                    celulaAtual.classList.remove('ativa');
                }
                
                this.colunaAtual++;
                if (this.colunaAtual >= 5) {
                    document.getElementById('botaoEnviar').disabled = false;
                    return;
                }
                
                this.definirCelulaAtiva(this.linhaAtual, this.colunaAtual);
            }
            
            definirCelulaAtiva(linha, coluna) {
                // Remove ativa de todas as células
                document.querySelectorAll('.celula-grade').forEach(celula => celula.classList.remove('ativa'));
                
                // Ativa célula desejada
                const celula = document.querySelector(`[data-linha="${linha}"][data-coluna="${coluna}"]`);
                if (celula) {
                    celula.classList.add('ativa');
                }
                
                document.getElementById('entradaNumero').focus();
                document.getElementById('entradaNumero').value = '';
            }
            
            enviarPalpite() {
                if (this.fimJogo || this.colunaAtual < 5) return;
                
                const celulasLinhaAtual = [];
                for (let coluna = 0; coluna < 5; coluna++) {
                    const celula = document.querySelector(`[data-linha="${this.linhaAtual}"][data-coluna="${coluna}"]`);
                    celulasLinhaAtual.push({
                        celula: celula,
                        valor: parseInt(celula.dataset.valor)
                    });
                }
                
                // Verifica a sequência
                const estaCorreto = this.verificarSequencia(celulasLinhaAtual);
                
                if (estaCorreto) {
                    this.ganharJogo();
                } else {
                    this.perderVida();
                    this.moverParaProximaLinha();
                }
                
                document.getElementById('entradaNumero').value = '';
                document.getElementById('botaoEnviar').disabled = true;
            }
            
            verificarSequencia(celulasDaLinha) {
                let contadorCorretos = 0;
                const copiaSequencia = [...this.sequenciaCorreta];
                
                // Primeira passada: marca posições corretas
                celulasDaLinha.forEach((dadosCelula, indice) => {
                    if (dadosCelula.valor === this.sequenciaCorreta[indice]) {
                        dadosCelula.celula.classList.add('correto');
                        contadorCorretos++;
                        copiaSequencia[indice] = null; // Remove da cópia
                    }
                });
                
                // Segunda passada: marca posições erradas e números que existem
                celulasDaLinha.forEach((dadosCelula, indice) => {
                    if (!dadosCelula.celula.classList.contains('correto')) {
                        const indiceEncontrado = copiaSequencia.indexOf(dadosCelula.valor);
                        if (indiceEncontrado !== -1) {
                            dadosCelula.celula.classList.add('posicao-errada');
                            copiaSequencia[indiceEncontrado] = null; // Remove da cópia
                        } else {
                            dadosCelula.celula.classList.add('nao-na-sequencia');
                        }
                    }
                });
                
                // Desabilita as células da linha atual
                celulasDaLinha.forEach(dadosCelula => {
                    dadosCelula.celula.classList.add('desabilitada');
                });
                
                return contadorCorretos === 5;
            }
            
            perderVida() {
                this.vidas--;
                if (this.vidas <= 0) {
                    this.terminarJogo(false);
                }
            }
            
            moverParaProximaLinha() {
                this.linhaAtual++;
                this.colunaAtual = 0;
                
                if (this.linhaAtual >= 4) {
                    this.terminarJogo(false);
                    return;
                }
                
                // Ativa primeira célula da próxima linha
                const proximaCelula = document.querySelector(`[data-linha="${this.linhaAtual}"][data-coluna="${this.colunaAtual}"]`);
                if (proximaCelula) {
                    proximaCelula.classList.add('ativa');
                }
                
                document.getElementById('entradaNumero').focus();
            }
            
            ganharJogo() {
                // Calcula pontuação bonus por vitória
                const pontosBase = 1000;
                const bonusVidas = this.vidas * 200;
                const bonusLinha = (4 - this.linhaAtual) * 100;
                
                this.pontos += pontosBase + bonusVidas + bonusLinha;
                this.atualizarPontos();
                
                this.terminarJogo(true);
            }
            
            terminarJogo(ganhou) {
                this.fimJogo = true;
                
                // Salva a pontuação
                this.salvarPontuacao();
                
                const modal = document.getElementById('modalFimJogo');
                const titulo = document.getElementById('tituloModal');
                const texto = document.getElementById('textoModal');
                
                if (ganhou) {
                    titulo.textContent = 'PARABÉNS!';
                    texto.innerHTML = `
                        Você descobriu a sequência!<br>
                        Sequência: ${this.sequenciaCorreta.join(' ')}<br>
                        Pontuação Final: ${this.pontos}<br>
                        Vidas Restantes: ${this.vidas}
                    `;
                } else {
                    titulo.textContent = 'GAME OVER!';
                    texto.innerHTML = `
                        Você não conseguiu descobrir a sequência.<br>
                        Sequência Correta: ${this.sequenciaCorreta.join(' ')}<br>
                        Pontuação Final: ${this.pontos}<br>
                        Tente novamente!
                    `;
                }
                
                modal.style.display = 'flex';
            }
            
            atualizarPontos() {
                document.getElementById('valorPontos').textContent = this.pontos;
            }
            
            salvarPontuacao() {
                const pontuacoes = JSON.parse(localStorage.getItem('pontuacoesJogo') || '[]');
                const novaPontuacao = {
                    jogador: this.nomeJogador,
                    pontos: this.pontos,
                    data: new Date().toLocaleDateString(),
                    sequencia: this.sequenciaCorreta.join(''),
                    vidas: this.vidas
                };
                
                pontuacoes.push(novaPontuacao);
                pontuacoes.sort((a, b) => b.pontos - a.pontos); // Ordena por pontuação
                
                // Mantém apenas os top 10
                if (pontuacoes.length > 10) {
                    pontuacoes.splice(10);
                }
                
                localStorage.setItem('pontuacoesJogo', JSON.stringify(pontuacoes));
            }
        }
        
        // Funções globais
        function reiniciarJogo() {
            document.getElementById('modalFimJogo').style.display = 'none';
            new JogoSequencia();
        }
        
        function irParaMenu() {
            window.location.href = 'dados.html';
        }
        
        // Inicializa o jogo
        let jogo = new JogoSequencia();
        
        // Foca no input ao carregar
        window.addEventListener('load', () => {
            document.getElementById('entradaNumero').focus();
        });