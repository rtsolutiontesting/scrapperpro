import React, { useRef } from 'react';
import * as XLSX from 'xlsx';

export interface UniversityRow {
  'University Name': string;
  'Country': string;
  'Campus': string;
  'Website URL': string;
}

interface ExcelImportProps {
  onImport: (data: UniversityRow[]) => void;
  onError?: (error: string) => void;
}

export const ExcelImport: React.FC<ExcelImportProps> = ({ onImport, onError }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      return;
    }

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      if (onError) {
        onError('Please upload a valid Excel file (.xlsx, .xls) or CSV file');
      }
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with header row
        const jsonData = XLSX.utils.sheet_to_json<UniversityRow>(worksheet, {
          header: ['University Name', 'Country', 'Campus', 'Website URL'],
          defval: '', // Default value for empty cells
        });

        // Filter out completely empty rows
        const validData = jsonData.filter(row => 
          row['University Name'] && row['University Name'].toString().trim() !== ''
        );

        if (validData.length === 0) {
          if (onError) {
            onError('No valid data found in the Excel file. Please check the format.');
          }
          return;
        }

        // Validate data format
        const errors: string[] = [];
        validData.forEach((row, index) => {
          const universityName = row['University Name']?.toString().trim();
          const country = row['Country']?.toString().trim();
          const websiteUrl = row['Website URL']?.toString().trim();
          
          if (!universityName || !country || !websiteUrl) {
            errors.push(`Row ${index + 2}: Missing required fields (University Name, Country, Website URL)`);
          }
          
          // Validate URL format (trim first, then validate)
          if (websiteUrl) {
            try {
              // Ensure URL has protocol, add https if missing
              let urlToValidate = websiteUrl;
              if (!urlToValidate.match(/^https?:\/\//i)) {
                urlToValidate = 'https://' + urlToValidate;
              }
              new URL(urlToValidate);
            } catch {
              errors.push(`Row ${index + 2}: Invalid Website URL format: "${websiteUrl}"`);
            }
          }
        });

        if (errors.length > 0) {
          if (onError) {
            onError(errors.join('\n'));
          }
          return;
        }

        // Success - pass data to parent
        onImport(validData);

      } catch (error: any) {
        if (onError) {
          onError(`Error reading file: ${error.message}`);
        }
      }
    };

    reader.onerror = () => {
      if (onError) {
        onError('Error reading file. Please try again.');
      }
    };

    reader.readAsBinaryString(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
      <button
        onClick={handleButtonClick}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        📤 Import from Excel
      </button>
    </div>
  );
};

