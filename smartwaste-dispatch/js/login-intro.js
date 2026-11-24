/* SmartWaste login intro: play once per page load, then freeze the final layout. */
(() => {
  const start = () => {
    const page = document.body;
    if (!page || !page.classList.contains("auth-page")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      page.classList.add("intro-complete");
      return;
    }
    // A hard refresh creates a new document and naturally replays this one-shot intro.
    requestAnimationFrame(() => page.classList.add("intro-running"));
    // Headline lands first; leaves and magnetic litter finish afterwards.
    // Freeze everything at its final state instead of looping indefinitely.
    window.setTimeout(() => {
      page.classList.remove("intro-running");
      page.classList.add("intro-complete");
    }, 11600);
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
