
(function () {
  const disposalBtn = document.getElementById("disposalBtn");
  const exploreBtn = document.getElementById("exploreBtn");
  const explorePage = document.querySelector(".explore-page");
  const disposalScreen = document.getElementById("disposalScreen");

  const optionsPanel = document.getElementById("disposalOptions");
  const selectedTitle = document.getElementById("selectedWasteTitle");
  const selectedDescription = document.getElementById("selectedWasteDescription");

  const smallOptions = document.getElementById("smallOptions");
  const mediumOptions = document.getElementById("mediumOptions");
  const largeOptions = document.getElementById("largeOptions");
  const backBtn = document.getElementById("backToCategories");

  let selectedCategory = null;

  function showExplore() {
    explorePage.hidden = false;
    disposalScreen.hidden = true;
    exploreBtn?.classList.add("active");
    disposalBtn?.classList.remove("active");
  }

  function showDisposal() {
    explorePage.hidden = true;
    disposalScreen.hidden = false;
    disposalBtn?.classList.add("active");
    exploreBtn?.classList.remove("active");
    resetCategories();
  }

  function resetCategories() {
    selectedCategory = null;
    optionsPanel.hidden = true;
    smallOptions.hidden = true;
    mediumOptions.hidden = true;
    largeOptions.hidden = true;
    backBtn.hidden = true;
  }

  function selectCategory(category) {
    selectedCategory = category;

    optionsPanel.hidden = false;
    smallOptions.hidden = category !== "small";
    mediumOptions.hidden = category !== "medium";
    largeOptions.hidden = category !== "large";
    backBtn.hidden = false;

    const details = {
      small: {
        title: "Small Waste Disposal",
        description: "Find a nearby public bin for bottles, wrappers, paper and small cans."
      },
      medium: {
        title: "Medium Waste Disposal",
        description: "Choose a nearby suitable bin or request home collection."
      },
      large: {
        title: "Large Waste Collection",
        description: "Book a vehicle to collect furniture, mattresses or bulky waste from your home."
      }
    };

    selectedTitle.textContent = details[category].title;
    selectedDescription.textContent = details[category].description;

    optionsPanel.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  }

  disposalBtn?.addEventListener("click", showDisposal);
  exploreBtn?.addEventListener("click", showExplore);

  document.querySelectorAll("[data-select]").forEach(button => {
    button.addEventListener("click", () => {
      selectCategory(button.dataset.select);
    });
  });

  backBtn?.addEventListener("click", resetCategories);

  document.querySelectorAll("[data-method]").forEach(button => {
    button.addEventListener("click", () => {
      const method = button.dataset.method;

      if (method === "walk") {
        alert("Nearby bin discovery will be connected to your Explore map next.");
      } else if (method === "home" || method === "vehicle") {
        alert("Home collection booking will be built next.");
      }
    });
  });
})();
