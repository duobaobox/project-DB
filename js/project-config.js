/**
 * 项目配置文件 - 管理所有项目列表
 * -------------------------------------------------------
 * 这个文件专门用于管理项目配置，使项目管理更加集中和简便
 * 您只需要：
 * 1. 将Markdown文件添加到projects/目录
 * 2. 在下面的PROJECT_CONFIG.files数组中添加文件名
 *
 * @file project-config.js - 项目配置中心
 */

// 项目配置对象
const PROJECT_CONFIG = {
  // 基本配置
  basePath: "projects/", // 项目文件存储路径
  extension: ".md", // 项目文件扩展名

  // 是否启用自动加载模式
  autoLoadEnabled: true, // 如果为true，将自动加载下面列表中的所有项目文件

  // 【重要】项目文件列表
  // 将您的所有项目Markdown文件名添加到这个数组中
  // 文件必须放在projects/目录下
  files: [
    "格式展示.md",
    "新增项目示例.md",
    "示例-神秘的宇宙之旅.md",
    "快速上手.md",
    "markdown高级功能展示.md",
    // 在此处添加更多项目文件...
  ],

  // 静态项目列表 (备用，一般不需要修改)
  // 仅当自动加载失败或禁用时使用
  fallbackProjects: [
    {
      id: "markdown-demo",
      title: "Markdown 格式展示",
      description: "展示所有支持的 Markdown 格式和样式",
      image: "https://via.placeholder.com/350x200?text=Markdown+Demo",
    },
    // 更多备用项目...
  ],
};

// 导出配置对象
window.PROJECT_CONFIG = PROJECT_CONFIG;
