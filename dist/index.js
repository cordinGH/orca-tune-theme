import { setupL10N, t } from './i18n.js';
import { start as startThemeSwitcher, cleanup as cleanupThemeSwitcher } from './theme-switcher.js';


let currentPluginName = '';
let isThemeCurrentlyActive = false; // 主题是否激活
let settingsSchema = null
let commands = null

let settingsUnsubscribe = null; // 设置变更的退订

// 日志工具
const log = {
    info: (message) => console.log(`[${currentPluginName}] ${message}`),
    error: (message) => console.error(`[${currentPluginName}] ${message}`)
};

// 样式管理函数：应用主题基础样式
async function applyStyles() {
    try {
        const style = await orca.plugins.getData('tune-theme', "indent-style")

        if (!style) await orca.plugins.setData('tune-theme', "indent-style", 1);

        switch (style) {
            case 2:
                orca.themes.injectCSSResource(`${currentPluginName}/dist/custom2.css`, currentPluginName);
                await orca.plugins.setData('tune-theme', "indent-style", 2);
                break;
            default:
                orca.themes.injectCSSResource(`${currentPluginName}/dist/custom.css`, currentPluginName);
                await orca.plugins.setData('tune-theme', "indent-style", 1);
                break;
            }

        // 注入CSS
        isThemeCurrentlyActive = true;
        return true;
    } catch (error) {
        log.error(`${t('样式应用失败 ==> ')}${error.message}`);
        isThemeCurrentlyActive = false;
        return false;
    }
}

// 移除主题基础样式
function removeStyles() {
    try {
        // 使用官方API移除CSS资源
        orca.themes.removeCSSResources(currentPluginName);
        isThemeCurrentlyActive = false;
        return true;
    } catch (error) {
        log.error(`${t('样式移除失败 ==> ')}${error.message}`);
        return false;
    }
}

/**
 * 注册设置选项
 */
async function registerSettings(pluginName) {
    // class配置定义
    settingsSchema = {
        'tune-headbar-hidden-btn': {
            type: "boolean",
            label: '启用顶部栏按钮简化',
            description: '关闭后不会再隐藏顶部栏原生按钮',
            defaultValue: true
        },
        'tune-heading-decoration': {
            type: "boolean",
            label: '启用标题装饰',
            description: '关闭后标题块不会再有线条装饰',
            defaultValue: true
        },
        'tune-block-ref-brackets': {
            type: "boolean",
            label: '启用块引用方括号装饰',
            description: '关闭后块引用不会再显示方括号，并恢复下划线',
            defaultValue: true
        },
        'tune-inline-i-font-family': {
            type: "boolean",
            label: '斜体英文采用更为流畅的字体',
            description: '关闭后显示默认的斜体字体',
            defaultValue: true
        }
    };

    await orca.plugins.setSettingsSchema(pluginName, settingsSchema);

    // 应用初始设置的样式
    const settings = orca.state.plugins[pluginName]?.settings;
    if (!settings) return
    Object.keys(settingsSchema).forEach(className => {
        if (settings[className]) document.body.classList.add(className)
    })
}

/**
 * 监听设置选项变更
 */
function setupSettingsWatcher(pluginName) {
    try {
        // 清理旧的订阅
        if (settingsUnsubscribe) {
            settingsUnsubscribe();
            settingsUnsubscribe = null;
        }

        // 监听设置变化
        const { subscribe } = window.Valtio;
        settingsUnsubscribe = subscribe(orca.state.plugins[pluginName], () => {
            const settings = orca.state.plugins[pluginName]?.settings;
            if (!settings) return
            // 更新变化
            Object.keys(settingsSchema).forEach(className => {
                settings[className] ? document.body.classList.add(className) : document.body.classList.remove(className)
            })
        });

    } catch (error) {
        log.error(`❌ 设置监听器启动失败: ${error.message}`);
    }
}


// 注册tabsman命令
function registerCommands() {
    commands = [
        {
            name: "tune.toggleActive",
            fn() {
                if (isThemeCurrentlyActive) {
                    log.info(removeStyles() ? t('主题已停用') : t('主题停用失败'));
                } else {
                    log.info(applyStyles() ? t('主题已激活') : t('主题激活失败'));
                }
            },
            description: "[tune] " + t('激活/停用Tune主题样式')
        },
        {
            name: "tune.toggleIndentOnFocus",
            async fn() {
                const style = await orca.plugins.getData('tune-theme', "indent-style")
                await orca.plugins.setData('tune-theme', "indent-style", style === 1 ? 2 : 1)
                removeStyles()
                applyStyles()
            },
            description: "[tune] " + t('切换聚焦时的缩进风格')
        }
    ]

    commands.forEach(({name,fn,description}) => orca.commands.registerCommand(name, fn, description))
}


// 插件生命周期函数，load函数
export async function load(pluginName) {
    try {
        // 初始化多语言
        setupL10N(orca.state.locale);

        currentPluginName = pluginName;
        
        // 应用主题样式
        await applyStyles();

        // 注册主题激活命令
        registerCommands();

        console.log("[tune-theme] 样式已生效")

        // 注册设置选项
        await registerSettings(pluginName);

        await startThemeSwitcher()
        
        // 最后启动设置监听器，确保所有初始化都完成
        setupSettingsWatcher(pluginName);

    } catch (error) {
        log.error(`${t('插件加载失败 ==> ')}${error.message}`);
    }
}


export async function unload() {
    try {
        // 注销主题激活命令和快捷键
        commands.forEach(({name}) => {
            orca.commands.unregisterCommand(name)
            orca.shortcuts.reset(name);
        })
        commands = null
        log.info(t('主题激活命令和快捷键已注销'));

        removeStyles();

        // 移除所有自定义class
        Object.keys(settingsSchema).forEach(className => document.body.classList.remove(className))
        settingsSchema = null
        log.info('所有自定义class清理完成');

        // 清理设置订阅
        if (settingsUnsubscribe) {
            settingsUnsubscribe();
            settingsUnsubscribe = null;
            log.info('已退订设置选项监听');
        }

        await cleanupThemeSwitcher();

        // 清理本插件的全局变量
        currentPluginName = '';
        isThemeCurrentlyActive = false;
        log.info(t('插件卸载完成'));

    } catch (error) {
        log.error(`${t('插件卸载失败：')} ${error.message}`);
    }
}