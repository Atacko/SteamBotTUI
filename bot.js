const blessed = require("blessed")
const SteamUser = require("steam-user")
const fs = require("fs")
const { showIntro } = require("./intro")

function checkTerminalSize() {
  const minWidth = 170
  const minHeight = 45

  function getCurrentSize() {
    return {
      width: process.stdout.columns || 80,
      height: process.stdout.rows || 24,
    }
  }

  function createSizeDisplay(current, required) {
    const boxWidth = 90
    const topBorder = "╔" + "═".repeat(boxWidth - 2) + "╗"
    const bottomBorder = "╚" + "═".repeat(boxWidth - 2) + "╝"
    const sideBorder = "║" + " ".repeat(boxWidth - 2) + "║"
    const titleBorder = "╠" + "═".repeat(boxWidth - 2) + "╣"

    function centerText(text, width = boxWidth - 2) {
      const spaces = Math.max(0, width - text.length)
      const leftSpaces = Math.floor(spaces / 2)
      const rightSpaces = spaces - leftSpaces
      return "║" + " ".repeat(leftSpaces) + text + " ".repeat(rightSpaces) + "║"
    }

    return `\x1b[2J\x1b[H\x1b[31m${topBorder}\x1b[0m
\x1b[31m${centerText("TERMINAL SIZE ERROR")}\x1b[0m
\x1b[31m${titleBorder}\x1b[0m
\x1b[33m${centerText("Your terminal window is too small to run Steam Bot Advanced UI")}\x1b[0m
\x1b[33m${sideBorder}\x1b[0m
\x1b[33m${centerText("REQUIRED SIZE:")}\x1b[0m
\x1b[32m${centerText(`${required.width} x ${required.height} (Width x Height)`)}\x1b[0m
\x1b[33m${sideBorder}\x1b[0m
\x1b[33m${centerText("CURRENT SIZE:")}\x1b[0m
\x1b[36m${centerText(`${current.width} x ${current.height} (Width x Height)`)}\x1b[0m
\x1b[32m${centerText("Please resize your terminal window...")}\x1b[0m
\x1b[32m${centerText("Bot will start automatically when size requirements are met!")}\x1b[0m
\x1b[33m${sideBorder}\x1b[0m
\x1b[90m${centerText("Press Ctrl+C to exit")}\x1b[0m
\x1b[31m${bottomBorder}\x1b[0m

\x1b[33m[WAIT] Waiting for terminal resize... (Updates live)\x1b[0m`
  }

  function checkAndDisplay() {
    const current = getCurrentSize()
    const required = { width: minWidth, height: minHeight }

    if (current.width >= minWidth && current.height >= minHeight) {
      console.clear()
      console.log("\x1b[32m[OK] Terminal size requirements met! Starting Steam Bot...\x1b[0m")
      return true
    } else {
      console.log(createSizeDisplay(current, required))
      return false
    }
  }

  if (checkAndDisplay()) {
    return true
  }

  let resizeTimeout
  process.stdout.on("resize", () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      if (checkAndDisplay()) {
        setTimeout(async () => {
          await showIntro()
          initializeBot()
        }, 1000)
      }
    }, 100)
  })

  const sizeCheckInterval = setInterval(() => {
    if (checkAndDisplay()) {
      clearInterval(sizeCheckInterval)
      setTimeout(async () => {
        await showIntro()
        initializeBot()
      }, 1000)
    }
  }, 1000)

  process.on("SIGINT", () => {
    console.clear()
    console.log("\x1b[33m[BYE] Steam Bot startup cancelled by user.\x1b[0m")
    process.exit(0)
  })

  return false
}

function initializeBot() {
  console.clear()

  const client = new SteamUser()
  const credentialsFile = "steam_credentials.json"
  const gamesFile = "games_to_play.json"

  let logOnOptions = {}
  if (fs.existsSync(credentialsFile)) {
    logOnOptions = JSON.parse(fs.readFileSync(credentialsFile))
  } else {
    logOnOptions = { accountName: "", password: "" }
  }

  const screen = blessed.screen({
    smartCSR: true,
    title: "Steam Bot TUI",
    fullUnicode: true,
    dockBorders: false,
    autoPadding: false,
    warnings: false,
  })

  screen.key("tab", () => {
    return false
  })

  const colors = {
    primary: "cyan",
    secondary: "red",
    success: "green",
    warning: "yellow",
    danger: "red",
    dark: "black",
    light: "white",
    accent: "magenta",
  }

  const header = blessed.box({
    parent: screen,
    top: 0,
    left: 0,
    width: "100%",
    height: 10,
    content: `

\x1b[31m███████╗\x1b[33m████████╗\x1b[32m███████╗\x1b[36m █████╗ \x1b[34m███╗   ███╗    \x1b[35m██████╗ \x1b[31m ██████╗ \x1b[33m████████╗   \x1b[32m████████╗\x1b[36m██╗   ██╗\x1b[34m██╗\x1b[0m
\x1b[33m██╔════╝\x1b[32m╚══██╔══╝\x1b[36m██╔════╝\x1b[34m██╔══██╗\x1b[35m████╗ ████║    \x1b[31m██╔══██╗\x1b[33m██╔═══██╗\x1b[32m╚══██╔══╝   \x1b[36m╚══██╔══╝\x1b[34m██║   ██║\x1b[35m██║\x1b[0m
\x1b[32m███████╗\x1b[36m   ██║   \x1b[34m█████╗  \x1b[35m███████║\x1b[31m██╔████╔██║    \x1b[33m██████╔╝\x1b[32m██║   ██║\x1b[36m   ██║         \x1b[34m██║   \x1b[35m██║   ██║\x1b[31m██║\x1b[0m
\x1b[36m╚════██║\x1b[34m   ██║   \x1b[35m██╔══╝  \x1b[31m██╔══██║\x1b[33m██║╚██╔╝██║    \x1b[32m██╔══██╗\x1b[36m██║   ██║\x1b[34m   ██║         \x1b[35m██║   \x1b[31m╚██╗ ██╔╝\x1b[33m██║\x1b[0m
\x1b[34m███████║\x1b[35m   ██║   \x1b[31m███████╗\x1b[33m██║  ██║\x1b[32m██║ ╚═╝ ██║    \x1b[36m██████╔╝\x1b[34m╚██████╔╝\x1b[35m   ██║         \x1b[31m██║   \x1b[33m ╚████╔╝ \x1b[32m██║\x1b[0m
\x1b[35m╚══════╝\x1b[31m   ╚═╝   \x1b[33m╚══════╝\x1b[32m╚═╝  ╚═╝\x1b[36m╚═╝     ╚═╝    \x1b[34m╚═════╝ \x1b[35m ╚═════╝ \x1b[31m   ╚═╝         \x1b[33m╚═╝   \x1b[32m  ╚═══╝  \x1b[36m╚═╝\x1b[0m

`,
    style: {
      fg: colors.primary,
      bold: true,
    },
  })

  const statusBar = blessed.box({
    parent: screen,
    top: 10,
    left: 0,
    width: "100%",
    height: 3,
    content: "OFFLINE | Games: 0 | Uptime: 00:00:00 | Memory: 0MB",
    style: {
      fg: colors.warning,
      bg: colors.dark,
      bold: true,
    },
    padding: {
      left: 2,
      right: 2,
    },
  })

  const mainContent = blessed.box({
    parent: screen,
    top: 13,
    left: 0,
    width: "100%",
    height: "100%-16",
    border: "line",
    style: {
      border: { fg: colors.primary },
    },
  })

  const tabHeaders = blessed.listbar({
    parent: mainContent,
    top: 0,
    left: 0,
    width: "100%",
    height: 3,
    commands: {
      Dashboard: { keys: ["d"] },
      Games: { keys: ["g"] },
      Logs: { keys: ["l"] },
    },
    style: {
      bg: colors.dark,
      item: { fg: colors.light },
      selected: { fg: colors.primary, bg: "blue" },
    },
  })

  const dashboardContent = blessed.box({
    parent: mainContent,
    top: 3,
    left: 0,
    width: "100%",
    height: "100%-3",
    hidden: false,
  })

  const gamesContent = blessed.box({
    parent: mainContent,
    top: 3,
    left: 0,
    width: "100%",
    height: "100%-3",
    hidden: true,
  })

  const logsContent = blessed.box({
    parent: mainContent,
    top: 3,
    left: 0,
    width: "100%",
    height: "100%-3",
    hidden: true,
  })

  const connectionWidget = blessed.box({
    parent: dashboardContent,
    top: 1,
    left: 2,
    width: 80,
    height: 8,
    border: "line",
    label: " Connection Status ",
    style: {
      border: { fg: colors.secondary },
      label: { fg: colors.secondary },
    },
    content: `
Status: * DISCONNECTED
Account: Not logged in
Persona: Offline
Last Login: Never
Connection Time: 00:00:00`,
    padding: 1,
  })

  const gamesWidget = blessed.box({
    parent: dashboardContent,
    top: 1,
    left: 86,
    width: 80,
    height: 8,
    border: "line",
    label: " Games Status ",
    style: {
      border: { fg: colors.success },
      label: { fg: colors.success },
    },
    content: `
Currently Playing: None
Total Games: 0
Custom Games: 0
Last Updated: Never
Auto-restart: Disabled`,
    padding: 1,
  })

  const systemWidget = blessed.box({
    parent: dashboardContent,
    top: 10,
    left: 2,
    width: 80,
    height: 6,
    border: "line",
    label: " System Info ",
    style: {
      border: { fg: colors.warning },
      label: { fg: colors.warning },
    },
    content: `
Uptime: 00:00:00
Memory Usage: 0 MB
CPU Usage: 0%
Node Version: ${process.version}`,
    padding: 1,
  })

  const controlWidget = blessed.box({
    parent: dashboardContent,
    top: 10,
    left: 86,
    width: 80,
    height: 6,
    border: "line",
    label: " Quick Controls ",
    style: {
      border: { fg: colors.accent },
      label: { fg: colors.accent },
    },
    padding: 1,
  })

  const startButton = blessed.button({
    parent: controlWidget,
    content: " [>] START GAMES ",
    top: 1,
    left: 9,
    width: 30,
    height: 3,
    border: "line",
    style: {
      fg: "black",
      bg: colors.success,
      border: { fg: colors.success },
      focus: { bg: colors.primary },
    },
    mouse: true,
  })

  const stopButton = blessed.button({
    parent: controlWidget,
    content: " [■] STOP GAMES ",
    top: 1,
    left: 41,
    width: 30,
    height: 3,
    border: "line",
    style: {
      fg: "black",
      bg: colors.warning,
      border: { fg: colors.warning },
      focus: { bg: colors.primary },
    },
    mouse: true,
  })

  const gamesList = blessed.list({
    parent: gamesContent,
    top: 1,
    left: 2,
    width: 100,
    height: 20,
    border: "line",
    label: " Games List - Use ↑↓ to select, +/- to add/remove ",
    style: {
      border: { fg: colors.primary },
      selected: { bg: colors.primary, fg: "black" },
      item: { fg: colors.light },
    },
    keys: true,
    mouse: true,
    scrollable: true,
    scrollbar: {
      ch: "█",
      style: { bg: colors.primary },
    },
  })

  const gameControls = blessed.box({
    parent: gamesContent,
    top: 1,
    left: 106,
    width: 60,
    height: 20,
    border: "line",
    label: " Game Controls ",
    style: {
      border: { fg: colors.secondary },
    },
    padding: 1,
  })

  const addGameButton = blessed.button({
    parent: gameControls,
    content: " [+] ADD GAME ",
    top: 1,
    left: 2,
    width: 50,
    height: 3,
    border: "line",
    style: {
      fg: "black",
      bg: colors.success,
      border: { fg: colors.success },
      focus: { bg: colors.primary },
    },
    mouse: true,
  })

  const removeGameButton = blessed.button({
    parent: gameControls,
    content: " [-] REMOVE GAME ",
    top: 5,
    left: 2,
    width: 50,
    height: 3,
    border: "line",
    style: {
      fg: "black",
      bg: colors.danger,
      border: { fg: colors.danger },
      focus: { bg: colors.primary },
    },
    mouse: true,
  })

  removeGameButton.on("press", () => {
    logMessage(`Remove button pressed. Current games: ${currentGames.length}`, "info")

    if (currentGames.length === 0) {
      logMessage("No games in the list to remove.", "error")
      return
    }

    const selectedIndex = gamesList.selected
    logMessage(`Selected index: ${selectedIndex}, Games length: ${currentGames.length}`, "info")

    if (selectedIndex < 0 || selectedIndex >= currentGames.length) {
      logMessage("Please select a game from the list to remove.", "error")
      return
    }

    const gameToRemove = currentGames[selectedIndex]
    logMessage(`Removing game at index ${selectedIndex}: ${gameToRemove}`, "warning")

    const newGames = []
    for (let i = 0; i < currentGames.length; i++) {
      if (i !== selectedIndex) {
        newGames.push(currentGames[i])
      }
    }

    logMessage(`Before removal: ${currentGames.length} games. After removal: ${newGames.length} games`, "info")

    currentGames = newGames

    if (currentGames.length === 0) {
      if (fs.existsSync(gamesFile)) {
        fs.unlinkSync(gamesFile)
        logMessage("All games removed. Deleted games file.", "warning")
      }
      if (isLoggedIn) {
        client.gamesPlayed([])
      }
    } else {
      fs.writeFileSync(gamesFile, JSON.stringify(currentGames, null, 2))
      logMessage(`Saved ${currentGames.length} remaining games to file`, "info")
      if (isLoggedIn) {
        client.gamesPlayed(currentGames)
      }
    }

    updateGamesList()
    updateGamesWidget()

    if (currentTab === "games") {
      setTimeout(() => {
        gamesList.focus()
        screen.render()
      }, 100)
    }

    logMessage(`Successfully removed: ${gameToRemove}. Remaining: ${currentGames.length}`, "success")
  })

  const logBox = blessed.log({
    parent: logsContent,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    border: "line",
    style: {
      fg: colors.success,
      border: { fg: colors.primary },
    },
    label: " System Logs ",
    padding: 1,
    scrollable: true,
    alwaysScroll: true,
    scrollbar: {
      ch: "█",
      style: { bg: colors.primary },
    },
    mouse: true,
  })

  const footer = blessed.box({
    parent: screen,
    bottom: 0,
    left: 0,
    width: "100%",
    height: 3,
    content: " [*] SHORTCUTS: [D]ashboard | [G]ames | [L]ogs | [Q]uit | [B] Start Games | [N] Stop Games ",
    style: {
      fg: colors.primary,
      bg: colors.dark,
      bold: true,
    },
    padding: {
      left: 2,
      right: 2,
    },
  })

  let isLoggedIn = false
  let currentGames = []
  const startTime = Date.now()
  let connectionTime = null
  let currentTab = "dashboard"
  let modalDepth = 0
  let isSettingUpGames = false
  let hasInitializedGames = false

  function registerModal(overlay, focusEl) {
    modalDepth++
    if (typeof overlay.setFront === "function") overlay.setFront()
    setTimeout(() => {
      if (focusEl && typeof focusEl.focus === "function") {
        focusEl.focus()
      } else if (typeof overlay.focus === "function") {
        overlay.focus()
      }
      screen.render()
    }, 10)
    const dec = () => {
      modalDepth = Math.max(0, modalDepth - 1)
    }
    overlay.once("detach", dec)
    overlay.once("destroy", dec)
  }

  function restoreMainFocus() {
    modalDepth = 0
    setTimeout(() => {
      try {
        if (currentTab === "games") {
          if (typeof gamesList.focus === "function") gamesList.focus()
        } else {
          if (typeof tabHeaders.focus === "function") tabHeaders.focus()
        }
        screen.render()
      } catch (_) {
      }
    }, 10)
  }

  function logMessage(message, type = "info") {
    const timestamp = new Date().toLocaleTimeString()
    const icons = {
      info: "[LOG]",
      success: "[OK]",
      warning: "[!]",
      error: "[X]",
      steam: "[GAME]",
    }

    const colors_log = {
      info: "white",
      success: "green",
      warning: "yellow",
      error: "red",
      steam: "cyan",
    }

    const formattedMessage = `{${colors_log[type]}-fg}[${timestamp}] ${icons[type]} ${message}{/}`
    logBox.log(formattedMessage)
    screen.render()
  }

  function updateStatusBar() {
    const uptime = Math.floor((Date.now() - startTime) / 1000)
    const hours = Math.floor(uptime / 3600)
    const minutes = Math.floor((uptime % 3600) / 60)
    const seconds = uptime % 60
    const uptimeStr = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

    const memUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    const status = isLoggedIn ? "* ONLINE" : "* OFFLINE"

    statusBar.setContent(`${status} | Games: ${currentGames.length} | Uptime: ${uptimeStr} | Memory: ${memUsage}MB`)
    statusBar.style.fg = isLoggedIn ? colors.success : colors.danger
    screen.render()
  }

  function updateConnectionWidget() {
    const status = isLoggedIn ? "CONNECTED" : "DISCONNECTED"
    const account = logOnOptions.accountName || "Not logged in"
    const persona = isLoggedIn ? "Online" : "Offline"
    const lastLogin = connectionTime ? connectionTime.toLocaleString() : "Never"
    const connTime = connectionTime ? Math.floor((Date.now() - connectionTime.getTime()) / 1000) : 0
    const connTimeStr = connectionTime
      ? `${Math.floor(connTime / 3600)}:${Math.floor((connTime % 3600) / 60)
          .toString()
          .padStart(2, "0")}:${(connTime % 60).toString().padStart(2, "0")}`
      : "00:00:00"

    connectionWidget.setContent(`
Status: ${status}
Account: ${account}
Persona: ${persona}
Last Login: ${lastLogin}
Connection Time: ${connTimeStr}`)
    screen.render()
  }

  function updateGamesWidget() {
    const currentlyPlaying =
      currentGames.length > 0 ? currentGames.slice(0, 3).join(", ") + (currentGames.length > 3 ? "..." : "") : "None"
    const totalGames = currentGames.length
    const customGames = currentGames.filter((game) => typeof game === "string").length

    gamesWidget.setContent(`
Currently Playing: ${currentlyPlaying}
Total Games: ${totalGames}
Custom Games: ${customGames}
Last Updated: ${new Date().toLocaleTimeString()}
Auto-restart: Disabled`)
    screen.render()
  }

  function updateSystemWidget() {
    const uptime = Math.floor((Date.now() - startTime) / 1000)
    const hours = Math.floor(uptime / 3600)
    const minutes = Math.floor((uptime % 3600) / 60)
    const seconds = uptime % 60
    const uptimeStr = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    const memUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024)

    systemWidget.setContent(`
Uptime: ${uptimeStr}
Memory Usage: ${memUsage} MB
CPU Usage: ${Math.floor(Math.random() * 10)}%
Node Version: ${process.version}`)
    screen.render()
  }

  const tabs = {
    dashboard: dashboardContent,
    games: gamesContent,
    logs: logsContent,
  }

  function switchTab(tabName) {
    Object.values(tabs).forEach((tab) => tab.hide())
    tabs[tabName].show()
    currentTab = tabName

    if (tabName === "games") {
      setTimeout(() => {
        gamesList.focus()
        screen.render()
      }, 50)
    }

    updateFooter()
    screen.render()
  }

  function updateFooter() {
    let shortcuts = " [*] SHORTCUTS: [D]ashboard | [G]ames | [L]ogs | [Q]uit | [B] Start Games | [N] Stop Games"

    if (currentTab === "games") {
      shortcuts += " | [+] Add Game | [-] Remove Game | [↑↓] Select Game"
    }

    footer.setContent(shortcuts)
    screen.render()
  }

  function createCustomInput(parent, options) {
    const inputBox = blessed.box({
      parent: parent,
      top: options.top,
      left: options.left,
      width: options.width,
      height: options.height,
      border: { type: "line" },
      style: {
        fg: options.style?.fg || colors.primary,
        border: { fg: options.style?.border?.fg || colors.secondary },
      },
      label: options.label,
      mouse: true,
      keys: true,
    })

    let inputValue = options.value || ""
    let isActive = false
    let cursorPos = inputValue.length
    let cursorVisible = true
    let blinkInterval = null

    function startBlinking() {
      if (blinkInterval) clearInterval(blinkInterval)
      cursorVisible = true
      blinkInterval = setInterval(() => {
        if (isActive) {
          cursorVisible = !cursorVisible
          updateDisplay()
        }
      }, 500)
    }

    function stopBlinking() {
      if (blinkInterval) {
        clearInterval(blinkInterval)
        blinkInterval = null
      }
      cursorVisible = false
    }

    function updateDisplay() {
      let displayText = inputValue
      if (options.censor && displayText) {
        displayText = "*".repeat(displayText.length)
      }

      if (isActive) {
        const beforeCursor = displayText.substring(0, cursorPos)
        const afterCursor = displayText.substring(cursorPos)
        const cursor = cursorVisible ? "█" : " "
        displayText = beforeCursor + cursor + afterCursor
        inputBox.style.border.fg = colors.primary
      } else {
        inputBox.style.border.fg = options.style?.border?.fg || colors.secondary
      }

      inputBox.setContent(` ${displayText}`)
      screen.render()
    }

    function activate() {
      isActive = true
      cursorPos = inputValue.length
      startBlinking()
      inputBox.focus()
      updateDisplay()
    }

    function deactivate() {
      isActive = false
      stopBlinking()
      updateDisplay()
    }

    inputBox.on("click", () => {
      activate()
    })

    inputBox.on("keypress", (ch, key) => {
      if (!isActive) return

      if (key.name === "enter") {
        deactivate()
        if (options.onEnter) {
          options.onEnter(inputValue)
        }
        return
      }

      if (key.name === "escape") {
        deactivate()
        return
      }

      if (key.name === "backspace") {
        if (cursorPos > 0) {
          inputValue = inputValue.substring(0, cursorPos - 1) + inputValue.substring(cursorPos)
          cursorPos--
          updateDisplay()
        }
        return
      }

      if (key.name === "left") {
        if (cursorPos > 0) {
          cursorPos--
          updateDisplay()
        }
        return
      }

      if (key.name === "right") {
        if (cursorPos < inputValue.length) {
          cursorPos++
          updateDisplay()
        }
        return
      }

      if (ch && ch.length === 1 && ch >= " " && ch <= "~") {
        inputValue = inputValue.substring(0, cursorPos) + ch + inputValue.substring(cursorPos)
        cursorPos++
        updateDisplay()
      }
    })

    inputBox.getValue = () => inputValue
    inputBox.setValue = (value) => {
      inputValue = value || ""
      cursorPos = inputValue.length
      updateDisplay()
    }
    inputBox.activate = activate
    inputBox.deactivate = deactivate
    inputBox.isActive = () => isActive

    inputBox.on("destroy", () => {
      stopBlinking()
    })

    updateDisplay()
    return inputBox
  }

  function showLoginForm() {
    const loginOverlay = blessed.box({
      parent: screen,
      top: "center",
      left: "center",
      width: 90,
      height: 18,
      border: "line",
      style: {
        fg: colors.primary,
        border: { fg: colors.primary },
        bg: "black",
      },
      label: " Steam Login ",
      padding: 2,
    })

    modalDepth++
    const decLogin = () => {
      modalDepth = Math.max(0, modalDepth - 1)
    }
    loginOverlay.once("detach", decLogin)
    loginOverlay.once("destroy", decLogin)

    const loginTitle = blessed.text({
      parent: loginOverlay,
      top: 1,
      left: "center",
      content: "STEAM AUTHENTICATION (press enter or use your mouse to change field)",
      style: {
        fg: colors.secondary,
        bold: true,
      },
    })

    const accountInput = createCustomInput(loginOverlay, {
      label: " Account Name: ",
      top: 4,
      left: 2,
      width: "90%",
      height: 3,
      value: logOnOptions.accountName || "",
      style: {
        fg: colors.primary,
        border: { fg: colors.secondary },
      },
      onEnter: (value) => {
        accountInput.deactivate()
        setTimeout(() => {
          passwordInput.activate()
          screen.render()
        }, 10)
      },
    })

    const passwordInput = createCustomInput(loginOverlay, {
      label: " Password: ",
      top: 8,
      left: 2,
      width: "90%",
      height: 3,
      censor: true,
      style: {
        fg: colors.primary,
        border: { fg: colors.secondary },
      },
      onEnter: (value) => {
        passwordInput.deactivate()
        submitLogin()
      },
    })

    registerModal(loginOverlay, accountInput)

    setTimeout(() => {
      if (typeof accountInput.activate === "function") {
        accountInput.activate()
      }
      screen.render()
    }, 50)

    const loginButton = blessed.button({
      parent: loginOverlay,
      content: " LOGIN TO STEAM ",
      top: 12,
      left: "center",
      width: 22,
      height: 3,
      border: "line",
      keys: true,
      mouse: true,
      style: {
        fg: "black",
        bg: colors.success,
        border: { fg: colors.success },
        focus: { bg: colors.primary },
      },
    })

    function submitLogin() {
      const account = accountInput.getValue().trim()
      const password = passwordInput.getValue().trim()

      if (!account || !password) {
        logMessage("Account name and password cannot be empty.", "error")
        return
      }

      logMessage("Submitting login credentials...", "steam")
      logOnOptions.accountName = account
      logOnOptions.password = password

      screen.remove(loginOverlay)
      screen.render()
      restoreMainFocus()
      loginToSteam()
    }

    loginOverlay.on("click", (data) => {
      if (!accountInput.isActive() && !passwordInput.isActive()) {
        accountInput.deactivate()
        passwordInput.deactivate()
      }
    })

    loginButton.on("press", () => {
      submitLogin()
    })

    loginButton.key("enter", () => {
      submitLogin()
    })

    passwordInput.deactivate()
  }

  function createSteamGuardWindow(callback) {
    const guardOverlay = blessed.box({
      parent: screen,
      top: "center",
      left: "center",
      width: 60,
      height: 15,
      border: "line",
      style: {
        fg: colors.warning,
        border: { fg: colors.warning },
        bg: "black",
      },
      label: " Steam Guard Required ",
      padding: 2,
    })

    modalDepth++
    const decGuard = () => {
      modalDepth = Math.max(0, modalDepth - 1)
    }
    guardOverlay.once("detach", decGuard)
    guardOverlay.once("destroy", decGuard)

    const guardTitle = blessed.text({
      parent: guardOverlay,
      top: 1,
      left: "center",
      content: "STEAM GUARD AUTHENTICATION",
      style: {
        fg: colors.warning,
        bold: true,
      },
    })

    const guardInput = createCustomInput(guardOverlay, {
      label: " Enter Code: ",
      top: 4,
      left: 2,
      width: "90%",
      height: 3,
      style: {
        fg: colors.warning,
        border: { fg: colors.warning },
      },
      onEnter: (value) => {
        submitCode()
      },
    })

    registerModal(guardOverlay, guardInput)

    const submitButton = blessed.button({
      parent: guardOverlay,
      content: " VERIFY ",
      top: 8,
      left: "center",
      width: 14,
      height: 3,
      border: "line",
      keys: true,
      mouse: true,
      style: {
        fg: "black",
        bg: colors.success,
        border: { fg: colors.success },
        focus: { bg: colors.primary },
      },
    })

    function submitCode() {
      const code = guardInput.getValue().trim()

      if (!code) {
        logMessage("Steam Guard code cannot be empty.", "error")
        return
      }

      logMessage(`Steam Guard code entered: ${code}`, "steam")
      screen.remove(guardOverlay)
      screen.render()
      restoreMainFocus()

      try {
        callback(code)
      } catch (error) {
        logMessage("Invalid Steam Guard code. Please try again.", "error")
        setTimeout(() => createSteamGuardWindow(callback), 1000)
      }
    }

    submitButton.on("press", () => {
      submitCode()
    })

    submitButton.key("enter", () => {
      submitCode()
    })

    guardOverlay.key("escape", () => {
      screen.remove(guardOverlay)
      screen.render()
      restoreMainFocus()
    })

    setTimeout(() => {
      guardInput.activate()
      screen.render()
    }, 50)
  }

  function loginToSteam() {
    logMessage("Attempting to log in...", "steam")

    client.removeAllListeners()

    client.logOn(logOnOptions)

    client.once("steamGuard", (domain, callback, lastCodeWrong) => {
      if (lastCodeWrong) {
        logMessage("Invalid Steam Guard code. Please try again.", "error")
      } else {
        logMessage("Steam Guard code required.", "warning")
      }
      createSteamGuardWindow(callback)
    })

    client.once("loggedOn", () => {
      logMessage("Successfully logged in!", "success")
      isLoggedIn = true
      connectionTime = new Date()

      fs.writeFileSync(credentialsFile, JSON.stringify(logOnOptions))

      client.setPersona(SteamUser.EPersonaState.Online)
      updateConnectionWidget()
      updateStatusBar()

      if (!hasInitializedGames) {
        hasInitializedGames = true
        checkGamesToPlay()
      } else if (currentGames.length > 0) {
        client.gamesPlayed(currentGames)
        logMessage(`Resumed playing existing games: ${currentGames.join(", ")}`, "steam")
      }
    })

    client.once("error", (err) => {
      logMessage(`Login failed: ${err.message}`, "error")
      isLoggedIn = false
      connectionTime = null
      updateConnectionWidget()
      updateStatusBar()

      setTimeout(() => showLoginForm(), 1000)
    })

    client.once("disconnected", () => {
      logMessage("Disconnected from Steam.", "warning")
      isLoggedIn = false
      connectionTime = null
      updateConnectionWidget()
      updateStatusBar()
    })
  }

  function checkGamesToPlay() {
    logMessage("Checking games to play...", "info")

    if (fs.existsSync(gamesFile)) {
      try {
        const games = JSON.parse(fs.readFileSync(gamesFile))
        if (Array.isArray(games) && games.length > 0) {
          currentGames = games
          updateGamesList()
          startPlayingGames(games)
          logMessage(`Loaded ${games.length} games from file`, "success")
        } else {
          logMessage("Games file exists but is empty, starting setup", "info")
          askForCustomGame()
        }
      } catch (error) {
        logMessage(`Error reading games file: ${error.message}`, "error")
        askForCustomGame()
      }
    } else {
      logMessage("No games file found, starting setup", "info")
      askForCustomGame()
    }
  }

  function updateGamesList() {
    gamesList.clearItems()
    currentGames.forEach((game) => {
      const displayName = typeof game === "string" ? `[NAME] ${game}` : `[GAME] Game ID: ${game}`
      gamesList.addItem(displayName)
    })
    updateGamesWidget()
    screen.render()
  }

  function startPlayingGames(gameIDs) {
    logMessage(`Starting games: ${gameIDs.join(", ")}`, "steam")
    client.gamesPlayed(gameIDs)

    currentGames = gameIDs
    updateGamesList()
    updateGamesWidget()
  }

  function askForCustomGame(isFromAddButton = false) {
    const customOverlay = blessed.box({
      parent: screen,
      top: "center",
      left: "center",
      width: 60,
      height: 15,
      border: "line",
      style: {
        fg: colors.secondary,
        border: { fg: colors.secondary },
        bg: "black",
      },
      label: " Add Custom Game ",
      padding: 2,
    })

    modalDepth++
    const decCustom = () => {
      modalDepth = Math.max(0, modalDepth - 1)
    }
    customOverlay.once("detach", decCustom)
    customOverlay.once("destroy", decCustom)

    const customInput = createCustomInput(customOverlay, {
      label: " Custom Game Name: ",
      top: 2,
      left: 2,
      width: "90%",
      height: 3,
      style: {
        fg: colors.secondary,
        border: { fg: colors.secondary },
      },
      onEnter: (value) => {
        submitCustomGame()
      },
    })

    if (typeof customOverlay.setFront === "function") customOverlay.setFront()
    setTimeout(() => {
      if (typeof customInput.focus === "function") customInput.focus()
      screen.render()
    }, 10)

    const submitButton = blessed.button({
      parent: customOverlay,
      content: " ADD GAME ",
      top: 7,
      left: "center",
      width: 15,
      height: 3,
      border: "line",
      style: {
        fg: "black",
        bg: colors.success,
        border: { fg: colors.success },
        focus: { bg: colors.primary },
      },
      mouse: true,
    })

    function submitCustomGame() {
      const customGame = customInput.getValue().trim()
      screen.remove(customOverlay)
      screen.render()
      restoreMainFocus()

      if (customGame) {
        logMessage(`Custom game added: ${customGame}`, "success")
        if (isFromAddButton) {
          askForGameIDsToAdd(customGame)
        } else {
          askForGameIDs(customGame)
        }
      } else {
        logMessage("No custom game entered.", "info")
        if (isFromAddButton) {
          askForGameIDsToAdd(null)
        } else {
          askForGameIDs(null)
        }
      }
    }

    submitButton.on("press", submitCustomGame)

    setTimeout(() => {
      customInput.activate()
      screen.render()
    }, 50)
  }

  function askForGameIDs(customGame) {
    const gameOverlay = blessed.box({
      parent: screen,
      top: "center",
      left: "center",
      width: 70,
      height: 15,
      border: "line",
      style: {
        fg: colors.primary,
        border: { fg: colors.primary },
        bg: "black",
      },
      label: " Enter Game IDs ",
      padding: 2,
    })

    modalDepth++
    const decIDs = () => {
      modalDepth = Math.max(0, modalDepth - 1)
    }
    gameOverlay.once("detach", decIDs)
    gameOverlay.once("destroy", decIDs)

    const gameInput = createCustomInput(gameOverlay, {
      label: " Game IDs (comma-separated): ",
      top: 2,
      left: 2,
      width: "90%",
      height: 3,
      style: {
        fg: colors.primary,
        border: { fg: colors.primary },
      },
      onEnter: (value) => {
        submitGames()
      },
    })

    registerModal(gameOverlay, gameInput)

    const submitButton = blessed.button({
      parent: gameOverlay,
      content: " START PLAYING ",
      top: 7,
      left: "center",
      width: 20,
      height: 3,
      border: "line",
      style: {
        fg: "black",
        bg: colors.success,
        border: { fg: colors.success },
        focus: { bg: colors.primary },
      },
      mouse: true,
    })

    function submitGames() {
      const games = gameInput
        .getValue()
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id)
        .map((id) => (/^\d+$/.test(id) ? Number.parseInt(id, 10) : id))

      if (games.length === 0) {
        logMessage("Invalid input. Please enter valid game IDs.", "error")
        return
      }

      if (customGame) {
        games.unshift(customGame)
      }

      const uniqueGames = []
      const seenIds = new Set()

      for (const game of games) {
        const gameKey = typeof game === "string" ? `custom_${game}` : game
        if (!seenIds.has(gameKey)) {
          seenIds.add(gameKey)
          uniqueGames.push(game)
        }
      }

      const duplicatesRemoved = games.length - uniqueGames.length
      if (duplicatesRemoved > 0) {
        logMessage(`Removed ${duplicatesRemoved} duplicate game(s)`, "warning")
      }

      fs.writeFileSync(gamesFile, JSON.stringify(uniqueGames, null, 2))
      logMessage(`Games entered: ${uniqueGames.join(", ")}`, "success")
      screen.remove(gameOverlay)
      screen.render()
      restoreMainFocus()

      currentGames = uniqueGames
      updateGamesList()
      updateGamesWidget()
      if (isLoggedIn) {
        client.gamesPlayed(uniqueGames)
      }

      isSettingUpGames = false
    }

    submitButton.on("press", submitGames)

    setTimeout(() => {
      gameInput.activate()
      screen.render()
    }, 50)
  }

  function askForGameIDsToAdd(customGame) {
    const gameOverlay = blessed.box({
      parent: screen,
      top: "center",
      left: "center",
      width: 70,
      height: 15,
      border: "line",
      style: {
        fg: colors.primary,
        border: { fg: colors.primary },
        bg: "black",
      },
      label: " Enter Game IDs to Add ",
      padding: 2,
    })

    modalDepth++
    const decIDsAdd = () => {
      modalDepth = Math.max(0, modalDepth - 1)
    }
    gameOverlay.once("detach", decIDsAdd)
    gameOverlay.once("destroy", decIDsAdd)

    const gameInput = createCustomInput(gameOverlay, {
      label: " Game IDs (comma-separated): ",
      top: 2,
      left: 2,
      width: "90%",
      height: 3,
      style: {
        fg: colors.primary,
        border: { fg: colors.primary },
      },
      onEnter: (value) => {
        submitNewGames()
      },
    })

    registerModal(gameOverlay, gameInput)

    const submitButton = blessed.button({
      parent: gameOverlay,
      content: " ADD GAMES ",
      top: 7,
      left: "center",
      width: 18,
      height: 3,
      border: "line",
      style: {
        fg: "black",
        bg: colors.success,
        border: { fg: colors.success },
        focus: { bg: colors.primary },
      },
      mouse: true,
    })

    function submitNewGames() {
      const newGames = gameInput
        .getValue()
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id)
        .map((id) => (/^\d+$/.test(id) ? Number.parseInt(id, 10) : id))

      if (newGames.length === 0) {
        logMessage("Invalid input. Please enter valid game IDs.", "error")
        return
      }

      const filteredCurrentGames = currentGames.filter((game) => typeof game !== "string")

      if (customGame) {
        newGames.unshift(customGame)
      }

      const combinedGames = [...filteredCurrentGames, ...newGames]
      const uniqueGames = []
      const seenIds = new Set()

      for (const game of combinedGames) {
        const gameKey = typeof game === "string" ? `custom_${game}` : game
        if (!seenIds.has(gameKey)) {
          seenIds.add(gameKey)
          uniqueGames.push(game)
        }
      }

      const duplicatesRemoved = combinedGames.length - uniqueGames.length
      if (duplicatesRemoved > 0) {
        logMessage(`Removed ${duplicatesRemoved} duplicate game(s)`, "warning")
      }

      currentGames = uniqueGames

      fs.writeFileSync(gamesFile, JSON.stringify(currentGames, null, 2))
      logMessage(`Added games: ${newGames.join(", ")}`, "success")
      screen.remove(gameOverlay)
      screen.render()
      restoreMainFocus()

      updateGamesList()
      updateGamesWidget()

      if (currentTab === "games") {
        setTimeout(() => {
          gamesList.focus()
          screen.render()
        }, 100)
      }

      if (isLoggedIn) {
        client.gamesPlayed(currentGames)
      }

      isSettingUpGames = false
    }

    submitButton.on("press", submitNewGames)

    gameOverlay.key("escape", () => {
      screen.remove(gameOverlay)
      screen.render()
      restoreMainFocus()
    })

    setTimeout(() => {
      gameInput.activate()
      screen.render()
    }, 50)
  }

  startButton.on("press", () => {
    if (fs.existsSync(gamesFile)) {
      const games = JSON.parse(fs.readFileSync(gamesFile))
      client.gamesPlayed(games)
      currentGames = games
      logMessage(`Resumed playing games: ${games.join(", ")}`, "success")
      updateGamesList()
      updateGamesWidget()
    } else {
      logMessage("No game list found.", "warning")
    }
  })

  stopButton.on("press", () => {
    client.gamesPlayed([])
    client.gamesPlayed([0])
    setTimeout(() => {
      client.setPersona(SteamUser.EPersonaState.Online)
    }, 1000)
    currentGames = []
    logMessage("Forced stop: No games should be running now.", "warning")
    updateGamesList()
    updateGamesWidget()
  })

  addGameButton.on("press", () => {
    askForCustomGame(true)
  })

  tabHeaders.on("action", (el, selected) => {
    const tabName = selected.toLowerCase()
    switchTab(tabName)
  })

  screen.key(["d", "D"], () => {
    if (modalDepth > 0) return
    switchTab("dashboard")
  })
  screen.key(["g", "G"], () => {
    if (modalDepth > 0) return
    switchTab("games")
  })
  screen.key(["l", "L"], () => {
    if (modalDepth > 0) return
    switchTab("logs")
  })
  screen.key(["b", "B"], () => {
    if (modalDepth > 0) return
    startButton.emit("press")
  })
  screen.key(["n", "N"], () => {
    if (modalDepth > 0) return
    stopButton.emit("press")
  })
  screen.key(["+"], () => {
    if (modalDepth > 0) return
    if (currentTab === "games") addGameButton.emit("press")
  })
  screen.key(["-"], () => {
    if (modalDepth > 0) return
    if (currentTab === "games") removeGameButton.emit("press")
  })
  screen.key(["q", "Q"], () => {
    if (modalDepth > 0) return
    process.exit(0)
  })

  setInterval(updateStatusBar, 1000)
  setInterval(updateSystemWidget, 5000)

  logMessage("[GO] Steam Bot Advanced Terminal UI Started", "success")
  logMessage("[TIP] Use keyboard shortcuts or mouse to navigate", "info")

  if (fs.existsSync(credentialsFile)) {
    logMessage("Credentials file found. Auto-logging in...", "steam")
    loginToSteam()
  } else {
    showLoginForm()
  }

  screen.key(["escape", "C-c"], (ch, key) => {
    if (key && key.full === "escape" && modalDepth > 0) return

    logMessage("Shutting down Steam Bot...", "warning")
    if (isLoggedIn) {
      client.logOff()
    }
    return process.exit(0)
  })

  screen.render()
  updateFooter()
}

async function startApp() {
  if (checkTerminalSize()) {
    await showIntro()
    initializeBot()
  }
}

startApp()
