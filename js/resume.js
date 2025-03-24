/**
 * 简历下载脚本 - 处理简历下载功能及特效
 * -------------------------------------------------------
 * 本文件负责简历下载功能和下载时的特效动画
 * 简历文件路径和文件名可在 config.js 的 resume 部分配置
 *
 * @file resume.js
 */

/**
 * 下载简历文件
 * 点击下载按钮时调用，处理文件下载并显示特效
 */
function downloadResume() {
  // 获取简历配置（文件路径和下载文件名）
  const resumeConfig = window.CONFIG?.resume || {};
  const resumeUrl = resumeConfig.path || "./assets/006.pdf";
  const resumeFileName = resumeConfig.fileName || "006.pdf";

  // 使用 Fetch API 下载文件
  downloadFile(resumeUrl, resumeFileName);

  // 触发下载特效
  showDownloadEffects();
}

/**
 * 下载文件
 * 使用Fetch API获取文件并触发浏览器下载
 *
 * @param {string} fileUrl - 文件路径
 * @param {string} fileName - 下载时的文件名
 */
function downloadFile(fileUrl, fileName) {
  fetch(fileUrl)
    .then((response) => {
      // 检查请求是否成功
      if (!response.ok) {
        throw new Error(
          `文件下载失败: ${response.status} ${response.statusText}`
        );
      }
      return response.blob();
    })
    .then((blob) => {
      // 创建Blob URL并触发下载
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      // 设置下载链接属性
      link.href = blobUrl;
      link.download = fileName;
      link.style.display = "none";

      // 触发下载
      document.body.appendChild(link);
      link.click();

      // 清理资源
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(link);
      }, 100);
    })
    .catch((error) => {
      console.error("下载失败:", error);
      alert("简历下载失败，请稍后重试");
    });
}

/**
 * 显示下载特效
 * 在按钮周围创建飞出的文本动画
 */
function showDownloadEffects() {
  // 定义特效使用的颜色
  const colors = [
    "#FF6B6B", // 红色
    "#4ECDC4", // 青色
    "#FFE66D", // 黄色
    "#6C5CE7", // 紫色
    "#A8E6CF", // 薄荷绿
  ];

  // 创建多个特效元素，错开显示
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      createOfferText(i, colors[i]);
    }, i * 100);
  }
}

/**
 * 创建单个特效文字元素
 *
 * @param {number} index - 用于计算角度的索引
 * @param {string} color - 文本颜色
 */
function createOfferText(index, color) {
  // 创建特效文本元素
  const text = document.createElement("div");
  text.className = "offer-text";
  text.textContent = "Offer +1";

  // 获取按钮位置
  const button = document.querySelector(".resume-button");
  const buttonRect = button.getBoundingClientRect();
  const centerX = buttonRect.left + buttonRect.width / 2;
  const centerY = buttonRect.top + buttonRect.height / 2;

  // 设置样式
  text.style.color = color;
  text.style.textShadow = `0 0 10px ${color}80`;

  // 计算初始位置（按钮周围）
  const startRadius = 30;
  const startAngle = (index / 5) * Math.PI * 2 + Math.random() * 0.3;
  const startX = centerX + Math.cos(startAngle) * startRadius;
  const startY = centerY + Math.sin(startAngle) * startRadius;

  // 计算终点位置（散开效果）
  const endRadius = 200 + Math.random() * 50;
  const endX = Math.cos(startAngle) * endRadius;
  const endY = Math.sin(startAngle) * endRadius;

  // 设置位置和动画终点
  text.style.left = `${startX}px`;
  text.style.top = `${startY}px`;
  text.style.setProperty("--end-x", `${endX}px`);
  text.style.setProperty("--end-y", `${endY}px`);

  // 添加到页面
  document.body.appendChild(text);

  // 动画结束后移除元素
  setTimeout(() => {
    text.remove();
  }, 1200);
}
