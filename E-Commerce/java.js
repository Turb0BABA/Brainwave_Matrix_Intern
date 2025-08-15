// Select the header element from the DOM
const header = document.querySelector("header");

// Add a scroll event listener to the window
window.addEventListener("scroll", function () {
  // Toggle the 'sticky' class on the header based on scroll position
  // The class is added if window.scrollY is greater than 0, otherwise it's removed.
  header.classList.toggle("sticky", window.scrollY > 0);
});

// Select the menu icon and the navigation menu
let menu = document.querySelector("#menu-icon");
let navmenu = document.querySelector(".navmenu");

// Add a click event listener to the menu icon
menu.onclick = () => {
  // Toggle the 'bx-x' class on the menu icon (to change it to a close icon)
  menu.classList.toggle("bx-x");
  // Toggle the 'open' class on the navigation menu to show/hide it
  navmenu.classList.toggle("open");
};
