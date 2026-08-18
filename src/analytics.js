function parseLine(line, delimiter) {
  const cells = []; let cell = ''; let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && line[index + 1] === '"' && quoted) { cell += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === delimiter && !quoted) { cells.push(cell.trim()); cell = ''; }
    else cell += char;
  }
  cells.push(cell.trim()); return cells;
}
export function parseCsv(text) {
  const lines = String(text).replace(/^\uFEFF/, '').split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) throw new Error('CSV must contain a header and at least one row');
  const delimiter = (lines[0].match(/;/g) || []).length > (lines[0].match(/,/g) || []).length ? ';' : ',';
  const headers = parseLine(lines[0], delimiter).map(header => header.toLowerCase());
  for (const key of ['date', 'amount']) if (!headers.includes(key)) throw new Error(`Missing required column: ${key}`);
  return lines.slice(1).map((line, rowIndex) => {
    const values = parseLine(line, delimiter); const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
    const amount = Number(String(row.amount).replace(',', '.'));
    if (!Number.isFinite(amount)) throw new Error(`Invalid amount at row ${rowIndex + 2}`);
    if (Number.isNaN(Date.parse(row.date))) throw new Error(`Invalid date at row ${rowIndex + 2}`);
    return { ...row, amount, returned: ['1', 'true', 'yes', 'да'].includes(String(row.returned).toLowerCase()) };
  });
}
export function analyzeSales(rows) {
  if (!rows.length) return { revenue: 0, orders: 0, averageOrder: 0, returnRate: 0, daily: [] };
  const orderIds = new Set(), dailyMap = new Map(); let revenue = 0, returns = 0;
  rows.forEach((row, index) => { const id = row.order_id || `row-${index}`; orderIds.add(id); if (row.returned) returns += 1; else revenue += row.amount; const day = row.date.slice(0, 10); dailyMap.set(day, (dailyMap.get(day) || 0) + (row.returned ? 0 : row.amount)); });
  const orders = orderIds.size;
  return { revenue, orders, averageOrder: orders ? revenue / orders : 0, returnRate: (returns / rows.length) * 100, daily: [...dailyMap].sort(([a],[b]) => a.localeCompare(b)).map(([date, amount]) => ({ date, amount })) };
}
