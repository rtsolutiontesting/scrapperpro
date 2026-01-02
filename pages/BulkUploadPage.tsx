import React from 'react';
import { UniversityManager } from '../components/UniversityManager';
import { Layout } from '../components/Layout';

export const BulkUploadPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Bulk University Upload</h1>
          <p className="text-gray-600">
            Import multiple universities at once using Excel. Export existing data or import new data.
          </p>
        </div>
        <UniversityManager />
      </div>
    </Layout>
  );
};

