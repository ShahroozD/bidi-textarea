class TextDirArea extends HTMLElement {
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: 'open' });
  
      shadow.innerHTML = `
        <div class="editable" contenteditable="true"></div>
        <style>
          .editable {
            outline: none;
            border: 1px solid #ccc;
            padding: 10px;
            min-height: 150px;
            max-width: 600px;
            white-space: pre-wrap;
          }
          .editable p {
            margin: 0 0 10px;
          }
        </style>
      `;
  
      this.editable = shadow.querySelector('.editable');
  
      // Initial empty <p>
      this.editable.innerHTML = '<p><br></p>';
  
      // Handle input
      this.editable.addEventListener('input', () => {
        this.wrapCurrentLineInParagraph();
        this.updateDirs();
        this.dispatchEvent(new Event('input')); // Re-emit input event
      });
  
      // Force Enter to insert <p>
      this.editable.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          document.execCommand('formatBlock', false, 'p');
        }
      });
    }
  
    // Detect text direction
    detectDir(text) {
      const rtlChar = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
      return rtlChar.test(text) ? 'rtl' : 'ltr';
    }
  
    // Wrap loose text in <p>
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
  
        // Restore caret
        const newRange = document.createRange();
        newRange.setStart(textNode, offset);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
      }
    }
  
    // Apply direction to each paragraph
    updateDirs() {
      const paragraphs = this.editable.querySelectorAll('p');
      paragraphs.forEach(p => {
        const dir = this.detectDir(p.textContent.trim());
        p.setAttribute('dir', dir);
      });
    }
  
    // Get plain text like <textarea>
    get value() {
      return Array.from(this.editable.querySelectorAll('p'))
        .map(p => p.textContent.trim())
        .join('\n');    }
  
  
    // Set plain text value (with \n) -> converts to <p>
    set value(text) {
      if (typeof text !== 'string') return;
      const lines = text.split('\n');
      const html = lines.map(line => {
        const clean = line.trim();
        const dir = this.detectDir(clean);
        return <p dir="${dir}">${clean || '<br>'}</p>;
      }).join('');
      this.editable.innerHTML = html || '<p><br></p>';
    }

    // Optional method: focus the editor
    focus() {
      this.editable.focus();
    }
  
    // Optional: clear content
    clear() {
      this.editable.innerHTML = '<p><br></p>';
    }
  }
  
  customElements.define('bidi-textarea', TextDirArea);