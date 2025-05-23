document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chatForm');
    const userInput = document.getElementById('userInput');
    const chatMessages = document.getElementById('chatMessages');
    const newChatBtn = document.getElementById('newChat');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.querySelector('.sidebar');

    // État de l'application
    let isProcessing = false;
    let abortController = null;
    let currentConversation = {
        id: Date.now(),
        messages: []
    };
    let isScrolling = false;
    let hiddenConversations = new Set(JSON.parse(localStorage.getItem('hiddenConversations') || '[]'));

    // Gestion du menu mobile
    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
    });

    // Gestion du nouveau chat
    newChatBtn.addEventListener('click', () => {
        if (isProcessing) {
            abortController?.abort();
        }
        currentConversation = {
            id: Date.now(),
            messages: []
        };
        chatMessages.innerHTML = '';
        userInput.value = '';
        showWelcomeMessage();
        saveConversation();
    });

    // Auto-resize du textarea avec animation
    userInput.addEventListener('input', () => {
        const previousHeight = userInput.style.height;
        userInput.style.height = 'auto';
        const newHeight = Math.min(userInput.scrollHeight, 120);
        
        if (previousHeight !== `${newHeight}px`) {
            userInput.style.height = `${newHeight}px`;
            adjustFooterPosition();
        }
    });

    // Ajuster la position du footer lors du redimensionnement
    function adjustFooterPosition() {
        const footer = document.querySelector('.chat-footer');
        if (footer) {
            const height = footer.offsetHeight;
            chatMessages.style.marginBottom = `${height}px`;
        }
    }

    // Gestion du formulaire
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (isProcessing) {
            return;
        }

        const message = userInput.value.trim();
        if (!message) return;

        try {
            isProcessing = true;
            abortController = new AbortController();

            // Ajouter le message de l'utilisateur avec animation
            addMessage(message, 'user');
            currentConversation.messages.push({
                role: 'user',
                content: message,
                timestamp: new Date().toISOString()
            });
            userInput.value = '';
            userInput.style.height = 'auto';
            adjustFooterPosition();

            // Afficher l'indicateur de chargement avec animation
            const loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'message assistant-message';
            loadingIndicator.innerHTML = `
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            `;
            chatMessages.appendChild(loadingIndicator);
            smoothScrollToBottom();

            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message,
                    conversationId: currentConversation.id
                }),
                signal: abortController.signal
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la communication avec le serveur');
            }

            const data = await response.json();
            
            // Supprimer l'indicateur de chargement avec animation
            loadingIndicator.style.opacity = '0';
            setTimeout(() => loadingIndicator.remove(), 300);

            // Ajouter la réponse de l'assistant avec animation
            addMessage(data.text, 'assistant', data.language, data.audioUrl);
            currentConversation.messages.push({
                role: 'assistant',
                content: data.text,
                language: data.language,
                audioUrl: data.audioUrl,
                timestamp: new Date().toISOString()
            });

            // Sauvegarder la conversation
            saveConversation();

        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Requête annulée');
            } else {
                console.error('Erreur:', error);
                showError('Une erreur est survenue lors de la communication avec le serveur.');
            }
        } finally {
            isProcessing = false;
            abortController = null;
        }
    });

    // Fonction pour ajouter un message avec animation
    function addMessage(content, type, language = null, audioUrl = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        // Créer un conteneur pour le contenu du message
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Formater le contenu en fonction de son type
        if (type === 'assistant') {
            // Détecter et formater le code
            content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
                return `<pre><code class="language-${lang || 'plaintext'}">${escapeHtml(code.trim())}</code></pre>`;
            });
            
            // Détecter et formater le code en ligne
            content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
            
            // Détecter et formater les listes
            content = content.replace(/^\s*[-*+]\s+(.+)$/gm, '<li>$1</li>');
            content = content.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
            
            // Détecter et formater les citations
            content = content.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
            
            // Détecter et formater les liens
            content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
            
            // Détecter et formater le texte en gras
            content = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            
            // Détecter et formater le texte en italique
            content = content.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        }
        
        messageContent.innerHTML = content;
        messageDiv.appendChild(messageContent);
        
        // Ajouter la langue si spécifiée
        if (language) {
            const languageInfo = document.createElement('small');
            languageInfo.className = 'text-muted d-block mt-1';
            languageInfo.textContent = `Langue: ${language}`;
            messageDiv.appendChild(languageInfo);
        }
        
        // Ajouter le lecteur audio si disponible
        if (audioUrl) {
            const audioPlayer = document.createElement('audio');
            audioPlayer.className = 'audio-player mt-2';
            audioPlayer.controls = true;
            audioPlayer.src = audioUrl;
            messageDiv.appendChild(audioPlayer);
        }
        
        chatMessages.appendChild(messageDiv);
        smoothScrollToBottom();
    }

    // Fonction pour échapper les caractères HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Fonction pour faire défiler vers le bas avec animation
    function smoothScrollToBottom() {
        if (isScrolling) return;
        isScrolling = true;

        const scrollHeight = chatMessages.scrollHeight;
        const currentScroll = chatMessages.scrollTop;
        const targetScroll = scrollHeight - chatMessages.clientHeight;
        const distance = targetScroll - currentScroll;
        const duration = 300;
        const startTime = performance.now();

        function easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
        }

        function animateScroll(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutCubic(progress);

            chatMessages.scrollTop = currentScroll + (distance * easedProgress);

            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            } else {
                isScrolling = false;
            }
        }

        requestAnimationFrame(animateScroll);
    }

    // Fonction pour afficher une erreur avec animation
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        chatMessages.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.style.opacity = '0';
            setTimeout(() => errorDiv.remove(), 300);
        }, 5000);
    }

    // Message de bienvenue avec animation
    function showWelcomeMessage() {
        const welcomeMessage = `
            <div class="welcome-message">
                <h4>👋 Bienvenue !</h4>
                <p>Je suis votre assistant IA. Je peux :</p>
                <ul>
                    <li>Répondre à vos questions</li>
                    <li>Générer du texte dans plusieurs langues</li>
                    <li>Convertir mes réponses en audio</li>
                </ul>
                <p>Comment puis-je vous aider aujourd'hui ?</p>
            </div>
        `;
        addMessage(welcomeMessage, 'assistant');
    }

    // Gestion des conversations avec animation
    function saveConversation() {
        const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
        const index = conversations.findIndex(c => c.id === currentConversation.id);
        
        if (index !== -1) {
            conversations[index] = currentConversation;
        } else {
            conversations.push(currentConversation);
        }
        
        localStorage.setItem('conversations', JSON.stringify(conversations));
        updateChatHistory();
    }

    // Fonction pour masquer une conversation
    function hideConversation(id) {
        hiddenConversations.add(parseInt(id));
        localStorage.setItem('hiddenConversations', JSON.stringify([...hiddenConversations]));
        updateChatHistory();
        
        // Si la conversation masquée est la conversation courante, créer une nouvelle conversation
        if (currentConversation.id === parseInt(id)) {
            newChatBtn.click();
        }
    }

    function updateChatHistory() {
        const chatHistory = document.getElementById('chatHistory');
        const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
        
        // Filtrer les conversations visibles
        const visibleConversations = conversations.filter(conv => !hiddenConversations.has(conv.id));
        
        const historyHTML = visibleConversations.map((conv, index) => `
            <div class="conversation-item">
                <button class="list-group-item list-group-item-action" data-id="${conv.id}" style="animation-delay: ${index * 0.1}s">
                    <div class="d-flex justify-content-between align-items-center">
                        <span>${conv.messages[0]?.content.substring(0, 30)}...</span>
                        <small class="text-muted">${new Date(conv.id).toLocaleDateString()}</small>
                    </div>
                </button>
                <button class="btn btn-sm btn-outline-danger hide-conversation" data-id="${conv.id}" title="Masquer la conversation">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        chatHistory.innerHTML = historyHTML;

        // Ajouter les écouteurs d'événements pour les conversations
        chatHistory.querySelectorAll('.list-group-item').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    btn.style.transform = '';
                    loadConversation(btn.dataset.id);
                }, 100);
            });
        });

        // Ajouter les écouteurs pour les boutons de masquage
        chatHistory.querySelectorAll('.hide-conversation').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                hideConversation(id);
            });
        });
    }

    function loadConversation(id) {
        const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
        const conversation = conversations.find(c => c.id === parseInt(id));
        
        if (conversation) {
            currentConversation = conversation;
            chatMessages.innerHTML = '';
            conversation.messages.forEach((msg, index) => {
                setTimeout(() => {
                    addMessage(msg.content, msg.role, msg.language, msg.audioUrl);
                }, index * 100);
            });
        }
    }

    // Gestion du redimensionnement de la fenêtre
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (window.innerWidth > 768) {
                sidebar.classList.remove('active');
                document.body.style.overflow = '';
            }
            adjustFooterPosition();
        }, 100);
    });

    // Nettoyage lors de la fermeture de la page
    window.addEventListener('beforeunload', () => {
        if (isProcessing) {
            abortController?.abort();
        }
    });

    // Initialisation
    showWelcomeMessage();
    updateChatHistory();
    adjustFooterPosition();
}); 