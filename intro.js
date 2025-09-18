const blessed = require("blessed")

function showIntro() {
  return new Promise((resolve) => {
    const introScreen = blessed.screen({
      smartCSR: true,
      title: "Steam Bot TUI - Loading...",
      fullUnicode: true,
      dockBorders: false,
      autoPadding: false,
      warnings: false,
    })

    const asciiArt = `⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠻⣏⠉⠉⠛⠒⠶⠤⣄⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⡤⠴⠖⠚⠋⠉⣉⡿⠛⠁⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠛⣦⡀⠀⠀⡤⠚⠉⠛⠶⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⡴⠞⠋⠙⠢⡄⠀⠀⣠⠞⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢳⣄⡞⠀⠀⠀⠀⠀⠈⠙⢦⡀⠀⠀⠀⠀⠀⠀⠀⠀⣠⠞⠉⠀⠀⠀⠀⠀⠘⣄⡴⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⣄⠀⠀⠀⣠⠖⠊⠉⠉⠙⢦⡀⠀⠀⠀⠀⣠⠞⠉⠉⠉⠒⢤⡀⠀⠀⢀⡾⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⡆⢀⠞⠀⠀⠀⠀⠀⢀⣈⠷⠶⠒⠲⠼⢇⣀⠀⠀⠀⠀⠀⠙⢆⢀⡾⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⡎⠀⠀⢀⡤⠔⠊⠉⠀⠀⠀⠀⠀⠀⠀⠈⠉⠒⠤⣀⠀⠀⠈⣾⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢧⣠⢞⠭⠀⠠⢄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⢦⣠⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡾⠱⣵⠚⠳⣄⠀⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡴⠋⢳⡄⠹⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⠖⠋⢧⣷⠃⠀⠀⢸⠀⢸⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠁⠀⠀⢻⠀⠏⠳⢦⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣠⠶⠚⠉⠀⠀⠀⢸⢸⠰⠶⠶⠾⡇⢸⠀⠀⠀⣆⠀⠀⠀⠀⠀⢸⠶⠶⠶⠘⣴⠀⠀⠀⠈⠙⠲⢤⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⣠⠶⠛⠛⠓⠓⠒⠒⠠⠤⢤⣿⢸⣄⠀⠀⢀⠇⢸⠀⢀⡀⠀⠀⡀⠀⠀⠀⢸⡀⠀⢀⣰⠇⡧⠤⠄⠒⠒⠚⠛⠛⠛⠳⢦⡀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠘⢧⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠉⢆⡈⠉⠉⢉⣴⠃⠀⠀⠉⠓⠋⠀⠀⠀⠰⡀⠉⠉⠉⠀⠀⢹⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠏⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠈⠳⣤⡀⠀⠀⠀⠀⠀⠀⣸⣆⠀⠈⠁⠈⠁⢻⠀⠀⠀⣠⢶⢦⡀⠀⠀⠀⠇⠀⠀⠀⠀⢀⣮⡀⠀⠀⠀⠀⠀⠀⣠⡴⠋⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠛⠲⠦⠴⠚⠋⠁⠘⢷⡀⠀⠀⠀⠀⠁⠒⡏⠁⢸⠀⠉⡷⠂⠀⠀⠀⠀⢀⣴⠏⠀⠉⠛⠲⠤⠶⠚⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣦⡀⠀⠀⠀⠀⢧⠀⠈⠀⢠⠃⠀⠀⠀⠀⣠⡾⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢻⡦⣄⡀⠀⠈⠳⠤⠴⠋⠀⠀⣀⡤⣿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⠁⠈⠙⠒⠶⠤⠤⠤⠴⠖⠚⠉⠀⢻⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡞⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠾⣅⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣹⠆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠙⠒⠶⠤⠤⠤⠤⠤⠤⠶⠶⠚⠋⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`

    // Main container
    const container = blessed.box({
      parent: introScreen,
      top: "center",
      left: "center",
      width: "100%",
      height: "100%",
      style: {
        bg: "black",
      },
    })

    // ASCII Art display
    const artBox = blessed.box({
      parent: container,
      top: "center",
      left: "center",
      width: 120,
      height: 25,
      content: asciiArt,
      style: {
        fg: "cyan",
        bg: "black",
      },
      align: "center",
    })

    // Title
    const titleBox = blessed.box({
      parent: container,
      top: "center",
      left: "center",
      width: 60,
      height: 3,
      content: "STEAM BOT TUI",
      style: {
        fg: "cyan",
        bg: "black",
        bold: true,
      },
      align: "center",
      valign: "middle",
    })

    titleBox.top = artBox.top + 26

    // Loading text
    const loadingBox = blessed.box({
      parent: container,
      top: titleBox.top + 4,
      left: "center",
      width: 40,
      height: 1,
      content: "Initializing...",
      style: {
        fg: "yellow",
        bg: "black",
      },
      align: "center",
    })

    // Progress bar container
    const progressContainer = blessed.box({
      parent: container,
      top: loadingBox.top + 2,
      left: "center",
      width: 50,
      height: 3,
      border: "line",
      style: {
        border: { fg: "cyan" },
        bg: "black",
      },
      label: " Loading Progress ",
    })

    // Progress bar background
    const progressBg = blessed.box({
      parent: progressContainer,
      top: 0,
      left: 0,
      width: 48,
      height: 1,
      content: "░".repeat(48),
      style: {
        fg: "gray",
        bg: "black",
      },
    })

    // Progress bar fill
    const progressBar = blessed.box({
      parent: progressContainer,
      top: 0,
      left: 0,
      width: 0,
      height: 1,
      style: {
        bg: "cyan",
      },
    })

    // Spinner characters
    const spinnerChars = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
    let spinnerIndex = 0

    // Loading messages
    const loadingMessages = [
      "Initializing Steam Bot...",
      "Loading configurations...",
      "Connecting to Steam API...",
      "Preparing user interface...",
      "Almost ready...",
      "Starting Steam Bot TUI!",
    ]

    let currentMessage = 0
    let progress = 0
    const totalDuration = 4000
    const updateInterval = 50
    const totalUpdates = totalDuration / updateInterval

    const animationInterval = setInterval(() => {
      spinnerIndex = (spinnerIndex + 1) % spinnerChars.length

      progress += 100 / totalUpdates
      const progressWidth = Math.floor((progress / 100) * 48)

      let progressContent = ""
      for (let i = 0; i < 48; i++) {
        if (i < progressWidth - 2) {
          progressContent += "█"
        } else if (i < progressWidth) {
          progressContent += "▓"
        } else if (i === progressWidth && progressWidth < 48) {
          progressContent += "▒"
        } else {
          progressContent += "░"
        }
      }

      progressBg.setContent(progressContent)

      if (progress < 25) {
        progressBg.style.fg = "red"
      } else if (progress < 50) {
        progressBg.style.fg = "yellow"
      } else if (progress < 75) {
        progressBg.style.fg = "blue"
      } else {
        progressBg.style.fg = "green"
      }

      const messageIndex = Math.floor((progress / 100) * loadingMessages.length)
      if (messageIndex < loadingMessages.length && messageIndex !== currentMessage) {
        currentMessage = messageIndex
      }

      const currentMsg = loadingMessages[currentMessage] || loadingMessages[loadingMessages.length - 1]
      loadingBox.setContent(`${spinnerChars[spinnerIndex]} ${currentMsg}`)

      const colorCycle = Math.floor(progress / 15) % 6
      const colors = ["cyan", "blue", "magenta", "green", "yellow", "red"]
      artBox.style.fg = colors[colorCycle]

      titleBox.style.fg = colors[colorCycle]

      introScreen.render()

      if (progress >= 100) {
        clearInterval(animationInterval)

        progressBg.setContent("█".repeat(48))
        progressBg.style.fg = "green"
        loadingBox.setContent("✓ Steam Bot TUI Ready!")
        loadingBox.style.fg = "green"
        titleBox.style.fg = "green"
        progressContainer.style.border.fg = "green"

        introScreen.render()

        setTimeout(() => {
          introScreen.destroy()
          resolve()
        }, 500)
      }
    }, updateInterval)

    introScreen.key(["C-c"], () => {
      clearInterval(animationInterval)
      introScreen.destroy()
      process.exit(0)
    })

    introScreen.render()
  })
}

module.exports = { showIntro }
