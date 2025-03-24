/**
 * 项目卡片生成器 - 自动生成项目展示卡片
 * -------------------------------------------------------
 * 本文件负责根据配置自动生成项目卡片并添加到页面中。
 *
 * 核心功能：
 * 1. 读取 config.js 中的项目配置
 * 2. 自动生成项目卡片并添加到页面
 * 3. 提供便捷的项目添加方法
 *
 * @file project-generator.js
 */

/**
 * 项目卡片生成器 - 初始化函数
 * 在页面加载完成后自动执行
 */
document.addEventListener("DOMContentLoaded", generateAllProjectCards);

/**
 * 获取项目容器元素
 * @returns {HTMLElement|null} 项目容器元素或null
 */
function getProjectsContainer() {
  const projectsGrid = document.querySelector(".projects-grid");
  if (!projectsGrid) {
    console.error("未找到项目网格容器！请确保页面中存在 .projects-grid 元素");
    return null;
  }
  return projectsGrid;
}

/**
 * 生成所有项目卡片
 * 读取配置并批量创建项目卡片
 */
function generateAllProjectCards() {
  // 检查配置是否正确加载
  if (!isConfigValid()) {
    console.error("项目配置未找到！请确保在此脚本之前加载 config.js");
    return;
  }

  // 获取并清空项目容器
  const projectsGrid = getProjectsContainer();
  if (!projectsGrid) return;

  projectsGrid.innerHTML = "";

  // 使用文档片段优化DOM操作
  const fragment = document.createDocumentFragment();

  // 遍历配置中的项目列表生成卡片
  CONFIG.projects.list.forEach((project) => {
    const projectCard = createProjectCard(project);
    fragment.appendChild(projectCard);
  });

  // 一次性添加到DOM
  projectsGrid.appendChild(fragment);

  console.log(`✅ 成功生成了 ${CONFIG.projects.list.length} 个项目卡片`);
}

/**
 * 创建单个项目卡片
 * @param {Object} project - 项目信息对象
 * @returns {HTMLElement} 创建的项目卡片元素
 */
function createProjectCard(project) {
  // 验证项目必要信息
  if (!project || !project.id || !project.title) {
    console.warn("项目信息不完整，跳过创建:", project);
    return document.createElement("div"); // 返回空元素
  }

  // 创建卡片元素
  const card = document.createElement("div");
  card.className = "project";
  card.onclick = () => openModal(project.id);

  // 图片地址安全检查
  const imagePath = project.image || "img/placeholder.jpg";

  // 设置卡片内容
  card.innerHTML = `
    <div class="project-img" style="background-image: url('${imagePath}')"></div>
    <div class="project-info">
      <h3>${project.title}</h3>
      <p>${project.description || ""}</p>
    </div>
  `;

  return card;
}

/**
 * 检查配置是否有效
 * @returns {boolean} 配置有效返回true，否则返回false
 */
function isConfigValid() {
  return (
    typeof CONFIG !== "undefined" &&
    CONFIG.projects &&
    Array.isArray(CONFIG.projects.list)
  );
}

/**
 * 添加新项目并立即显示
 * 提供简便的API用于动态添加项目
 *
 * @param {Object} project - 项目信息对象
 * @param {string} project.id - 项目ID
 * @param {string} project.title - 项目标题
 * @param {string} project.description - 项目描述
 * @param {string} project.image - 项目图片路径
 * @returns {boolean} 添加成功返回true，失败返回false
 */
function addProject(project) {
  // 检查配置有效性
  if (!isConfigValid()) {
    console.error("项目配置未找到！请确保在此脚本之前加载 config.js");
    return false;
  }

  // 验证项目基本信息
  if (!project || !project.id || !project.title) {
    console.error("项目信息不完整，必须包含id和title");
    return false;
  }

  // 添加项目到配置
  CONFIG.projects.list.push(project);

  // 创建并添加新卡片到页面
  const projectsGrid = getProjectsContainer();
  if (projectsGrid) {
    const projectCard = createProjectCard(project);
    projectsGrid.appendChild(projectCard);
    console.log(`✅ 已添加新项目: ${project.title}`);
    return true;
  }

  return false;
}

// 导出公共API
window.addProject = addProject;
