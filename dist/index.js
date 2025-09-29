// 导入升级模块
import { handleVersionUpgrade } from './tune-upgrade.js';
import { setupL10N, t } from './i18n.js';

// 常量定义
const BASE_LINK_ID = 'tune-theme-inject-baseStyles'; // 基础CSS文件的link ID
const BASE_CSS_NAME = 'custom.css'; // 基础CSS文件的名称
// 全局变量
let currentPluginName = ''; // 当前插件名称
let cssPathPrefix = ''; // CSS路径前缀
let isThemeCurrentlyActive = false; // 主题是否激活
let themeActivateCommandId = ''; // 主题激活命令ID

// 日志工具
const log = {
    info: (message) => console.log(`[${currentPluginName}] ${message}`),
    error: (message) => console.error(`[${currentPluginName}] ${message}`)
};


// 初始化函数：初始化插件的全局变量
function initTuneThemeGlobals(pluginName) {
    currentPluginName = pluginName;
    themeActivateCommandId = `${pluginName}.toggleActive`;

    // 设置CSS路径前缀（当前JS文件所在的绝对路径）
    cssPathPrefix = new URL('.', import.meta.url).href;

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
        const applyOK = await applyStyles();
        log.info(applyOK ? t('主题基础样式应用成功') : t('主题基础样式应用失败'));

        // 注册主题激活命令
        const registerOK = await registerThemeActivateCommand();
        log.info(registerOK ? t('主题激活命令注册成功') : t('主题激活命令注册失败'));

        // 版本升级处理（放在最后，不阻塞主流程）
        handleVersionUpgrade(pluginName);

    } catch (error) {
        log.error(`${t('插件加载失败 ==> ')}${error.message}`);
    }
}


// 样式管理函数：应用主题基础样式
async function applyStyles() {
    try {
        // 获取 DOM 元素
        const head = document.head || document.getElementsByTagName('head')[0];

        if (!head) {
            log.error(t('无法找到document.head，无法注入CSS'));
            return false;
        }


        // 注入基础CSS
        const cssPath = cssPathPrefix + BASE_CSS_NAME; // 基础CSS文件的绝对路径
        const linkId = BASE_LINK_ID; // 基础CSS文件的link ID
        const success = await injectCSS(cssPath, linkId, head);

        if (success) {
            isThemeCurrentlyActive = true;
        }
        return success;
    } catch (error) {
        log.error(`${t('样式应用失败 ==> ')}${error.message}`);
        isThemeCurrentlyActive = false;
        return false;
    }
}

// 工具函数：注入CSS
function injectCSS(cssPath, linkId, head) {
    return new Promise((resolve, reject) => {
        // 检查是否已经存在相同的CSS
        if (document.getElementById(linkId)) {
            log.info(`${t('跳过注入，因为该CSS已存在 ==> link-ID: #')}${linkId}`);
            resolve(true);
            return;
        }

        try {
            // 创建link元素
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = cssPath;
            link.id = linkId;

            // 事件监听 - 在监听回调完成后，调用 resolve 完成 Promise
            link.onload = () => {
                log.info(`${t('CSS注入成功 ==> link-ID: #')}${link.id}`);
                resolve(true);
            };

            link.onerror = () => {
                const error = `${t(`CSS注入失败，路径：`)} ${link.href}`;
                log.error(error);
                log.error(t('注入失败的可能原因: 文件不存在、权限问题或CSS语法错误'));
                reject(new Error(error));
            };

            head.appendChild(link);

        } catch (error) {
            log.error(`${t('CSS注入失败：')}${error.message}`);
            reject(error);
        }
    });
}


// 移除主题基础样式
function removeStyles() {
    // 移除本插件的基础CSS的link元素
    document.getElementById(BASE_LINK_ID)?.remove();


    // 更新状态
    isThemeCurrentlyActive = false;
    return true;
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
                            log.info(await applyStyles() ? t('主题已激活') : t('主题激活失败'));
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

        // 清理插件数据
        try {
            await orca.plugins.removeData(currentPluginName, 'version');
            await orca.plugins.removeData(currentPluginName, 'settings');
            log.info(t('插件数据清理完成'));
        } catch (error) {
            log.error(`${t('插件数据清理失败：')}${error.message}`);
        }

        // 清理本插件的全局变量
        currentPluginName = '';
        isThemeCurrentlyActive = false;
        cssPathPrefix = '';
        themeActivateCommandId = '';

        log.info(t('插件卸载完成'));

    } catch (error) {
        log.error(`${t('插件卸载失败：')} ${error.message}`);
    }
}