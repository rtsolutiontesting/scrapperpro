/**
 * CLOUDFLARE WORKER - University Data Engine API
 * 
 * Simplified API handler for Cloudflare Workers environment
 */

interface Env {
  // Environment variables
  FIREBASE_PROJECT_ID?: string;
  // Add other env vars as needed
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Enable CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle OPTIONS for CORS
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Health check
      if (method === 'GET' && path === '/health') {
        return new Response(
          JSON.stringify({ 
            status: 'ok', 
            timestamp: new Date().toISOString(),
            platform: 'cloudflare-workers'
          }),
          { 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            } 
          }
        );
      }

      // Create job endpoint
      if (method === 'POST' && path === '/jobs/create') {
        const body = await request.json() as any;
        const { universityName, country, urls, autoPublish, createdBy } = body;

        if (!universityName || !country || !urls || !Array.isArray(urls)) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields: universityName, country, urls' }),
            { 
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              } 
            }
          );
        }

        // TODO: Implement job creation with Firebase Firestore
        // For now, return a mock response
        const job = {
          id: `job-${Date.now()}`,
          universityName,
          country,
          urls,
          status: 'QUEUED',
          createdAt: new Date().toISOString(),
          createdBy: createdBy || 'system',
        };

        return new Response(
          JSON.stringify({ job }),
          { 
            status: 201,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            } 
          }
        );
      }

      // Get job endpoint
      if (method === 'GET' && path.startsWith('/jobs/')) {
        const jobId = path.split('/')[2];
        
        // TODO: Fetch from Firebase Firestore
        return new Response(
          JSON.stringify({ error: 'Not implemented yet - need Firestore integration' }),
          { 
            status: 501,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            } 
          }
        );
      }

      // Queue status
      if (method === 'GET' && path === '/queue/status') {
        return new Response(
          JSON.stringify({ 
            status: 'operational',
            queueLength: 0,
            processing: false
          }),
          { 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            } 
          }
        );
      }

      // 404 for unknown routes
      return new Response(
        JSON.stringify({ error: 'Not found' }),
        { 
          status: 404,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );

    } catch (error: any) {
      return new Response(
        JSON.stringify({ 
          error: error.message || 'Internal server error' 
        }),
        { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }
  },
};

