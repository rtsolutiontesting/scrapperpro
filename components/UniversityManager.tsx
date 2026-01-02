import React, { useState } from 'react';
import { BulkUpload } from './BulkUpload';
import { bulkCreateJobs, BulkUniversityData } from '../services/bulkService';

export const UniversityManager: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleBulkCreate = async (universities: BulkUniversityData[]) => {
    setIsProcessing(true);
    setMessage(null);
    
    try {
      const result = await bulkCreateJobs(universities, 'user');
      
      if (result.success) {
        setMessage({
          type: 'success',
          text: `Successfully created ${result.created} jobs!`,
        });
      } else {
        const errorDetails = result.errors?.map(e => `${e.universityName}: ${e.error}`).join(', ') || 'Unknown errors';
        setMessage({
          type: 'error',
          text: `Created ${result.created} jobs, but ${result.failed} failed. Errors: ${errorDetails}`,
        });
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: `Bulk create failed: ${error.message}`,
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {message && (
        <div className={`mb-4 p-4 rounded ${
          message.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700' 
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          {message.text}
        </div>
      )}
      
      <BulkUpload 
        onBulkCreate={handleBulkCreate}
      />
    </div>
  );
};


