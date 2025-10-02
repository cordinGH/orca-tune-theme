// 导入升级模块
import { handleVersionUpgrade } from './tune-upgrade.js';
import { setupL10N, t } from './i18n.js';
import { start as startThemeSwitcher, cleanup as cleanupThemeSwitcher } from './theme-switcher.js';

// 全局变量
let currentPluginName = ''; // 当前插件名称
let isThemeCurrentlyActive = false; // 主题是否激活
let themeActivateCommandId = ''; // 主题激活命令ID
let isClassInjectionActive = false; // class注入是否激活
let settingsUnsubscribe = null; // 设置订阅取消函数

// 日志工具
const log = {
    info: (message) => console.log(`[${currentPluginName}] ${message}`),
    error: (message) => console.error(`[${currentPluginName}] ${message}`)
};


// 初始化函数：初始化插件的全局变量
function initTuneThemeGlobals(pluginName) {
    currentPluginName = pluginName;
    themeActivateCommandId = `${pluginName}.toggleActive`;

    log.info(t('插件初始化完成'));
    return true;
}


// 插件生命周期函数：load函数
export async function load(pluginName) {
    try {
        // 初始化多语言
        setupL10N(orca.state.locale);

        // 初始化全局变量
        if (!initTuneThemeGlobals(pluginName)) {
            throw new Error(t('插件初始化失败'));
        }

        // 应用主题样式
        const applyOK = applyStyles();

        // 注册主题激活命令
        const registerOK = await registerThemeActivateCommand();
        log.info(registerOK ? t('主题激活命令注册成功') : t('主题激活命令注册失败'));

        // 注册设置模式
        await registerSettings(pluginName);

        await startThemeSwitcher(pluginName);
        
        // 最后启动设置监听器，确保所有初始化都完成
        setupSettingsWatcher(pluginName);
        
        // 版本升级处理（放在最后，不阻塞主流程）
        handleVersionUpgrade(pluginName);


    } catch (error) {
        log.error(`${t('插件加载失败 ==> ')}${error.message}`);
    }
}


// 样式管理函数：应用主题基础样式
function applyStyles() {
    try {
        // 使用官方API注入CSS
        orca.themes.injectCSSResource(`${currentPluginName}/dist/custom.css`, currentPluginName);
        isThemeCurrentlyActive = true;
        log.info(t('主题基础样式应用成功'));
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
        log.info(t('主题样式移除成功'));
        return true;
    } catch (error) {
        log.error(`${t('样式移除失败 ==> ')}${error.message}`);
        return false;
    }
}

/**
 * 注册设置模式
 */
async function registerSettings(pluginName) {
    const settingsSchema = {
        enableClassInjection: {
            type: "boolean",
            label: "启用顶部栏按钮简化",
            description: "顶部栏原生按钮隐藏",
            defaultValue: false
        }
    };

    await orca.plugins.setSettingsSchema(pluginName, settingsSchema);
    log.info('✅ 插件设置模式已注册');
}

/**
 * 设置监听器（分离设置注册和监听逻辑）
 */
function setupSettingsWatcher(pluginName) {
    try {
        // 清理旧的订阅（如果存在）
        if (settingsUnsubscribe) {
            settingsUnsubscribe();
            settingsUnsubscribe = null;
        }

        // 监听设置变化
        const { subscribe } = window.Valtio;
        settingsUnsubscribe = subscribe(orca.state.plugins[pluginName], () => {
            const settings = orca.state.plugins[pluginName]?.settings;
            if (settings) {
                const shouldInject = settings.enableClassInjection;
                if (shouldInject !== isClassInjectionActive) {
                    if (shouldInject) {
                        injectCustomClass();
                    } else {
                        removeCustomClass();
                    }
                    isClassInjectionActive = shouldInject;
                }
            }
        });

        // 应用初始设置
        const settings = orca.state.plugins[pluginName]?.settings;
        if (settings?.enableClassInjection) {
            injectCustomClass();
            isClassInjectionActive = true;
        }

        log.info('✅ 设置监听器已启动');
    } catch (error) {
        log.error(`❌ 设置监听器启动失败: ${error.message}`);
    }
}

// 注入class => enable-hidden-btn成功
function injectCustomClass() {
    try {
        const headbarElement = document.getElementById('headbar');
        if (headbarElement) {
            headbarElement.classList.add('enable-hidden-btn');
            log.info('注入class => enable-hidden-btn成功');
            return true;
        } else {
            log.error('未找到#headbar元素');
            return false;
        }
    } catch (error) {
        log.error(`自定义class注入失败: ${error.message}`);
        return false;
    }
}

// 移除class => enable-hidden-btn成功
function removeCustomClass() {
    try {
        const headbarElement = document.getElementById('headbar');
        if (headbarElement) {
            headbarElement.classList.remove('enable-hidden-btn');
            log.info('移除class => enable-hidden-btn成功');
            return true;
        } else {
            log.error('未找到#headbar元素');
            return false;
        }
    } catch (error) {
        log.error(`自定义class移除失败: ${error.message}`);
        return false;
    }
}


// 注册主题激活命令：激活/停用Tune主题样式
async function registerThemeActivateCommand() {
    try {
        // 检查命令是否已存在
        if (orca.state.commands[themeActivateCommandId] == null) {
            // 注册命令
            orca.commands.registerCommand(
                // 命令注册参数1：命令ID
                themeActivateCommandId,
                // 命令注册参数2：绑定主题激活命令的执行函数
                async () => {
                    try {
                        log.info(`${t('即将执行命令：')}${themeActivateCommandId}${t('。当前主题状态：')} ${isThemeCurrentlyActive}`);

                        if (isThemeCurrentlyActive) {
                            // 当前已激活，执行removeStyles
                            log.info(removeStyles() ? t('主题已停用') : t('主题停用失败'));
                        } else {
                            // 当前未激活，执行applyStyles
                            log.info(applyStyles() ? t('主题已激活') : t('主题激活失败'));
                        }

                        log.info(`${t('命令执行完毕，主题状态已切换为：')}${isThemeCurrentlyActive}`);
                    } catch (error) {
                        log.error(`${t('命令执行失败')}: ${error.message}`);
                    }
                },
                // 命令注册参数3： 命令的显示名称
                t('激活/停用Tune主题样式')
            );
            return true; // 命令注册成功
        }
        return true; // 命令已存在，也视为成功
    } catch (error) {
        return false; // 命令注册失败
    }
}


// 插件卸载函数：卸载插件，移除主题激活命令，移除主题样式 和 清理本插件的全局变量
export async function unload() {
    try {
        log.info(t('开始卸载插件'));

        // 注销主题激活命令和快捷键
        orca.commands.unregisterCommand(themeActivateCommandId);
        orca.shortcuts.reset(themeActivateCommandId);
        log.info(t('主题激活命令和快捷键注销成功'));

        // 移除本插件的样式
        removeStyles();
        log.info(t('主题样式移除成功'));

        // 移除自定义class
        removeCustomClass();
        log.info('自定义class清理完成');

        // 清理设置订阅
        if (settingsUnsubscribe) {
            settingsUnsubscribe();
            settingsUnsubscribe = null;
            log.info('设置订阅已清理');
        }

        // 清理设置模式
        try {
            await orca.plugins.setSettingsSchema(currentPluginName, {});
            log.info('设置模式已清理');
        } catch (error) {
            log.error(`设置模式清理失败: ${error.message}`);
        }

        await cleanupThemeSwitcher();

        // 清理插件数据（只清理版本信息，升级模块使用了 setData 存储）
        try {
            await orca.plugins.removeData(currentPluginName, 'version');
            log.info(t('插件数据清理完成'));
        } catch (error) {
            log.error(`${t('插件数据清理失败：')}${error.message}`);
        }

        // 清理本插件的全局变量
        currentPluginName = '';
        isThemeCurrentlyActive = false;
        isClassInjectionActive = false;
        themeActivateCommandId = '';
        settingsUnsubscribe = null;

        log.info(t('插件卸载完成'));

    } catch (error) {
        log.error(`${t('插件卸载失败：')} ${error.message}`);
    }
}