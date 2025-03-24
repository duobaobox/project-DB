/**
 * Markdown 加载器 - 处理项目内容加载与显示
 * -------------------------------------------------------
 * 本文件负责项目内容的加载和展示，核心功能：
 * 1. 从服务器获取 Markdown 文件
 * 2. 提取Markdown文件中的元数据（前置参数）
 * 3. 将 Markdown 格式转换为 HTML
 * 4. 将处理后的内容显示在项目模态框中
 *
 * 使用说明：如需修改项目内容，只需编辑 projects/ 目录下的对应 Markdown 文件
 * 文件支持Front Matter前置元数据（id、title、description、image）
 * 文件支持完整的 Markdown 语法，包括标题、链接、图片、代码块等
 *
 * @file markdown-loader.js
 */

// 缓存已加载的项目内容
const projectCache = new Map();

// 增强版 Markdown 解析器类
class MarkdownParser {
  /**
   * 将 Markdown 文本转换为 HTML
   * -------------------------------------------------------
   * 这个方法是整个转换过程的核心，它使用正则表达式
   * 将 Markdown 语法转换为对应的 HTML 标签
   *
   * @param {string} markdown - Markdown 格式的文本
   * @returns {string} 转换后的 HTML
   */
  static parse(markdown) {
    if (!markdown) return "";

    let html = markdown;

    // 预处理：转义 HTML 特殊字符（但保留已有的 HTML 标签）
    html = this.escapeHtml(html);

    // 处理代码块（需要在其他处理之前进行）
    html = this.parseCodeBlocks(html);

    // 一次性处理所有标题 (h1 - h6)
    html = html.replace(/^(#{1,6})\s+(.*?)$/gm, (match, hashes, content) => {
      const level = hashes.length;
      return `<h${level}>${content}</h${level}>`;
    });

    // 解析水平线
    // 例如: --- 或 *** => <hr>
    html = html.replace(/^(\-{3,}|\*{3,})$/gm, "<hr>");

    // 解析引用区块
    html = this.parseBlockquotes(html);

    // 解析列表
    html = this.parseOrderedLists(html);
    html = this.parseUnorderedLists(html);

    // 解析表格
    html = this.parseTables(html);

    // 优化：使用单次正则替换处理强调标记
    html = html
      // 粗体
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      // 斜体
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      // 删除线
      .replace(/~~(.+?)~~/g, "<del>$1</del>")
      // 内联代码
      .replace(/`([^`]+)`/g, "<code>$1</code>");

    // 解析链接
    // 例如: [链接文本](https://example.com) => <a href="https://example.com">链接文本</a>
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>'
    );

    // 解析图片
    // 例如: ![替代文本](image.jpg) => <img src="image.jpg" alt="替代文本">
    html = html.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$2" alt="$1" class="md-img">'
    );

    // 解析段落和换行
    // 将连续两个换行符替换为段落分隔符
    html = html
      .replace(/\n\s*\n/g, "</p><p>")
      // 将剩余的单个换行符替换为 <br>
      .replace(/\n/g, "<br>");

    // 处理表情符号
    html = this.parseEmojis(html);

    // 包装在段落标签中（如果不是以HTML标签开头）
    if (!/^<(\w+)/.test(html)) {
      html = `<p>${html}</p>`;
    }

    return html;
  }

  /**
   * 转义 HTML 特殊字符
   * -------------------------------------------------------
   * @param {string} text - 要转义的文本
   * @returns {string} 转义后的文本
   */
  static escapeHtml(text) {
    // 保存所有已有的HTML标签
    const htmlTags = [];
    text = text.replace(/<[^>]*>/g, (match) => {
      htmlTags.push(match);
      return `__HTML_TAG_${htmlTags.length - 1}__`;
    });

    // 转义特殊字符
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    text = text.replace(/[&<>"']/g, (m) => map[m]);

    // 恢复HTML标签
    text = text.replace(/__HTML_TAG_(\d+)__/g, (_, index) => {
      return htmlTags[parseInt(index)];
    });

    return text;
  }

  /**
   * 解析代码块
   * -------------------------------------------------------
   * @param {string} html - 要解析的 HTML
   * @returns {string} 解析后的 HTML
   */
  static parseCodeBlocks(html) {
    // 处理围栏式代码块 ```language code ```
    html = html.replace(
      /```([a-z]*)\n([\s\S]*?)\n```/g,
      (match, language, code) => {
        // 移除代码中的 HTML 转义，因为代码块内容应该按原样显示
        code = code
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&amp;/g, "&");
        const languageClass = language ? ` class="language-${language}"` : "";
        return `<pre><code${languageClass}>${code}</code></pre>`;
      }
    );

    // 处理缩进式代码块（4个空格或1个制表符）
    html = html.replace(/^(( {4}|\t).*\n?)+/gm, (match) => {
      // 移除每行开头的缩进
      const code = match.replace(/^( {4}|\t)/gm, "");
      return `<pre><code>${code}</code></pre>`;
    });

    return html;
  }

  /**
   * 解析引用块
   * -------------------------------------------------------
   * @param {string} html - 要解析的 HTML
   * @returns {string} 解析后的 HTML
   */
  static parseBlockquotes(html) {
    // 匹配连续的引用行
    return html.replace(/(^>.*\n?)+/gm, (match) => {
      // 移除每行开头的 > 符号并合并内容
      const content = match.replace(/^>\s?/gm, "");
      return `<blockquote>${content}</blockquote>`;
    });
  }

  /**
   * 解析有序列表
   * -------------------------------------------------------
   * @param {string} html - 要解析的 HTML
   * @returns {string} 解析后的 HTML
   */
  static parseOrderedLists(html) {
    // 匹配有序列表项（1. 列表项）
    html = html.replace(/^\s*(\d+)\.\s*(.*$)/gm, "<li>$2</li>");

    // 将连续的列表项包装在 <ol> 标签中
    html = html.replace(
      /<li>(.*?)<\/li>(?:\s*<li>|$)/gs,
      "<ol><li>$1</li></ol>"
    );

    // 修复嵌套的 ol 标签
    html = html.replace(/<\/ol>\s*<ol>/g, "");

    return html;
  }

  /**
   * 解析无序列表
   * -------------------------------------------------------
   * @param {string} html - 要解析的 HTML
   * @returns {string} 解析后的 HTML
   */
  static parseUnorderedLists(html) {
    // 匹配无序列表项（- 列表项、* 列表项、+ 列表项）
    html = html.replace(/^\s*[-*+]\s*(.*$)/gm, "<li>$1</li>");

    // 将连续的列表项包装在 <ul> 标签中
    html = html.replace(
      /<li>(.*?)<\/li>(?:\s*<li>|$)/gs,
      "<ul><li>$1</li></ul>"
    );

    // 修复嵌套的 ul 标签
    html = html.replace(/<\/ul>\s*<ul>/g, "");

    return html;
  }

  /**
   * 解析表格
   * -------------------------------------------------------
   * @param {string} html - 要解析的 HTML
   * @returns {string} 解析后的 HTML
   */
  static parseTables(html) {
    // 匹配表格结构
    return html.replace(
      /^\|(.+)\|\s*\n\|(?:[-:]+\|)+\s*\n((?:\|.+\|\s*\n?)+)/gm,
      (match, header, rows) => {
        // 解析表头
        const headers = header
          .split("|")
          .map((cell) => cell.trim())
          .filter(Boolean);
        const headerHtml = headers.map((cell) => `<th>${cell}</th>`).join("");

        // 解析表格内容
        const rowsHtml = rows
          .split("\n")
          .filter(Boolean)
          .map((row) => {
            const cells = row
              .split("|")
              .map((cell) => cell.trim())
              .filter(Boolean);
            return `<tr>${cells
              .map((cell) => `<td>${cell}</td>`)
              .join("")}</tr>`;
          })
          .join("");

        // 组合表格 HTML
        return `<table class="md-table">
        <thead>
          <tr>${headerHtml}</tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>`;
      }
    );
  }

  /**
   * 解析表情符号
   * -------------------------------------------------------
   * @param {string} html - 要解析的 HTML
   * @returns {string} 解析后的 HTML
   */
  static parseEmojis(html) {
    // 简单的表情映射
    const emojiMap = {
      ":smile:": "😊",
      ":laughing:": "😄",
      ":thumbsup:": "👍",
      ":heart:": "❤️",
      ":star:": "⭐",
      ":warning:": "⚠️",
      ":bulb:": "💡",
      ":rocket:": "🚀",
      ":chart:": "📊",
      ":memo:": "📝",
      ":computer:": "💻",
      ":phone:": "📱",
      ":email:": "📧",
      ":calendar:": "📅",
      ":clock:": "🕒",
    };

    // 替换表情符号
    Object.keys(emojiMap).forEach((key) => {
      html = html.replace(new RegExp(key, "g"), emojiMap[key]);
    });

    return html;
  }

  /**
   * 从Markdown中提取前置元数据(Front Matter)
   * Front Matter格式：
   * ---
   * key: value
   * ---
   *
   * @param {string} markdown - 包含前置元数据的Markdown文本
   * @returns {Object} 包含元数据和内容的对象 {metadata, content}
   */
  static extractFrontMatter(markdown) {
    if (!markdown) return { metadata: {}, content: "" };

    // 检查是否有前置元数据 (格式为 ---)
    const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = markdown.match(frontMatterRegex);

    if (!match) {
      return { metadata: {}, content: markdown };
    }

    // 提取元数据部分和内容部分
    const [, metadataStr, content] = match;
    const metadata = {};

    // 解析元数据
    metadataStr.split("\n").forEach((line) => {
      const [key, ...valueParts] = line.split(":");
      if (key && valueParts.length > 0) {
        const value = valueParts.join(":").trim();
        metadata[key.trim()] = value;
      }
    });

    return { metadata, content };
  }
}

/**
 * 加载Markdown文件
 *
 * @param {string} filePath - 文件路径
 * @returns {Promise<string>} Markdown 文本内容
 */
async function loadMarkdownFile(filePath) {
  try {
    // 优先从缓存获取
    if (projectCache.has(filePath)) {
      return projectCache.get(filePath);
    }

    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error(`无法加载文件: ${filePath} (${response.status})`);
    }

    const markdown = await response.text();

    // 存入缓存
    projectCache.set(filePath, markdown);

    return markdown;
  } catch (error) {
    console.error(`加载Markdown文件失败: ${filePath}`, error);
    throw error;
  }
}

/**
 * 标准化文件路径
 */
function normalizePath(basePath, filename) {
  // 确保路径以斜杠结尾
  if (basePath && !basePath.endsWith("/")) {
    basePath += "/";
  }

  // 移除文件名开头的斜杠
  if (filename.startsWith("/")) {
    filename = filename.substring(1);
  }

  return basePath + filename;
}

/**
 * 扫描并加载 Markdown 项目文件
 * -------------------------------------------------------
 * 从配置文件或指定路径读取所有项目 Markdown 文件，并加载到项目列表中
 * 如果未找到任何项目文件，将使用备用项目列表
 */
async function scanAndLoadProjects() {
  console.log("🔍 开始扫描项目文件...");

  // 从配置中获取必要信息
  const projectConfig = window.PROJECT_CONFIG || {};

  // 检查是否启用自动加载
  const autoLoadEnabled =
    projectConfig.autoLoadEnabled !== undefined
      ? projectConfig.autoLoadEnabled
      : CONFIG.projects.autoLoadEnabled;

  if (!autoLoadEnabled) {
    console.log("自动加载项目功能未启用");
    return;
  }

  // 使用项目配置或回退到全局配置
  const projectsBasePath =
    projectConfig.basePath || CONFIG.projects.basePath || "projects/";
  const projectsList = [];

  try {
    console.log("🔍 开始加载项目文件...");

    // 从项目配置文件获取文件列表
    let fileList = [];

    // 首先检查PROJECT_CONFIG.files
    if (projectConfig.files && projectConfig.files.length > 0) {
      fileList = projectConfig.files;
      console.log(
        `使用项目配置文件中的列表: ${fileList.length} 个文件`,
        fileList
      );
    }
    // 然后检查CONFIG.projects.autoLoad
    else if (CONFIG.projects.autoLoad && CONFIG.projects.autoLoad.length > 0) {
      fileList = CONFIG.projects.autoLoad;
      console.log(
        `使用全局配置文件中的列表: ${fileList.length} 个文件`,
        fileList
      );
    }
    // 最后尝试使用预定义列表
    else {
      console.log("配置中未找到文件列表，尝试检测项目文件...");

      // 使用预设的文件名列表进行检测
      const commonFilenames = [
        "格式展示.md",
        "新增项目示例.md",
        "文本案例 1.md",
        "project1.md",
        "project2.md",
        "project3.md",
        "project4.md",
        "markdown-demo.md",
      ];

      // 验证这些文件是否存在
      const validFiles = [];
      for (const filename of commonFilenames) {
        try {
          const filePath = normalizePath(projectsBasePath, filename);
          const response = await fetch(filePath);
          if (response.ok) {
            validFiles.push(filename);
            console.log(`找到文件: ${filename}`);
          }
        } catch (e) {
          // 忽略错误，表示文件不存在
        }
      }

      if (validFiles.length > 0) {
        fileList = validFiles;
        console.log(`检测到 ${validFiles.length} 个文件`);
      }
    }

    // 如果仍无法获取文件列表，使用备用项目列表
    if (fileList.length === 0) {
      console.warn("⚠️ 无法获取项目文件列表，将使用备用项目列表");

      // 使用PROJECT_CONFIG中的备用项目列表或CONFIG中的项目列表
      if (
        projectConfig.fallbackProjects &&
        projectConfig.fallbackProjects.length > 0
      ) {
        CONFIG.projects.list = projectConfig.fallbackProjects;
        console.log("使用项目配置中的备用项目列表");
      }
      // 保持现有的CONFIG.projects.list不变

      return;
    }

    console.log(`🔍 正在加载 ${fileList.length} 个项目文件...`, fileList);

    // 顺序加载所有项目文件，确保保持files数组的顺序
    for (const filename of fileList) {
      try {
        // 规范化文件路径
        const filePath = normalizePath(projectsBasePath, filename);

        console.log(`尝试加载: ${filePath}`);
        const markdown = await loadMarkdownFile(filePath);
        console.log(`成功加载: ${filePath}`);

        // 提取前置元数据和内容
        const { metadata, content } =
          MarkdownParser.extractFrontMatter(markdown);

        // 如果没有id，使用文件名作为id（移除.md后缀）
        if (!metadata.id) {
          const idMatch = filename.match(/(.+)\.md$/);
          metadata.id = idMatch ? idMatch[1] : filename;
        }

        // 添加到项目列表
        if (metadata.id && metadata.title) {
          projectsList.push({
            id: metadata.id,
            title: metadata.title,
            description: metadata.description || "项目描述",
            image: metadata.image || "https://via.placeholder.com/350x200",
            content: content, // 存储原始内容，避免重复加载
          });
          console.log(`✅ 已加载项目: ${metadata.title}`);
        } else {
          console.warn(`⚠️ 项目文件 ${filename} 缺少必要的元数据(id或title)`);
        }
      } catch (error) {
        console.error(`❌ 处理项目文件 ${filename} 失败:`, error);
      }
    }

    // 更新CONFIG中的项目列表
    if (projectsList.length > 0) {
      console.log(`✅ 从Markdown文件中加载了 ${projectsList.length} 个项目`);
      CONFIG.projects.list = projectsList;

      // 重新生成项目卡片
      if (typeof generateAllProjectCards === "function") {
        generateAllProjectCards();
      }
    } else {
      console.warn("⚠️ 未能从Markdown文件中加载任何项目");
    }
  } catch (error) {
    console.error("❌ 项目加载失败:", error);
  }
}

/**
 * 项目内容加载器
 * 负责加载项目内容并转换为可显示的HTML
 */
class ProjectContentLoader {
  // 项目样式模板
  static PROJECT_STYLE = `
    /* 项目详情基础样式 */
    .project-detail {
      color: #333;
      line-height: 1.6;
      font-size: 16px;
    }
    
    /* 标题样式 */
    .project-detail h1, .project-detail h2, .project-detail h3,
    .project-detail h4, .project-detail h5, .project-detail h6 {
      color: #2c3e50;
      margin-top: 1.5em;
      margin-bottom: 0.8em;
      font-weight: 600;
      line-height: 1.25;
    }
    
    .project-detail h1 {
      font-size: 2rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #eaecef;
      margin-top: 0;
    }
    
    .project-detail h2 {
      font-size: 1.5rem;
      padding-bottom: 0.3rem;
      border-bottom: 1px solid #eaecef;
    }
    
    .project-detail h3 {
      font-size: 1.25rem;
    }
    
    .project-detail h4 {
      font-size: 1.1rem;
    }
    
    /* 段落和文本样式 */
    .project-detail p {
      margin-bottom: 1.2em;
      line-height: 1.7;
    }
    
    .project-detail strong {
      font-weight: 600;
      color: #0366d6;
    }
    
    .project-detail em {
      font-style: italic;
      color: #5a6270;
    }
    
    .project-detail del {
      text-decoration: line-through;
      color: #999;
    }
    
    /* 链接样式 */
    .project-detail a {
      color: #0366d6;
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: border-color 0.2s ease;
    }
    
    .project-detail a:hover {
      border-bottom-color: #0366d6;
    }
    
    /* 列表样式 */
    .project-detail ul, .project-detail ol {
      padding-left: 2em;
      margin-bottom: 1.2em;
    }
    
    .project-detail li {
      margin-bottom: 0.5em;
    }
    
    .project-detail ul li {
      list-style-type: disc;
    }
    
    .project-detail ul li::marker {
      color: #0366d6;
    }
    
    .project-detail ol li {
      list-style-type: decimal;
    }
    
    /* 引用块样式 */
    .project-detail blockquote {
      border-left: 4px solid #0366d6;
      padding: 0.8em 1em;
      margin: 1.5em 0;
      background-color: #f6f8fa;
      color: #5a6270;
      border-radius: 0 3px 3px 0;
    }
    
    .project-detail blockquote p {
      margin: 0;
    }
    
    /* 代码样式 */
    .project-detail code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      background-color: #f6f8fa;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-size: 0.9em;
      color: #d73a49;
    }
    
    .project-detail pre {
      background-color: #f6f8fa;
      border-radius: 6px;
      padding: 1em;
      overflow: auto;
      margin: 1.5em 0;
    }
    
    .project-detail pre code {
      background-color: transparent;
      padding: 0;
      color: #24292e;
      font-size: 0.9em;
      line-height: 1.5;
      white-space: pre;
    }
    
    /* 表格样式 */
    .project-detail .md-table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5em 0;
      overflow: auto;
      display: block;
    }
    
    .project-detail .md-table th,
    .project-detail .md-table td {
      border: 1px solid #dfe2e5;
      padding: 0.6em 1em;
      text-align: left;
    }
    
    .project-detail .md-table th {
      background-color: #f6f8fa;
      font-weight: 600;
    }
    
    .project-detail .md-table tr:nth-child(2n) {
      background-color: #f8f8f8;
    }
    
    /* 水平线样式 */
    .project-detail hr {
      height: 0.25em;
      padding: 0;
      margin: 1.5em 0;
      background-color: #e1e4e8;
      border: 0;
    }
    
    /* 图片样式 */
    .project-detail .md-image {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 1.5em auto;
      border-radius: 6px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }
    
    /* 特殊内容样式 */
    .project-detail .highlight {
      background-color: #fff8c5;
      padding: 2px;
    }
    
    /* 移动设备适配 */
    @media (max-width: 768px) {
      .project-detail {
        font-size: 15px;
      }
      
      .project-detail h1 {
        font-size: 1.8rem;
      }
      
      .project-detail h2 {
        font-size: 1.3rem;
      }
      
      .project-detail h3 {
        font-size: 1.1rem;
      }
      
      .project-detail .md-table {
        font-size: 0.9em;
      }
      
      .project-detail blockquote {
        padding: 0.6em 0.8em;
      }
    }
  `;

  /**
   * 加载项目内容
   *
   * @param {string} projectId - 项目ID，用于查找对应的Markdown文件
   * @returns {Promise<Object>} 项目内容对象，包含title和content
   */
  static async loadProject(projectId) {
    // 使用项目配置或全局配置
    const projectConfig = window.PROJECT_CONFIG || {};

    // 检查配置是否存在
    if (!window.CONFIG?.projects && !projectConfig) {
      throw new Error("项目配置未找到");
    }

    // 查找项目信息
    const project = CONFIG.projects.list.find((p) => p.id === projectId);
    if (!project) {
      throw new Error(`未找到ID为 ${projectId} 的项目`);
    }

    try {
      // 检查缓存中是否已有处理好的项目内容
      const cacheKey = `processed_${projectId}`;
      if (projectCache.has(cacheKey)) {
        return {
          title: project.title,
          content: projectCache.get(cacheKey),
        };
      }

      let markdown, content;

      // 如果项目对象中已经有content(原始Markdown)，直接使用
      if (project.content) {
        content = MarkdownParser.parse(project.content);
      } else {
        // 否则加载Markdown文件
        // 优先使用项目配置中的路径
        const basePath =
          projectConfig.basePath || CONFIG.projects.basePath || "projects/";
        const extension =
          projectConfig.extension || CONFIG.projects.extension || ".md";
        const filePath = `${basePath}${projectId}${extension}`;

        markdown = await loadMarkdownFile(filePath);

        // 提取前置元数据和内容
        const { content: markdownContent } =
          MarkdownParser.extractFrontMatter(markdown);

        // 将Markdown转换为HTML
        content = MarkdownParser.parse(markdownContent);
      }

      // 添加Project Detail容器和样式
      const processedContent = `
        <div class="project-detail">
          ${content}
        </div>
        <style>
          ${this.PROJECT_STYLE}
        </style>
      `;

      // 缓存处理好的内容
      projectCache.set(cacheKey, processedContent);

      return {
        title: project.title,
        content: processedContent,
      };
    } catch (error) {
      console.error(`加载项目失败: ${projectId}`, error);
      throw error;
    }
  }
}

// 在DOM加载完成后自动扫描项目
document.addEventListener("DOMContentLoaded", scanAndLoadProjects);

// 导出公共API
window.ProjectContentLoader = ProjectContentLoader;

/**
 * 项目详情内容配置 (兼容旧版本)
 * -------------------------------------------------------
 * 注意：此对象仅作为兼容层保留，新的项目内容应该使用 Markdown 文件定义
 * 在 projects/ 目录下创建对应的 .md 文件
 */
window.projectContent = {};
