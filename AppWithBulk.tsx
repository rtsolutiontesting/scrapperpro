import { useState } from 'react';
import { BulkUpload } from './components/BulkUpload';
import { bulkCreateJobs, BulkUniversityData } from './services/bulkService';

function App() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkCreate = async (universities: BulkUniversityData[]) => {
    setIsProcessing(true);
    try {
      const result = await bulkCreateJobs(universities, 'user');
      
      if (result.success) {
        alert(`Successfully created ${result.created} jobs!`);
      } else {
        const errorMsg = `Created ${result.created} jobs, but ${result.failed} failed.\n\nErrors:\n${
          result.errors?.map(e => `- ${e.universityName}: ${e.error}`).join('\n') || 'Unknown errors'
        }`;
        alert(errorMsg);
      }
    } catch (error: any) {
      alert(`Bulk create failed: ${error.message}`);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold mb-8 text-center">
          University Data Engine
        </h1>
        
        <BulkUpload 
          onBulkCreate={handleBulkCreate}
        />
      </div>
    </div>
  );
}

export default App;

