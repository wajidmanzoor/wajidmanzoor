const year = document.querySelector("#year");
const progressBar = document.querySelector("#progress-bar");
const revealItems = [...document.querySelectorAll("[data-reveal]")];
const heroStage = document.querySelector(".hero-stage");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (year) {
  year.textContent = new Date().getFullYear();
}

revealItems.forEach((item, index) => {
  const delay = item.dataset.delay ? Number(item.dataset.delay) : (index % 4) * 0.07;
  item.style.transitionDelay = `${delay}s`;
});

if (reducedMotion) {
  revealItems.forEach((item) => item.classList.add("revealed"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  revealItems.forEach((item) => observer.observe(item));

  let ticking = false;

  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;

    if (progressBar) {
      progressBar.style.transform = `scaleX(${progress})`;
    }

    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    },
    { passive: true },
  );

  updateProgress();
}

if (heroStage && !reducedMotion) {
  heroStage.addEventListener("pointermove", (event) => {
    const rect = heroStage.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const tiltY = ((x - 50) / 50) * 4;
    const tiltX = ((50 - y) / 50) * 4;

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
