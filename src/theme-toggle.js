export function toggleTheme() {
  document.body.classList.toggle("dark");
  const themeToggle = document.querySelector(".theme-toggle");
  themeToggle.textContent = document.body.classList.contains("dark")
    ? "🌞 切換主題"
    : "🌜 切換主題";
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
}
window.toggleTheme = toggleTheme;
