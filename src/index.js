const definedTag = ["javascript", "java", "html", "css"];
export default class TagInput {
  constructor(container, options = {}) {
    this.container = container;
    if (this.container.tagInputInstance) {
      this.container.tagInputInstance.destroy();
    }
    this.options = {
      maxTags: options.maxTags || 10,
      maxStrLength: options.maxStrLength || 50, // add length limit to avoid DoS attacks
      placeholder: options.placeholder || "輸入標籤並按 Enter 或 逗號",
      initialTags: options.initialTags || [],
      ...options,
    };
    this.tags = [...this.options.initialTags];
    this.errorTimeout = null;
    this.allowDuplicates = false;
    this.container.tagInputInstance = this;
    this.init();
  }

  init() {
    this.createInput();
    this.bindEvents();
    this.autocomplete();
    this.render();
  }

  createInput() {
    this.container.innerHTML = `
                    <div class="tag-input-container">
                        <div class="tag-input" role="combobox" aria-expanded="false" aria-haspopup="listbox">
                            <div class="tag-list" role="listbox" aria-label="已選擇的標籤"></div>
                            <input 
                                type="text" 
                                class="tag-input-field" 
                                placeholder="${this.escapeHtml(
                                  this.options.placeholder
                                )}"
                                aria-label="輸入新標籤"
                                autocomplete="off"
                                maxlength="${this.options.maxStrLength}"
                            >
                            <ul class="autocomplete-list"></ul>
                        </div>
                        <div class="error-message" role="alert" aria-live="polite"></div>
                        <div class="tag-counter">
                            <span class="current-count">${
                              this.tags.length
                            }</span> / ${this.options.maxTags}
                        </div>
                    </div>
                `;

    this.tagInput = this.container.querySelector(".tag-input");
    this.tagList = this.container.querySelector(".tag-list");
    this.inputField = this.container.querySelector(".tag-input-field");
    this.autocompleteList = this.container.querySelector(".autocomplete-list");
    this.errorMessage = this.container.querySelector(".error-message");
    this.counterCurrent = this.container.querySelector(".current-count");
  }

  bindEvents() {
    this.inputField.addEventListener("keydown", (e) =>
      this.handleInputKeyDown(e)
    );
    this.tagList.addEventListener("click", (e) => this.handleTagClick(e));
    this.tagList.addEventListener("keydown", (e) => this.handleTagKeyDown(e));
  }

  handleInputKeyDown(e) {
    const value = this.inputField.value;
    const isEntered = e.key === "," || e.key === "Enter";
    if (isEntered && value) {
      e.preventDefault();
      this.addTag(value);
    } else if (e.key === "Backspace" && !value && this.tags.length > 0) {
      this.removeTag(this.tags.length - 1);
    }
  }

  handleTagClick(e) {
    if (e.target.classList.contains("tag-remove")) {
      const index = parseInt(e.target.parentElement.dataset.index, 10);
      this.removeTag(index);
    }
  }

  handleTagKeyDown(e) {
    if (e.key === "Delete" || e.key === "Backspace") {
      const index = parseInt(e.target.dataset.index, 10);
      if (!isNaN(index)) this.removeTag(index);
    }
  }

  addTag(tagTxt) {
    const cleanTag = this.arrangeString(tagTxt);
    if (cleanTag.length === 0) {
      this.showError("標籤不能為空格");
      return false;
    }
    if (cleanTag.length > this.options.maxStrLength) {
      this.showError(`字數不能超過 ${this.options.maxStrLength} 個字`);
      return false;
    }
    if (this.tags.length >= this.options.maxTags) {
      this.showError(`最多只能添加 ${this.options.maxTags} 個標籤`);
      return false;
    }
    if (this.tags.includes(cleanTag)) {
      this.showError("不能添加重複的標籤");
      return false;
    }

    this.tags.push(cleanTag);
    this.inputField.value = "";
    this.render();
    this.container.dispatchEvent(
      new CustomEvent("tag-add", { detail: { tags: [...this.tags] } })
    );

    return true;
  }

  removeTag(index) {
    if (index < 0 || index >= this.tags.length) return false;
    const removedTag = this.tags[index];
    this.tags.splice(index, 1);
    this.render();
    this.container.dispatchEvent(
      new CustomEvent("tag-remove", {
        detail: { tags: [...this.tags], removedTag },
      })
    );
    this.inputField.focus();
    return true;
  }

  render() {
    this.tagList.innerHTML = this.tags
      .map(
        (tag, index) =>
          `
            <div class="tag-chip" tabindex="0" role="option" aria-selected="true" data-index="${index}">
                <span class="tag-chip-text">${this.escapeHtml(tag)}</span>
                <button class="tag-remove" aria-label="刪除標籤 ${this.escapeHtml(
                  tag
                )}" tabindex="-1">×</button>
            </div>
        `
      )
      .join("");

    this.counterCurrent.textContent = this.tags.length;
  }

  showError(message) {
    this.errorMessage.textContent = message;
    this.errorMessage.classList.add("visible");
    clearTimeout(this.errorTimeout);
    this.errorTimeout = setTimeout(() => {
      this.errorMessage.classList.remove("visible");
    }, 3000);
  }

  // avoid html injection attacks
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // avoid unnecessary spaces and special characters, and unify the lowercase tag format
  arrangeString(str) {
    let cleanedStr = str.trim().toLowerCase().replace(/\s+/g, " ");
    cleanedStr = cleanedStr.replace(/[<>"'&]/g, "");
    return cleanedStr;
  }

  closeAutocompleteList() {
    this.autocompleteList.innerHTML = "";
  }

  handleDocClick(e) {
    if (!e.target.classList.contains("tag-input")) this.closeAutocompleteList();
  }

  autocomplete() {
    this.inputField.addEventListener("input", () => {
      const val = this.arrangeString(this.inputField.value);
      this.closeAutocompleteList();

      definedTag
        .filter((tag) => tag.toLowerCase().includes(val))
        .forEach((tag) => {
          const item = document.createElement("li");
          item.innerHTML = highlightMatch(tag, val);
          item.classList.add("autocomplete-item");
          item.tabIndex = 0;
          item.role = "option";
          item.ariaSelected = true;
          this.autocompleteList.appendChild(item);
        });
    });
    this.autocompleteList.addEventListener("click", (e) => {
      if (e.target.tagName === "LI") this.handleAutocompleteClick(e);
    });
    this.autocompleteList.addEventListener("keydown", (e) => {
      if (e.target.tagName === "LI") this.handleAutocompleteKeyDown(e);
    });

    function highlightMatch(tag, keyword) {
      const idx = tag.toLowerCase().indexOf(keyword);
      if (idx === -1) return tag;
      return (
        tag.substring(0, idx) +
        `<strong>${tag.substring(idx, idx + keyword.length)}</strong>` +
        tag.substring(idx + keyword.length)
      );
    }

    document.addEventListener("click", (e) => this.handleDocClick(e));
  }

  handleAutocompleteClick(e) {
    this.autocompleteAdd(e.target.textContent);
  }

  handleAutocompleteKeyDown(e) {
    if (e.key === "Enter") this.autocompleteAdd(e.target.textContent);
  }

  autocompleteAdd(tag) {
    this.addTag(tag);
    this.inputField.value = "";
    this.closeAutocompleteList();
    this.inputField.focus();
  }

  destroy() {
    if (this.errorTimeout) clearTimeout(this.errorTimeout);
    this.inputField.removeEventListener("keydown", this.handleInputKeyDown);
    this.tagList.removeEventListener("click", this.handleTagClick);
    this.tagList.removeEventListener("keydown", this.handleTagKeyDown);
    this.autocompleteList.removeEventListener(
      "click",
      this.handleAutocompleteClick
    );
    this.autocompleteList.removeEventListener(
      "keydown",
      this.handleAutocompleteKeyDown
    );
    document.removeEventListener("click", this.handleDocClick);
    this.container.innerHTML = "";
  }
}
window.TagInput = TagInput;
