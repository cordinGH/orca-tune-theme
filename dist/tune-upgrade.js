// 升级管理模块
import { setupL10N, t } from './i18n.js';
const PLUGIN_VERSION = '2.1.0'; // 插件版本号
let previousVersion = ''; // 之前的版本号

// 日志工具
const log = {
    info: (message) => console.log(`[Tune-Theme-Upgrade] ${message}`),
    error: (message) => console.error(`[Tune-Theme-Upgrade] ${message}`)
};


// 处理版本变更和清理无效快捷键
export async function handleVersionUpgrade(pluginName) {
    try {
        // 设置本地语言
        setupL10N(orca.state.locale);

        // 获取之前的版本信息
        previousVersion = await orca.plugins.getData(pluginName, 'version');
        // 存储新版本信息，用于下次升级检测
        await orca.plugins.setData(pluginName, 'version', PLUGIN_VERSION);

        // 如果版本相同，无需处理
        if (previousVersion === PLUGIN_VERSION) {
            log.info(t('版本未变化，无需处理'));
            return;
        }

        // 初始化设置界面
        await orca.plugins.setSettingsSchema(pluginName, {});
        log.info(t('检测到版本变更或首次安装。已初始化设置界面'));

        // 延迟执行快捷键清理，等待快捷键完全加载
        setTimeout(async () => {
            // 清理无效快捷键
            await cleanupInvalidShortcuts();

            // 清理成功后发送通知
            if (previousVersion) {
                orca.notify("success", `${t('Tune Theme 已成功从')} ${previousVersion} ${t('变更到')} ${PLUGIN_VERSION}！`);
                log.info(`${t('Tune Theme 变更完成：')}${previousVersion} ${t('==>')} ${PLUGIN_VERSION}`);
            } else {
                orca.notify("success", `${t('Tune Theme')} ${PLUGIN_VERSION} ${t('安装成功！可命令面板搜索 tune 切换主题')}`);
                log.info(`${t('Tune Theme 首次安装：版本')} ${PLUGIN_VERSION}`);
            }
        }, 1000);

    } catch (error) {
        log.error(`${pluginName} ${t('更新处理失败==> ')} ${error.message}`);
        orca.notify("error", `${t('插件更新/安装遇到问题，建议重启Orca')}`, {
            title: `${t('更新/安装失败')}`
        });
    }
}


// 清理无效快捷键（解决用户物理删除插件文件夹后的残留问题）
async function cleanupInvalidShortcuts() {
    try {
        log.info(t('开始清理无效快捷键'));
        const allShortcuts = orca.state.shortcuts || {};
        const allCommands = Object.keys(orca.state.commands || {});


        // 用于存储所有检测到的无效命令ID
        const invalidCommandIds = [];
        const invalidTuneThemeCommandIds = [];
        for (const [boundCommandId, shortcut] of Object.entries(allShortcuts)) {
            // 检查命令是否仍然存在
            const commandExists = allCommands.includes(boundCommandId);

            // 检查是否为tune主题相关命令
            const isTuneThemeCommand = boundCommandId.toLowerCase().includes('tune-theme') ||
                boundCommandId.toLowerCase().includes('tune theme') ||
                boundCommandId.toLowerCase().includes('tunetheme');
            if (isTuneThemeCommand && !commandExists) {
                // tune主题的无效命令：清理并记录
                invalidTuneThemeCommandIds.push(boundCommandId);
                orca.shortcuts.reset(boundCommandId);
                log.info(`${t('已清理无效的残留快捷键（仅Tune-theme）：')} ${boundCommandId} ${t('==>')} ${shortcut}`);
            } else if (!commandExists) {
                // 非tune主题的无效命令：只记录，不清理
                invalidCommandIds.push(boundCommandId);
                log.info(`${t('发现无效的残留快捷键（非Tune-theme）：')} ${shortcut} ${t('==>')} ${boundCommandId}
${t('💡 复制此命令到控制台删除本条残留：')} orca.shortcuts.reset('${boundCommandId}')
${t('🔍 复制此命令检测是否删除成功：')} orca.state.shortcuts['${boundCommandId}']`);
            }
        }

        log.info(`${t('共清理了')} ${invalidTuneThemeCommandIds.length} ${t('个无效的残留快捷键（仅Tune-theme）')}`);

    } catch (error) {
        log.error(`${t('清理无效快捷键失败:')} ${error.message}`);
    }
}