/**
 * DIFF SERVICE
 * 
 * Service for fetching and managing diff data from Firestore
 */

import { ProgramDiff } from '../types/core';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

/**
 * Get diff results for a job
 */
export async function getDiffResults(jobId: string): Promise<ProgramDiff[]> {
  try {
    const diffQuery = query(
      collection(db, 'diff_results'),
      where('jobId', '==', jobId),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const snapshot = await getDocs(diffQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as ProgramDiff[];
  } catch (error) {
    console.error('Error fetching diff results:', error);
    return [];
  }
}

/**
 * Subscribe to diff results for a job (real-time)
 */
export function subscribeToDiffResults(
  jobId: string,
  callback: (diffs: ProgramDiff[]) => void
): () => void {
  // TODO: Implement real-time subscription
  // For now, just fetch once
  getDiffResults(jobId).then(callback);
  
  // Return unsubscribe function (no-op for now)
  return () => {};
}


