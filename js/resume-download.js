/**
 * 简历下载和Offer动画效果模块
 * 修复了部分浏览器下载文件名错误的问题
 */

// 配置项
const CONFIG = {
  RESUME_URL: "./assets/006.pdf", // 简历文件路径 
  RESUME_NAME: "006.pdf", // 下载时的文件名
  OFFER_COUNT: 3, // Offer动画数量
  COLORS: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD"], // Offer文本颜色
  OFFSET_RANGE: {
    X: { MIN: -50, MAX: 50 }, // X轴偏移范围
    Y: { MIN: -10, MAX: 10 }, // Y轴偏移范围
  },
};

/**
 * 下载简历并触发Offer动画
 * @param {Event} event - 点击事件对象
 */
function downloadResume(event) {
  try {
    // 使用fetch获取文件并创建Blob对象
    fetch(CONFIG.RESUME_URL)
      .then(response => {
        if (!response.ok) {
          throw new Error('简历文件不存在');
        }
        return response.blob();
      })
      .then(blob => {
        // 创建Blob URL
        const blobUrl = window.URL.createObjectURL(blob);
        
        // 创建下载链接
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = CONFIG.RESUME_NAME; // 强制设置下载文件名
        link.style.display = "none"; // 隐藏链接元素
        
        // 添加到页面并触发下载
        document.body.appendChild(link);
        link.click();
        
        // 清理资源
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(link);

        // 触发 Offer 动画
        for (let i = 0; i < CONFIG.OFFER_COUNT; i++) {
          createOfferText(event || window.event);
        }
      })
      .catch(error => {
        console.error('下载失败:', error);
        alert('抱歉，简历文件暂时无法下载，请稍后重试或联系网站管理员');
      });
  } catch (error) {
    console.error('下载过程出错:', error);
    alert('下载过程出现错误，请稍后重试');
  }
}

/**
 * 创建Offer文本动画
 * @param {Event} e - 点击事件对象
 */
function createOfferText(e) {
  // 创建文本元素
  const text = document.createElement("div");
  text.className = "offer-text";
  text.textContent = "Offer +1";

  // 计算随机偏移
  const offsetX = getRandomOffset(
    CONFIG.OFFSET_RANGE.X.MIN,
    CONFIG.OFFSET_RANGE.X.MAX
  );
  const offsetY = getRandomOffset(
    CONFIG.OFFSET_RANGE.Y.MIN,
    CONFIG.OFFSET_RANGE.Y.MAX
  );

  // 设置位置和颜色
  text.style.left = `${e.clientX + offsetX}px`;
  text.style.top = `${e.clientY + offsetY}px`;
  text.style.color = getRandomColor();

  // 添加到页面
  document.body.appendChild(text);

  // 动画结束后清理
  text.addEventListener("animationend", () => {
    document.body.removeChild(text);
  });
}

/**
 * 获取随机偏移值
 * @param {number} min - 最小值 
 * @param {number} max - 最大值
 * @returns {number} 随机偏移值
 */
function getRandomOffset(min, max) {
  // 将偏移值扩大2倍,使动画效果更明显
  return (Math.random() * (max - min) + min) * 2;
}

/**
 * 获取随机颜色
 * @returns {string} 随机颜色值
 */
function getRandomColor() {
  return CONFIG.COLORS[Math.floor(Math.random() * CONFIG.COLORS.length)];
}

// 导出函数供全局使用
window.downloadResume = downloadResume;
