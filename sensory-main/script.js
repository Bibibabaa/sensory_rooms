// ─── BURGER MENU ─────────────────────────────────
const burger = document.getElementById("burger");
const nav    = document.getElementById("nav");

burger.addEventListener("click", () => nav.classList.toggle("show"));

// ─── SCROLL REVEAL ───────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

// ─── ANIMATED IMPACT COUNTERS ────────────────────
function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10) || 0;
  const suffix = el.dataset.suffix || "";
  const duration = 1400;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    el.textContent = value.toLocaleString("ru-RU") + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

document.querySelectorAll(".impact-number, .awareness-stat-number").forEach(el => counterObserver.observe(el));

// ─── GOAL PROGRESS BAR ANIMATION ─────────────────
const progressFill = document.querySelector(".goal-progress-fill");
if (progressFill) {
  const targetWidth = progressFill.style.width;
  progressFill.style.width = "0%";
  const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        requestAnimationFrame(() => { progressFill.style.width = targetWidth; });
        progressObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  progressObserver.observe(progressFill);
}

// ─── BACK TO TOP ──────────────────────────────────
const backToTop = document.getElementById("backToTop");
if (backToTop) {
  window.addEventListener("scroll", () => {
    backToTop.classList.toggle("show", window.scrollY > 480);
  });
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ─── ACTIVE NAV LINK ─────────────────────────────
const currentPath = window.location.pathname.replace(/\/$/, "");
document.querySelectorAll("nav a").forEach(link => {
  const href = link.getAttribute("href").replace(/\/$/, "");
  if (href === currentPath || (href === "" && currentPath === "")) {
    link.classList.add("active");
  }
});

// ─── LIGHTBOX GALLERY (multi-photo per school) ───
(function () {
  const items = Array.from(document.querySelectorAll(".room-item"));
  const lb = document.getElementById("lightbox");
  if (!items.length || !lb) return;

  const lbImage = document.getElementById("lbImage");
  const lbCaption = document.getElementById("lbCaption");
  const lbCounter = document.getElementById("lbCounter");
  const btnClose = document.getElementById("lbClose");
  const btnPrev = document.getElementById("lbPrev");
  const btnNext = document.getElementById("lbNext");

  // Build a photo set per school from data-images (comma-separated)
  const sets = items.map((item) => {
    const raw = item.getAttribute("data-images") || (item.querySelector("img") ? item.querySelector("img").getAttribute("src") : "");
    const photos = raw.split(",").map((s) => s.trim()).filter(Boolean);
    const school = item.getAttribute("data-school") || "";
    // update count badge
    const badge = item.querySelector(".room-count-n");
    if (badge) badge.textContent = String(photos.length);
    const countWrap = item.querySelector(".room-count");
    if (countWrap && photos.length <= 1) countWrap.style.display = "none";
    return { school, photos };
  });

  let setIndex = 0;
  let photoIndex = 0;

  function render() {
    const set = sets[setIndex];
    const total = set.photos.length;
    photoIndex = (photoIndex + total) % total;
    lbImage.setAttribute("src", set.photos[photoIndex]);
    lbImage.setAttribute("alt", set.school);
    lbCaption.textContent = set.school;
    if (lbCounter) {
      lbCounter.textContent = total > 1 ? (photoIndex + 1) + " / " + total : "";
    }
    // hide nav arrows when single photo
    const single = total <= 1;
    btnPrev.style.display = single ? "none" : "";
    btnNext.style.display = single ? "none" : "";
  }

  function open(i) {
    setIndex = i;
    photoIndex = 0;
    render();
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function close() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function step(dir) { photoIndex += dir; render(); }

  items.forEach((item, i) => item.addEventListener("click", () => open(i)));
  btnClose.addEventListener("click", close);
  btnPrev.addEventListener("click", () => step(-1));
  btnNext.addEventListener("click", () => step(1));
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  });
})();

// ─── EVENT CARDS EXPAND (Awareness) ──────────────
document.querySelectorAll(".event-expand").forEach((card) => {
  card.addEventListener("click", () => card.classList.toggle("open"));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); card.classList.toggle("open"); }
  });
});

// ─── AMBIENT BACKGROUND INJECTION ────────────────
(function () {
  if (document.querySelector(".ambient")) return;
  const amb = document.createElement("div");
  amb.className = "ambient";
  amb.setAttribute("aria-hidden", "true");
  amb.innerHTML = '<span class="ambient-blob b1"></span><span class="ambient-blob b2"></span><span class="ambient-blob b3"></span>';
  document.body.insertBefore(amb, document.body.firstChild);

  // subtle parallax following the cursor
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const blobs = amb.querySelectorAll(".ambient-blob");
  let tx = 0, ty = 0, cx = 0, cy = 0;
  window.addEventListener("mousemove", (e) => {
    tx = (e.clientX / window.innerWidth - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  (function loop() {
    cx += (tx - cx) * 0.05;
    cy += (ty - cy) * 0.05;
    blobs.forEach((b, i) => {
      const depth = (i + 1) * 12;
      b.style.marginLeft = (cx * depth) + "px";
      b.style.marginTop = (cy * depth) + "px";
    });
    requestAnimationFrame(loop);
  })();
})();

// ─── SCROLL PROGRESS BAR (added) ─────────────────
(function () {
  const bar = document.getElementById("scrollProgress");
  if (!bar) return;
  function update() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", update, { passive: true });
  update();
})();

// ─── HERO TITLE WORD-BY-WORD ANIMATION (added) ───
(function () {
  const h1 = document.querySelector(".hero h1");
  if (!h1) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let wordIndex = 0;
  const delayStep = 0.08;
  function wrapTextNode(node) {
    const parts = node.textContent.split(/(\s+)/);
    const frag = document.createDocumentFragment();
    parts.forEach((part) => {
      if (part.trim() === "") { frag.appendChild(document.createTextNode(part)); return; }
      const span = document.createElement("span");
      span.className = "word";
      span.textContent = part;
      span.style.animationDelay = (0.15 + wordIndex * delayStep) + "s";
      wordIndex++;
      frag.appendChild(span);
    });
    node.parentNode.replaceChild(frag, node);
  }
  Array.from(h1.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) wrapTextNode(node);
    else if (node.nodeType === Node.ELEMENT_NODE) {
      node.classList.add("word");
      node.style.animationDelay = (0.15 + wordIndex * delayStep) + "s";
      wordIndex++;
    }
  });
})();
