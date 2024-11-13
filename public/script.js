window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    
    if (window.scrollY > 0) {
        navbar.classList.add('navbar-scrolled');
    } else {
        navbar.classList.remove('navbar-scrolled');
    }
});

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

window.onload = function() {
    const loginModal = getQueryParam('loginModal');
    if (loginModal === 'true') {
        var myModal = new bootstrap.Modal(document.getElementById('loginBackdrop'));
        myModal.show();
    }
};

document.getElementById('toggleAuth').addEventListener('click', function() {
    const authSection = document.getElementById('authSection');
    const btnClose = document.getElementById('btn-close');

    authSection.classList.add('animate');

    setTimeout(() => { 
        if (authSection.classList.contains('move-left')) {
            authSection.classList.remove('move-left');
            authSection.classList.add('move-right');
            document.getElementById('authTitle').textContent = "Bem Vindo";
            document.getElementById('authText').textContent = "Já possui uma conta? Entre abaixo.";
            document.getElementById('toggleAuth').textContent = "Entrar";
            btnClose.classList.remove('btn-close-white');
        } else {
            authSection.classList.remove('move-right');
            authSection.classList.add('move-left');
            document.getElementById('authTitle').textContent = "Criar Conta";
            document.getElementById('authText').textContent = "Caso não tenha uma conta, crie aqui";
            document.getElementById('toggleAuth').textContent = "Cadastrar";
            btnClose.classList.add('btn-close-white');
        }
    }, 100);
});


const chatBody = document.querySelector('.chat-body');
const messageInput = document.querySelector('.message-input');
const sendMessageButton = document.querySelector('#send-message');
const chatbotToggler = document.querySelector('#chatbot-toggler');
const closeChatbot = document.querySelector('#close-chatbot');

const API_KEY = "AIzaSyBS0TtusCkXIPeEya4tKZq5XXAKeRATXnE";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`; 

const userData = {
    message: null
}

const chatHistory = [];
const initialInputHeight = messageInput.scrollHeight

const createMessageElement = (content, ...classes) => {
    const div = document.createElement('div');
    div.classList.add('message', ...classes);
    div.innerHTML = content;
    return div;
}

const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector('.message-text');
    chatHistory.push(
        {
            role: 'user',
            parts: [{ text: "Seu nome é Greener. Você é o assistente virtual da Greens. A Greens busca promover a segurança alimentar com produtos à base de grãos que nutrem e respeitam o planeta. Como empresa B-Corp, unimos lucro e propósito, gerando impacto positivo nas comunidades e no meio ambiente. Realizamos workshops sobre práticas alimentares sustentáveis para empoderar as pessoas a fazer escolhas conscientes e incentivamos a produção local por meio de parcerias com agricultores sustentáveis. Nosso plano é expandir essas iniciativas educacionais e fortalecer nossa rede de colaboração, criando um ciclo de consumo que cuide tanto das pessoas quanto do planeta. Na Greens, cada grão conta. Como uma empresa certificada B-Corp, prioriza a transparência e a ética em suas operações, comprometendo-se com a responsabilidade social e ambiental. Sua missão é baseada em três pilares: sustentabilidade por meio de práticas ecológicas, programas educativos na comunidade e desenvolvimento de produtos nutritivos e inovadores. A empresa valoriza parcerias com fornecedores alinhados a esses valores, evitando práticas prejudiciais como o uso de agrotóxicos. Com foco no fortalecimento do comércio local e em uma postura de transparência, a Greens busca promover o desenvolvimento econômico e cultural da região, refletindo seu compromisso com o bem-estar do planeta e das comunidadesSua função é ajudar o usuário dando mais informações ou tirando dúvidas sobre o assunto (seja como funciona a produção de soja por exemplo, ou os benefícios de seu plantio para o meio ambiente e para o corpo humano). Caso o usuário queira saber, nosso email de contato é: greens.compania@gmail.com. Nosso telefone: +55 (11) 12345-6789. E caso o usuário queira participar dos nossos workshops ou saber sobre mais dos produtos que estamos promovendo no momento, é só criar uma conta para e os notificaremos para que ele fique por dentro de tudo." }]
        },
        {
            role: 'model',
            parts: [{ text: "Olá, eu sou Greener, assistente virtual da Greens" }]
        },
        {
            role: 'user',
            parts: [{ text: userData.message }]
        },
    );

    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({
            contents: chatHistory
        })
    }

    try {
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
        messageElement.innerHTML = apiResponseText;

        chatHistory.push({
            role: 'model',
            parts: [{ text: apiResponseText }]
        });
    } catch (error) {
        console.log(error);
        messageElement.innerHTML = error.message;
        messageElement.style.color = "#ff0000"
    } finally {
        incomingMessageDiv.classList.remove('thinking');
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    }
}

const handleOutgoingMessage = (e) => {
    e.preventDefault();
    userData.message = messageInput.value.trim();
    messageInput.value = "";
    messageInput.dispatchEvent(new Event('input'));

    const messageContent = `<div class="message-text"></div>`;
    const outgoingMessageDiv = createMessageElement(messageContent, 'user-message');
    outgoingMessageDiv.querySelector('.message-text').textContent = userData.message;
    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

    setTimeout(() => {
        const messageContent = `<svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
                        <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
                    </svg>
                    <div class="message-text">
                        <div class="thinking-indicator">
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                        </div>
                </div>`;
        const incomingMessageDiv = createMessageElement(messageContent, 'bot-message', 'thinking');
        chatBody.appendChild(incomingMessageDiv);
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
        generateBotResponse(incomingMessageDiv);
    }, 600)
}

messageInput.addEventListener('keydown', (e) => {
    const userMessage = e.target.value.trim();
    if (e.key === 'Enter' && userMessage && !e.shiftKey && window.innerWidth > 768) {
        handleOutgoingMessage(e);
    }
})

messageInput.addEventListener('input', () => {
    messageInput.style.height = `${initialInputHeight}px`
    messageInput.style.height = `${messageInput.scrollHeight}px`
    document.querySelector('.chat-form').style.borderRadius = messageInput.scrollHeight > initialInputHeight ? '15px' : '32px';
})

sendMessageButton.addEventListener('click', (e) => handleOutgoingMessage(e));
chatbotToggler.addEventListener('click', () => document.body.classList.toggle('show-chatbot'));
closeChatbot.addEventListener('click', () => document.body.classList.remove('show-chatbot'));


const menuToggler = document.querySelector('#menu-toggler');
menuToggler.addEventListener('click', () => document.body.classList.toggle('show-menu'));