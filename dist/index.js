// dist/index.js

// 模块作用域变量
let currentPluginName = '';
const THEME_CSS_ID_PREFIX = 'css-injector-';
const BODY_ID = 'custom-theme-body'; // 新增常量，便于维护
let isThemeCurrentlyActive = false; // 用于跟踪主题的当前状态
let themeToggleCommandId = '';    // 用于存储命令的ID
let absoluteCssPath = ''; // 新增：缓存 CSS 路径，避免重复创建 URL

// --- Helper 函数：获取 DOM 元素，减少重复查询 ---
function getDomElements() {
  const head = document.head || document.getElementsByTagName('head')[0];
  const body = document.body || document.getElementsByTagName('body')[0];
  return { head, body };
}

// --- 内部 CSS 加载逻辑 ---
function applyThemeStylesInternal() {
  if (!currentPluginName) {
    console.warn('applyThemeStylesInternal called but currentPluginName is not set.');
    return;
  }
  try {
    const { head, body } = getDomElements();

    if (head) {
      const linkId = THEME_CSS_ID_PREFIX + currentPluginName;
      if (document.getElementById(linkId)) {
        console.log(`Plugin '${currentPluginName}': Theme CSS link already exists (ID: ${linkId}).`);
        isThemeCurrentlyActive = true; // 确保状态同步
        return;
      }

      // 先添加 ID 到 body 元素，确保在 CSS 加载前 body 已带有 ID
      if (body && !body.id) { // 检查是否已有 ID，避免覆盖
        body.id = BODY_ID;
        console.log(`Plugin '${currentPluginName}': Added ID '${BODY_ID}' to body element.`);
      } else if (body && body.id) {
        console.warn(`Plugin '${currentPluginName}': Body already has an ID '${body.id}'. Not adding new ID to avoid conflicts.`);
      } else {
        console.error(`Plugin '${currentPluginName}': Could not find document body to add ID.`);
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = absoluteCssPath;
      link.id = linkId;

      // 添加 onload 和 onerror 以确认加载成功
      link.onload = () => {
        console.log(`Plugin '${currentPluginName}': CSS loaded successfully.`);
        isThemeCurrentlyActive = true;
      };
      link.onerror = () => {
        console.error(`Plugin '${currentPluginName}': Failed to load CSS from ${absoluteCssPath}.`);
        isThemeCurrentlyActive = false;
      };

      head.appendChild(link);
      console.log(`Plugin '${currentPluginName}': Custom CSS link created with ID '${link.id}'. Path: ${absoluteCssPath}`);
    } else {
      console.error(`Plugin '${currentPluginName}': Could not find document head to inject CSS.`);
      isThemeCurrentlyActive = false; // 加载失败，状态设为false
    }
  } catch (e) {
    console.error(`Plugin '${currentPluginName}': Error applying theme styles.`, e);
    isThemeCurrentlyActive = false; // 加载失败，状态设为false
  }
}

// --- 内部 CSS 卸载逻辑 ---
function removeThemeStylesInternal() {
  if (!currentPluginName) {
    console.warn('removeThemeStylesInternal called but currentPluginName is not set.');
    return;
  }
  try {
    const { body } = getDomElements(); // 只需 body，这里不需要 head 但为了统一使用 helper
    const linkId = THEME_CSS_ID_PREFIX + currentPluginName;
    const themeLinkElement = document.getElementById(linkId);
    if (themeLinkElement) {
      themeLinkElement.remove();
      isThemeCurrentlyActive = false;
      console.log(`Plugin '${currentPluginName}': Custom CSS unloaded by removing element with ID '${linkId}'.`);
    } else {
      // 即使没找到元素，也应该将状态视为false，因为我们期望它被移除
      isThemeCurrentlyActive = false;
      console.warn(`Plugin '${currentPluginName}': No custom CSS link found to unload (expected ID: '${linkId}'). Current state set to inactive.`);
    }

    // 移除 body 的 ID（仅当它是我们添加的）
    if (body && body.id === BODY_ID) {
      body.removeAttribute('id');
      console.log(`Plugin '${currentPluginName}': Removed ID '${BODY_ID}' from body element.`);
    }
  } catch (e) {
    console.error(`Plugin '${currentPluginName}': Error removing theme styles.`, e);
    isThemeCurrentlyActive = false; // 出错时，也认为主题未激活
  }
}

// --- 切换主题的命令执行函数 ---
function toggleThemeCommandExecute() {
  if (!currentPluginName) {
    console.warn('toggleThemeCommandExecute called but currentPluginName is not set.');
    return;
  }
  console.log(`Command '${themeToggleCommandId}' executed. Current theme active state BEFORE toggle: ${isThemeCurrentlyActive}`);
  if (isThemeCurrentlyActive) {
    removeThemeStylesInternal();
  } else {
    applyThemeStylesInternal();
  }
  console.log(`Theme active state AFTER toggle: ${isThemeCurrentlyActive}`);
  // 如果有持久化设置，可以在这里保存 isThemeCurrentlyActive 的状态
  // await orca.settings.set(currentPluginName, 'themeActive', isThemeCurrentlyActive);
}

// --- load 函数 (修改版：加载时默认应用主题) ---
export async function load(pluginName) {
  currentPluginName = pluginName;
  themeToggleCommandId = `${pluginName}.toggleMyTheme`; // 定义命令ID

  // 计算并缓存 CSS 路径
  const cssUrl = new URL('./custom.css', import.meta.url);
  absoluteCssPath = cssUrl.href;

  console.log(`Plugin '${currentPluginName}' LOADED. Attempting to apply theme by default. Command '${themeToggleCommandId}' will be registered.`);

  // ***** 主要改动在这里 *****
  // 直接应用主题样式
  applyThemeStylesInternal();
  // isThemeCurrentlyActive 会在 applyThemeStylesInternal 内部被设为 true (如果成功)
  // ***********************

  // 注册命令 (使用 optional chaining)
  try {
    const registerCommand = window.orca?.commands?.registerCommand;
    if (registerCommand) {
      registerCommand(themeToggleCommandId, toggleThemeCommandExecute, '启用/关闭Tune主题');
      console.log(`Plugin '${pluginName}': Command '${themeToggleCommandId}' successfully registered.`);
    } else {
      console.warn(`Plugin '${pluginName}': orca.commands.registerCommand API not found. Command cannot be registered.`);
    }
  } catch (e) {
    console.error(`Plugin '${pluginName}': Error registering command '${themeToggleCommandId}'.`, e);
  }

  // 确保在函数末尾打印正确的状态（如果 applyThemeStylesInternal 成功了）
  console.log(`Theme active state after initial load: ${isThemeCurrentlyActive}`);
  return Promise.resolve();
}

// --- unload 函数 ---
export async function unload() {
  if (!currentPluginName) {
    console.warn('Unload called but currentPluginName is not set (was load successful?).');
    return Promise.resolve();
  }
  console.log(`Plugin '${currentPluginName}' UNLOADING...`);

  // 1. 注销命令 (使用 optional chaining)
  try {
    const unregisterCommand = window.orca?.commands?.unregisterCommand;
    if (unregisterCommand && themeToggleCommandId) {
      unregisterCommand(themeToggleCommandId);
      console.log(`Plugin '${currentPluginName}': Command '${themeToggleCommandId}' unregistered.`);
    } else {
      console.warn(`Plugin '${currentPluginName}': Command unregistration API not available or command ID unknown.`);
    }
  } catch (e) {
    console.error(`Plugin '${currentPluginName}': Error unregistering command.`, e);
  }

  // 2. 移除CSS样式 (如果当前是激活状态，或者干脆都移除)
  removeThemeStylesInternal(); // 插件卸载时，确保移除样式

  console.log(`Plugin '${currentPluginName}' UNLOADED. Theme state was: ${isThemeCurrentlyActive}`);
  // 清理状态变量
  currentPluginName = '';
  isThemeCurrentlyActive = false;
  themeToggleCommandId = '';
  absoluteCssPath = ''; // 清理缓存
  return Promise.resolve();
}
