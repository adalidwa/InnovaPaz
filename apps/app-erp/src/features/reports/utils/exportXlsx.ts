import * as XLSX from 'xlsx';

export function exportXlsx(filename: string, sheets: Record<string, Record<string, unknown>[]>) {
  const wb = XLSX.utils.book_new();
  Object.entries(sheets).forEach(([sheetName, rows]) => {
    const safeName = sheetName.slice(0, 31) || 'Sheet';
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, safeName);
  });
  XLSX.writeFile(wb, filename.endsWith('.xlsx') ? filename : filename + '.xlsx');
}
