import React from 'react';
import * as XLSX from 'xlsx';

interface UniversityData {
  'University Name': string;
  'Country': string;
  'Campus': string;
  'Website URL': string;
}

interface ExcelExportProps {
  data?: UniversityData[];
  onExport?: () => void;
}

export const ExcelExport: React.FC<ExcelExportProps> = ({ data = [], onExport }) => {
  const handleExport = () => {
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Prepare data with headers
    const worksheetData: UniversityData[] = data.length > 0 
      ? data 
      : [
          // Empty template with headers
          {
            'University Name': '',
            'Country': '',
            'Campus': '',
            'Website URL': ''
          }
        ];
    
    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 30 }, // University Name
      { wch: 20 }, // Country
      { wch: 20 }, // Campus
      { wch: 40 }  // Website URL
    ];
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Universities');
    
    // Generate filename with timestamp
    const filename = `universities_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Write file
    XLSX.writeFile(workbook, filename);
    
    if (onExport) {
      onExport();
    }
  };

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      📥 Export to Excel
    </button>
  );
};

