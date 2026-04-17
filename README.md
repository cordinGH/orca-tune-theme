**[Orca-Note](https://github.com/sethyuan/orca-note) 主题**

## 使用说明

- 因为是基于**非生动风格**编写，所以**关闭生动风格**可能表现更好  
    <img width="850" height="281" alt="image" src="https://github.com/user-attachments/assets/dc5b9b41-8a35-49b4-9860-52b8e5be50e8" />
- 本插件可以与[官方主题插件](https://github.com/sethyuan/orca-plugin-official-themes)联动，遵循下图配置即可。  
     <img width="716" height="225" alt="image" src="https://github.com/user-attachments/assets/75bc056b-e111-4e51-847f-a91d2fbc288c" />
     
   https://github.com/user-attachments/assets/e5e28e5b-57e7-4d07-a708-c3c2cd5b1e28

---

### 更新日志
- 3.2.0 解决了大型页面的卡顿问题（2.8.0版本引入了一个异常选择器），现加载和响应速度和官方原生基本无疑。
- 2.9.0 [更加稳定的主题切换器(搭配官方主题)](https://github.com/cordinGH/orca-tune-theme/releases/tag/2.9.0)
- [v2.4.0](https://github.com/cordinGH/orca-tune-theme/releases/tag/v2.4.0)：适配了 [official-themes](https://github.com/sethyuan/orca-plugin-official-themes) 各配色下的查询块列表视图
- [v2.3.0](https://github.com/cordinGH/orca-tune-theme/releases/tag/v2.3.0)
  - 新增设置项：是否启用顶部栏简化（原生按钮）
  - 新增顶部栏切换按钮，可以在[official-themes](https://github.com/sethyuan/orca-plugin-official-themes)主题和tune主题之间循环切换（official-themes请开启圆角选项）
- **v2.2.0** [兼容了官方插件official-themes，可以叠加运行/优化加载](https://github.com/cordinGH/orca-tune-theme/releases/tag/v2.2.0)  
- **v2.1.0** [支持本地语言翻译](https://github.com/cordinGH/orca-tune-theme/releases/tag/v2.1.0)  
- **v2.0.0** [重构注入代码/表格视图计数/优化图片块按钮位置](https://github.com/cordinGH/orca-tune-theme/releases/tag/v2.0.0)  
- **v1.6.0** [优化表格视图&左侧栏](https://github.com/cordinGH/orca-tune-theme/releases/tag/v1.6.0)  
- **v1.5.0** [左侧栏更为平滑的收起/展开](https://github.com/cordinGH/orca-tune-theme/releases/tag/v1.5.0)  
- **v1.4.0** [支持图文环绕](https://github.com/cordinGH/orca-tune-theme/releases/tag/v1.4.0)  
- **v1.3.0** [新风格：顶部栏和左侧栏形成一个视觉整体，包裹住主编辑区域](https://github.com/cordinGH/orca-tune-theme/releases/tag/v1.3.0)  
- **v1.2.0** [右侧栏toc从顶格开始显示](https://github.com/cordinGH/orca-tune-theme/releases/tag/v1.2.0)
- **v1.1.0** [优化查询块样式](https://github.com/cordinGH/orca-tune-theme/releases/tag/v1.1.0)  

## 主题基本特征

<img width="3200" height="1901" alt="image" src="https://github.com/user-attachments/assets/199f874e-2246-4172-a019-e9e8b2f4e093" />

( 上图为 **v1.0.0** )

> [!note]
> - 纯 CSS 驱动  
> - 自带 PingFangSC 字体，字重支持范围 200-600  
> - 支持设置命令快捷键，快速启用和关闭主题（命令/快捷键搜索 Tune）

### 1. 块风格（v1.0.0）
1️⃣代码块：卡片风格、顺滑式光标  
2️⃣引述块：卡片风格、改变缩进尺度（与外部块一致）。适配引述嵌套。  
3️⃣查询块：新的list视图样式，并提供结果计数  
4️⃣标题块：区分不同级别标题；折叠时右侧显示标题级别  
5️⃣镜像块：tana风格  
6️⃣视频块图片块：统一的边界阴影  
7️⃣无序列表：同步有序列表的块标风格
### 2. 顶部栏（v1.0.0）
1️⃣非悬停时会收起按钮（仅收起原生按钮，不影响用户插件的按钮）
### 3. 左侧栏（v1.0.0）
1️⃣折叠按钮融合块标  
2️⃣优化布局，优化悬停时tooltips位置（减少对内容的遮挡）
### 4. 编辑器界面（v1.0.0）
1️⃣新的缩进风格（一级子块顶格。不影响缩进线点击。）  
2️⃣顶部块字号调节，使之看起来像是标题  
3️⃣底部引用为空时 简化显示  
4️⃣优化最近打开界面（ctrl tab 界面）  
5️⃣切换页面时（如前进后退），提供过渡动画  
6️⃣优化右侧按钮，并在分屏时差异化显示（方便判断所处页面）  
7️⃣新的标签属性样式（聚焦）  
8️⃣限制分屏时最小宽度（为了方便拖拽尺寸），并优化留白  
### 5. 全局搜索/@搜索（v1.0.0）
1️⃣提供对搜索结果的统计&计数  
2️⃣优化界面显示  
### 6. 杂项改动（v1.0.0）
1️⃣折叠按钮平滑切换，并适当优化了位置  
2️⃣优化块选中框的尺寸，使之可以更好的覆盖大块（如代码块）。  
3️⃣优化滚动条样式  
4️⃣改变块引用风格  
5️⃣淡化文本块块标  
6️⃣取消父块块标变色  
7️⃣空块占位文本改成英文（为了减少中文环境下对注意力的干扰）  
### 7. 对虎鲸本身的一些ui问题的修正（v1.0.0）
1️⃣修正 orca分割线块标和分割线的垂直对齐  
2️⃣修正 Windows下自定义图标的水平对齐  
3️⃣修正 折叠按钮的垂直对齐  
4️⃣修正 标题块的块引计数器垂直对齐  
5️⃣修正 @弹出窗的尺寸问题
6️⃣修正 url 链接编辑界面的输入框宽度不够的问题  
7️⃣修正 list 视图下，长文结果条目对条目间距的影响  
