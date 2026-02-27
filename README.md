**[Orca-Note](https://github.com/sethyuan/orca-note) 主题，自用主题**

> [!TIP]
> 因为是基于**非生动风格**，所以关闭生动风格可能表现更好
> <img width="850" height="281" alt="image" src="https://github.com/user-attachments/assets/dc5b9b41-8a35-49b4-9860-52b8e5be50e8" />


# （一）使用方法

前往本仓库的 [Releases](https://github.com/cordinGH/orca-tune-theme/releases) 页面。

在最新版本的 "Assets" 区域，下载 `Source code(zip)` 解压，解压后复制文件夹到 `orca\plugins`。  
**⭐️检查一下最终目录结构是否如下**：

```
orca/
└── plugins/
    └── orca-tune-theme-1.0.0/
        ├── dist/
        ├── icon.png
        ├── LICENSE
        ├── package.json
        └── README.md
```

**⭐️⭐️⭐️最后，最重要的，要退掉 orca-note 重新打开 orca-note ，插件才能被读取，这是现版本所有插件必须的一步。**

---

> [!TIP]  
> - **Q：`orca\` 目录在哪？**  
> - A：从下图进入即可看到  
>   <img width="321" height="134" alt="image" src="https://github.com/user-attachments/assets/50cf1e64-f628-42cb-8e77-82ae4083999b" />

---

# （二）主题基本特征

<img width="3200" height="1901" alt="image" src="https://github.com/user-attachments/assets/199f874e-2246-4172-a019-e9e8b2f4e093" />

( 上图为 **v1.0.0** )

> [!note]
> - 纯 CSS 驱动  
> - 自带 PingFangSC 字体，字重支持范围 200-600  
> - 支持设置命令快捷键，快速启用和关闭主题（命令/快捷键搜索 Tune）

## 各版本主要变化
- 2.9.0 更加稳定的主题切换器(搭配官方主题)
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

## 一、块风格（v1.0.0）
1️⃣代码块：卡片风格、顺滑式光标  
2️⃣引述块：卡片风格、改变缩进尺度（与外部块一致）。适配引述嵌套。  
3️⃣查询块：新的list视图样式，并提供结果计数  
4️⃣标题块：区分不同级别标题；折叠时右侧显示标题级别  
5️⃣镜像块：tana风格  
6️⃣视频块图片块：统一的边界阴影  
7️⃣无序列表：同步有序列表的块标风格
## 二、顶部栏（v1.0.0）
1️⃣非悬停时会收起按钮（仅收起原生按钮，不影响用户插件的按钮）
## 三、左侧栏（v1.0.0）
1️⃣折叠按钮融合块标  
2️⃣优化布局，优化悬停时tooltips位置（减少对内容的遮挡）
## 四、编辑器界面（v1.0.0）
1️⃣新的缩进风格（一级子块顶格。不影响缩进线点击。）  
2️⃣顶部块字号调节，使之看起来像是标题  
3️⃣底部引用为空时 简化显示  
4️⃣优化最近打开界面（ctrl tab 界面）  
5️⃣切换页面时（如前进后退），提供过渡动画  
6️⃣优化右侧按钮，并在分屏时差异化显示（方便判断所处页面）  
7️⃣新的标签属性样式（聚焦）  
8️⃣限制分屏时最小宽度（为了方便拖拽尺寸），并优化留白  
## 五、全局搜索/@搜索（v1.0.0）
1️⃣提供对搜索结果的统计&计数  
2️⃣优化界面显示  
## 六、杂项改动（v1.0.0）
1️⃣折叠按钮平滑切换，并适当优化了位置  
2️⃣优化块选中框的尺寸，使之可以更好的覆盖大块（如代码块）。  
3️⃣优化滚动条样式  
4️⃣改变块引用风格  
5️⃣淡化文本块块标  
6️⃣取消父块块标变色  
7️⃣空块占位文本改成英文（为了减少中文环境下对注意力的干扰）  
## 七、对虎鲸本身的一些ui问题的修正（v1.0.0）
1️⃣修正 orca分割线块标和分割线的垂直对齐  
2️⃣修正 Windows下自定义图标的水平对齐  
3️⃣修正 折叠按钮的垂直对齐  
4️⃣修正 标题块的块引计数器垂直对齐  
5️⃣修正 @弹出窗的尺寸问题
6️⃣修正 url 链接编辑界面的输入框宽度不够的问题  
7️⃣修正 list 视图下，长文结果条目对条目间距的影响  
