const year = document.querySelector("#year");
const progressBar = document.querySelector("#progress-bar");
const revealItems = [...document.querySelectorAll("[data-reveal]")];
const heroStage = document.querySelector(".hero-stage");
const nav = document.querySelector("#site-nav");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (year) year.textContent = new Date().getFullYear();

// Stagger delays for reveals
revealItems.forEach((item, index) => {
  const delay = item.dataset.delay ? Number(item.dataset.delay) : (index % 5) * 0.055;
  item.style.transitionDelay = `${delay}s`;
});

if (reducedMotion) {
  revealItems.forEach((item) => item.classList.add("revealed"));
} else {
  // Intersection observer for scroll reveals
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );

  revealItems.forEach((item) => observer.observe(item));

  // Scroll progress bar + nav scroll state
  let ticking = false;

  const onScroll = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;

    if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 40);

    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  onScroll();

  // Hero stage: interactive pointer glow + card tilt
  if (heroStage) {
    const portraitCard = heroStage.querySelector(".portrait-card");

    heroStage.addEventListener("pointermove", (e) => {
      const rect = heroStage.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      const tiltY = ((x - 50) / 50) * 5;
      const tiltX = ((50 - y) / 50) * 5;

      heroStage.style.setProperty("--pointer-x", `${x}%`);
      heroStage.style.setProperty("--pointer-y", `${y}%`);
      heroStage.style.setProperty("--tilt-x", `${tiltX}deg`);
      heroStage.style.setProperty("--tilt-y", `${tiltY}deg`);
    });

    heroStage.addEventListener("pointerleave", () => {
      heroStage.style.setProperty("--pointer-x", "50%");
      heroStage.style.setProperty("--pointer-y", "50%");
      heroStage.style.setProperty("--tilt-x", "0deg");
      heroStage.style.setProperty("--tilt-y", "0deg");
    });
  }

  // Magnetic pull on primary + secondary buttons
  document.querySelectorAll(".button-primary, .button-secondary").forEach((btn) => {
    let animFrame;

    btn.addEventListener("mousemove", (e) => {
      cancelAnimationFrame(animFrame);
      animFrame = requestAnimationFrame(() => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.26}px) translateY(-2px)`;
      });
    });

    btn.addEventListener("mouseleave", () => {
      cancelAnimationFrame(animFrame);
      btn.style.transform = "";
    });
  });

  // Subtle glow trail on cards
  document.querySelectorAll(".panel, .paper, .project-card, .service-card, .focus-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--mx", `${x}%`);
      card.style.setProperty("--my", `${y}%`);
    });
  });
}
