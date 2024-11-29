document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');

    // Initialize UI elements
    const messagesDiv = document.getElementById('messages');
    const messageInput = document.getElementById('message-input');
    const voiceButton = document.getElementById('voice-button');
    const sendButton = document.getElementById('send-button');
    const startChatButton = document.getElementById('start-chat');
    console.log('Start Chat Button:', startChatButton);
    const messageForm = document.getElementById('message-form');
    let recognition = null;
    let isListening = false;

    // Audio context setup
    let currentAudio = null;
    let audioContext = null;

    function initAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // Function to switch screens
    function switchScreen(from, to) {
        console.log('Switching screens from', from, 'to', to);
        const fromScreen = document.getElementById(from);
        const toScreen = document.getElementById(to);
        
        console.log('From screen:', fromScreen);
        console.log('To screen:', toScreen);
        
        if (fromScreen && toScreen) {
            fromScreen.classList.remove('active');
            toScreen.classList.add('active');
            console.log('Screen switch complete');
        } else {
            console.error('Could not find screens');
        }
    }

    // Add message to chat
    async function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    // Handle message submission
    async function handleSubmit(event) {
        if (event) {
            event.preventDefault();
        }

        const text = messageInput.value.trim();
        if (!text) return;

        // Add user's message
        await addMessage(text, 'user');
        messageInput.value = '';

        // Simulate Santa's response
        setTimeout(async () => {
            const santaResponse = "Ho ho ho! That's wonderful! I love hearing from children like you. What would you like for Christmas?";
            await addMessage(santaResponse, 'santa');
            await playSantaVoice(santaResponse);
        }, 1000);
    }

    // Voice synthesis setup
    async function playSantaVoice(text) {
        try {
            console.log('Requesting Santa voice for text:', text);
            const response = await fetch('http://localhost:3000/api/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text })
            });

            if (!response.ok) {
                throw new Error('Failed to get voice response');
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            
            if (currentAudio) {
                currentAudio.pause();
                URL.revokeObjectURL(currentAudio.src);
                currentAudio = null;
            }

            const audio = new Audio(audioUrl);
            currentAudio = audio;
            
            await audio.play();
            
            return new Promise((resolve) => {
                audio.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                    currentAudio = null;
                    resolve();
                };
            });
        } catch (error) {
            console.error('Error playing Santa voice:', error);
            // Fallback to browser's speech synthesis
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 0.9;
                utterance.pitch = 0.9;
                window.speechSynthesis.speak(utterance);
            }
        }
    }

    // Setup speech recognition
    function setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                console.log('Voice recognition started');
                voiceButton.classList.add('listening');
                document.getElementById('mic-status').textContent = '🎙️ Listening...';
            };

            recognition.onresult = (event) => {
                const last = event.results.length - 1;
                const transcript = event.results[last][0].transcript;
                
                if (event.results[last].isFinal) {
                    messageInput.value = transcript;
                    handleSubmit();
                    messageInput.value = '';
                }
            };

            recognition.onend = () => {
                console.log('Voice recognition ended');
                voiceButton.classList.remove('listening');
                document.getElementById('mic-status').textContent = '🎙️ Click to start';
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                voiceButton.classList.remove('listening');
                document.getElementById('mic-status').textContent = '🎙️ Click to start';
            };
        } else {
            console.log('Speech recognition not supported');
            voiceButton.style.display = 'none';
        }
    }

    // Voice button click handler
    if (voiceButton) {
        voiceButton.onclick = () => {
            if (!recognition) {
                setupSpeechRecognition();
            }
            
            if (voiceButton.classList.contains('listening')) {
                recognition.stop();
            } else {
                try {
                    recognition.start();
                } catch (e) {
                    console.error('Failed to start recognition:', e);
                }
            }
        };
    }

    // Event Listeners
    if (startChatButton) {
        console.log('Adding click listener to start button');
        startChatButton.onclick = async (e) => {
            console.log('Start chat button clicked');
            e.preventDefault();
            switchScreen('main-screen', 'chat-screen');
            initAudioContext();
            
            // Initial greeting
            const greeting = "Ho ho ho! Merry Christmas! What's your name, little one?";
            await addMessage(greeting, 'santa');
            await playSantaVoice(greeting);
        };
    } else {
        console.error('Start chat button not found');
    }

    if (messageForm) {
        messageForm.addEventListener('submit', handleSubmit);
    }

    // Create snow effect
    function createSnow() {
        const snow = document.createElement('div');
        snow.className = 'snow';
        
        // Random starting position
        snow.style.left = Math.random() * 100 + 'vw';
        snow.style.animationDuration = (5 + Math.random() * 3) + 's';
        
        document.body.appendChild(snow);
        
        // Remove snowflake after animation
        setTimeout(() => snow.remove(), 5000);
    }

    // Create snow periodically
    setInterval(createSnow, 500);
});
