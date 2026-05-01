// 多语言支持模块

let locale = "zh-CN";
const translations = {
    "en": {
        // 插件生命周期
        "插件初始化完成": "Plugin initialization completed",
        "插件初始化失败": "Plugin initialization failed",
        "插件加载失败 ==> ": "Plugin loading failed ==> ",
        "主题基础样式应用成功": "Theme base styles applied successfully",
        "主题基础样式应用失败": "Theme base styles application failed",
        "主题激活命令注册成功": "Theme activation command registered successfully",
        "主题激活命令注册失败": "Theme activation command registration failed",
        
        // 样式管理
        "无法找到document.head，无法注入CSS": "Cannot find document.head, unable to inject CSS",
        "Body已存在ID ==> #": "Body already has ID ==> #",
        "将覆盖为 #": "will override to #",
        "样式应用失败 ==> ": "Style application failed ==> ",
        
        // CSS注入
        "跳过注入，因为该CSS已存在 ==> link-ID: #": "Skip injection, CSS already exists ==> link-ID: #",
        "CSS注入成功 ==> link-ID: #": "CSS injection successful ==> link-ID: #",
        "CSS注入失败，路径：": "CSS injection failed, path: ",
        "注入失败的可能原因: 文件不存在、权限问题或CSS语法错误": "Possible reasons for injection failure: file not found, permission issues, or CSS syntax errors",
        "CSS注入失败：": "CSS injection failed: ",
        
        // 命令执行
        "即将执行命令：": "About to execute command: ",
        "。当前主题状态：": ". Current theme status: ",
        "主题已停用": "Theme has been deactivated",
        "主题停用失败": "Theme deactivation failed",
        "主题已激活": "Theme has been activated",
        "主题激活失败": "Theme activation failed",
        "命令执行完毕，主题状态已切换为：": "Command execution completed, theme status switched to: ",
        "命令执行失败": "Command execution failed",
        "激活/停用Tune主题样式": "Activate/Deactivate Tune Theme",
        
        // 插件卸载
        "开始卸载插件": "Starting plugin unload",
        "主题激活命令和快捷键注销成功": "Theme activation command and shortcut unregistered successfully",
        "主题样式移除成功": "Theme styles removed successfully",
        "插件数据清理完成": "Plugin data cleanup completed",
        "插件数据清理失败：": "Plugin data cleanup failed: ",
        "插件卸载完成": "Plugin unload completed",
        "插件卸载失败：": "Plugin unload failed: ",
        
        // 版本升级
        "版本未变化，无需处理": "Version unchanged, no processing needed",
        "检测到版本变更或首次安装。已初始化设置界面": "Version change or first installation detected. Settings interface initialized",
        "Tune Theme 已成功从": "Tune Theme successfully updated from",
        "变更到": "to",
        "==>": "==>",
        "Tune Theme 变更完成：": "Tune Theme update completed:",
        "Tune Theme": "Tune Theme",
        "安装成功！可命令面板搜索 tune 切换主题": "installed successfully! Search 'tune' in command palette to toggle theme",
        "Tune Theme 首次安装：版本": "Tune Theme first installation: version",
        "更新处理失败==> ": "update processing failed ==> ",
        "插件更新/安装遇到问题，建议重启Orca": "Plugin update/installation encountered issues, recommend restarting Orca",
        "更新/安装失败": "Update/Installation Failed",
        "开始清理无效快捷键": "Starting cleanup of invalid shortcuts",
        "已清理无效的残留快捷键（仅Tune-theme）：": "Cleaned up invalid residual shortcut (Tune-theme only):",
        "发现无效的残留快捷键（非Tune-theme）：": "Found invalid residual shortcut (non-Tune-theme):",
        "💡 复制此命令到控制台删除本条残留：": "💡 Copy this command to console to delete this residual:",
        "🔍 复制此命令检测是否删除成功：": "🔍 Copy this command to check if deletion was successful:",
        "共清理了": "Cleaned up",
        "个无效的残留快捷键（仅Tune-theme）": "invalid residual shortcuts (Tune-theme only)",
        "清理无效快捷键失败:": "Failed to cleanup invalid shortcuts:"
    }
};

// 设置本地语言
export function setupL10N(currentLocale) {
    locale = currentLocale;
}

// 翻译函数
export function t(key) {
    // 当前语言是中文直接返回原消息
    if (locale === "zh-CN") return key;
    return translations[locale]?.[key] ?? key;
}
