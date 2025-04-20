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
          }
          .editable p {
            margin: 0 0 10px;
          }
        </style>
      `;
  
      this.editable = shadow.querySelector('.editable');
  
      this.editable.addEventListener('input', () => {
        this.wrapCurrentLineInParagraph();
        this.updateDirs();
      });
  
      this.editable.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          document.execCommand('formatBlock', false, 'p');
        }
      });
  
      // Start with an empty <p><br></p>
      this.editable.innerHTML = '<p><br></p>';
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
  
      // If inside a text node directly under .editable (not inside a <p>)
      if (node.nodeType === Node.TEXT_NODE && node.parentNode === this.editable) {
        const textNode = node;
        const offset = range.startOffset;
  
        const p = document.createElement('p');
        p.appendChild(textNode);
  
        this.editable.replaceChild(p, textNode);
  
        // Move caret back into the text node, at the correct offset
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
  }
  
  customElements.define('bidi-textarea', TextDirArea);
  