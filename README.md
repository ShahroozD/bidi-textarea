# bidi-textarea

A custom `<bidi-textarea>` web component that behaves like a standard `<textarea>`, with built‑in support for **per‑paragraph direction detection** (LTR/RTL) plus an optional **default direction** override. Ideal for multilingual content and lightweight, framework‑free integration.

---

## 🚀 Features

* **Automatic direction**: Detects Left‑to‑Right (LTR) or Right‑to‑Left (RTL) per paragraph.
* **Default direction override**: Use the `default-direction` attribute to force blank or new paragraphs to LTR or RTL.
* **Native `<textarea>`‑like API**: Works with `value`, events, focus/blur, selection.
* **Lightweight & encapsulated**: Uses Shadow DOM; no external dependencies.

---

## 📦 CDN Installation

Load directly from JSDelivr:

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/ShahroozD/bidi-textarea/index.js"></script>
```

---

## 🎉 Usage

Use the `<bidi-textarea>` tag just like a `<textarea>`:

```html
<!-- Default: automatic detection -->
<bidi-textarea placeholder="متن خود را وارد کنید..."></bidi-textarea>

<!-- Force blank/new paragraphs to LTR -->
<bidi-textarea id="myEditor" default-direction="ltr"  placeholder="Type here..."></bidi-textarea>

<script type="module">
  window.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('myEditor');
    // Set initial content (lines split by "\n")
    editor.value = "Hello world\nسلام دنیا\nBonjour le monde";

    // Listen for changes
    editor.addEventListener('input', () => {
      console.log('Value:', editor.value);
      console.log('Selection start:', editor.selectionStart);
      console.log('Selection end:', editor.selectionEnd);
    });

    // Programmatic controls:
    // editor.focus();
    // editor.clear();
    // editor.setSelectionRange(0, 5);
  });
</script>
```

> **Tip:** Set `value`, `placeholder`, and `default-direction` **after** DOMContentLoaded to ensure the element is initialized.

---

## 🛠️ API Reference

| Property / Method                | Description                                                 |
| -------------------------------- | ----------------------------------------------------------- | 
| `value`                          | Get/set plain‑text with `\n` line breaks (alias: `text`).   |
| `text`                           | Alias for `.value`.                                         |
| `placeholder`                    | Set hint text when empty (via attribute).                   |
| `default-direction`              | (`rtl`,`ltr`) Force blank/new paragraphs to this direction. |
| `focus()`                        | Focus the editor.                                           |
| `blur()`                         | Remove focus.                                               |
| `clear()`                        | Clear all content (resets to an empty paragraph).           |
| `setSelectionRange(start, end?)` | Set cursor or selection by character index (inclusive).     |
| `selectionStart`                 | Read-only: start index of the selection (character offset). |
| `selectionEnd`                   | Read-only: end index of the selection (character offset).   |

### Events

* `"input"`: Fired whenever content changes (typing, paste, delete).

---

## 🎨 Styling

Style the host element with regular CSS:

```css
bidi-textarea {
  display: block;
  width: 100%;
  margin: 20px 0;
}

/* Adjust the inner padding or border via ::part if exposed */
```

---

## 📄 License

MIT — free to use, modify, and share.
