
import { GoogleGenAI, Type } from "@google/genai";
import { ProgramData, ProgramLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const scrapeUniversityData = async (university: string, country: string): Promise<ProgramData[]> => {
  const prompt = `
    Deep-dive into the official website of ${university} (${country}) to find admission data EXCLUSIVELY for applicants from INDIA.
    
    Specific Search Objectives:
    1. Locate the "International Students - India" or "South Asia" specific landing page.
    2. Identify entry requirements for Indian Standard XII (CBSE, ICSE, and State Boards) for UG, and Indian 3/4-year Bachelor degrees for PG.
    3. Find specific IELTS/TOEFL requirements or waivers for students who studied in English-medium Indian schools.
    4. Search for "Commonwealth Scholarships" or university-specific "India Excellence Scholarships".
    5. Look for the university's policy on backlogs/re-attempts for Indian degree holders.

    For at least 3 programs (1 UG, 1 PG, 1 PhD), extract:
    - programName
    - level (UG, PG, or PhD)
    - tuitionFee (in local currency)
    - applicationFee (mention if waived for Indian applicants)
    - ieltsScore (Minimum overall and section-wise)
    - toeflScore
    - indianAcademicReq: Detailed entry grades for Indian boards (e.g., "85% in CBSE/ICSE" or "1st Class from recognized Indian Univ").
    - indianScholarships: Any aid specifically for Indian citizens.
    - backlogPolicy: Max backlogs allowed.
    - deadline: Specifically for the next major intake (Fall/Spring).
    - sourceUrl: The exact URL where the Indian student information was found.

    Ensure all data is strictly for students residing in and applying from India.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              programName: { type: Type.STRING },
              level: { type: Type.STRING, enum: ['UG', 'PG', 'PhD'] },
              tuitionFee: { type: Type.STRING },
              applicationFee: { type: Type.STRING },
              ieltsScore: { type: Type.STRING },
              toeflScore: { type: Type.STRING },
              indianAcademicReq: { type: Type.STRING },
              indianScholarships: { type: Type.STRING },
              backlogPolicy: { type: Type.STRING },
              deadline: { type: Type.STRING },
              sourceUrl: { type: Type.STRING },
            },
            required: ['programName', 'level', 'indianAcademicReq'],
          },
        },
      },
    });

    const results = JSON.parse(response.text || '[]');
    return results.map((item: any, index: number) => ({
      ...item,
      id: `${university.replace(/\s+/g, '-').toLowerCase()}-${index}`,
      universityName: university,
      country: country as 'Canada' | 'UK',
      level: item.level === 'UG' ? ProgramLevel.UG : item.level === 'PG' ? ProgramLevel.PG : ProgramLevel.PHD,
      admissionRequirements: item.indianAcademicReq // Map for compatibility if needed
    }));
  } catch (error) {
    console.error(`Error scraping Indian-specific data for ${university}:`, error);
    throw error;
  }
};
