// CSV export utility with semicolon delimiter for Indonesian standard
export function exportReportCsv(data: any[], filename: string): void {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  const headers = Object.keys(data[0] || {});
  
  // Helper to escape CSV values
  const escapeValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // If value contains semicolon, quote, or newline, wrap in quotes and escape quotes
    if (str.includes(';') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = [
    headers.join(';'),
    ...data.map((row) =>
      headers.map((header) => escapeValue(row[header])).join(';')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
