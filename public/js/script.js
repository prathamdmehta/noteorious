document.addEventListener("DOMContentLoaded", function () {
  const allButtons = document.querySelectorAll(".searchBtn");
  const searchBar = document.querySelector(".searchBar");
  const searchInput = document.getElementById("searchInput");
  const searchClose = document.getElementById("searchClose");

  for (var i = 0; i < allButtons.length; i++) {
    allButtons[i].addEventListener("click", function () {
      searchBar.style.visibility = "visible";
      searchBar.classList.add("open");
      this.setAttribute("aria-expanded", "true");
      searchInput.focus();
    });
  }

  searchClose.addEventListener("click", function () {
    searchBar.style.visibility = "hidden";
    searchBar.classList.remove("open");
    this.setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const toggleSwitch = document.querySelector("#dark-mode-toggle");

  // Check for saved user preference and apply it
  if (localStorage.getItem("dark-mode") === "enabled") {
    document.body.classList.add("dark-mode");
    toggleSwitch.checked = true;
  }

  toggleSwitch.addEventListener("change", function () {
    if (toggleSwitch.checked) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("dark-mode", "enabled");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("dark-mode", "disabled");
    }
  });
});

// HOME PAGE
const darkModeToggle = document.getElementById("dark-mode-toggle");
const body = document.body;

// Check initial dark mode preference
const isDarkMode = localStorage.getItem("dark-mode") === "true";
if (isDarkMode) {
  body.classList.add("dark-mode");
  darkModeToggle.checked = true;
}

// Toggle dark mode on click
darkModeToggle.addEventListener("change", () => {
  body.classList.toggle("dark-mode");
  localStorage.setItem("dark-mode", body.classList.contains("dark-mode"));
});

// Loader logic
const loaderShown = sessionStorage.getItem("loaderShown");

if (!loaderShown) {
  let tl = gsap.timeline();

  tl.from("#loader h3", {
    x: 40,
    opacity: 0,
    duration: 1,
    stagger: 0.1,
  });
  tl.to("#loader h3", {
    opacity: 0,
    stagger: 0.1,
    x: -40,
    duration: 1,
  });
  tl.to("#loader", {
    opacity: 0,
    duration: 0.5,
  });
  tl.to("#loader", {
    display: "none",
  });

  sessionStorage.setItem("loaderShown", "true");
} else {
  document.getElementById("loader").style.display = "none";
}

// ScrollTrigger animation for the hero section

// ScrollTrigger animation for the articles section
gsap.fromTo(
  ".articles h2, .articles ul li",
  {
    y: 50,
    opacity: 0,
  },
  {
    y: 0,
    opacity: 1,
    duration: 0.5,
    stagger: 0.1,
    scrollTrigger: {
      trigger: ".articles",
      start: "top center",
      toggleActions: "play none none reverse",
      onEnterBack: () => {
        gsap.fromTo(
          ".articles h2, .articles ul li",
          { y: 0, opacity: 1 },
          { y: 50, opacity: 0, duration: 0.5, stagger: 0.1 }
        );
      },
    },
  }
);

document.addEventListener("DOMContentLoaded", () => {
  // GSAP animations for the hero section
  gsap.from(".hero-content h2", {
    duration: 1.5,
    y: -50,
    opacity: 0,
    ease: "power3.out",
    delay: 0.5,
  });

  gsap.from(".hero-content p", {
    duration: 1.5,
    y: -30,
    opacity: 0,
    ease: "power3.out",
    delay: 0.7,
  });

  gsap.from(".hero-buttons a", {
    duration: 1.5,
    scale: 0,
    opacity: 0,
    ease: "back.out(1.7)",
    delay: 1,
  });

  gsap.from(".hero-svg-left img", {
    duration: 1.5,
    x: -100,
    opacity: 0,
    ease: "power3.out",
    delay: 1.2,
  });

  gsap.from(".hero-svg-right img", {
    duration: 1.5,
    x: 100,
    opacity: 0,
    ease: "power3.out",
    delay: 1.2,
  });
});

// Animate the author text and image
gsap.from(".author__heading", {
  opacity: 0,
  y: 50,
  duration: 1,
  ease: "power4.out",
});

gsap.from(".author__image", {
  opacity: 0,
  y: 50,
  duration: 1,
  ease: "power4.out",
  delay: 0.5, // Delay to stagger the animation
});

document.addEventListener("DOMContentLoaded", function () {
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray(".feature-box").forEach((box, index) => {
    gsap.fromTo(
      box,
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        scrollTrigger: {
          trigger: box,
          start: "top 80%",
          end: "top 60%",
          toggleActions: "play none none none",
        },
        delay: index * 0.2, // Delay each box animation
      }
    );
  });
});

// HEADER SECTION
// Animate each navigation item
const navLinks = gsap.utils.toArray(".header__nav-item, a");

navLinks.forEach((link, index) => {
  gsap.from(link, {
    y: -50,
    opacity: 0,
    duration: 0.95,
    ease: "power4.out",
    delay: index * 0.1, // Delay each link slightly
  });
});


