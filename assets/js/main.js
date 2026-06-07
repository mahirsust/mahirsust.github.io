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

const chatFab     = document.getElementById("chat-fab");
const chatWin     = document.getElementById("chat-window");
const chatMsgs    = document.getElementById("chat-messages");
const chatInput   = document.getElementById("chat-input");
const chatSend    = document.getElementById("chat-send");
const chatChips   = document.getElementById("chat-chips");
let   chatOpen    = false;
let   chatLoading = false;

chatFab.addEventListener("click", () => {
  chatOpen = !chatOpen;
  chatWin.classList.toggle("open", chatOpen);
  chatFab.classList.toggle("open", chatOpen);
  if (chatOpen) { chatInput.focus(); chatScrollBottom(); }
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

function chatAddMsg(text, role) {
  const div = document.createElement("div");
  div.className = `msg msg-${role}`;
  div.textContent = text;
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

async function chatSendMsg() {
  const question = chatInput.value.trim();
  if (!question || chatLoading) return;

  chatChips.style.display = "none";
  chatInput.value = "";
  chatLoading = true;
  chatSend.disabled = true;

  chatAddMsg(question, "user");
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
  } catch (err) {
    chatHideTyping();
    chatAddMsg(
      "Sorry, I'm having trouble connecting right now. You can reach Mahir directly at mahirhasancse@gmail.com.",
      "bot"
    );
    console.error("RAG API error:", err);
  } finally {
    chatLoading = false;
    chatSend.disabled = false;
    chatInput.focus();
  }
}
