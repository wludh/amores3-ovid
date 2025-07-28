# Amores Website Documentation

Welcome to the documentation for the Amores website. This guide is intended for content editors and explains how to update the text and data on the site.

## Project Structure Overview

The most important directory for content editing is `docs/data/`. This is where all the text for the website is stored.

## How the Website Works: A Brief Overview

This section provides a simplified overview of how the website is built for those who are curious. You do not need to edit any of these files to change the content of the companion texts.

*   `docs/`: This is the main folder for the website. All the files that the website uses are in here.
*   `index.html`: This is the main file for the homepage of the website. It's the first page that loads. Other HTML files like `about.html` and `editions.html` are for those specific pages.
*   `docs/css/styles.css`: This is the stylesheet. It controls the colors, fonts, and layout of the website.
*   `docs/js/`: This folder contains the JavaScript files, which add interactivity to the site.
    *   `script.js`: This is the main script that runs the interactive features on the pages.
    *   `data.js`: This script is responsible for loading all the companion text data (the JSON files) and the witness text data (the XML files).
    *   `CETEI.js`: This is a special library used to make the XML manuscript files display correctly in a web browser.

Again, for editing content, you will only need to work in the `docs/data/` directory.

## Editing Companion Text

The "companion text" for each poem is located in the `docs/data/Companion/` directory. This directory contains three subdirectories for different types of companion text:

*   `docs/data/Companion/Commentary/`: Contains commentary for each poem.
*   `docs/data/Companion/TextCommentary/`: Contains commentary on the Latin text itself.
*   `docs/data/Companion/Vocab/`: Contains vocabulary lists for each poem.

Each of these directories contains a set of JSON files, one for each poem (e.g., `3.1.json`, `3.2.json`, etc.).

### What is a JSON file?

A JSON file is a simple text file used to store data. It uses a `key: value` format. For this project, the "key" is a line number (as a string in double quotes), and the "value" is the text that should appear for that line.

Here is an example from `docs/data/Companion/Vocab/3.15.json`:

```json
{
  "2": "rādō, rādere, rāsī, rāsum: to scrape, shave, scratch, to rub\\npl, elegōrum: elegiac verses\\nulter, ultra, ultrum: that is beyond\\nmēta, mētae f.: cone, pyramid, turning point, winning post ( pillar at each end of the Circus route",
  "3": "alumnus, alumna, alumnum: nourished, fostered, etc"
}
```

In this example:
*   `"2":` is the key (representing line 2).
*   The long string of text following it is the value associated with line 2.

### How to edit the JSON files

1.  Navigate to the correct directory (e.g., `docs/data/Companion/Commentary/`).
2.  Open the JSON file corresponding to the poem you want to edit (e.g., `3.1.json` for poem 3.1).
3.  Find the line number (the key) you want to change.
4.  Edit the text (the value) inside the double quotes.
5.  Save the file. The changes should appear on the website after reloading the page.

**Important Notes:**
*   Be careful not to delete the double quotes `"` around the line numbers (keys) and the text (values).
*   Each entry is separated by a comma `,`, except for the very last one in the file.
*   The entire file is wrapped in curly braces `{}`.

## Editing Witness XML Files

The witness XML files contain the base texts for the different manuscript witnesses (P, S, and Y). These files are located directly in the `docs/data/` directory.

The files are:
*   `docs/data/witness-P.xml`
*   `docs/data/witness-S.xml`
*   `docs/data/witness-Y.xml`

### What is an XML file?

XML is a markup language that uses tags to describe data. It looks similar to HTML. The text of the poem is contained within these tags.

### How to edit the XML files

1.  Navigate to the `docs/data/` directory.
2.  Open the XML file you want to edit (e.g., `witness-P.xml`).
3.  The text is structured within XML tags like `<l>` (for a line) and `<w>` (for a word). You can edit the text content that appears between these tags.
4.  Save the file. The changes will be reflected on the website.

## Updating IIIF Manifests

The website uses IIIF manifests from external libraries to display manuscript images. These are pre-fetched and stored locally in the `docs/data/iiif-manifests/` directory.

If you need to refresh this data (for example, if a library has updated its manifest), you must run the following commands from the project's root directory:

1.  **Install dependencies (only needs to be done once):**
    ```sh
    npm install
    ```
2.  **Run the fetch script:**
    ```sh
    node fetch-manifests.js
    ```
This will download the latest versions of the manifests and update the local files. After running the script, you should commit the updated JSON files to your repository.

## Quick Reference: Editing and Pushing Changes to GitHub

1. Edit your files locally using your preferred editor.
2. Stage your changes:
   ```sh
   git add .
   ```
3. Commit your changes with a message:
   ```sh
   git commit -m "Describe what you changed"
   ```
4. Push your changes to GitHub:
   ```sh
   git push
   ```

Repeat these steps whenever you want to update your project on GitHub. 
