import bot from './assets_codex/assets/bot.svg'
import user from './assets_codex/assets/user.svg'

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');
// add a glboal menu const and variable
const menuButton = document.getElementById("copy");
const menuButton1 = document.getElementById("resubmit");
const menuButton2 = document.getElementById("chinese");
const menuButton3 = document.getElementById("english");

let currentText = "";

let loadInterval;

function loader(element) {
    element.textContent = '';

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += '.';

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

function typeText(element, text) {
    let index = 0;

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
        } else {
            clearInterval(interval);
        }
    }, 20)
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}

const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData(form);

    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

    // to clear the textarea input 
    form.reset();

    // bot's chatstripe
    const uniqueId = generateUniqueId();
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

    // to focus scroll to the bottom 
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // specific message div 
    const messageDiv = document.getElementById(uniqueId);

    // messageDiv.innerHTML = "..."
    loader(messageDiv);

    const response = await fetch('https://biosycle-chat.onrender.com', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })

    clearInterval(loadInterval)
    messageDiv.innerHTML = " "

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim(); // trims any trailing spaces/'\n' 

        typeText(messageDiv, parsedData);

        currentText = parsedData; // Keep the current output
    } else {
        const err = await response.text();

        messageDiv.innerHTML = "Something went wrong";
        alert(err);
    }
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e);
    }
})

// --------------------------------------------------------------------------------
// login and timer below

var timeout = 10 * 60 * 1000; // 10 minutes in milliseconds

var startTime = new Date().getTime(); // get current time

alert("you have only 10 mins for testing without a valid login");

/*
//  const loginForm = document.getElementById("login-chat");
const loginButton = document.getElementById("login-form-submit");

loginButton.addEventListener("click", (e) => {
  e.preventDefault();
  const username = document.getElementById("BS-user").value;
  const password = document.getElementById("BS-password").value;

  if (username === "user" && password === "test") {
    alert("You have successfully logged in. You have 60 mins now.");
    timeout = 60 * 60 * 1000;
  } else {
    alert("Wrong user name or password !");
  }
})
*/

window.onload = function() {

    setTimeout(function() { // set timeout function

        if (new Date().getTime() - startTime > timeout) { // compare current time with start time 

            window.location.href = 'https://login.biosycle.wiki/'; // redirect to login page 

        } 

    }, timeout);
}

// Add a funtion to response COPY menu
menuButton.addEventListener("click", (e) =>{
    navigator.clipboard.writeText(currentText);

})

menuButton1.addEventListener("click", (e)=>{
    handleRewrite(1);
})

menuButton2.addEventListener("click", (e)=>{
    handleRewrite(2);
})

menuButton3.addEventListener("click", (e)=>{
    handleRewrite(3);
})

async function handleRewrite(menuItem) {
    const data = new FormData(form);

    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

    // to clear the textarea input
    form.reset();

    // bot's chatstripe
    const uniqueId = generateUniqueId();
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

    // to focus scroll to the bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // specific message div
    const messageDiv = document.getElementById(uniqueId);

    // messageDiv.innerHTML = "..."
    loader(messageDiv);

    // More options:
    var queryText = "?";
    if (menuItem === 1) {
            queryText =  "please rewrite: " + currentText +"\n";
    }
    else if (menuItem === 2) {
            queryText = "please translate the following to Chinese: " + currentText + "\n";
    }
    else if (menuItem === 3) {
            queryText = "please translate the following to English: " + currentText + "\n";
    }

    const response = await fetch('https://biosycle-chat.onrender.com', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
                prompt: queryText

        })
    })

    clearInterval(loadInterval)
    messageDiv.innerHTML = " "

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim(); // trims any trailing spaces/'\n'

        typeText(messageDiv, parsedData);
        currentText = parsedData;

    } else {
        const err = await response.text();

        messageDiv.innerHTML = "Something went wrong";
        alert(err);
    }
}
