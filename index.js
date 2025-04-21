class TextDirArea extends HTMLElement {
  constructor() {
    super();
    this._pendingValue = null;
    this._isConnected = false;
  }

  connectedCallback() {
    // Prevent re-initialization
    if (this._isConnected) return;
    this._isConnected = true;

    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <div class="editable" contenteditable="true"></div>
      <style>
        :host {
          border: 1px solid #ccc;
          height: 100%;
          display: block;
        }
        .editable {
          outline: none;
          border: none;
          padding: 10px;
          box-sizing: border-box;
          height: 100%;
          min-height: 150px;
          min-width: 90px;
          width: 100%;
          white-space: pre-wrap;
        }
        .editable p {
          margin: 0 0 10px;
        }
      </style>
    `;

    this.editable = shadow.querySelector('.editable');

    // Initial content
    this.editable.innerHTML = '<p><br></p>';

    // Handle input
    this.editable.addEventListener('input', () => {
      this.wrapCurrentLineInParagraph();
      this.updateDirs();
      this.dispatchEvent(new Event('input'));
    });

    // Force Enter to create <p>
    this.editable.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        document.execCommand('formatBlock', false, 'p');
      }
    });

    // ✅ Apply any value set before connected
    if (this._pendingValue !== null) {
      const valueToApply = this._pendingValue;
      this._pendingValue = null;
      this.value = valueToApply;
    }
  }

  detectDir(text) {
    const rtlChar = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
    return rtlChar.test(text) ? 'rtl' : 'ltr';
  }

  wrapCurrentLineInParagraph() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    let node = range.startContainer;

    if (node.nodeType === Node.TEXT_NODE && node.parentNode === this.editable) {
      const textNode = node;
      const offset = range.startOffset;

      const p = document.createElement('p');
      p.appendChild(textNode);
      this.editable.replaceChild(p, textNode);

      const newRange = document.createRange();
      newRange.setStart(textNode, offset);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
    }
  }

  updateDirs() {
    const paragraphs = this.editable.querySelectorAll('p');
    paragraphs.forEach(p => {
      const dir = this.detectDir(p.textContent.trim());
      p.setAttribute('dir', dir);
    });
  }

  // Get plain text like a <textarea>
  get value() {
    if (!this.editable) return '';
    return Array.from(this.editable.querySelectorAll('p'))
      .map(p => p.textContent.trim())
      .join('\n');
  }

  // Set plain text value (handles early assignment)
  set value(text) {
    if (!this.editable) {
      this._pendingValue = text;
      return;
    }

    const lines = String(text || '').split('\n');
    queueMicrotask(() => {
      this.editable.innerHTML = lines.map(line => {
        const clean = line.trim();
        const dir = this.detectDir(clean);
        return <p dir="${dir}">${clean || '<br>'}</p>;
      }).join('');
    });
  }

  // Focus method
  focus() {
    this.editable?.focus();
  }

  // Clear content
  clear() {
    if (this.editable) {
      this.editable.innerHTML = '<p><br></p>';
    }
  }
}

customElements.define('bidi-textarea', TextDirArea);