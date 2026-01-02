/**
 * UNIVERSITY URL UTILITIES
 * 
 * Generates URLs for university admission pages.
 * These are the URLs that will be fetched by the backend.
 */

/**
 * Generate admission-related URLs for a university
 * 
 * This is a conservative implementation that only suggests common public URLs.
 * In production, you might want to maintain a database of known URLs per university.
 */
export function getUniversityUrls(universityName: string, country: string): string[] {
  const baseUrls: string[] = [];
  
  // Convert university name to a likely domain
  // This is a simplified approach - in production, maintain a mapping
  const domain = getUniversityDomain(universityName, country);
  
  if (domain) {
    // Common admission page URLs
    baseUrls.push(`${domain}/admissions`);
    baseUrls.push(`${domain}/international`);
    baseUrls.push(`${domain}/international/admissions`);
    baseUrls.push(`${domain}/admissions/international`);
    baseUrls.push(`${domain}/study/international`);
    baseUrls.push(`${domain}/international-students`);
  }
  
  // Return unique URLs
  return [...new Set(baseUrls)];
}

/**
 * Get university domain (simplified)
 * In production, maintain a proper mapping
 */
function getUniversityDomain(universityName: string, country: string): string | null {
  // Very basic mapping - in production, use a database
  const name = universityName.toLowerCase().replace(/\s+/g, '');
  
  // Some common mappings
  const mappings: Record<string, string> = {
    'universityoftoronto': 'https://www.utoronto.ca',
    'ubc': 'https://www.ubc.ca',
    'mcgilluniversity': 'https://www.mcgill.ca',
    'universityofoxford': 'https://www.ox.ac.uk',
    'universityofcambridge': 'https://www.cam.ac.uk',
    'imperialcollegelondon': 'https://www.imperial.ac.uk',
    'ucl': 'https://www.ucl.ac.uk',
  };
  
  if (mappings[name]) {
    return mappings[name];
  }
  
  // Generic pattern (not recommended for production)
  // Would need proper domain verification
  return null;
}

