const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// --- Configuration ---
const manifests = {
  'witness-P': 'https://gallica.bnf.fr/iiif/ark:/12148/btv1b9066797j/manifest.json',
  'witness-Y': 'https://content.staatsbibliothek-berlin.de/dc/1844735508/manifest',
  'witness-S': 'https://www.e-codices.unifr.ch/metadata/iiif/csg-0864/manifest.json'
};

const outputDir = path.join(__dirname, 'docs', 'data', 'iiif-manifests');

// --- Main Function ---
async function fetchAndSaveManifests() {
  console.log('Starting manifest fetch...');

  // 1. Ensure the output directory exists
  try {
    await fs.mkdir(outputDir, { recursive: true });
    console.log(`Output directory created/ensured at: ${outputDir}`);
  } catch (error) {
    console.error(`Error creating directory: ${outputDir}`, error);
    return; // Exit if we can't create the directory
  }

  // 2. Create an array of promises for all fetch operations
  const fetchPromises = Object.entries(manifests).map(async ([key, url]) => {
    const outputPath = path.join(outputDir, `${key}.json`);
    console.log(`Fetching: ${url}`);

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
          'Accept': 'application/json, application/ld+json, */*'
        },
        timeout: 30000 // 30-second timeout
      });

      await fs.writeFile(outputPath, JSON.stringify(response.data, null, 2));
      console.log(`✅ Successfully saved: ${outputPath}`);
    } catch (error) {
      console.error(`❌ Error fetching or saving for ${key} from ${url}`);
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Data: ${JSON.stringify(error.response.data).substring(0, 100)}...`);
      } else {
        console.error(`   Error: ${error.message}`);
      }
    }
  });

  // 3. Wait for all promises to settle
  await Promise.all(fetchPromises);

  console.log('\nManifest fetch process complete.');
}

// --- Execute Script ---
fetchAndSaveManifests(); 