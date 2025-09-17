function sanitizeUrl(raw) {
  if (!raw && raw !== '') throw new Error('URL vazia/undefined');

  // garante string
  let url = String(raw);

  // remove BOM inicial (Byte Order Mark)
  url = url.replace(/^\uFEFF/, '');

  // trim de espaços no início/fim
  url = url.trim();

  // remove caracteres de controle (inclui NUL)
  url = url.replace(/[\x00-\x1F\x7F]/g, '');

  // opcional: se faltar esquema, assume https
  if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(url)) {
    url = 'https://' + url;
  }

  // encode partes que possam ter espaços ou caracteres inválidos
  // tenta criar um new URL pra validar; se falhar, lança erro já com info
  try {
    const u = new URL(url);
    // reparo simples: reconstroi pra garantir formatação correta
    return u.href;
  } catch (e) {
    // última tentativa: encodeURI e retorna
    const enc = encodeURI(url);
    try {
      new URL(enc);
      return enc;
    } catch (err) {
      throw new Error('sanitizeUrl: URL inválida após sanitização: ' + url);
    }
  }
}

module.exports = {
    sanitizeUrl
};