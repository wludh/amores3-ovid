# Witness O browser verification — 2026-09-08

Tested the current worktree at `http://127.0.0.1:4173/` using the actual
OpenSeadragon viewers and live Internet Archive image tiles.

The original generated export incorrectly stored zero-based canvas indices as
annotation pages. The viewer subtracts one from annotation pages, so these
records opened the preceding scan. Both generators and all 870 exported
records now store canvas index + 1. Poem-start navigation remains zero based.

Page changes now defer focus until the new image opens. Removed the old
single-selection zoom reduction, which divided zoom by the number of available
witness sections and made the selected line unreadably small.

## Visually checked samples

| Poem.line | Viewer mode | Visible highlighted text | Viewer page / printed page |
|---|---|---|---|
| 3.1.1 | Line-by-line, O only | Stat vetus et multos incaedua silva per annos | 93 / 45 |
| 3.1.22 | Line-by-line, O only; crossed page boundary | Dum tua praeterito facta pudore refers | 94 / 46 |
| 3.1.47 | Line-by-line, O only | Et tamen emerui plus, quam tu, posse ferendo | 94 / 46 |
| 3.11.33 | Line-by-line, O only; switched poems | Luctantur pectusque leve in contraria tendunt — XIb | 112 / 64 |
| 3.15.20 | Line-by-line, O only; switched poems | Post mea mansurum fata superstes opus | 117 / 69 |
| 3.15.20 | Single Manuscript Viewer, O | Post mea mansurum fata superstes opus | 117 / 69 |

Each screenshot was inspected after the remote image tiles loaded. Highlight
bands aligned with the cited printed verse, including O's relocated 3.1.47 and
the XIb start corresponding to continuous LL line numbering at 3.11.33.

The browser also confirmed initial P/Y/S checked with O unchecked, O-only
selection, and the initial Single Manuscript Viewer O button. The source is
identified as a printed edition in witness control tooltips and the usage guide.

## Automated checks

`npm test`: 25 tests passed. O-specific checks cover every canonical line,
one-based page mapping, scan leaf identity, image dimensions, bounding boxes
against the actual OCR rows on the rendered page, transposed verse order,
repair of cached faulty exports while retaining edited coordinates, and
deferral of focus across page changes. Existing annotation-prefix preservation
and checkbox subset/empty-selection/state restoration checks also pass.

This is complete source-coordinate verification plus browser sampling, not a
claim that every verse was manually inspected in a browser.
