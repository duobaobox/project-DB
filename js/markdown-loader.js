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

// 加载 markdown-it 及其插件
document.write(
  '<script src="https://cdn.jsdelivr.net/npm/markdown-it@13.0.1/dist/markdown-it.min.js"></script>'
);
document.write(
  '<script src="https://cdn.jsdelivr.net/npm/markdown-it-emoji@2.0.2/dist/markdown-it-emoji.min.js"></script>'
);
document.write(
  '<script src="https://cdn.jsdelivr.net/npm/markdown-it-footnote@3.0.3/dist/markdown-it-footnote.min.js"></script>'
);
document.write(
  '<script src="https://cdn.jsdelivr.net/npm/markdown-it-sub@1.0.0/dist/markdown-it-sub.min.js"></script>'
);
document.write(
  '<script src="https://cdn.jsdelivr.net/npm/markdown-it-sup@1.0.0/dist/markdown-it-sup.min.js"></script>'
);
document.write(
  '<script src="https://cdn.jsdelivr.net/npm/markdown-it-task-lists@2.1.1/dist/markdown-it-task-lists.min.js"></script>'
);
document.write(
  '<script src="https://cdn.jsdelivr.net/npm/markdown-it-anchor@8.6.7/dist/markdownItAnchor.min.js"></script>'
);
document.write(
  '<script src="https://cdn.jsdelivr.net/npm/markdown-it-toc-done-right@4.2.0/dist/markdownItTocDoneRight.umd.min.js"></script>'
);
document.write(
  '<script src="https://cdn.jsdelivr.net/npm/markdown-it-container@3.0.0/dist/markdown-it-container.min.js"></script>'
);
document.write(
  '<script src="https://cdn.jsdelivr.net/npm/markdown-it-attrs@4.1.6/markdown-it-attrs.browser.js"></script>'
);

// 增强版 Markdown 解析器类
class MarkdownParser {
  /**
   * 获取配置好的 markdown-it 实例
   * @returns {Object} markdown-it 实例
   */
  static getMarkdownIt() {
    // 确保 markdown-it 已加载
    if (typeof window.markdownit === "undefined") {
      console.error("markdown-it 库未加载");
      return null;
    }

    // 创建并配置 markdown-it 实例
    const md = window.markdownit({
      html: true, // 允许 HTML 标签
      xhtmlOut: true, // 使用 '/' 闭合单标签
      breaks: true, // 转换段落里的 '\n' 到 <br>
      linkify: true, // 自动将 URL 转换为链接
      typographer: true, // 启用一些语言中立的替换 + 引号美化
      quotes: ["『』", "「」"], // 引号样式
      highlight: function (str, lang) {
        // 如果有代码高亮库可以在这里配置
        return `<pre class="language-${lang}"><code>${str}</code></pre>`;
      },
    });

    // 添加插件（如果已加载）
    if (window.markdownitEmoji) {
      md.use(window.markdownitEmoji);
    }

    if (window.markdownitFootnote) {
      md.use(window.markdownitFootnote);
    }

    if (window.markdownitSub) {
      md.use(window.markdownitSub);
    }

    if (window.markdownitSup) {
      md.use(window.markdownitSup);
    }

    if (window.markdownitTaskLists) {
      md.use(window.markdownitTaskLists, { enabled: true, label: true });
    }

    if (window.markdownitAnchor && window.markdownItTocDoneRight) {
      md.use(window.markdownitAnchor, {
        permalink: true,
        permalinkSymbol: "#",
        permalinkBefore: true,
      }).use(window.markdownItTocDoneRight, {
        containerClass: "toc-container",
        listType: "ul",
      });
    }

    if (window.markdownitContainer) {
      // 添加提示容器
      md.use(window.markdownitContainer, "tip", {
        validate: function (params) {
          return params.trim() === "tip";
        },
        render: function (tokens, idx) {
          if (tokens[idx].nesting === 1) {
            return '<div class="tip custom-block">\n<p class="custom-block-title">提示</p>\n';
          } else {
            return "</div>\n";
          }
        },
      });

      // 添加警告容器
      md.use(window.markdownitContainer, "warning", {
        validate: function (params) {
          return params.trim() === "warning";
        },
        render: function (tokens, idx) {
          if (tokens[idx].nesting === 1) {
            return '<div class="warning custom-block">\n<p class="custom-block-title">警告</p>\n';
          } else {
            return "</div>\n";
          }
        },
      });

      // 添加危险容器
      md.use(window.markdownitContainer, "danger", {
        validate: function (params) {
          return params.trim() === "danger";
        },
        render: function (tokens, idx) {
          if (tokens[idx].nesting === 1) {
            return '<div class="danger custom-block">\n<p class="custom-block-title">危险</p>\n';
          } else {
            return "</div>\n";
          }
        },
      });
    }

    if (window.markdownItAttrs) {
      md.use(window.markdownItAttrs);
    }

    return md;
  }

  /**
   * 将 Markdown 文本转换为 HTML
   * @param {string} markdown - Markdown 格式的文本
   * @returns {string} 转换后的 HTML
   */
  static parse(markdown) {
    if (!markdown) return "";

    const md = this.getMarkdownIt();
    if (!md) {
      console.error("markdown-it 未正确加载，无法解析 Markdown");
      return markdown;
    }

    return md.render(markdown);
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

      // 添加Project Detail容器
      const processedContent = `
        <div class="project-detail">
          ${content}
        </div>
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
