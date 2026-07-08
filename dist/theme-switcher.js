/**
 * 主题切换器 - 核心功能
 * 一个按钮循环切换所有官方主题，重启后保持
 */

// 笔记 2025-10-01：
// 当启用官方主题后，orca.state.settings[11] 不会是null，默认是'default'
// ['Aurora Borealis', 'Catppuccin', 'Mono Mint', 'Moonlit Sakura', 'Pastel Garden', 'Sandstone Dusk']
// 默认主题时，disable官方主题的link标签，再移除圆角class，即可自由切换tune和官方主题

// 笔记 2026-04-29：推倒重构。

// 日志工具
const log = {
    info: (message) => console.log(`[Tune-theme] ${message}`),
    error: (message) => console.error(`[Tune-theme] ${message}`)
}

const c = React.createElement

let officialThemesInfo = null // 插件对象，发现插件启用后被赋予，用于正确处理插件关闭行为（预防存在多个版本的情况）。
let startrekInfo = null // 插件对象，发现插件启用后被赋予，用于正确处理插件关闭行为（预防存在多个版本的情况）。
let enableStartrek;
let fakeStartrekLink = null;

let unsubscribeList = []

/** @type {string[]} 主题名称数组 */
let superThemes = null;

// 生动风格初始状态
let enableVibrant;

function debounce(fn, delay = 0) {
    let timer = null;
    return (...args) => {
        timer && clearTimeout(timer)
        timer = setTimeout(() => {
            fn(...args);
            timer = null;
        }, delay)
    }
}

export function start() {

    // 主题列表
    superThemes = ['default', ...Object.keys(orca.state.themes)]
    unsubscribeList.push(
        window.Valtio.subscribe(orca.state.themes, debounce(() => superThemes = ['default', ...Object.keys(orca.state.themes)]))
    )

    // 适配officialThemes主题
    handleOfficialThemes()
    unsubscribeList.push(
        // 避免连续的操作记录导致重复触发
        window.Valtio.subscribe(orca.state.plugins, debounce(() => handleOfficialThemes()))
    )

    // 适配startrek主题
    handleStartrek()
    unsubscribeList.push(
        // 避免连续的操作记录导致重复触发
        window.Valtio.subscribe(orca.state.plugins, debounce(() => handleStartrek()))
    )

    enableVibrant = !!orca.state.settings[52]
    registerSwitcher()
}

export function cleanup() {
    orca.headbar.unregisterHeadbarButton(`pluginTuneTheme.themeSwitcher`)
    unsubscribeList.forEach(us => us())
    unsubscribeList.length = 0

    officialThemesInfo = null
    startrekInfo = null;
    superThemes.length = 0
    if (fakeStartrekLink) {
        fakeStartrekLink.remove()
        fakeStartrekLink = null
    }
    
    log.info("主题切换器已清理")
}

/**
 * 处理officialThemes的适配兼容
 */
function handleOfficialThemes() {

    if (!officialThemesInfo) {
        for (const pluginInfo of Object.values(orca.state.plugins)) {

            if (!pluginInfo.enabled || !pluginInfo.schema?.enableRoundShell) continue;
            
            // 首次登记启用的officialTheme
            officialThemesInfo = pluginInfo
            setVaildRoundShell();
            break;
        }

    } else {

        // 关闭插件（单次）
        if (!officialThemesInfo.enabled) {
            officialThemesInfo = null; 
            document.body.classList.remove('kef-round-shell')
            return
        }
        
        setVaildRoundShell()
    }
}

/**
 * 处理startrek的适配兼容(星星特效)
 */
function handleStartrek() {

    if (!startrekInfo) {
        for (const pluginInfo of Object.values(orca.state.plugins)) {
    
            if (!pluginInfo.enabled || !pluginInfo.schema?.fullMode) continue;
            
            // 首次登记启用的startrek
            startrekInfo = pluginInfo

            // 设置伪造的link，使得星空js特效生效
            if (!fakeStartrekLink) {
                fakeStartrekLink = document.createElement('link')
                fakeStartrekLink.rel = 'stylesheet';
                fakeStartrekLink.href = 'data:text/css,/*startrek*/';
            }
            document.head.append(fakeStartrekLink);
            break;
        }
    
    } else if (!startrekInfo.enabled){
        // 存在，则只处理处理关闭
        startrekInfo = null;
        fakeStartrekLink?.remove()
    }
}



/**
 * 注册切换器按钮
 */
function registerSwitcher() {

    // 创建切换按钮
    orca.headbar.registerHeadbarButton(`pluginTuneTheme.themeSwitcher`, () => c(
        orca.components.Tooltip,
        {
            text: c('div',{}, '左键 叠加其他主题(推荐官方主题)', c('br'), '右键 切换生动风格', c('br'), '中键 切换星空特效(推荐Dark模式)', c('br'), '（无中键的鼠标 可Alt+右键切换星空特效）'),
        },
        c(
            orca.components.Button,
            { 
                variant: "plain",
                onClick: () => {
                    if (superThemes.length === 1) orca.notify('info', "[tune-theme] 当前未安装其他主题插件")
                    switchToTheme()
                },
                onContextMenu: (e)=> {
                    if (e.altKey) {
                        switchFullmode()
                        return
                    };
                    switchVibrant();
                },
                onAuxClick: (e) => {
                    if (e.button !== 1) return
                    switchFullmode()
                }
            },
            c("i", { className: "ti ti-color-swatch orca-headbar-icon" }))
        )
    )
}

function switchFullmode() {
    if (!startrekInfo) {
        orca.notify("info", "[tune-theme] 请先安装启用oh-StarTrek主题")
        return;
    }
    // 持久化变更
    orca.plugins.setSettings("repo", 'oh-StarTrek', {
        ...startrekInfo.settings,
        fullMode: !startrekInfo.settings.fullMode
    });
}


/**
 * 为officialThemes设置正确的class以及link
 */
function setVaildRoundShell() {    
    const currentTheme = orca.state.settings[11]
    const isNotDefaultTheme = currentTheme && currentTheme !== 'default'
    document.body.classList.toggle('kef-round-shell', isNotDefaultTheme)
    const roundShell = document.head.querySelector('link[data-role="official-themes"]')
    if (roundShell) roundShell.remove();
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

    let themeLink = document.head.querySelector('link[data-role="theme"]')

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
        if (!themePath) log.info(`不存在主题：${themeName}`)
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


// 切换生动风格
function switchVibrant() {
    enableVibrant = !enableVibrant
    document.body.classList.toggle('orca-vibrant', enableVibrant)
    orca.invokeBackend("set-config", 52, enableVibrant)   
}