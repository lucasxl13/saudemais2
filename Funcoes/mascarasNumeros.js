// ../Funcoes/mascarasNumeros.js

function setCaretBeforeSuffix(el, sep = " ") {
  const numLen = (el.value.indexOf(sep) >= 0) ? el.value.indexOf(sep) : el.value.length;
  try { el.setSelectionRange(numLen, numLen); } catch {}
}

function bindOnce(el, type, handler, key) {
  const flag = `__mask_${type}_${key}`;
  if (el[flag]) return;
  el.addEventListener(type, handler);
  el[flag] = true;
}

// ===== Máscara SHIFT DECIMAL (peso) =====
export function maskShiftDecimal(el, {
  suffix = "kg",
  sep = " ",
  decimals = 1,
  min = 200,   // 20.0 * 10
  max = 4000,  // 400.0 * 10
  inputmode = "decimal"
} = {}) {
  if (!el) return;

  const scale = Math.pow(10, Math.max(0, decimals));
  let raw = ""; // ex.: "123" => 12.3

  const formatFromRaw = () => {
    if (!raw) { el.value = ""; return; }
    let n = parseInt(raw, 10) || 0;
    if (n > max) n = max;

    const inteiro = Math.floor(n / scale);
    const frac = n % scale;

    let fracStr = String(frac);
    while (fracStr.length < decimals) fracStr = "0" + fracStr;

    // agora com ponto decimal
    const visivel = decimals > 0
      ? `${inteiro}.${fracStr}${sep}${suffix}`
      : `${inteiro}${sep}${suffix}`;

    el.value = visivel;
    setCaretBeforeSuffix(el, sep);
  };

  const pushDigit = (d) => {
    raw = (raw + d).replace(/^0+(?=\d)/, "");
    if (raw === "") raw = "0";
    let n = parseInt(raw, 10) || 0;
    if (n > max) n = max;
    raw = String(n);
    formatFromRaw();
  };

  const popDigit = () => {
    if (!raw) { el.value = ""; return; }
    raw = raw.slice(0, -1);
    if (raw === "") { el.value = ""; return; }
    formatFromRaw();
  };

  const onKeyDown = (e) => {
    const k = e.key;
    const isDigit = k.length === 1 && /[0-9]/.test(k);

    if (k === "End") { e.preventDefault(); setCaretBeforeSuffix(el, sep); return; }
    if (k === "ArrowRight") {
      const caret = el.selectionStart ?? 0;
      const lim = (el.value.indexOf(sep) >= 0) ? el.value.indexOf(sep) : el.value.length;
      if (caret >= lim) { e.preventDefault(); setCaretBeforeSuffix(el, sep); }
      return;
    }

    if (isDigit) {
      e.preventDefault();
      const current = parseInt(raw || "0", 10);
      if (current >= max) { formatFromRaw(); return; }
      pushDigit(k);
      return;
    }

    if (k === "Backspace" || k === "Delete") { e.preventDefault(); popDigit(); return; }
    if (k === "." || k === ",") { e.preventDefault(); return; }
  };

  const onPaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData?.getData("text") || "").replace(/[^\d]/g, "");
    if (!text) return;
    for (const ch of text) {
      const current = parseInt(raw || "0", 10);
      if (current >= max) break;
      pushDigit(ch);
    }
  };

  const onFocus = () => setTimeout(() => setCaretBeforeSuffix(el, sep), 0);

  const onBlur = () => {
    if (!raw) { el.value = ""; return; }
    let n = parseInt(raw, 10) || 0;
    if (min != null && n < min) n = min;
    if (max != null && n > max) n = max;
    raw = String(n);
    formatFromRaw();
  };

  const normalizeFromValue = () => {
    const digits = (el.value || "").replace(/[^\d]/g, "");
    raw = digits ? String(Math.min(parseInt(digits, 10) || 0, max)) : "";
    formatFromRaw();
  };

  el.setAttribute("inputmode", inputmode);
  bindOnce(el, "keydown", onKeyDown, "shiftdec");
  bindOnce(el, "paste", onPaste, "shiftdec");
  bindOnce(el, "focus", onFocus, "shiftdec");
  bindOnce(el, "blur", onBlur, "shiftdec");

  normalizeFromValue();

  el.getRawScaled = () => parseInt(raw || "0", 10);
  el.getNumber = () => (parseInt(raw || "0", 10) / scale);
}

// ===== Máscara INTEIRO (altura) =====
export function maskIntegerWithSuffix(el, {
  suffix = "cm",
  sep = " ",
  min = 80,
  max = 250,
  inputmode = "numeric"
} = {}) {
  if (!el) return;

  let raw = "";

  const formatFromRaw = () => {
    if (!raw) { el.value = ""; return; }
    let n = parseInt(raw, 10) || 0;
    if (max != null && n > max) n = max;
    const visivel = `${n}${sep}${suffix}`;
    el.value = visivel;
    setCaretBeforeSuffix(el, sep);
  };

  const pushDigit = (d) => {
    raw = (raw + d).replace(/^0+(?=\d)/, "");
    if (raw === "") raw = "0";
    let n = parseInt(raw, 10) || 0;
    if (max != null && n > max) n = max;
    raw = String(n);
    formatFromRaw();
  };

  const popDigit = () => {
    if (!raw) { el.value = ""; return; }
    raw = raw.slice(0, -1);
    if (raw === "") { el.value = ""; return; }
    formatFromRaw();
  };

  const onKeyDown = (e) => {
    const k = e.key;
    const isDigit = k.length === 1 && /[0-9]/.test(k);

    if (k === "End") { e.preventDefault(); setCaretBeforeSuffix(el, sep); return; }
    if (k === "ArrowRight") {
      const caret = el.selectionStart ?? 0;
      const lim = (el.value.indexOf(sep) >= 0) ? el.value.indexOf(sep) : el.value.length;
      if (caret >= lim) { e.preventDefault(); setCaretBeforeSuffix(el, sep); }
      return;
    }

    if (isDigit) { e.preventDefault(); pushDigit(k); return; }
    if (k === "Backspace" || k === "Delete") { e.preventDefault(); popDigit(); return; }
  };

  const onPaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData?.getData("text") || "").replace(/[^\d]/g, "");
    if (!text) return;
    for (const ch of text) pushDigit(ch);
  };

  const onFocus = () => setTimeout(() => setCaretBeforeSuffix(el, sep), 0);

  const onBlur = () => {
    if (!raw) { el.value = ""; return; }
    let n = parseInt(raw, 10) || 0;
    if (min != null && n < min) n = min;
    if (max != null && n > max) n = max;
    raw = String(n);
    formatFromRaw();
  };

  const normalizeFromValue = () => {
    const digits = (el.value || "").replace(/[^\d]/g, "");
    raw = digits ? String(Math.min(parseInt(digits, 10) || 0, max ?? Number.MAX_SAFE_INTEGER)) : "";
    formatFromRaw();
  };

  el.setAttribute("inputmode", inputmode);
  bindOnce(el, "keydown", onKeyDown, "int");
  bindOnce(el, "paste", onPaste, "int");
  bindOnce(el, "focus", onFocus, "int");
  bindOnce(el, "blur", onBlur, "int");

  normalizeFromValue();

  el.getInteger = () => parseInt(raw || "0", 10);
}

// ===== Parser genérico =====
export function parseMaskedNumber(value) {
  if (!value) return 0;
  const only = String(value).replace(/[^\d.-]/g, "");
  const n = Number(only);
  return Number.isFinite(n) ? n : 0;
}
