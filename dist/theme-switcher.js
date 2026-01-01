/**
 * 主题切换器 - 核心功能
 * 一个按钮循环切换所有官方主题，重启后保持
 */

// 笔记 2025-10-01：
// 当启用官方主题后，orca.state.settings[11] 不会是null，默认是'default'
// 但是Object.keys(orca.state.themes) 是可能为空数组（主题加载失败）
// ['Aurora Borealis', 'Catppuccin', 'Mono Mint', 'Moonlit Sakura', 'Pastel Garden', 'Sandstone Dusk']
// 默认主题时，disable官方主题的link标签，再移除圆角class，即可自由切换tune和官方主题

// 日志工具
const log = {
  info: (message) => console.log(`[Tune-theme] ${message}`),
  error: (message) => console.error(`[Tune-theme] ${message}`)
}

export async function start() {
  try {
    // 使用状态订阅监听主题数据
    setupThemeStateSubscription()
  } catch (error) {
    log.error(`主题切换器启动失败: ${error.message}`)
  }
}

export async function cleanup() {
  try {
    // 清理头部栏按钮
    orca.headbar.unregisterHeadbarButton(`pluginTuneTheme.themeSwitcher`)
    log.info("主题切换器已清理")
  } catch (error) {
    log.error(`主题切换器清理失败: ${error.message}`)
  }
}


// 订阅主题并绑定按钮
function setupThemeStateSubscription() {
  const checkOfficialThemes = () => {
    // 检查所有插件，寻找 official-themes 插件，存在且已经启动加入进模块，则添加圆角class，以确保主题可以和tune切换
    const plugins = Object.values(orca.state.plugins)
    if (!plugins || plugins.length === 0) {
      return false
    }
    for (const plugin of plugins) {
      const pluginSchema = plugin?.schema
      if (!pluginSchema) continue
      const existSchemaAndModule = plugin.module
      if (!existSchemaAndModule) continue
      const isOfficialThemes = Object.keys(pluginSchema).length === 1 && Object.hasOwn(pluginSchema, 'enableRoundShell')
      if (isOfficialThemes) {
        const currentTheme = orca.state.settings[11]
        const isDefaultTheme = !currentTheme || currentTheme === 'default'

        // 准备一个link，用于后续切换主题
        let themeLink = document.querySelector('head>link[data-role="theme"]')
        if (!themeLink) themeLink = document.createElement('link')

        // 默认主题完全采用tune的class，并修正link
        if (isDefaultTheme) {
          document.body.classList.remove("kef-round-shell")
          setTimeout(() => {
            themeLink.rel = 'stylesheet'
            themeLink.setAttribute('data-role', 'theme')
            themeLink.disabled = true
            // 预注入第一个主题，消除重新注入链接时的颜色丢失（注入需要时间）
            themeLink.href = orca.state.themes["Aurora Borealis"]
            document.head.appendChild(themeLink)
          }, 500)
        } else document.body.classList.add("kef-round-shell")
        return true
      }
    }
    return false
  }

  if (checkOfficialThemes()) {
    // 创建切换按钮
    log.info("官方主题插件已就绪，创建主题切换按钮")
    createThemeSwitcherButton()
    return
  }

  const unsubscribe = window.Valtio.subscribe(orca.state.plugins, () => {
    if (checkOfficialThemes()) {
      log.info("官方主题插件已就绪，创建主题切换按钮")
      unsubscribe()
      createThemeSwitcherButton()
      return
    }
  })

  // 设置超时保护（5秒后取消订阅）
  setTimeout(() => unsubscribe(), 5000)
}



// 创建主题切换按钮
function createThemeSwitcherButton() {
  try {
    const superThemes = ['default', ...Object.keys(orca.state.themes)]
    
    orca.headbar.registerHeadbarButton(`pluginTuneTheme.themeSwitcher`, () => {
      return React.createElement(orca.components.Button, {
        variant: "plain",
        onClick: () => switchToTheme(getNextTheme(superThemes))
      }, React.createElement("i", { className: "ti ti-color-swatch orca-headbar-icon" }))
    })
  } catch (error) {
    log.error(`创建主题切换按钮失败: ${error.message}`)
  }
}


// 获取下一个主题。检查 orca.state.settings[11] ，该值为当前主题
function getNextTheme(availableThemes) {
  const currentTheme = orca.state.settings[11] ? orca.state.settings[11] : 'default'
  const currentIndex = availableThemes.indexOf(currentTheme)
  const nextIndex = (currentIndex + 1) % availableThemes.length
  const nextTheme = availableThemes[nextIndex]
  return nextTheme
}



// 切换主题
function switchToTheme(themeName) {
  try {
    let themeLink = document.querySelector('head>link[data-role="theme"]')
    if (themeName !== 'default') {
      // 切换到官方主题
      const themePath = orca.state.themes[themeName]
      if (themePath) {
        themeLink.href = themePath
        themeLink.disabled = false
        document.body.classList.add('kef-round-shell')
      } else {
        log.info("不存在主题：",themeName)
      }
    } else {
      themeLink.disabled = true
      document.body.classList.remove('kef-round-shell')
    }

    // 同步到仓库级设置
    syncThemeToSettings(themeName)
    log.info(`✅ 主题切换完成: ${themeName}`)
  } catch (error) {
    log.error(`❌ 切换主题失败: ${error.message}`)
  }
}


// 同步主题到设置
async function syncThemeToSettings(themeName) {
  try {
    orca.state.settings[11] = themeName
    // 持久化
    await orca.invokeBackend("set-config", 11, themeName)
  } catch (error) {
    log.error(`❌ 主题设置同步失败: ${error.message}`)
  }
}