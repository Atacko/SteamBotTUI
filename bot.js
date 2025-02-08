const blessed = require('blessed');
const SteamUser = require('steam-user');
const fs = require('fs');

const client = new SteamUser();
const credentialsFile = 'steam_credentials.json';

let logOnOptions = {};
if (fs.existsSync(credentialsFile)) {
    logOnOptions = JSON.parse(fs.readFileSync(credentialsFile));
} else {
    logOnOptions = { accountName: '', password: '' };
}

// Create screen
const screen = blessed.screen({
    smartCSR: true,
    title: 'Steam Bot Terminal UI'
});

// Main form box
const form = blessed.form({
    parent: screen,
    keys: true,
    mouse: true,
    left: 'center',
    top: 'center',
    width: '50%',
    height: '50%',
    border: 'line',
    label: 'Login to Steam',
    padding: 1
});

// Username input
const accountInput = blessed.textbox({
    parent: form,
    label: ' Account Name: ',
    top: 2,
    left: 2,
    width: '90%',
    height: 3,
    inputOnFocus: true,
    border: { type: 'line' },
    style: { fg: 'white', border: { fg: 'cyan' } }
});

// Password input
const passwordInput = blessed.textbox({
    parent: form,
    label: ' Password: ',
    top: 6,
    left: 2,
    width: '90%',
    height: 3,
    inputOnFocus: true,
    censor: true,
    border: { type: 'line' },
    style: { fg: 'white', border: { fg: 'cyan' } }
});

// Login button
const submitButton = blessed.button({
    parent: form,
    content: ' Login ',
    top: 10,
    left: 'center',
    shrink: true,
    border: 'line',
    style: { fg: 'green', border: { fg: 'white' }, focus: { bg: 'blue' } }
});

// Log box to display bot activity
const logBox = blessed.box({
    parent: screen,
    top: '70%',
    left: 'center',
    width: '80%',
    height: '25%',
    border: 'line',
    label: 'Logs',
    padding: 1,
    scrollable: true,
    alwaysScroll: true,
    scrollbar: { ch: '|' }
});

// Function to append logs
function logMessage(message) {
    logBox.setContent(logBox.getContent() + `\n${message}`);
    logBox.setScrollPerc(100); // Auto-scroll to bottom
    screen.render();
}

// Handle login
submitButton.on('press', () => {
    form.submit();
});

// Handle form submission
form.on('submit', () => {
    logOnOptions.accountName = accountInput.getValue();
    logOnOptions.password = passwordInput.getValue();
    fs.writeFileSync(credentialsFile, JSON.stringify(logOnOptions));
    form.hide();
    loginToSteam();
});

// Make input fields clickable
accountInput.on('click', () => accountInput.focus());
passwordInput.on('click', () => passwordInput.focus());
submitButton.on('click', () => form.submit());

// Focus handling
accountInput.focus();
screen.append(form);
screen.append(logBox);
screen.render();

// Fix Steam Guard window
function createSteamGuardWindow(callback) {
    screen.remove(form); // Remove the login form

    let guardForm = blessed.form({
        parent: screen,
        keys: true,
        mouse: true,
        left: 'center',
        top: 'center',
        width: '50%',
        height: '40%',
        border: 'line',
        label: 'Steam Guard Code',
        padding: 1
    });

    let guardInput = blessed.textbox({
        parent: guardForm,
        label: ' Code: ',
        top: 2,
        left: 2,
        width: '90%',
        height: 3,
        inputOnFocus: true,
        border: { type: 'line' },
        style: { fg: 'white', border: { fg: 'cyan' } }
    });

    let submitGuardButton = blessed.button({
        parent: guardForm,
        content: ' Submit ',
        top: 6,
        left: 'center',
        shrink: true,
        border: 'line',
        keys: true,
        mouse: true,
        focusable: true,
        padding: { left: 1, right: 1 },
        style: {
            fg: 'green',
            border: { fg: 'white' },
            focus: { bg: 'blue' }
        }
    });

    // ✅ FIXED: Ensure the button only submits ONCE
    let submitted = false;

    function submitCode() {
        if (submitted) return; // Prevent double submission
        submitted = true;

        let code = guardInput.getValue().trim();
        if (!code) {
            logMessage('Steam Guard code cannot be empty.');
            submitted = false; // Allow resubmission if empty
            return;
        }

        logMessage(`Steam Guard code entered: ${code}`);
        screen.remove(guardForm);
        screen.render();

        // ✅ FIX: Only send the Steam Guard code, DO NOT call logOn() again
        callback(code);
    }

    submitGuardButton.on('press', submitCode);
    guardInput.key('enter', submitCode);

    guardInput.on('click', () => guardInput.focus());
    submitGuardButton.on('click', submitCode);

    guardInput.focus();
    screen.append(guardForm);
    screen.render();
}

// Function to log into Steam
function loginToSteam() {
    logMessage('Attempting to log in...');
    client.logOn(logOnOptions); // ✅ This should only be called once

    client.on('steamGuard', (domain, callback) => {
        logMessage('Steam Guard code required.');
        createSteamGuardWindow(callback); // ✅ This only asks for the code, doesn't call logOn()
    });

    client.on('loggedOn', () => {
        logMessage('Successfully logged in! Playing games...');
        client.setPersona(SteamUser.EPersonaState.Online);
        client.gamesPlayed([730]);

        // ✅ FIXED: Call the correct function
        showGameWindow();
    });

    client.on('error', (err) => {
        logMessage(`Login failed: ${err.message}`);
    });

    client.on('disconnected', () => {
        logMessage('Disconnected from Steam.');
    });
}

// Function to display game status window
function showGameWindow() {  // FIXED: This function is now correctly used
    screen.children.forEach(child => screen.remove(child)); // Remove previous UI elements

    let gameBox = blessed.box({
        parent: screen,
        top: 'center',
        left: 'center',
        width: '50%',
        height: '30%',
        border: 'line',
        label: 'Bot is Playing Games',
        padding: 1,
        content: 'Currently playing: CS:GO (App ID: 730)', // Modify dynamically if needed
        align: 'center',
        style: { fg: 'green', border: { fg: 'white' } }
    });

    let exitButton = blessed.button({
        parent: screen,
        content: ' Exit ',
        top: '80%',
        left: 'center',
        shrink: true,
        border: 'line',
        style: { fg: 'red', border: { fg: 'white' }, focus: { bg: 'blue' } }
    });

    exitButton.on('press', () => {
        client.logOff();
        logMessage('Exiting Steam bot...');
        return process.exit(0);
    });

    screen.append(gameBox);
    screen.append(exitButton);
    exitButton.focus();
    screen.render();
}

// Enable keyboard navigation
screen.key(['tab'], () => {
    screen.focusNext();
});
screen.key(['S-tab'], () => {
    screen.focusPrevious();
});

screen.key(['q', 'C-c'], () => {
    client.logOff();
    logMessage('Exiting Steam bot...');
    return process.exit(0);
});
