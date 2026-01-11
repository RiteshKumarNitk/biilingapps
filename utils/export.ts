
import * as XLSX from 'xlsx';

export function exportToExcel(data: any[], fileName: string) {
    // 1. Convert Data to Worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 2. Create Workbook and Append Worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // 3. Write and Download
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
