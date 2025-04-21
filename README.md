# bidi-textarea

A custom <bidi-textarea> web component that behaves like a regular <textarea>, but with built-in support for automatic **per-paragraph text direction** (LTR/RTL), ideal for multilingual content.

---

## Features

Automatic direction detection per paragraph
Simple API: works like a native <textarea>
Lightweight and framework-free
Uses Shadow DOM for clean encapsulation

---

## CDN

You can load the component directly from the CDN:
https://cdn.jsdelivr.net/gh/ShahroozD/bidi-textarea/index.js

---

## Usage

Simply use the <bidi-textarea> tag instead of a regular <textarea>:
html
<bidi-textarea id="myEditor"></bidi-textarea>

<script type="module">
  window.addEventListener('DOMContentLoaded', () => {
    const el = document.getElementById('myEditor');
    el.value = "Hello world\nسلام دنیا\nBonjour le monde";

    el.addEventListener('input', () => {
      console.log("Value:", el.value);
    });
  });
</script>

> Make sure to set the value **after** the DOM is loaded (DOMContentLoaded), so the custom element is properly initialized.

---

## 🛠️ API

| Property/Method | Description                            |
|------------------|----------------------------------------|
| value          | Plain text with \n line breaks       |
| focus()        | Focus the editable content             |
| clear()        | Clears all content                     |

---

## 🖌️ Styling

You can style the outer element with normal CSS:
css
bidi-textarea {
  display: block;
  margin: 20px;
}

---

## ✅ License

MIT — free to use, modify, and share.