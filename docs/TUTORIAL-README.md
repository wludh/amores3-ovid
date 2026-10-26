# Tutorial Overlay (Quick Tour)

## Overview
The Amores Project shows a **simple first-visit “Quick tour” modal** to orient new users without cluttering the UI.

## User Experience
- **Shows once on first visit** (500ms after page load)
- **Dismiss options**:
  - Click the **×** button
  - Click **Start exploring**
  - Press **Escape**
  - Click the dimmed backdrop
- **Dark mode compatible** and uses the site’s existing theme variables

## Technical Details

### Files
- `docs/index.html`: Quick tour modal markup
- `docs/css/styles.css`: Overlay + modal styling
- `docs/js/script.js`: First-visit logic + dismiss handling

### Key Functions
- `checkFirstVisit()`: Checks localStorage for tutorial completion
- `bindTutorialEvents()`: Wires up dismiss handlers (backdrop, buttons, Escape)
- `showTutorial()`: Displays the overlay
- `dismissTutorial()`: Hides the overlay and marks as seen

### Browser Storage
- **Key**: `amores-tutorial-seen`
- **Value**: `'true'` (set when the tutorial is dismissed)
- **Location**: localStorage

### Developer Tools
- **Reset tutorial**: Press `Ctrl+Shift+T` to clear localStorage and reload page

## Customization

### To edit the tour content
Edit the list items inside `.tutorial-list` in `docs/index.html`.

### To change colors / spacing
Adjust `.tutorial-overlay` and `.tutorial-modal` in `docs/css/styles.css`.

### To disable the tutorial
Add this before the closing `</body>` tag:

```html
<script>
  localStorage.setItem('amores-tutorial-seen', 'true');
</script>
```

## W&L printed edition (W)

Select **Witness W** in Single Witness Viewer, or check **W** in Line-by-line
Viewer. W is the Wetstein 1751 printed edition at Washington and Lee University.
It has image mappings for all 870 verses in Amores III; choose an available
transcription and click its numbered lines to focus the matching W passage.
There is currently no W transcription or W TEI download.

Book III starts at viewer image **172**, printed page **128**. The archive's
label for that image is “Page 164,” so use the project's poem navigation or
line selection rather than the archive label. Existing manuscript selections
and annotations are preserved.
