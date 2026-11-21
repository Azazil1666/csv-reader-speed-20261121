// A compact CSV scanner tailored to csv-reader's deliberately defined recovery rules.
export function run(input) {
  const s = String(input.text);
  const wantsHeader = input.header === true;
  const n = s.length;
  const errors = [];
  const rows = [];
  let columns = null;
  let width = -1;
  let p = n && s.charCodeAt(0) === 0xfeff ? 1 : 0;
  let line = 1;
  let recordLine = 1;
  let recordRow = null;

  const report = (code) => errors.push({ code, line: recordLine, row: recordRow });

  // Scan a non-quoted tail. `lead` is used for an unterminated opening quote
  // and for characters following a closing quote.
  function plain(lead) {
    const start = p;
    let cut = start;
    let pieces = null;
    let kept = 0;
    for (;;) {
      if (p >= n) {
        let value;
        if (pieces === null) value = lead + s.slice(start, p);
        else { pieces.push(s.slice(cut, p)); value = lead + pieces.join(''); }
        return { value, end: 0, kept };
      }
      const c = s.charCodeAt(p);
      if (c === 44 || c === 10) {
        let value;
        if (pieces === null) value = lead + s.slice(start, p);
        else { pieces.push(s.slice(cut, p)); value = lead + pieces.join(''); }
        p++;
        if (c === 10) { line++; return { value, end: 2, kept }; }
        return { value, end: 1, kept };
      }
      if (c === 13) {
        if (p + 1 < n && s.charCodeAt(p + 1) === 10) {
          let value;
          if (pieces === null) value = lead + s.slice(start, p);
          else { pieces.push(s.slice(cut, p)); value = lead + pieces.join(''); }
          p += 2; line++;
          return { value, end: 2, kept };
        }
        report('stray_cr');
        if (pieces === null) pieces = [];
        pieces.push(s.slice(cut, p));
        p++; cut = p;
        continue;
      }
      p++; kept++;
    }
  }

  function quoted() {
    const opening = p++;
    const openingLine = line;
    const begin = p;
    let cut = begin;
    let pieces = null;
    for (;;) {
      if (p >= n) {
        // Re-read this whole field as ordinary text, including its opening quote.
        p = opening + 1;
        line = openingLine;
        report('unterminated_quote');
        return plain('"');
      }
      const c = s.charCodeAt(p);
      if (c === 34) {
        if (p + 1 < n && s.charCodeAt(p + 1) === 34) {
          if (pieces === null) pieces = [];
          pieces.push(s.slice(cut, p), '"');
          p += 2; cut = p;
          continue;
        }
        let value;
        if (pieces === null) value = s.slice(begin, p);
        else { pieces.push(s.slice(cut, p)); value = pieces.join(''); }
        p++;
        if (p >= n) return { value, end: 0 };
        const next = s.charCodeAt(p);
        if (next === 44) { p++; return { value, end: 1 }; }
        if (next === 10) { p++; line++; return { value, end: 2 }; }
        if (next === 13 && p + 1 < n && s.charCodeAt(p + 1) === 10) {
          p += 2; line++; return { value, end: 2 };
        }
        const tail = plain(value);
        if (tail.kept) report('quote_junk');
        return tail;
      }
      if (c === 13) {
        if (pieces === null) pieces = [];
        pieces.push(s.slice(cut, p), '\n');
        p += p + 1 < n && s.charCodeAt(p + 1) === 10 ? 2 : 1;
        cut = p; line++;
      } else {
        if (c === 10) line++;
        p++;
      }
    }
  }

  while (true) {
    // Empty physical lines disappear before a record starts.
    while (p < n) {
      const c = s.charCodeAt(p);
      if (c === 10) { p++; line++; continue; }
      if (c === 13 && p + 1 < n && s.charCodeAt(p + 1) === 10) { p += 2; line++; continue; }
      break;
    }
    if (p >= n) break;
    recordLine = line;
    recordRow = wantsHeader && columns === null ? null : rows.length;
    const fields = [];
    let token, startedQuoted;
    do {
      startedQuoted = s.charCodeAt(p) === 34;
      token = startedQuoted ? quoted() : plain('');
      fields.push(token.value);
    } while (token.end === 1);

    if (fields.length === 1 && fields[0] === '' && !startedQuoted) continue;
    if (width < 0) width = fields.length;
    if (wantsHeader && columns === null) { columns = fields; continue; }
    if (fields.length < width) {
      errors.push({ code: 'short_row', line: recordLine, row: recordRow, fields: fields.length });
      while (fields.length < width) fields.push('');
    } else if (fields.length > width) {
      errors.push({ code: 'long_row', line: recordLine, row: recordRow, extra: fields.splice(width) });
    }
    rows.push(fields);
  }
  return { columns: wantsHeader ? (columns ?? []) : null, rows, errors };
}
