/**
 * 打字效果脚本 - 实现打字机效果动画
 * -------------------------------------------------------
 * 本文件实现了首页标题下方的打字机效果动画
 * 文本内容可在 config.js 中的 typing 部分配置
 *
 * @file typing.js
 */

// 在页面加载完成后初始化打字效果
document.addEventListener("DOMContentLoaded", () => {
  initTypingEffect();
});

/**
 * 初始化打字效果
 * 读取配置并启动打字动画
 */
function initTypingEffect() {
  // 获取打字效果容器
  const typingElement = document.querySelector(".typing");
  if (!typingElement) return;

  // 获取配置（如果不存在则使用默认值）
  const config = window.CONFIG?.typing || {
    strings: ["产品经理", "UI/UX 设计师", "前端开发者"],
    typeSpeed: 100,
    backSpeed: 50,
    backDelay: 2000,
    loop: true,
  };

  // 初始化打字效果
  new Typed(typingElement, config);
}

/**
 * 打字效果类
 * 轻量级打字机效果实现
 */
class Typed {
  /**
   * 创建打字效果实例
   *
   * @param {HTMLElement} element - 要显示打字效果的元素
   * @param {Object} options - 配置选项
   * @param {string[]} options.strings - 要显示的文本数组
   * @param {number} options.typeSpeed - 打字速度（毫秒）
   * @param {number} options.backSpeed - 删除速度（毫秒）
   * @param {number} options.backDelay - 删除前停顿时间（毫秒）
   * @param {boolean} options.loop - 是否循环播放
   */
  constructor(element, options) {
    this.element = element;
    this.options = options;
    this.textArray = this.options.strings; // 文本数组
    this.textArrayIndex = 0; // 当前文本索引
    this.textIndex = 0; // 当前字符索引
    this.isDeleting = false; // 是否处于删除阶段

    // 立即开始动画
    this.loop();
  }

  /**
   * 打字效果动画循环
   * 处理打字和删除过程
   */
  loop() {
    // 当前显示的文本
    const currentText = this.textArray[this.textArrayIndex];

    // 计算下一个字符索引位置
    let nextTextIndex = this.isDeleting
      ? this.textIndex - 1 // 删除一个字符
      : this.textIndex + 1; // 添加一个字符

    // 确保索引在有效范围内
    nextTextIndex = Math.max(0, Math.min(nextTextIndex, currentText.length));

    // 更新当前索引
    this.textIndex = nextTextIndex;

    // 更新显示的文本
    this.element.textContent = currentText.substring(0, this.textIndex);

    // 计算下一步的延迟时间
    let delay = this.isDeleting
      ? this.options.backSpeed // 删除速度
      : this.options.typeSpeed; // 打字速度

    // 处理状态转换
    if (!this.isDeleting && this.textIndex === currentText.length) {
      // 完成打字后等待一段时间再开始删除
      delay = this.options.backDelay;
      this.isDeleting = true;
    } else if (this.isDeleting && this.textIndex === 0) {
      // 完成删除后切换到下一个文本
      this.isDeleting = false;
      // 循环到下一个文本（如果启用了循环）
      if (
        this.options.loop ||
        this.textArrayIndex < this.textArray.length - 1
      ) {
        this.textArrayIndex = (this.textArrayIndex + 1) % this.textArray.length;
      }
    }

    // 安排下一帧动画
    setTimeout(() => this.loop(), delay);
  }
}
