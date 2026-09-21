// 定義校園常見預設提問
const campusQuickPrompts = [
  { label: "📅 選課時程", query: "大同大學本學期加退選的截止日期是什麼時候？" },
  { label: "💳 註冊與繳費", query: "學雜費繳費單如何下載與列印？" },
  { label: "📖 圖書館借閱", query: "圖書館借書的期限與續借規定是多久？" },
  { label: "🚌 校園停車與位置", query: "學生機車與汽車停車位如何申請？" }
];

function initQuickPills() {
  const container = document.getElementById("quick-pills-container");
  if (!container) return;

  campusQuickPrompts.forEach(item => {
    const pill = document.createElement("button");
    pill.className = "quick-pill";
    pill.textContent = item.label;
    pill.onclick = () => {
      window.dispatchEvent(new CustomEvent("triggerQuickChat", { detail: item.query }));
    };
    container.appendChild(pill);
  });
}

document.addEventListener("DOMContentLoaded", initQuickPills);