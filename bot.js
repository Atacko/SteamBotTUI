const blessed = require('blessed');
const SteamUser = require('steam-user');
const fs = require('fs');

const client = new SteamUser();
const credentialsFile = 'steam_credentials.json';
const gamesFile = 'games_to_play.json';

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
    logBox.setScrollPerc(100);
    screen.render();
}

// Auto-login if credentials exist
if (fs.existsSync(credentialsFile)) {
    logMessage('Credentials file found. Skipping login form.');
    loginToSteam();
} else {
    showLoginForm();
}

// Function to show login form
function showLoginForm() {
    let form = blessed.form({
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

    let accountInput = blessed.textbox({
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

    let passwordInput = blessed.textbox({
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

    let submitButton = blessed.button({
        parent: form,
        content: ' Login ',
        top: 10,
        left: 'center',
        shrink: true,
        border: 'line',
        keys: true,
        mouse: true,
        padding: { left: 1, right: 1 },
        style: { fg: 'green', border: { fg: 'white' }, focus: { bg: 'blue' } }
    });

    function submitLogin() {
        let account = accountInput.getValue().trim();
        let password = passwordInput.getValue().trim();

        if (!account || !password) {
            logMessage('Account name and password cannot be empty.');
            return;
        }

        logMessage('Submitting login credentials...');
        logOnOptions.accountName = account;
        logOnOptions.password = password;
        fs.writeFileSync(credentialsFile, JSON.stringify(logOnOptions));

        screen.remove(form);
        screen.render();
        loginToSteam();
    }

    submitButton.on('press', submitLogin);
    accountInput.key('enter', submitLogin);
    passwordInput.key('enter', submitLogin);

    accountInput.focus();
    screen.append(form);
    screen.render();
}

// Function to create Steam Guard window
function createSteamGuardWindow(callback) {
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
        padding: { left: 1, right: 1 },
        style: { fg: 'green', border: { fg: 'white' }, focus: { bg: 'blue' } }
    });

    function submitCode() {
        let code = guardInput.getValue().trim();
        if (!code) {
            logMessage('Steam Guard code cannot be empty.');
            return;
        }

        logMessage(`Steam Guard code entered: ${code}`);
        screen.remove(guardForm);
        screen.render();
        callback(code);
    }

    submitGuardButton.on('press', submitCode);
    guardInput.key('enter', submitCode);

    guardInput.focus();
    screen.append(guardForm);
    screen.render();
}

// Function to log into Steam
function loginToSteam() {
    logMessage('Attempting to log in...');
    client.logOn(logOnOptions);

    client.on('steamGuard', (domain, callback) => {
        logMessage('Steam Guard code required.');
        createSteamGuardWindow(callback);
    });

    client.on('loggedOn', () => {
        logMessage('Successfully logged in!');
        client.setPersona(SteamUser.EPersonaState.Online);
        checkGamesToPlay();
    });

    client.on('error', (err) => {
        logMessage(`Login failed: ${err.message}`);
    });

    client.on('disconnected', () => {
        logMessage('Disconnected from Steam.');
    });
}

// Function to check if games_to_play.json exists
function checkGamesToPlay() {
    if (fs.existsSync(gamesFile)) {
        let games = JSON.parse(fs.readFileSync(gamesFile));
        startPlayingGames(games);
    } else {
        askForGameIDs();
    }
}

// Function to show the currently playing games window with an Exit button
function showCurrentlyPlayingWindow(gameIDs) {
    let playingBox = blessed.box({
        parent: screen,
        top: '20%',
        left: 'center',
        width: '50%',
        height: '40%',
        border: 'line',
        label: 'Currently Playing',
        padding: 1,
        content: gameIDs.length > 0 ? gameIDs.join('\n') : 'No games playing',
        style: { fg: 'white', border: { fg: 'cyan' } }
    });

    // Exit button to stop the bot
    let exitButton = blessed.button({
        parent: screen,
        content: ' Exit Bot ',
        top: '65%',
        left: 'center',
        shrink: true,
        border: 'line',
        keys: true,
        mouse: true,
        padding: { left: 1, right: 1 },
        style: { fg: 'red', border: { fg: 'white' }, focus: { bg: 'blue' } }
    });

    exitButton.on('press', () => {
        logMessage('Stopping the bot and logging out...');
        client.logOff();
        process.exit(0);
    });

    screen.render();
}

// Function to ask user for game IDs
function askForGameIDs() {
    let gameInputForm = blessed.form({
        parent: screen,
        keys: true,
        mouse: true,
        left: 'center',
        top: 'center',
        width: '50%',
        height: '40%',
        border: 'line',
        label: 'Enter Game IDs (comma-separated)',
        padding: 1
    });

    let gameInput = blessed.textbox({
        parent: gameInputForm,
        label: ' Game IDs: ',
        top: 2,
        left: 2,
        width: '90%',
        height: 3,
        inputOnFocus: true,
        border: { type: 'line' },
        style: { fg: 'white', border: { fg: 'cyan' } }
    });

    // Submit Button
    let submitButton = blessed.button({
        parent: gameInputForm,
        content: ' Submit ',
        top: 6,
        left: 'center',
        shrink: true,
        border: 'line',
        keys: true,
        mouse: true,
        padding: { left: 1, right: 1 },
        style: { fg: 'green', border: { fg: 'white' }, focus: { bg: 'blue' } }
    });

    function submitGames() {
        let games = gameInput.getValue().split(',')
            .map(id => parseInt(id.trim()))
            .filter(id => !isNaN(id));

        if (games.length === 0) {
            logMessage('Invalid input. Please enter valid game IDs.');
            return;
        }

        fs.writeFileSync(gamesFile, JSON.stringify(games));
        logMessage(`Game IDs entered: ${games.join(', ')}`);
        screen.remove(gameInputForm);
        screen.render();
        startPlayingGames(games);
    }

    submitButton.on('press', submitGames);
    gameInput.key('enter', submitGames);

    gameInput.focus();
    screen.append(gameInputForm);
    screen.render();
}

// Function to start playing games
function startPlayingGames(gameIDs) {
    logMessage(`Starting games: ${gameIDs.join(', ')}`);
    client.gamesPlayed(gameIDs);
    showCurrentlyPlayingWindow(gameIDs);
}
