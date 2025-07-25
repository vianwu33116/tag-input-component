import { describe, it, expect } from "vitest";
import { toggleTheme } from "../src/theme-toggle.js";
import "./setup.js"; // Import the setup file to mock localStorage

describe("Theme Toggle", () => {
  it("切換主題後更新 localStorage", () => {
    document.body.classList.remove("dark");
    const themeToggle = document.createElement("button");
    themeToggle.className = "theme-toggle";
    document.body.appendChild(themeToggle);

    toggleTheme();
    expect(document.body.classList.contains("dark")).toBe(true);
    expect(themeToggle.textContent).toBe("🌞 切換主題");
    expect(localStorage.setItem).toHaveBeenCalledWith("theme", "dark");

    toggleTheme();
    expect(document.body.classList.contains("dark")).toBe(false);
    expect(themeToggle.textContent).toBe("🌜 切換主題");
    expect(localStorage.setItem).toHaveBeenCalledWith("theme", "light");
  });
});
