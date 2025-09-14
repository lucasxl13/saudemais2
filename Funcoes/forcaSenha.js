export function temLetra(s) { return /[A-Za-z]/.test(s); }
export function temNumero(s) { return /[0-9]/.test(s); }
export function temRepeticao4Seguidas(s) { return /(.)\1{3,}/.test(s); }

export function temSequenciaMaiorQue3(s) {
  const isDigit = (c) => /[0-9]/.test(c);
  const isAlpha = (c) => /[A-Za-z]/.test(c);

  let run = 1;
  let dir = 0;

  for (let i = 1; i < s.length; i++) {
    const a = s[i - 1], b = s[i];
    const sameDigit = isDigit(a) && isDigit(b);
    const sameAlpha = isAlpha(a) && isAlpha(b);
    if (!sameDigit && !sameAlpha) { run = 1; dir = 0; continue; }

    const diff = b.charCodeAt(0) - a.charCodeAt(0);
    const step = (diff === 1 || diff === -1) ? diff : 0;

    if (step !== 0 && (dir === 0 || step === dir)) {
      run += 1;
      dir = step;
      if (run >= 4) return true;
    } else {
      dir = step;
      run = step !== 0 ? 2 : 1;
    }
  }
  return false;
}

export function validarSenha(s) {
  if (!temLetra(s) || !temNumero(s)) {
    return { ok: false, msg: "Deve conter números e letras." };
  }
  if (temRepeticao4Seguidas(s)) {
    return { ok: false, msg: "Repetição excessiva de caracteres." };
  }
  if (temSequenciaMaiorQue3(s)) {
    return { ok: false, msg: "Senha fraca" };
  }
  return { ok: true };
}
