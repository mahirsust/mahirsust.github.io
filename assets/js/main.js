// Mobile hamburger menu
const hamburger = document.querySelector('.nav-hamburger');
const navMenu = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open);
});
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
  });
});

// Highlight active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.classList.add('active');
        }
      });
    }
  });
}, { rootMargin: '-50% 0px -50% 0px' });

sections.forEach(section => observer.observe(section));

// Smooth scroll for all anchor links
document.querySelector('.nav-logo').addEventListener('click', function (e) {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Nav background opacity on scroll
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    nav.style.boxShadow = '0 1px 8px rgba(0,0,0,0.08)';
  } else {
    nav.style.boxShadow = 'none';
    navLinks.forEach(link => link.classList.remove('active'));
  }
});

// Copy email to clipboard
document.querySelectorAll('a[href^="mailto"]').forEach(function(link) {
  const email = 'mahirhasancse@gmail.com';
  link.addEventListener('click', function(e) {
    e.preventDefault();
    navigator.clipboard.writeText(email).then(() => {
      const textEl = this.querySelector('.cl-text');
      if (textEl) {
        const orig = textEl.textContent;
        textEl.textContent = 'Copied!';
        setTimeout(() => textEl.textContent = orig, 2000);
      } else if (!this.querySelector('svg')) {
        const orig = this.textContent;
        this.textContent = 'Copied!';
        setTimeout(() => this.textContent = orig, 2000);
      }
    });
  });
});

// Chatbot widget
const RAG_API_URL = "https://mahirsust-portfolio-rag.hf.space/chat";

const chatFab       = document.getElementById("chat-fab");
const chatWin       = document.getElementById("chat-window");
const chatMsgs      = document.getElementById("chat-messages");
const chatInput     = document.getElementById("chat-input");
const chatSend      = document.getElementById("chat-send");
const chatChips     = document.getElementById("chat-chips");
const chatCharCount = document.getElementById("chat-char-count");
let   chatOpen      = false;
let   chatLoading   = false;
let   lastQuestion  = "";

chatInput.addEventListener("input", () => {
  const len = chatInput.value.length;
  const max = 300;
  if (len === 0) {
    chatCharCount.className = "";
    chatCharCount.textContent = "";
  } else {
    chatCharCount.textContent = `${len} / ${max}`;
    if (len >= max - 20)       chatCharCount.className = "danger visible";
    else if (len >= max - 60)  chatCharCount.className = "warn visible";
    else                       chatCharCount.className = "visible";
  }
});

function toggleChat(open) {
  chatOpen = open;
  chatWin.classList.toggle("open", chatOpen);
  chatFab.classList.toggle("open", chatOpen);
  document.body.classList.toggle("chat-open", chatOpen);
  if (chatOpen) {
    chatInput.focus();
    chatScrollBottom();
  } else {
    chatWin.style.bottom = "";
    chatWin.style.maxHeight = "";
    chatWin.style.width = "";
    chatWin.style.right = "";
  }
}

if (window.visualViewport) {
  function adjustChatForKeyboard() {
    if (!chatOpen) return;
    const vv = window.visualViewport;
    const keyboardHeight = window.innerHeight - vv.height - vv.offsetTop;
    if (keyboardHeight > 50) {
      chatWin.style.bottom = (keyboardHeight + 8) + "px";
      chatWin.style.maxHeight = (vv.height - 16) + "px";
      chatWin.style.width = (vv.width - 32) + "px";
      chatWin.style.right = "16px";
    } else {
      chatWin.style.bottom = "";
      chatWin.style.maxHeight = "";
      chatWin.style.width = "";
      chatWin.style.right = "";
    }
    chatScrollBottom();
  }
  window.visualViewport.addEventListener("resize", adjustChatForKeyboard);
  window.visualViewport.addEventListener("scroll", adjustChatForKeyboard);
}

// Prevent background page scroll when chat is open on touch devices
document.addEventListener("touchmove", function(e) {
  if (chatOpen && !chatWin.contains(e.target)) {
    e.preventDefault();
  }
}, { passive: false });

chatFab.addEventListener("click", () => toggleChat(!chatOpen));
document.getElementById("chat-header").addEventListener("click", () => toggleChat(false));

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && chatOpen) toggleChat(false);
});

document.addEventListener("click", e => {
  if (chatOpen && !chatWin.contains(e.target) && !chatFab.contains(e.target)) {
    toggleChat(false);
  }
});

chatInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); chatSendMsg(); }
});
chatSend.addEventListener("click", chatSendMsg);

function sendChip(el) {
  chatInput.value = el.textContent;
  chatChips.style.display = "none";
  chatSendMsg();
}

function chatScrollBottom() {
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
}

function renderMarkdown(text) {
  // Escape HTML first to prevent XSS
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Convert bullet lists (consecutive lines starting with - or *)
  const lines = html.split("\n");
  const out = [];
  let inList = false;
  for (const line of lines) {
    const li = line.match(/^[-*]\s+(.+)/);
    if (li) {
      if (!inList) { out.push("<ul>"); inList = true; }
      out.push(`<li>${li[1]}</li>`);
    } else {
      if (inList) { out.push("</ul>"); inList = false; }
      out.push(line);
    }
  }
  if (inList) out.push("</ul>");
  html = out.join("\n");

  // Inline formatting
  html = html
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\n\n/g, "<br><br>")
    .replace(/\n/g, "<br>");

  return html;
}

function chatAddMsg(text, role) {
  const div = document.createElement("div");
  div.className = `msg msg-${role}`;
  if (role === "bot") {
    div.innerHTML = renderMarkdown(text);
  } else {
    div.textContent = text;
  }
  chatMsgs.appendChild(div);
  chatScrollBottom();
  return div;
}

function chatShowTyping() {
  const div = document.createElement("div");
  div.className = "msg msg-bot msg-typing";
  div.id = "typing-indicator";
  div.innerHTML = "<span></span><span></span><span></span>";
  chatMsgs.appendChild(div);
  chatScrollBottom();
}

function chatHideTyping() {
  const t = document.getElementById("typing-indicator");
  if (t) t.remove();
}

function chatShowSuggestBtn() {
  const existing = document.getElementById("chat-suggest-btn");
  if (existing) existing.remove();
  const btn = document.createElement("button");
  btn.id = "chat-suggest-btn";
  btn.className = "chat-suggest-btn";
  btn.textContent = "Suggest questions";
  btn.onclick = (e) => {
    e.stopPropagation();
    btn.remove();
    chatChips.style.display = "flex";
    chatScrollBottom();
  };
  chatMsgs.appendChild(btn);
  chatScrollBottom();
}

function chatShowError() {
  const div = document.createElement("div");
  div.className = "msg msg-bot msg-error";
  div.innerHTML = `
    <span>Sorry, I'm having trouble connecting right now. You can also <a href="mailto:mahirhasancse@gmail.com" class="chat-error-link">email Mahir directly</a>.</span>
    <button class="chat-retry-btn" onclick="chatRetry(event, this)">↺ Retry</button>
  `;
  chatMsgs.appendChild(div);
  chatScrollBottom();
}

function chatRetry(e, btn) {
  e.stopPropagation();
  btn.closest(".msg-error").remove();
  chatSendQuestion(lastQuestion);
}

async function chatSendQuestion(question) {
  chatLoading = true;
  chatSend.disabled = true;
  chatShowTyping();

  try {
    const res = await fetch(RAG_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const data = await res.json();
    chatHideTyping();
    chatAddMsg(data.answer, "bot");
    chatShowSuggestBtn();
  } catch (err) {
    chatHideTyping();
    chatShowError();
    console.error("RAG API error:", err);
  } finally {
    chatLoading = false;
    chatSend.disabled = false;
    chatInput.focus();
  }
}

async function chatSendMsg() {
  const question = chatInput.value.trim();
  if (!question || chatLoading) return;

  chatChips.style.display = "none";
  chatInput.value = "";
  chatCharCount.className = "";
  chatCharCount.textContent = "";
  lastQuestion = question;

  chatAddMsg(question, "user");
  chatSendQuestion(question);
}
