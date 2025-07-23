const express = require('express');
const cors = require('cors');
const axios = require('axios');
const https = require('https');

const app = express();
const port = 3000;

// Configure CORS
app.use(cors({
  origin: '*',
  methods: ['GET'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('URL parameter is required');
  }

  // Determine the appropriate referer based on the target URL
  let referer = 'https://gallica.bnf.fr/';
  if (targetUrl.includes('staatsbibliothek-berlin.de')) {
    referer = 'https://digital.staatsbibliothek-berlin.de/';
  } else if (targetUrl.includes('e-codices.unifr.ch')) {
    referer = 'https://www.e-codices.unifr.ch/';
  }

  try {
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        'Accept': 'application/json, application/ld+json, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': referer
      },
      // Set longer timeout
      timeout: 30000,
      // Allow self-signed certificates
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    });

    // Copy relevant response headers
    const headersToForward = ['content-type', 'etag', 'last-modified'];
    headersToForward.forEach(header => {
      if (response.headers[header]) {
        res.setHeader(header, response.headers[header]);
      }
    });

    res.send(response.data);
  } catch (error) {
    console.error('--- ERROR FETCHING MANIFEST ---');
    console.error('Target URL:', targetUrl);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
      res.status(error.response.status).send(error.response.data);
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timed out');
      res.status(504).send('Request timed out');
    } else {
      console.error('Error:', error.message);
      res.status(500).send('Failed to fetch the IIIF manifest');
    }
    console.error('---------------------------------');
  }
});

app.listen(port, () => {
  console.log(`CORS proxy server listening at http://localhost:${port}`);
}); 