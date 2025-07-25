import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import TagInput from "../src/index.js";

describe("TagInput with Vitest", () => {
  let tagInput;
  let container;

  beforeEach(() => {
    container = document.createElement("div");
    container.id = "testContainer";
    document.body.appendChild(container);
  });

  afterEach(() => {
    tagInput?.destroy();
    document.body.innerHTML = "";
  });

  describe("初始化", () => {
    test("創建空白標籤輸入元件", () => {
      tagInput = new TagInput(container);
      expect(tagInput.tags).toHaveLength(0);
      expect(container.querySelector(".tag-input-field")).toBeInTheDocument();
      expect(container.querySelector(".tag-list")).toBeInTheDocument();
    });

    test("正確設置初始標籤", () => {
      tagInput = new TagInput(container, {
        initialTags: ["JavaScript", "React", "Jest"],
      });
      expect(tagInput.tags).toEqual(["JavaScript", "React", "Jest"]);
      expect(container.querySelectorAll(".tag-chip")).toHaveLength(3);
    });

    test("正確設置選項", () => {
      tagInput = new TagInput(container, {
        maxTags: 5,
        maxTagLength: 20,
        placeholder: "自定義輸入提示",
      });
      expect(tagInput.options.maxTags).toBe(5);
      expect(tagInput.options.maxTagLength).toBe(20);
      expect(container.querySelector(".tag-input-field").placeholder).toBe(
        "自定義輸入提示"
      );
    });
  });

  describe("新增標籤", () => {
    beforeEach(() => {
      tagInput = new TagInput(container);
    });

    test("新增多個標籤", () => {
      tagInput.addTag("標籤1");
      tagInput.addTag("標籤2");
      expect(tagInput.tags).toEqual(["標籤1", "標籤2"]);
      const tagChips = container.querySelectorAll(".tag-chip");
      expect(tagChips).toHaveLength(2);
      expect(tagChips[0].textContent).toContain("標籤1");
    });

    test("通過 Enter 鍵添加標籤", () => {
      const inputField = container.querySelector(".tag-input-field");
      inputField.value = "標籤1";
      const event = new KeyboardEvent("keydown", { key: "Enter" });
      inputField.dispatchEvent(event);
      const tagChips = container.querySelectorAll(".tag-chip");
      expect(tagChips).toHaveLength(1);
      expect(tagChips[0].textContent).toContain("標籤1");
    });

    test("通過逗號添加標籤", () => {
      const inputField = container.querySelector(".tag-input-field");
      inputField.value = "標籤1,";
      const event = new KeyboardEvent("keydown", { key: "," });
      inputField.dispatchEvent(event);
      const tagChips = container.querySelectorAll(".tag-chip");
      expect(tagChips[0].textContent).toContain("標籤1");
    });

    test("加入空字串標籤不會觸發新增事件", () => {
      vi.spyOn(tagInput, "addTag");
      const inputField = container.querySelector(".tag-input-field");
      inputField.value = "";
      const event = new KeyboardEvent("keydown", { key: "Enter" });
      inputField.dispatchEvent(event);
      expect(tagInput.tags).toHaveLength(0);
      expect(tagInput.addTag).not.toHaveBeenCalled();
    });
  });

  describe("移除標籤", () => {
    beforeEach(() => {
      tagInput = new TagInput(container, {
        initialTags: ["標籤1", "標籤2"],
      });
    });

    test("移除標籤", () => {
      const tagChips = container.querySelectorAll(".tag-chip");
      expect(tagChips).toHaveLength(2);
      tagInput.removeTag(0);
      expect(tagInput.tags).toEqual(["標籤2"]);
      const updatedChips = container.querySelectorAll(".tag-chip");
      expect(updatedChips).toHaveLength(1);
    });

    test("通過 Backspace 鍵移除最後一個標籤", () => {
      const inputField = container.querySelector(".tag-input-field");
      inputField.value = "";
      const event = new KeyboardEvent("keydown", { key: "Backspace" });
      inputField.dispatchEvent(event);
      expect(tagInput.tags).toEqual(["標籤1"]);
      const tagChips = container.querySelectorAll(".tag-chip");
      expect(tagChips).toHaveLength(1);
    });

    test("通過點擊刪除按鈕來移除標籤", () => {
      const tagChips = container.querySelectorAll(".tag-chip");
      expect(tagChips).toHaveLength(2);
      const removeButton = tagChips[0].querySelector(".tag-remove");
      removeButton.click();
      expect(tagInput.tags).toEqual(["標籤2"]);
      const updatedChips = container.querySelectorAll(".tag-chip");
      expect(updatedChips).toHaveLength(1);
    });
  });

  describe("輸入字串的處理", () => {
    beforeEach(() => {
      tagInput = new TagInput(container);
    });

    test("應該去除頭尾兩端空格", () => {
      tagInput.addTag("  標籤1  ");
      expect(tagInput.tags).toEqual(["標籤1"]);
    });

    test("應該去除多餘的空格", () => {
      tagInput.addTag("標籤    空格   測試");
      expect(tagInput.tags).toEqual(["標籤 空格 測試"]);
    });

    test("應該正確處理特殊字符", () => {
      tagInput.addTag("<script>alert('XSS');</script>");
      expect(tagInput.tags).toEqual(["scriptalert(xss);/script"]);
    });

    test("應該正確處理重複標籤", () => {
      tagInput.addTag("標籤1");
      tagInput.addTag("標籤1");
      expect(tagInput.tags).toEqual(["標籤1"]);
      const tagChips = container.querySelectorAll(".tag-chip");
      expect(tagChips).toHaveLength(1);
    });
  });

  describe("錯誤訊息處理", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });
    test("添加空格標籤應該顯示錯誤訊息", () => {
      tagInput = new TagInput(container);
      tagInput.addTag(" ");
      const errorMessage = container.querySelector(".error-message");
      expect(errorMessage.textContent).toBe("標籤不能為空格");
      expect(tagInput.tags).toHaveLength(0);
    });

    test("添加過長標籤應該顯示錯誤訊息", () => {
      tagInput = new TagInput(container, { maxStrLength: 5 });
      tagInput.addTag("這是一個過長的標籤");
      const errorMessage = container.querySelector(".error-message");
      expect(errorMessage.textContent).toBe("字數不能超過 5 個字");
      expect(tagInput.tags).toHaveLength(0);
    });

    test("添加超過最大標籤數應該顯示錯誤訊息", () => {
      tagInput = new TagInput(container, { maxTags: 2 });
      tagInput.addTag("標籤1");
      tagInput.addTag("標籤2");
      const errorMessage = container.querySelector(".error-message");
      expect(errorMessage.textContent).toBe("");
      tagInput.addTag("標籤3");
      expect(errorMessage.textContent).toBe("最多只能添加 2 個標籤");
      expect(tagInput.tags).toHaveLength(2);
    });

    test("添加重複標籤應該顯示錯誤訊息", () => {
      tagInput = new TagInput(container, {
        initialTags: ["標籤1", "標籤2"],
      });
      tagInput.addTag("標籤1");
      const errorMessage = container.querySelector(".error-message");
      expect(errorMessage.textContent).toBe("不能添加重複的標籤");
    });

    test("錯誤訊息應該在三秒後自動隱藏", async () => {
      tagInput = new TagInput(container, { maxTags: 1 });
      tagInput.addTag("標籤1");
      tagInput.addTag("標籤2"); // over maxTags should show error
      expect(tagInput.tags.length).toBe(1);
      const errorMessage = container.querySelector(".error-message");
      expect(errorMessage).toHaveClass("visible");
      vi.advanceTimersByTime(3000); // fasten time
      expect(errorMessage).not.toHaveClass("visible");
    });
  });

  describe("事件處理", () => {
    test("在添加標籤時觸發 tag-add 事件", () => {
      tagInput = new TagInput(container);
      const tagAddHandler = vi.fn();
      container.addEventListener("tag-add", tagAddHandler);
      tagInput.addTag("新標籤");
      expect(tagAddHandler).toHaveBeenCalled();
      expect(tagAddHandler.mock.calls[0][0].detail.tags).toEqual(["新標籤"]);
    });

    test("在移除標籤時觸發 tag-remove 事件", () => {
      tagInput = new TagInput(container, {
        initialTags: ["標籤1", "標籤2"],
      });
      const tagRemoveHandler = vi.fn();
      container.addEventListener("tag-remove", tagRemoveHandler);
      tagInput.removeTag(0);
      expect(tagRemoveHandler).toHaveBeenCalled();
      expect(tagRemoveHandler.mock.calls[0][0].detail.tags).toEqual(["標籤2"]);
    });
  });
});
