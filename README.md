# paper-deep-reader

**简体中文** | [English](README.en.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-4A7C7E.svg)](LICENSE)
[![Agent Skills](https://img.shields.io/badge/Agent_Skills-Claude_Code_%7C_Codex_%7C_Cursor_%7C_Antigravity-B86B52.svg)](#快速开始)
[![Output](https://img.shields.io/badge/Output-Single--File_Interactive_HTML-5E8C61.svg)](#效果预览)

一个面向科研论文深度精读的 Agent Skill。输入本地 PDF、arXiv、开放获取 DOI 或 Zotero 文献，生成单个可离线打开的交互式 HTML 精读长文——包含逐页视觉核对的公式与实验数据、矢量机制图、Matplotlib 统计图，以及支持滚轮缩放与拖拽平移的矢量图表灯箱。

---

## 效果预览

- **在线交互预览（GitHub Pages）**：[Pinho (2002) 完整精读页面](https://yangyannick.github.io/paper-deep-reader/examples/pinho-2002-demo.html)
- **本地离线查看**：直接在浏览器中打开 [`examples/pinho-2002-demo.html`](examples/pinho-2002-demo.html)

示例基于 Pinho (2002), *IEEE Signal Processing Letters*, Vol. 9, No. 1, pp. 5–7 生成，单文件约 250 KB，无需服务器或构建步骤。

| 刊物风格排版与悬浮目录 | 矢量架构图与交互式步进演示 |
| :---: | :---: |
| ![刊物排版与核心摘要](docs/images/preview-hero.png) | ![矢量架构图与交互步进演示](docs/images/preview-interactive.png) |
| **全宽 Matplotlib 矢量统计图** | **极值个案对比与交互式数据表** |
| ![全宽矢量统计图](docs/images/preview-charts.png) | ![交互数据表与个案对比](docs/images/preview-table-audit.png) |

---

## 核心特性

- **逐页视觉核验，拒绝编造数据**：先用 PyMuPDF 将关键页渲染为 PNG 逐页核对公式、多栏表格与脚注，再动笔撰写，避免纯文本抽取错位。
- **刊物级长文阅读体验**：采用暖纸低饱和配色、左侧悬浮目录、KaTeX 数学排版与零阻塞加载策略（无外链 Google Fonts、无拖帧毛玻璃），长文和复杂图表也能秒开顺滑滚动。
- **按论文类型自适应生成可视化与交互**：离散算法类自动配步进状态机与交互沙盒，架构/系统类配联动高亮矢量图与对比卡片，数据密集型图表自动拆分为全宽 Matplotlib 矢量 SVG，所有图表内置滚轮缩放（50%–500%）与拖拽平移灯箱。
- **有深度的方法剖析，无冗余标记**：正文保留完整的数值微算例、关键设计取舍与实验局限性分析，不堆砌 AI 套话或多余的校验角标。
- **单文件便携交付，零硬依赖输入**：CSS、JS 与矢量 SVG 全部内联进单个 ~250 KB 的 `.html` 文件；支持本地 PDF、arXiv、开放获取 DOI 与 Zotero 7+ 本地文献库，无需强制安装额外 MCP 或插件。

---

## 快速开始

### 1. 安装 Skill

兼容 **Claude Code**、**Codex**、**Cursor**、**Antigravity** 及支持 Agent Skills 规范的助手：

```bash
# 方式一：通过 skills CLI 安装
npx skills add yangyannick/paper-deep-reader

# 方式二：直接克隆到本地 skills 目录
git clone https://github.com/yangyannick/paper-deep-reader.git ~/.agents/skills/paper-deep-reader
```

> 本 Skill 默认配置为显式触发，不会在你随口询问论文问题时误启动。使用时在提示词中提及 `paper-deep-reader` / `$paper-deep-reader`，或明确要求生成交互式 HTML 精读页面即可。

### 2. 安装 Python 依赖

```bash
pip install -r requirements.txt
```

- **核心依赖**：`pymupdf`、`matplotlib`、`numpy`、`pillow`（用于 PDF 渲染与矢量统计图）。论文拉取脚本 `scripts/fetch_paper.py` 仅使用 Python 标准库，无额外依赖。
- **可选质检环境**：Node.js（用于 `node --check` 校验内联 JS 语法）及本机 Chrome / Chromium / Edge（自动探测，用于 1440px 无头截图审查）。

---

## 支持的输入源

| 输入方式 | 额外插件 | 说明 |
| :--- | :---: | :--- |
| **本地 PDF**（`path/to/paper.pdf`） | 不需要 | 默认入口，离线可用，直接渲染关键页并核验内容。 |
| **arXiv ID / 链接**（`1706.03762` 等） | 不需要 | 内置 `scripts/fetch_paper.py` 自动拉取元数据并下载 PDF。 |
| **开放获取 DOI**（`10.1038/...`） | 不需要 | 查 Crossref 书目信息，并依次从 OpenAlex、Europe PMC、Semantic Scholar、可选 Unpaywall 获取合法 OA PDF。 |
| **付费墙 DOI**（`10.1109/...`） | 不需要 | 仅保存书目元数据并停下提示提供本地 PDF 或 Zotero 条目（退出码 `2`），不凭摘要硬编，也不调用灰色源。 |
| **Zotero 7+ 本地文献库** | 不需要 | 兼容 Zotero 7 / 8 / 9 / 10，直连本地 API（`127.0.0.1:23119`），自动读取元数据、笔记并定位本地 PDF（含自定义数据目录）。若已装 `zotero-cli` / `zotero-mcp` 也可直接复用。 |

---

## 使用示例

### 在对话中调用

**1. 本地 PDF（离散算法 / 编解码类论文）**
```text
使用 $paper-deep-reader 深度精读 ./papers/pinho-2002.pdf，给出完整的小规模手算闭环算例、交互式步进演示器、自定义输入沙盒与可筛选的原始实验数据表。
```

**2. arXiv 或开放获取 DOI（深度学习 / 架构类论文）**
```text
使用 $paper-deep-reader 精读 arXiv:2312.00752（Mamba），重点绘制带高亮联动的层级架构图、张量维度推演、消融对比小多图和序列长度扩展曲线。
```
```text
使用 $paper-deep-reader 精读 DOI 10.1038/s41586-021-03819-2。
```

**3. 从 Zotero 读取文献并融合已有笔记**
```text
使用 $paper-deep-reader 读取我 Zotero 里的《Online Preprocessing for Sparse Histograms》，并把我已有的 Zotero 笔记结合进最后的工程启发部分。
```

**4. 结合自身研究方向分析工程迁移边界**
```text
使用 $paper-deep-reader 精读 ./papers/bitshuffle-2015.pdf，在最后结合我的研究方向（16-bit 高速科学采集数据流的实时无损压缩）分析可迁移点、内存开销与失效边界。
```

**5. 输出全英文精读页面**
```text
Use $paper-deep-reader on arXiv:1706.03762 and write the entire standalone interactive HTML monograph in English.
```

### 独立运行内置脚本（CLI）

```bash
# 1. 拉取论文元数据与 PDF（arXiv / OA DOI / Zotero 7+）
python scripts/fetch_paper.py --source 1706.03762 --out ./temp/demo
python scripts/fetch_paper.py --source 10.1038/s41586-021-03819-2 --out ./temp/demo
python scripts/fetch_paper.py --zotero-query "sparse histograms" --out ./temp/demo

# 2. 提取全文并渲染 200 DPI 核验页图
python scripts/extract_pdf.py --pdf ./temp/demo/arxiv_1706.03762.pdf --out ./temp/demo --pages 1-6 --dpi 200

# 3. 对生成的 HTML 运行静态检查（KaTeX、重复 ID、JS 语法、禁用套话）
python scripts/qa_static.py examples/pinho-2002-demo.html --strict-cliches

# 4. 捕获 1440px 浏览器截图切片进行视觉审查
python scripts/qa_browser_shots.py --html examples/pinho-2002-demo.html --out ./temp/demo/qa_shots
```

---

## 工作流与目录结构

整体按四步推进：**① 源文献落地与逐页视觉核对** → **② 学术长文撰写与算例/边界核查** → **③ 矢量图绘制、统计图自检与单文件组装** → **④ 静态与 1440px 浏览器双层质检**。

```text
paper-deep-reader/
├── SKILL.md                           # 完整工作流、输入源适配与按论文类型选型规范
├── agents/
│   └── openai.yaml                    # Codex 显式调用配置
├── assets/
│   ├── theme-morandi.css              # 暖纸莫兰迪排版样式表与灯箱样式
│   ├── widgets.js                     # 目录联动、术语-SVG 高亮、中英自适应矢量灯箱
│   └── morandi-academic.mplstyle      # 配色统一的 Matplotlib 学术样式
├── references/
│   ├── academic-writing-guide.md      # 叙事结构、手算算例与证据边界规范
│   ├── diagram-and-layout-guide.md    # 矢量机制图工艺与交互组件指南
│   └── plotting-guide.md              # 全宽/双栏拆图规则与绘图视觉自检清单
├── scripts/
│   ├── fetch_paper.py                 # 零依赖拉取器（arXiv / OA DOI / PDF URL / Zotero 7+）
│   ├── extract_pdf.py                 # PyMuPDF 文本提取与核验页 PNG 渲染
│   ├── assemble_html.py               # 单文件 HTML 组装器（SVG 清理与 ID 隔离）
│   ├── qa_static.py                   # 静态质检脚本（公式、ID、套话、node --check）
│   └── qa_browser_shots.py            # 跨平台无头浏览器 1440px 截图切片脚本
├── docs/images/                       # README 展示截图
├── examples/
│   └── pinho-2002-demo.html           # 完整单文件 HTML 示例
├── requirements.txt
├── README.md                          # 简体中文文档（默认）
├── README.en.md                       # English documentation
└── LICENSE                            # MIT
```

---

## 常见问题

- **为什么某些 DOI 会返回 `PAYWALL_OR_NO_OA_PDF`？**  
  IEEE、Elsevier、Springer 等订阅制期刊不通过公开接口提供全文 PDF。`fetch_paper.py` 只查询合法开放获取源，不会接入灰色镜像，也不允许模型仅靠摘要推测公式和实验数据；遇到此类论文直接传本地 PDF 或从 Zotero 读取即可。设置环境变量 `UNPAYWALL_EMAIL=you@example.com` 可额外启用 Unpaywall 检索机构库与作者预印本。
- **如何开启 Zotero 7+ 本地 API？**  
  打开 Zotero（7 / 8 / 9 / 10 通用）→ **设置 → 高级 → 常规** → 勾选「允许此计算机上的其他应用程序与 Zotero 通信」。脚本通过 `/file` 接口自动解析真实磁盘路径，即使你把 Zotero 数据目录迁到了 `D:\Zotero` 等自定义位置也无需额外传参。
- **生成的 HTML 完全离线也能看吗？**  
  样式、交互脚本、原始数据表与所有矢量图表均内联在单个 HTML 内，无外链字体或图床；仅数学公式排版按需加载 KaTeX CDN（离线时正文、表格与所有矢量图依然正常浏览）。

---

## 致谢与开源协议

本仓库全部模板、样式表、脚本与规范文档均基于 [MIT License](LICENSE) 从零编写，设计思路借鉴了开源社区的若干优秀实践：
- 矢量机制图、高亮联动、步进播放器与小多图矩阵的交互理念受 [`visual-explainer`](https://github.com/nicobailon/visual-explainer)（MIT）启发；
- 数值微算例、组件作用评估与证据边界审查受学术论文深度 X-ray 精读工作流启发；
- 统计图“渲染—目视自检—修正”闭环受学术绘图工作流启发；
- 本地文献库联动兼容 Zotero 7+ Local API 与 [`zotero-mcp`](https://github.com/54yyyu/zotero-mcp)（MIT）。
