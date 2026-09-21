document.addEventListener("DOMContentLoaded", () => {
  const chatWindow = document.getElementById("chat-window");
  const toggleBtn = document.getElementById("chat-toggle-btn");
  const closeBtn = document.getElementById("chat-close-btn");
  const sendBtn = document.getElementById("send-btn");
  const chatInput = document.getElementById("chat-input");
  const messagesContainer = document.getElementById("chat-messages");

  // 記錄目前是否正在打字中，避免使用者在生成時重複狂按
  let isTyping = false;

  // 1. 開啟/關閉對話框
  toggleBtn.addEventListener("click", () => chatWindow.classList.toggle("hidden"));
  closeBtn.addEventListener("click", () => chatWindow.classList.add("hidden"));

  // 2. 打字機核心函式：逐字輸出到指定的對話泡泡中
  function typeWriterEffect(bubbleElement, fullText, speed = 20) {
    return new Promise((resolve) => {
      let index = 0;
      bubbleElement.textContent = ""; // 清空載入中提示字串

      // 建立游標閃爍效果 (可選)
      const cursor = document.createElement("span");
      cursor.className = "typing-cursor";
      cursor.textContent = "▌";
      bubbleElement.appendChild(cursor);

      const interval = setInterval(() => {
        if (index < fullText.length) {
          // 在游標前依序插入單一字元
          cursor.insertAdjacentText("beforebegin", fullText.charAt(index));
          index++;
          // 隨著打字增加，視窗自動保持滾動在最下方
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } else {
          // 打字結束，清除游標與定時器
          clearInterval(interval);
          cursor.remove();
          resolve();
        }
      }, speed);
    });
  }

  // 3. 發送訊息處理
  const sendMessage = async (text) => {
    if (isTyping) return; // 如果正在回答，鎖定不重複發送

    const message = text || chatInput.value.trim();
    if (!message) return;

    // 渲染使用者輸入
    appendBubble(message, "user");
    chatInput.value = "";

    // 鎖定輸入框與發送鈕狀態
    isTyping = true;
    sendBtn.disabled = true;
    chatInput.disabled = true;

    // 建立臨時的載入等待泡泡
    const botBubble = appendBubble("正在為您查詢校園資料...", "bot");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message })
      });

      if (!response.ok) throw new Error("API 回應異常");

      const data = await response.json();
      const replyText = data.reply || "未收到有效回覆";

      // 啟動逐字打字機特效 (速度 20ms 一字，可自行微調)
      await typeWriterEffect(botBubble, replyText, 20);

    } catch (err) {
      botBubble.textContent = "抱歉，目前伺服器連線失敗，請稍後再試。";
    } finally {
      // 解除輸入鎖定
      isTyping = false;
      sendBtn.disabled = false;
      chatInput.disabled = false;
      chatInput.focus();
    }
  };

  // 4. 建立並掛載訊息泡泡
  function appendBubble(text, role) {
    const bubble = document.createElement("div");
    bubble.className = `message-bubble ${role}`;
    bubble.textContent = text;
    messagesContainer.appendChild(bubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return bubble;
  }

  // 5. 事件綁定
  sendBtn.addEventListener("click", () => sendMessage());
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.isComposing) {
      sendMessage();
    }
  });

  // 監聽來自 quick_actions.js 的快捷點擊事件
  window.addEventListener("triggerQuickChat", (e) => {
    sendMessage(e.detail);
  });
});