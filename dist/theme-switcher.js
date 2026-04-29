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
/** @type {string[]} 主题名称数组 */
let superThemes = null;

let officialThemesTimer;

export function start() {
    // 检查官方主题是否就位并监听其状态以抵消用户不当操作（切换圆角按钮）
    checkOfficialThemesReady()
    officialThemesUnSubscribe = window.Valtio.subscribe(orca.state.plugins, ()=>{
        officialThemesTimer && clearTimeout(officialThemesTimer)
        // 避免连续的操作记录重复触发
        officialThemesTimer = setTimeout(()=>{
            checkOfficialThemesReady()
            officialThemesTimer = null
        }, 0)
    })
}

export function cleanup() {
    orca.headbar.unregisterHeadbarButton(`pluginTuneTheme.themeSwitcher`)
    if (officialThemesUnSubscribe) {
        officialThemesUnSubscribe()
        officialThemesUnSubscribe = null
    }
    officialThemesTimer = null
    superThemes = null;
    log.info("主题切换器已清理")
}


// 订阅传入的通知更新
function checkOfficialThemesReady() {

    // 读取插件列表后的下一步操作
    let nextOp = '';

    const pluginInfoArray = Object.values(orca.state.plugins)
    for (const pluginInfo of pluginInfoArray) {
        // 不存在该shcema说明本次不是目标插件
        if (!pluginInfo.schema?.enableRoundShell) continue;

        // 查看切换器存在与否，用于决定下一步是否应当清理切换器或注册切换器
        const isNotExist = !orca.state.headbarButtons['pluginTuneTheme.themeSwitcher']

        if (pluginInfo?.enabled) {
            // 确保任意状态都具有正确的圆角class
            setVaildRoundShell()
            // 启用状态，则解析应当执行什么操作
            nextOp = isNotExist ? 'register' : 'none'
            break;
        } else {
            // 停用状态
            nextOp = isNotExist ? 'none' : 'unregister'
            break;
        }
    }

    switch (nextOp) {
        case 'register': registerSwitcher();break;
        case 'unregister': orca.headbar.unregisterHeadbarButton(`pluginTuneTheme.themeSwitcher`);break;
    }
}

/**
 * 识别到了启用了官方主题，则注册主题切换器，并确保配色适配
 * @param {boolean} needClearRoundShell - 是否应当清理掉被启用的圆角外壳
 */
function registerSwitcher() {

    // 消除无意义的link
    const roundShell = document.querySelector('head>link[data-role="official-themes"]')
    if (roundShell) roundShell.remove();

    // 设置当前主题所需的class
    const currentTheme = orca.state.settings[11]
    const isDefaultTheme = !currentTheme || currentTheme === 'default'
    isDefaultTheme ? document.body.classList.remove("kef-round-shell") : document.body.classList.add("kef-round-shell")

    // 准备主题切换名单
    superThemes = ['default', ...Object.keys(orca.state.themes)]

    // 创建切换按钮
    orca.headbar.registerHeadbarButton(`pluginTuneTheme.themeSwitcher`, () => React.createElement(
        orca.components.Button,
        { variant: "plain", onClick: () => switchToTheme() },
        React.createElement("i", { className: "ti ti-color-swatch orca-headbar-icon" }))
    )
}



/**
 * 根据监听到启用状态，设置圆角外壳有效性
 * @param {*} enableRoundShell 
 */
function setVaildRoundShell(enableRoundShell) {
    if (enableRoundShell) {}
    const roundShell = document.querySelector('head>link[data-role="official-themes"]')
    if (roundShell) roundShell.remove();

    // 设置当前主题所需的class
    const currentTheme = orca.state.settings[11]
    const isDefaultTheme = !currentTheme || currentTheme === 'default'
    isDefaultTheme ? document.body.classList.remove("kef-round-shell") : document.body.classList.add("kef-round-shell")
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