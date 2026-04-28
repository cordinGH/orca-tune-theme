/**
 * 主题切换器 - 核心功能
 * 一个按钮循环切换所有官方主题，重启后保持
 */

// 笔记 2025-10-01：
// 当启用官方主题后，orca.state.settings[11] 不会是null，默认是'default'
// ['Aurora Borealis', 'Catppuccin', 'Mono Mint', 'Moonlit Sakura', 'Pastel Garden', 'Sandstone Dusk']
// 默认主题时，disable官方主题的link标签，再移除圆角class，即可自由切换tune和官方主题

// 笔记 2026-04-29-至今：推倒重构版本。

// 日志工具
const log = {
    info: (message) => console.log(`[Tune-theme] ${message}`),
    error: (message) => console.error(`[Tune-theme] ${message}`)
}

let officialThemesUnSubscribe = null;
let officialThemesSettingUnSubscribe = null;
let officialThemesPlugin = null;
/** @type {string[]} 主题名称数组 */
let superThemes = null;

export function start() {
    // 检查官方主题是否就位并监听其状态以抵消用户不当操作（切换圆角按钮）
    checkOfficialThemesReady()
    officialThemesUnSubscribe = window.Valtio.subscribe(orca.state.plugins, checkOfficialThemesReady)
}

export function cleanup() {
    orca.headbar.unregisterHeadbarButton(`pluginTuneTheme.themeSwitcher`)
    clearAllSubscribe()
    officialThemesPlugin = null;
    superThemes = null;
    log.info("主题切换器已清理")
}


function checkOfficialThemesReady() {
    if (officialThemesPlugin) return

    const pluginInfoArray = Object.values(orca.state.plugins)

    for (const pluginInfo of pluginInfoArray) {
        // 未启用或不存在settings
        if (!Object.hasOwn(pluginInfo, "module") || !pluginInfo.settings) continue

        // 目标正确
        if (Object.hasOwn(pluginInfo.settings, "enableRoundShell")) {
            officialThemesPlugin = pluginInfo
            break;
        }
        officialThemesPlugin = null
    }

    // 清理
    !officialThemesPlugin && clearAllSubscribe();

    // 检查到插件后，等待执行栈清空后，则去注册切换按钮，并确保配色适配
    if (officialThemesPlugin) {

        setTimeout(() => {

            // 消除无意义的class
            const roundShell = document.querySelector('head>link[data-role="official-themes"]')
            if (roundShell) roundShell.remove();

            const currentTheme = orca.state.settings[11]
            const isDefaultTheme = !currentTheme || currentTheme === 'default'
            // 设置主题所需的class
            isDefaultTheme ? document.body.classList.remove("kef-round-shell") : document.body.classList.add("kef-round-shell")

            // 准备主题切换名单
            superThemes = ['default', ...Object.keys(orca.state.themes)]

            // 创建切换按钮
            orca.headbar.registerHeadbarButton(`pluginTuneTheme.themeSwitcher`, () => React.createElement(
                orca.components.Button,
                { variant: "plain", onClick: () => switchToTheme() },
                React.createElement("i", { className: "ti ti-color-swatch orca-headbar-icon" }))
            )

            // 订阅officialThemes插件的设置变更，用于抵消一些不希望发生的用户操作
            officialThemesSettingUnSubscribe = window.Valtio.subscribe(officialThemesPlugin, () => {
                setTimeout(() => {
                    if (officialThemesPlugin.settings.enableRoundShell === true) setVaildRoundShell();
                }, 0)
            })
        }, 0)
    }
}

// 设置一个有效的roundShell
function setVaildRoundShell() {
    const roundShell = document.querySelector('head>link[data-role="official-themes"]')
    if (roundShell) roundShell.remove();

    // 设置当前主题所需的class
    const currentTheme = orca.state.settings[11]
    const isDefaultTheme = !currentTheme || currentTheme === 'default'
    isDefaultTheme ? document.body.classList.remove("kef-round-shell") : document.body.classList.add("kef-round-shell")
}

// 插件不存在，清理所有订阅
function clearAllSubscribe() {
    if (officialThemesUnSubscribe) {
        officialThemesUnSubscribe()
        officialThemesUnSubscribe = null
    }
    if (officialThemesSettingUnSubscribe) {
        officialThemesSettingUnSubscribe()
        officialThemesSettingUnSubscribe = null
    }
}


// 从superThemes中获取下一个主题。
function getNextTheme(currentTheme) {
    const currentIndex = superThemes.indexOf(currentTheme)
    const nextIndex = (currentIndex + 1) % superThemes.length
    const nextTheme = superThemes[nextIndex]
    return nextTheme
}


// 切换主题
function switchToTheme() {
    // 检查 orca.state.settings[11] ，该值为当前主题
    const currentTheme = orca.state.settings[11] ? orca.state.settings[11] : 'default'
    const themeName = getNextTheme(currentTheme)

    let themeLink = document.querySelector('head>link[data-role="theme"]')

    // 确保link存在
    if (!themeLink) {
        themeLink = document.createElement('link');
        themeLink.rel = 'stylesheet'
        themeLink.setAttribute('data-role', 'theme')
        document.head.appendChild(themeLink)
    }

    if (themeName !== 'default') {
        // 目标主题不是默认，则载载入对应href和class
        const themePath = orca.state.themes[themeName]
        if (!themePath) log.info("不存在主题：", themeName)
        document.body.classList.add('kef-round-shell')
        themeLink.disabled = false
        themeLink.href = themePath

    } else {
        // 目标主题是默认主题
        themeLink.disabled = true
        document.body.classList.remove('kef-round-shell')
    }

    log.info(`✅ 主题切换完成: ${themeName}`)

    // 持久化
    orca.state.settings[11] = themeName
    orca.invokeBackend("set-config", 11, themeName)
}