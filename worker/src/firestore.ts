/**
 * FIRESTORE REST API CLIENT FOR CLOUDFLARE WORKERS
 * 
 * Note: Full Firebase Admin SDK doesn't work in Workers.
 * This uses Firestore REST API with OAuth token.
 * 
 * For production, consider using Firebase Functions instead.
 */

interface FirestoreDocument {
  [key: string]: any;
}

export class FirestoreClient {
  private projectId: string;
  private accessToken: string | null = null;

  constructor(projectId: string, accessToken?: string) {
    this.projectId = projectId;
    this.accessToken = accessToken || null;
  }

  /**
   * Get Firestore REST API base URL
   */
  private getBaseUrl(): string {
    return `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents`;
  }

  /**
   * Create a document
   */
  async create(collection: string, documentId: string, data: FirestoreDocument): Promise<any> {
    // Convert data to Firestore format
    const firestoreData = this.convertToFirestoreFormat(data);
    
    const url = `${this.getBaseUrl()}/${collection}/${documentId}`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(this.accessToken && { 'Authorization': `Bearer ${this.accessToken}` }),
      },
      body: JSON.stringify({
        fields: firestoreData,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`Firestore error: ${JSON.stringify(error)}`);
    }

    return await response.json();
  }

  /**
   * Get a document
   */
  async get(collection: string, documentId: string): Promise<any> {
    const url = `${this.getBaseUrl()}/${collection}/${documentId}`;
    
    const response = await fetch(url, {
      headers: {
        ...(this.accessToken && { 'Authorization': `Bearer ${this.accessToken}` }),
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`Firestore error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return this.convertFromFirestoreFormat(data);
  }

  /**
   * Update a document
   */
  async update(collection: string, documentId: string, data: Partial<FirestoreDocument>): Promise<any> {
    const firestoreData = this.convertToFirestoreFormat(data);
    
    const url = `${this.getBaseUrl()}/${collection}/${documentId}`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(this.accessToken && { 'Authorization': `Bearer ${this.accessToken}` }),
      },
      body: JSON.stringify({
        fields: firestoreData,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`Firestore error: ${JSON.stringify(error)}`);
    }

    return await response.json();
  }

  /**
   * List documents in a collection
   */
  async list(collection: string, limit: number = 100, orderBy?: string): Promise<any[]> {
    let url = `${this.getBaseUrl()}/${collection}?pageSize=${limit}`;
    
    if (orderBy) {
      url += `&orderBy=${orderBy}`;
    }
    
    const response = await fetch(url, {
      headers: {
        ...(this.accessToken && { 'Authorization': `Bearer ${this.accessToken}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`Firestore error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    
    if (!data.documents) {
      return [];
    }

    return data.documents.map((doc: any) => ({
      id: doc.name.split('/').pop(),
      ...this.convertFromFirestoreFormat(doc),
    }));
  }

  /**
   * Convert JavaScript object to Firestore format
   */
  private convertToFirestoreFormat(data: any): any {
    const result: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (value === null) {
        result[key] = { nullValue: null };
      } else if (typeof value === 'string') {
        result[key] = { stringValue: value };
      } else if (typeof value === 'number') {
        result[key] = Number.isInteger(value) ? { integerValue: value.toString() } : { doubleValue: value };
      } else if (typeof value === 'boolean') {
        result[key] = { booleanValue: value };
      } else if (value instanceof Date) {
        result[key] = { timestampValue: value.toISOString() };
      } else if (Array.isArray(value)) {
        result[key] = { arrayValue: { values: value.map(v => this.convertToFirestoreFormat({ temp: v }).temp) } };
      } else if (typeof value === 'object') {
        result[key] = { mapValue: { fields: this.convertToFirestoreFormat(value) } };
      }
    }
    
    return result;
  }

  /**
   * Convert Firestore format to JavaScript object
   */
  private convertFromFirestoreFormat(data: any): any {
    if (!data.fields) {
      return {};
    }
    
    const result: any = {};
    
    for (const [key, field] of Object.entries(data.fields as any)) {
      if ('stringValue' in field) {
        result[key] = field.stringValue;
      } else if ('integerValue' in field) {
        result[key] = parseInt(field.integerValue);
      } else if ('doubleValue' in field) {
        result[key] = parseFloat(field.doubleValue);
      } else if ('booleanValue' in field) {
        result[key] = field.booleanValue;
      } else if ('timestampValue' in field) {
        result[key] = new Date(field.timestampValue);
      } else if ('nullValue' in field) {
        result[key] = null;
      } else if ('arrayValue' in field) {
        result[key] = (field.arrayValue.values || []).map((v: any) => 
          this.convertFromFirestoreFormat({ fields: { temp: v } }).temp
        );
      } else if ('mapValue' in field) {
        result[key] = this.convertFromFirestoreFormat(field.mapValue);
      }
    }
    
    return result;
  }
}


