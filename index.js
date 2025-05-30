class BidiTextArea extends HTMLElement {
  constructor() {
    super();
    this._pendingValue = null;
    this._isConnected = false;
    this._defaultDirection = 'rtl';
  }


  static get observedAttributes() {
    return ['placeholder','value','default-direction'];
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'placeholder') {
      this._updatePlaceholderText();
    }
    if (name === 'value') {
      this.value = newVal;
    }
    else if (name === 'default-direction') {
      // normalize to either "ltr" or "rtl" (default to "ltr" if invalid)
      this._defaultDirection =
        newVal === 'ltr' ? 'ltr' : 'rtl';
      this.updateDirs();
    }
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
        .editable[data-empty="true"]::before {
          content: attr(data-placeholder);
          color: #aaa;
          pointer-events: none;
          display: block;
          white-space: pre-wrap;
          position: absolute;
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
      this._updatePlaceholderState();
      this.dispatchEvent(new Event('input'));
    });

    // Force Enter to create <p>
    this.editable.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        document.execCommand('formatBlock', false, 'p');
      }
    });

    this._updatePlaceholderText();
    this._updatePlaceholderState();

    // ✅ Apply any value set before connected
    if (this._pendingValue !== null) {
      const valueToApply = this._pendingValue;
      this._pendingValue = null;
      this.value = valueToApply;
    }

    // if HTML had a value="" attribute, apply it now:
    if (this.hasAttribute('value')) {
      this.value = this.getAttribute('value');
    }
  }

  // Handle placeholder attribute
  _updatePlaceholderText() {
    const placeholder = this.getAttribute('placeholder') || '';
    this.editable?.setAttribute('data-placeholder', placeholder);
  }

  _isVisuallyEmpty() {
    const text = this.editable.textContent.trim();
    const html = this.editable.innerHTML.replace(/\s+/g, '');
    return text === '' || html === '<p><br></p>';
  }

  _updatePlaceholderState() {
    const isEmpty = this._isVisuallyEmpty();
    this.editable.setAttribute('data-empty', isEmpty ? 'true' : 'false');
  }

  detectDir(text) {
    const rtlChar = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
    const hasRTL = rtlChar.test(text);
    const dir = text === ''
      ? this._defaultDirection
      : (hasRTL ? 'rtl' : 'ltr');
    return dir;
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
      p.setAttribute('dir', this._defaultDirection);
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
    // until shadow DOM is wired up, hand back any pendingValue
    if (!this.editable) return this._pendingValue || '';
    return Array.from(this.editable.querySelectorAll('p'))
      .map(p => p.textContent.trim())
      .join('\n');
  }

  // Set plain text value (handles early assignment)
  set value(text) {
    // before connected, stash it
    if (!this.editable) {
      this._pendingValue = text;
      return;
    }
    // once we have the editable, render immediately
    const lines = String(text||'').split('\n');
    this.editable.innerHTML = lines.map(line => {
      const clean = line.trim();
      const dir = this.detectDir(clean);
      return `<p dir="${dir}">${clean||'<br>'}</p>`;
    }).join('');
    this._updatePlaceholderState();
  }

  setSelectionRange(start, end = start) {
    if (!this.editable) return;
  
    const range = document.createRange();
    const selection = window.getSelection();
    selection.removeAllRanges();
  
    let currentPos = 0;
    let startNode = null, endNode = null;
    let startOffset = 0, endOffset = 0;
  
    const walker = document.createTreeWalker(
      this.editable,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
  
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const len = node.textContent.length;
  
      if (!startNode && currentPos + len >= start) {
        startNode = node;
        startOffset = start - currentPos;
      }
  
      if (!endNode && currentPos + len >= end) {
        endNode = node;
        endOffset = end - currentPos;
        break;
      }
  
      currentPos += len;
    }
  
    // Fallback: if we couldn't find the right nodes
    if (!startNode) startNode = this.editable;
    if (!endNode) endNode = this.editable;
  
    try {
      range.setStart(startNode, startOffset);
      range.setEnd(endNode, endOffset);
      selection.addRange(range);
    } catch (e) {
      console.warn('setSelectionRange failed:', e);
    }
  }

  get selectionStart() {
    const sel = this.shadowRoot.getSelection
      ? this.shadowRoot.getSelection()
      : window.getSelection();
    if (!sel.rangeCount) return 0;
    
    const range = sel.getRangeAt(0);
    let pos = 0;
  
    // walk all text nodes to sum their lengths
    const walker = document.createTreeWalker(
      this.editable,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node === range.startContainer) {
        pos += range.startOffset;
        break;
      }
      pos += node.textContent.length;
    }
  
    // ** NEW ** account for the '\n' between paragraphs
    let newlineCount = 0;
    const paragraphs = Array.from(this.editable.querySelectorAll('p'));
    for (const p of paragraphs) {
      if (p.contains(range.startContainer)) break;
      newlineCount++;
    }
  
    return pos + newlineCount;
  }
  
  get selectionEnd() {
    const sel = this.shadowRoot.getSelection
      ? this.shadowRoot.getSelection()
      : window.getSelection();
    if (!sel.rangeCount) return 0;
    
    const range = sel.getRangeAt(0);
    let pos = 0;
  
    // walk all text nodes to sum their lengths
    const walker = document.createTreeWalker(
      this.editable,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node === range.endContainer) {
        pos += range.endOffset;
        break;
      }
      pos += node.textContent.length;
    }
  
    // ** NEW ** account for the '\n' between paragraphs
    let newlineCount = 0;
    const paragraphs = Array.from(this.editable.querySelectorAll('p'));
    for (const p of paragraphs) {
      if (p.contains(range.startContainer)) break;
      newlineCount++;
    }
  
    return pos + newlineCount;
  }

  // Focus method
  focus() {
    this.editable?.focus();
  }

  blur() {
    this.editable?.blur();
  }

  select() {
    this.setSelectionRange(0, this.value.length);
  }

  // Clear content
  clear() {
    if (this.editable) {
      this.editable.innerHTML = '<p><br></p>';
      this._updatePlaceholderState();
    }
  }
}

customElements.define('bidi-textarea', BidiTextArea);