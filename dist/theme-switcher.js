/**
 * 主题切换器 - 核心功能
 * 一个按钮循环切换所有官方主题，重启后保持
 */

// 笔记 2025-10-01：
// 当启用官方主题后，orca.state.settings[11] 不会是null，默认是'default'
// 但是Object.keys(orca.state.themes) 是可能为空数组（主题加载失败）
// ['Aurora Borealis', 'Catppuccin', 'Mono Mint', 'Moonlit Sakura', 'Pastel Garden', 'Sandstone Dusk']
// 默认主题时，disable官方主题的link标签，再移除圆角class，即可自由切换tune和官方主题


// 模块状态
let pluginName = ""
let isInitialized = false
let officialThemes = [] // 存储官方主题数组

// 日志工具
const log = {
  info: (message) => console.log(`[${pluginName}] 主题切换器: ${message}`),
  error: (message) => console.error(`[${pluginName}] 主题切换器: ${message}`)
}

/**
 * 启动主题切换器
 */
export async function start(name) {
  pluginName = name
  
  if (isInitialized) {
    log.info("主题切换器已经初始化")
    return
  }
  
  try {
    // 使用状态订阅监听主题数据
    setupThemeStateSubscription()
    log.info("主题切换器启动成功")
  } catch (error) {
    log.error(`启动失败: ${error.message}`)
  }
}

/**
 * 清理主题切换器
 */
export async function cleanup() {
  try {
    // 清理头部栏按钮
    orca.headbar.unregisterHeadbarButton(`${pluginName}.themeSwitcher`)
    log.info("头部栏主题切换按钮已清理")
    
    isInitialized = false
    log.info("主题切换器已清理")
  } catch (error) {
    log.error(`清理失败: ${error.message}`)
  }
}

// ==================== 主题状态监听 ====================

/**
 * 设置主题状态订阅
 */
function setupThemeStateSubscription() {
  if (orca.state && orca.state.themes) {
    const themes = Object.keys(orca.state.themes)
    if (themes.length === 6) {
      officialThemes = themes
      log.info(`发现 ${themes.length} 个主题: ${themes.join(', ')}`)
      
      // 检查并启用圆角设置
      checkAndEnableRoundShell()
      // 初始化主题切换器
      initializeThemeSwitcher()
      return
    }
  }
  log.info("等待主题数据加载...")
  const unsubscribe = window.Valtio.subscribe(orca.state.themes, (themes) => {
    if (themes && Object.keys(themes).length === 6) {
      officialThemes = Object.keys(themes)
      log.info(`主题数据已完整加载，发现 ${officialThemes.length} 个主题: ${officialThemes.join(', ')}`)
      
      // 取消订阅
      unsubscribe()
      checkAndEnableRoundShell()
      initializeThemeSwitcher()
    }
  })
  // 设置超时保护（5秒后取消订阅）
  setTimeout(() => {
    unsubscribe()
    log.info("官方主题插件加载超时，主题切换器跳过启动")
  }, 5000)
}


/**
 * 检查并启用官方主题插件的圆角设置
 */
function checkAndEnableRoundShell() {
  if (!orca.state.plugins["official-themes"].settings?.enableRoundShell) {
    orca.notify("info", "💡请先开启 official-themes 的圆角外壳")
  }
}

/**
 * 初始化主题切换器
 */
async function initializeThemeSwitcher() {
  if (isInitialized) {
    return
  }
  
  try {
    // 创建主题切换按钮
    await createThemeSwitcherButton()
    
    // 检查启动时的主题状态，如果是默认主题需要禁用圆角效果
    const currentTheme = orca.state.settings[11]
    
    if (currentTheme == 'default') {
      log.info("启动时检测到默认主题，禁用圆角效果")
      
      // 检查是否有现有的主题CSS元素
      const themeLink = document.querySelector('link[data-role="theme"]')
      if (themeLink) {
        // 如果有，直接禁用
        themeLink.disabled = true
        log.info(`禁用了现有的主题CSS元素: ${themeLink.href}`)
      } else {
        // 如果没有，说明是默认主题，预备一个
        log.info("真正的默认主题，没有主题CSS元素")
        
        // 延迟创建，避免被系统删除
        setTimeout(() => {
          let newThemeLink = document.querySelector('link[data-role="theme"]')
          if (!newThemeLink) {
            newThemeLink = document.createElement('link')
            newThemeLink.rel = 'stylesheet'
            newThemeLink.setAttribute('data-role', 'theme')
            newThemeLink.disabled = true
            // 预注入第一个主题，消除重新注入链接时的颜色丢失（注入需要时间）
            newThemeLink.href = orca.state.themes["Aurora Borealis"]
            document.head.appendChild(newThemeLink)
            log.info("延迟创建了主题CSS元素并禁用")
          }
        }, 500)
      }

      // disable圆角css
      const officialRoundShellLink = document.querySelector('link[data-role="official-themes"]')
      if (officialRoundShellLink) {
        officialRoundShellLink.disabled = true
      }
      // 移除body圆角class
      document.body.classList.remove('kef-round-shell')
    }
    
    isInitialized = true
    log.info("主题切换器初始化完成")
  } catch (error) {
    log.error(`主题切换器初始化失败: ${error.message}`)
  }
}


/**
 * 创建主题切换按钮
 */
async function createThemeSwitcherButton() {
  try {
    // const themes = Object.keys(orca.state.themes)
    const superThemes = ['default', ...officialThemes]
    
    orca.headbar.registerHeadbarButton(`${pluginName}.themeSwitcher`, () => {
      return React.createElement(orca.components.Button, {
        variant: "plain",
        onClick: () => {
          const currentTheme = getCurrentTheme(superThemes)
          const currentIndex = superThemes.indexOf(currentTheme)
          const nextIndex = (currentIndex + 1) % superThemes.length
          const nextTheme = superThemes[nextIndex]
          
          // 根据下一个主题的索引决定是否需要处理圆角状态
          if (nextIndex === 0) {
            // 下一个是 default，需要禁用圆角效果
            const officialRoundShellLink = document.querySelector('link[data-role="official-themes"]')
            if (officialRoundShellLink) {
              officialRoundShellLink.disabled = true
            }
            // 禁用主题CSS
            const themeLink = document.querySelector('link[data-role="theme"]')
            if (themeLink) {
              themeLink.disabled = true
            }
            // 移除body圆角class
            document.body.classList.remove('kef-round-shell')
          } else if (nextIndex === 1) {
            // 下一个是第一个官方主题，需要启用圆角效果
            const officialRoundShellLink = document.querySelector('link[data-role="official-themes"]')
            if (officialRoundShellLink) {
              officialRoundShellLink.disabled = false
            }
            // 启用主题CSS
            const themeLink = document.querySelector('link[data-role="theme"]')
            if (themeLink) {
              themeLink.disabled = false
            }
            // 直接添加body圆角class（从default切换过来，肯定没有这个class）
            document.body.classList.add('kef-round-shell')
          }
          
          switchToTheme(nextTheme)
        }
      }, React.createElement("i", { className: "ti ti-palette" }))
    })
    
    log.info("主题切换按钮已注册到头部栏")
  } catch (error) {
    log.error(`创建主题切换按钮失败: ${error.message}`)
  }
}

// ==================== 主题管理 ====================

/**
 * 获取当前主题
 */
function getCurrentTheme(availableThemes) {
  // 检查 orca.state.settings[11] ，该值为当前主题
  const currentTheme = orca.state.settings[11]
  // 如果找到，返回当前主题
  if (currentTheme && availableThemes.includes(currentTheme)) {
    return currentTheme
  }
  // 如果找不到，返回第一个主题（default）
  return availableThemes[0]
}


/**
 * 切换主题
 */
function switchToTheme(themeName) {
  try {
    log.info(`开始切换主题: ${themeName}`)
    
    if (themeName !== 'default') {
      // 切换到官方主题
      const officialThemeLink = document.querySelector('link[data-role="theme"]')
      if (officialThemeLink) {
        const themePath = orca.state.themes[themeName]
        if (themePath) {
          log.info(`主题路径: ${themePath}`)
          log.info(`修改官方CSS链接: ${officialThemeLink.href} -> ${themePath}`)
          officialThemeLink.href = themePath
        } else {
          log.info(`未找到主题路径: ${themeName}`)
        }
      } else {
        log.info(`未找到官方主题CSSLink元素，无法切换主题`)
      }
    }
    
    // 同步到仓库级设置（自动持久化）
    syncThemeToSettings(themeName)
    
    log.info(`✅ 主题切换完成: ${themeName}`)
  } catch (error) {
    log.error(`❌ 切换主题失败: ${error.message}`)
  }
}

/**
 * 同步主题到设置
 */
async function syncThemeToSettings(themeName) {
  try {
    // 直接修改state
    orca.state.settings[11] = themeName
    
    // 使用set-config (仓库级设置，自动持久化)
    await orca.invokeBackend("set-config", 11, themeName)
    
    // 广播刷新
    orca.broadcasts.broadcast("RefreshSettings", 11)
    
    log.info(`✅ 主题设置同步完成: ${themeName}`)
  } catch (error) {
    log.error(`❌ 主题设置同步失败: ${error.message}`)
  }
}