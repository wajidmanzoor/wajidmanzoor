const year = document.querySelector("#year");
const progressBar = document.querySelector("#progress-bar");
const revealItems = [...document.querySelectorAll("[data-reveal]")];
const heroStage = document.querySelector(".hero-stage");
const nav = document.querySelector("#site-nav");
const navToggle = document.querySelector("#nav-toggle");
const navLinks = document.querySelector("#nav-links");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Year
if (year) year.textContent = new Date().getFullYear();

// Stagger delays
revealItems.forEach((item, i) => {
  const delay = item.dataset.delay ? Number(item.dataset.delay) : (i % 5) * 0.055;
  item.style.transitionDelay = `${delay}s`;
});

// ── Mobile nav toggle ──────────────────────────
if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const open = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!open));
    navLinks.classList.toggle("open", !open);
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      navLinks.classList.remove("open");
    });
  });

  // Close menu on outside click
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target)) {
      navToggle.setAttribute("aria-expanded", "false");
      navLinks.classList.remove("open");
    }
  });
}

if (reducedMotion) {
  revealItems.forEach((item) => item.classList.add("revealed"));
} else {
  // ── Scroll reveals ─────────────────────────────
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
  );

  revealItems.forEach((item) => observer.observe(item));

  // ── Scroll progress + nav state ────────────────
  let ticking = false;

  const onScroll = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;

    if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 50);

    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  onScroll();

  // ── Active nav link on scroll ───────────────────
  const sections = document.querySelectorAll("section[id]");
  const navAnchors = navLinks ? navLinks.querySelectorAll("a[href^='#']") : [];

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navAnchors.forEach((a) => {
            a.style.color = a.getAttribute("href") === `#${entry.target.id}`
              ? "var(--text)"
              : "";
          });
        }
      });
    },
    { rootMargin: "-35% 0px -55% 0px" }
  );

  sections.forEach((s) => sectionObserver.observe(s));

  // ── Hero stage: interactive glow + card tilt ────
  if (heroStage) {
    heroStage.addEventListener("pointermove", (e) => {
      const rect = heroStage.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      heroStage.style.setProperty("--pointer-x", `${x}%`);
      heroStage.style.setProperty("--pointer-y", `${y}%`);
      heroStage.style.setProperty("--tilt-x", `${((50 - y) / 50) * 5}deg`);
      heroStage.style.setProperty("--tilt-y", `${((x - 50) / 50) * 5}deg`);
    });

    heroStage.addEventListener("pointerleave", () => {
      heroStage.style.setProperty("--pointer-x", "50%");
      heroStage.style.setProperty("--pointer-y", "50%");
      heroStage.style.setProperty("--tilt-x", "0deg");
      heroStage.style.setProperty("--tilt-y", "0deg");
    });
  }

  // ── Magnetic pull on CTA buttons ───────────────
  document.querySelectorAll(".button-primary, .button-secondary").forEach((btn) => {
    let raf;

    btn.addEventListener("mousemove", (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.17}px, ${y * 0.24}px) translateY(-2px)`;
      });
    });

    btn.addEventListener("mouseleave", () => {
      cancelAnimationFrame(raf);
      btn.style.transform = "";
    });
  });
}
