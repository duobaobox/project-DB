/**
 * 主要脚本文件 - 网站核心交互功能
 * -------------------------------------------------------
 * 本文件负责网站的主要功能和交互逻辑，包括：
 * - 网站初始化与配置
 * - 设备适配与移动端提示
 * - 滚动提示与动画效果
 * - 项目模态框控制
 * - 个人介绍与技能展示
 *
 * @file main.js - 网站核心功能集
 */

// 在页面加载完成后执行初始化
document.addEventListener("DOMContentLoaded", initApp);

/**
 * 应用程序初始化函数 - 统一入口点
 * 按顺序依次初始化各模块功能
 */
function initApp() {
  // 核心功能初始化
  initSiteInfo(); // 初始化网站信息
  initMobileDetection(); // 移动设备检测
  initScrollPrompt(); // 滚动提示
  initModal(); // 模态框

  // 内容初始化
  initPersonalInfo(); // 个人介绍和技能

  // 功能组件初始化
  initBackToTop(); // 返回顶部按钮
  initCounterAnimation(); // 计数器动画
}

/**
 * 初始化网站基本信息
 * 从配置中加载网站标题、描述等基本信息
 */
function initSiteInfo() {
  // 获取配置
  const siteConfig = window.CONFIG?.site;
  if (!siteConfig) {
    console.warn("未找到网站配置，使用默认标题和描述");
    return;
  }

  // 设置网站标题和描述
  if (siteConfig.title) document.title = siteConfig.title;

  if (siteConfig.description) {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", siteConfig.description);
    }
  }

  // 设置作者名称
  if (siteConfig.author) {
    const authorElement = document.querySelector(".header-content h1");
    if (authorElement) {
      authorElement.textContent = `你好，我是${siteConfig.author}`;
    }
  }
}

/**
 * 移动设备检测
 * 检测访问设备并显示适当的提示信息
 */
function initMobileDetection() {
  const mobileWarning = document.getElementById("mobile-warning");
  if (!mobileWarning) return;

  // 如果是移动设备，显示提示
  if (isMobileDevice()) {
    mobileWarning.style.display = "block";

    // 修改滚动提示文本
    const promptText = document.querySelector(".scroll-prompt .text");
    if (promptText) {
      promptText.textContent = "向下滑动查看更多";
    }
  }

  // 关闭按钮事件
  const closeButton = mobileWarning.querySelector("button");
  if (closeButton) {
    closeButton.addEventListener(
      "click",
      () => (mobileWarning.style.display = "none")
    );
  }
}

/**
 * 检测是否为移动设备
 * @returns {boolean} 是否为移动设备
 */
function isMobileDevice() {
  return (
    typeof window.orientation !== "undefined" ||
    navigator.userAgent.indexOf("IEMobile") !== -1 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  );
}

/**
 * 滚动提示初始化
 * 控制页面底部滚动提示器的行为
 */
function initScrollPrompt() {
  const scrollPrompt = document.querySelector(".scroll-prompt");
  if (!scrollPrompt) return;

  // 使用防抖优化滚动事件
  let scrollTimeout;
  let isFirstScroll = true;

  window.addEventListener("scroll", () => {
    if (!isFirstScroll) return;

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      if (window.scrollY > 100) {
        // 添加淡出动画
        scrollPrompt.classList.add("fade-out");
        isFirstScroll = false;

        // 动画结束后隐藏元素
        setTimeout(() => {
          scrollPrompt.style.display = "none";
        }, 500);
      }
    }, 100);
  });
}

/**
 * 模态框初始化
 * 设置项目详情模态框的基本行为
 */
function initModal() {
  const modal = document.getElementById("modal");
  if (!modal) return;

  // 点击外部区域关闭模态框
  window.onclick = function (event) {
    if (event.target === modal) {
      closeModal();
    }
  };
}

/**
 * 打开项目模态框
 * @param {string} projectId - 项目ID
 */
async function openModal(projectId) {
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const modalBodyContainer = document.querySelector(".modal-body-container");

  if (!modal || !modalTitle || !modalBodyContainer) {
    console.error("模态框元素未找到");
    return;
  }

  // 显示加载中状态
  modalTitle.textContent = "加载中...";
  modalBodyContainer.innerHTML = "<p>正在加载项目内容，请稍候...</p>";

  // 显示模态框
  modal.style.display = "block";
  setTimeout(() => modal.classList.add("active"), 10);
  document.body.style.overflow = "hidden"; // 阻止背景滚动

  try {
    // 加载项目内容
    const projectContent = await ProjectContentLoader.loadProject(projectId);

    // 更新模态框内容
    modalTitle.textContent = projectContent.title;
    modalBodyContainer.innerHTML = projectContent.content;
  } catch (error) {
    console.error("加载项目内容失败:", error);
    modalBodyContainer.innerHTML = `<p>加载项目内容失败: ${error.message}</p>`;
  }
}

/**
 * 关闭模态框
 */
function closeModal() {
  const modal = document.getElementById("modal");
  if (!modal) return;

  // 触发淡出动画
  modal.classList.remove("active");

  // 动画结束后隐藏元素
  setTimeout(() => {
    modal.style.display = "none";
    document.body.style.overflow = "auto"; // 恢复背景滚动
  }, 300);
}

/**
 * 初始化返回顶部按钮
 */
function initBackToTop() {
  const modalBody = document.querySelector(".modal-body");
  const backToTopBtn = document.getElementById("backToTop");

  if (!modalBody || !backToTopBtn) return;

  // 使用防抖优化滚动监听
  let scrollTimeout;
  modalBody.addEventListener("scroll", function () {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      backToTopBtn.style.display = this.scrollTop > 300 ? "flex" : "none";
    }, 100);
  });
}

/**
 * 滚动到顶部
 * 模态框内容平滑滚动回顶部
 */
function scrollToTop() {
  const modalBody = document.querySelector(".modal-body");
  if (modalBody) {
    modalBody.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
}

/**
 * 初始化计数器动画
 */
function initCounterAnimation() {
  // 使用IntersectionObserver提高性能
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (
          entry.isIntersecting &&
          !entry.target.classList.contains("animated")
        ) {
          // 标记为已动画
          entry.target.classList.add("animated");

          // 执行动画
          const target = parseInt(entry.target.getAttribute("data-target"));
          animateCounter(entry.target, target);
        }
      });
    },
    {
      threshold: 0.1,
    }
  );

  // 监听所有计数器元素
  document.querySelectorAll(".counter").forEach((counter) => {
    observer.observe(counter);
  });
}

/**
 * 执行计数器动画
 * @param {HTMLElement} element - 目标元素
 * @param {number} target - 目标数值
 */
function animateCounter(element, target) {
  if (!element || isNaN(target)) return;

  let current = 0;
  const increment = Math.max(1, target / 100); // 将总数分成100步，至少为1
  const duration = 1500; // 持续时间（毫秒）
  const stepTime = duration / 100; // 每步时间

  // 定时更新数值
  const timer = setInterval(() => {
    current += increment;

    // 更新显示值（整数）
    element.textContent = Math.floor(current);

    // 达到目标时停止
    if (current >= target) {
      element.textContent = target;
      clearInterval(timer);
    }
  }, stepTime);
}

/**
 * 初始化个人信息
 * 包括个人介绍和技能标签
 */
function initPersonalInfo() {
  initPersonalIntro();
  initSkillTags();
}

/**
 * 初始化技能标签
 * 从配置加载并展示技能标签
 */
function initSkillTags() {
  const skillsContainer = document.querySelector(".skills-container");
  if (!skillsContainer) return;

  // 清空容器
  skillsContainer.innerHTML = "";

  // 获取技能列表
  const skills = window.CONFIG?.about?.skills || [];

  // 批量创建技能标签 - 使用文档片段优化DOM操作
  const fragment = document.createDocumentFragment();
  skills.forEach((skill) => {
    const skillTag = document.createElement("span");
    skillTag.className = "skill-tag";
    skillTag.textContent = skill;
    fragment.appendChild(skillTag);
  });

  // 一次性添加到DOM
  skillsContainer.appendChild(fragment);
}

/**
 * 初始化个人介绍
 * 从配置加载个人介绍文本
 */
function initPersonalIntro() {
  const introText = document.querySelector(".intro-text");
  if (!introText) return;

  // 设置介绍文本
  const intro = window.CONFIG?.about?.intro || "";
  introText.textContent = intro;
}
