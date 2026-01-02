import React, { useState } from 'react';
import { ExcelImport, UniversityRow } from './ExcelImport';
import { ExcelExport } from './ExcelExport';

interface BulkUploadProps {
  onBulkCreate: (universities: Array<{
    universityName: string;
    country: string;
    campus?: string;
    urls: string[];
  }>) => Promise<void>;
  existingData?: UniversityRow[];
}

export const BulkUpload: React.FC<BulkUploadProps> = ({ onBulkCreate, existingData = [] }) => {
  const [importedData, setImportedData] = useState<UniversityRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleImport = async (data: UniversityRow[]) => {
    setError(null);
    setSuccess(null);
    setImportedData(data);
  };

  const handleProcessImport = async () => {
    if (importedData.length === 0) {
      setError('Please import an Excel file first');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      // Convert Excel data to API format
      const universities = importedData.map(row => ({
        universityName: row['University Name'].toString().trim(),
        country: row['Country'].toString().trim(),
        campus: row['Campus'] ? row['Campus'].toString().trim() : undefined,
        urls: [row['Website URL'].toString().trim()],
      }));

      // Call the bulk create function
      await onBulkCreate(universities);

      setSuccess(`Successfully processed ${universities.length} universities!`);
      setImportedData([]); // Clear after successful processing

    } catch (err: any) {
      setError(err.message || 'Failed to process universities');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">📊 Bulk University Upload</h2>
      <p className="text-gray-600 mb-6">
        Import multiple universities at once using Excel. Download the template or import your own file.
      </p>

      <div className="space-y-4">
        {/* Export Template */}
        <div className="flex items-center gap-4">
          <ExcelExport data={existingData} />
          <span className="text-sm text-gray-500">Download template or export existing data</span>
        </div>

        {/* Import */}
        <div className="flex items-center gap-4">
          <ExcelImport 
            onImport={handleImport}
            onError={(err) => setError(err)}
          />
          <span className="text-sm text-gray-500">Upload Excel file with university data</span>
        </div>

        {/* Preview Imported Data */}
        {importedData.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">
                Preview ({importedData.length} universities)
              </h3>
              <button
                onClick={handleProcessImport}
                disabled={isProcessing}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
              >
                {isProcessing ? 'Processing...' : '✓ Process & Create Jobs'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2 text-left">University Name</th>
                    <th className="border p-2 text-left">Country</th>
                    <th className="border p-2 text-left">Campus</th>
                    <th className="border p-2 text-left">Website URL</th>
                  </tr>
                </thead>
                <tbody>
                  {importedData.slice(0, 10).map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border p-2">{row['University Name']}</td>
                      <td className="border p-2">{row['Country']}</td>
                      <td className="border p-2">{row['Campus'] || '-'}</td>
                      <td className="border p-2">
                        <a 
                          href={row['Website URL'].toString()} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {row['Website URL']}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {importedData.length > 10 && (
                <p className="text-sm text-gray-500 mt-2">
                  Showing first 10 rows. {importedData.length - 10} more rows will be processed.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Error:</strong>
            <pre className="mt-2 whitespace-pre-wrap text-sm">{error}</pre>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <strong>Success:</strong> {success}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h4 className="font-semibold mb-2">📋 Excel Format Requirements:</h4>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li><strong>Column 1:</strong> University Name (required)</li>
          <li><strong>Column 2:</strong> Country (required)</li>
          <li><strong>Column 3:</strong> Campus (optional)</li>
          <li><strong>Column 4:</strong> Website URL (required, must be valid URL)</li>
          <li>First row should contain headers</li>
          <li>Empty rows will be skipped</li>
        </ul>
      </div>
    </div>
  );
};


