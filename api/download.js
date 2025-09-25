// api/download.js (Create this file in a folder named 'api')

// The use of 'node-fetch' is typical for Vercel/Next.js/Node environments.
// If you are using pure Node.js, you might use the built-in 'http' or 'https' module.

// In Vercel serverless functions, 'fetch' is usually available globally.
// If your environment is older or restricted, you might need to install 'node-fetch' (npm install node-fetch)
// and uncomment the import:
// import fetch from 'node-fetch'; 

export default async function handler(req, res) {
  // Ensure the request method is allowed (for pre-flight checks and actual request)
  if (req.method === 'OPTIONS') {
    // Handle CORS preflight request
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).end(); // No Content
    return;
  }
  
  // Set CORS headers for the actual response
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');


  // Get the 'url' query parameter from the request
  const url = req.query.url;

  // Check if a URL was provided
  if (!url) {
    res.status(400).json({ success: false, message: 'URL parameter is missing' });
    return;
  }

  // The original external API endpoint that the proxy will call
  const externalApiUrl = `https://batgpt.vercel.app/api/alldl?url=${encodeURIComponent(url)}`;

  try {
    // Use the native 'fetch' or 'node-fetch' to call the external API
    const response = await fetch(externalApiUrl);

    // Forward the status code and content type headers from the external API
    res.status(response.status);
    
    // Check if the external API call failed
    if (!response.ok) {
        // Forward the error response body
        const errorData = await response.json().catch(() => ({ message: 'External API call failed' }));
        res.json({ success: false, message: `External API Error: ${response.status}`, data: errorData });
        return;
    }
    
    // Get the data (assuming it returns JSON)
    const data = await response.json();

    // Send the data back to your frontend
    res.json(data);

  } catch (error) {
    console.error('Proxy fetch error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error during proxy fetch.' });
  }
}
