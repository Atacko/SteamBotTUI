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
    style: { 
        fg: 'green',
        border: { fg: 'magenta' }, 
        label: { fg: 'green' }
    },
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
        top: '20%',
        width: '50%',
        height: '45%',
        border: 'line',
        style: { 
            fg: 'green',
            border: { fg: 'magenta' }, 
            label: { fg: 'green' }
        },
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
        style: { 
            fg: 'green',
            border: { fg: 'cyan' }, 
            label: { fg: 'green' }
        }
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
        style: { 
            fg: 'green',
            border: { fg: 'cyan' }, 
            label: { fg: 'green' }
        }
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
        style: { fg: 'green', border: { fg: 'cyan' }, focus: { bg: 'blue' } }
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
        style: { 
            fg: 'green',
            border: { fg: 'magenta' }, 
            label: { fg: 'green' }
        },
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
        style: { 
            fg: 'green',
            border: { fg: 'cyan' }, 
            label: { fg: 'green' }
        }
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
        style: { fg: 'green', border: { fg: 'cyan' }, focus: { bg: 'blue' } }
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
        askForCustomGame();
    }
}

// Function to show the currently playing games window
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
        style: { 
            fg: 'green',
            border: { fg: 'magenta' }, 
            label: { fg: 'green' }
        }
    });

    // Start Games Button
    let startGamesButton = blessed.button({
        parent: screen,
        content: ' Start Games ',
        top: '61%',
        left: '30%',
        shrink: true,
        border: 'line',
        keys: true,
        mouse: true,
        padding: { left: 1, right: 1 },
        style: { fg: 'green', border: { fg: 'cyan' } }
    });

    startGamesButton.on('press', () => {
        if (fs.existsSync(gamesFile)) {
            let games = JSON.parse(fs.readFileSync(gamesFile));
            client.gamesPlayed(games);
            logMessage(`Resumed playing games: ${games.join(', ')}`);
            playingBox.setContent(games.length > 0 ? games.join('\n') : 'No games playing');
            screen.render();
        } else {
            logMessage('No game list found.');
        }
    });

    // Quit Games Button
    let quitGamesButton = blessed.button({
        parent: screen,
        content: ' Stop Games ',
        top: '61%',
        left: '46%',
        shrink: true,
        border: 'line',
        keys: true,
        mouse: true,
        padding: { left: 1, right: 1 },
        style: { fg: 'yellow', border: { fg: 'cyan' } }
    });

    quitGamesButton.on('press', () => {
        client.gamesPlayed([]);
        client.gamesPlayed([0]);
    
        setTimeout(() => {
            client.setPersona(SteamUser.EPersonaState.Online);
        }, 1000);
    
        logMessage('Forced stop: No games should be running now.');
        playingBox.setContent('No games playing');
        screen.render();
    });    

    // Exit Bot Button
    let exitBotButton = blessed.button({
        parent: screen,
        content: ' Exit Bot ',
        top: '61%',
        left: '62%',
        shrink: true,
        border: 'line',
        keys: true,
        mouse: true,
        padding: { left: 1, right: 1 },
        style: { fg: 'red', border: { fg: 'cyan' } }
    });

    exitBotButton.on('press', () => {
        logMessage('Exiting bot...');
        client.logOff();
        process.exit(0);
    });

    screen.render();
}

function askForCustomGame() {
    let customGameForm = blessed.form({
        parent: screen,
        keys: true,
        mouse: true,
        left: 'center',
        top: 'center',
        width: '50%',
        height: '40%',
        border: 'line',
        style: { 
            fg: 'green',
            border: { fg: 'magenta' }, 
            label: { fg: 'green' }
        },
        label: 'Add a Custom Game?',
        padding: 1
    });

    let customGameInput = blessed.textbox({
        parent: customGameForm,
        label: ' Custom Game Name: ',
        top: 2,
        left: 2,
        width: '90%',
        height: 3,
        inputOnFocus: true,
        border: { type: 'line' },
        style: { 
            fg: 'green',
            border: { fg: 'cyan' }, 
            label: { fg: 'green' }
        }
    });

    let submitButton = blessed.button({
        parent: customGameForm,
        content: ' Submit ',
        top: 6,
        left: '25%',
        shrink: true,
        border: 'line',
        keys: true,
        mouse: true,
        padding: { left: 1, right: 1 },
        style: { fg: 'green', border: { fg: 'cyan' }, focus: { bg: 'blue' } }
    });

    let skipButton = blessed.button({
        parent: customGameForm,
        content: ' No Thanks ',
        top: 6,
        left: '55%',
        shrink: true,
        border: 'line',
        keys: true,
        mouse: true,
        padding: { left: 1, right: 1 },
        style: { fg: 'red', border: { fg: 'cyan' }, focus: { bg: 'red' } }
    });

    function submitCustomGame() {
        let customGame = customGameInput.getValue().trim();

        if (customGame) {
            logMessage(`Custom game added: ${customGame}`);
            screen.remove(customGameForm);
            screen.render();
            askForGameIDs(customGame);
        } else {
            logMessage('No custom game entered.');
            screen.remove(customGameForm);
            screen.render();
            askForGameIDs(null);
        }
    }

    function skipCustomGame() {
        logMessage('Skipping custom game addition.');
        screen.remove(customGameForm);
        screen.render();
        askForGameIDs(null);
    }

    submitButton.on('press', submitCustomGame);
    skipButton.on('press', skipCustomGame);
    customGameInput.key('enter', submitCustomGame);

    customGameInput.focus();
    screen.append(customGameForm);
    screen.render();
}

// Function to ask user for game IDs
function askForGameIDs(customGame) {
    let gameInputForm = blessed.form({
        parent: screen,
        keys: true,
        mouse: true,
        left: 'center',
        top: 'center',
        width: '50%',
        height: '40%',
        border: 'line',
        style: { 
            fg: 'green',
            border: { fg: 'magenta' }, 
            label: { fg: 'green' }
        },
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
        style: { 
            fg: 'green',
            border: { fg: 'cyan' }, 
            label: { fg: 'green' }
        },
    });

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
        style: { fg: 'green', border: { fg: 'cyan' } }
    });

    function submitGames() {
        let games = gameInput.getValue().split(',')
            .map(id => id.trim())
            .filter(id => id)
            .map(id => (/^\d+$/.test(id) ? parseInt(id, 10) : id));

        if (games.length === 0) {
            logMessage('Invalid input. Please enter valid game IDs.');
            return;
        }

        if (customGame) {
            games.unshift(customGame);
        }

        fs.writeFileSync(gamesFile, JSON.stringify(games, null, 2));
        logMessage(`Games entered: ${games.join(', ')}`);
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
