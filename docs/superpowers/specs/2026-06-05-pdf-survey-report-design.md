# Design Spec: PDF Survey Report Layout Optimizations

Improve the layout of the CCTV Survey Report (PDF Print format) for both **Portrait** and **Landscape** orientations, ensuring that each survey point occupies exactly **one A4 page** with no overflow.

## User Context & Persona
- **Assistant Persona**: ลีนุกส์ (Linux) - ผู้ช่วยสาวแว่นผู้รอบรู้และพร้อมช่วยเหลือ
- **User Name**: คุณบีม (Beam)

---

## 1. Requirements & Layout Design

### General Constraints
- **One point per page**: Each point in the survey must fit exactly on a single A4 page.
- **Orientation**: Supports both `portrait` and `landscape` modes.
- **No overflow**: Strict image sizing and table styling to prevent content pushing onto extra pages.
- **Grid for View Photos**: View photos (1 to 4 camera angles) must be arranged in a 2x2 grid when they belong to the same point.

---

### Layout A: Landscape Mode (`width: 297mm`, `height: 210mm`)

We use a side-by-side (2-column) layout because the height is limited (210mm):

- **Header / Logo**: Top full-width strip, compact (height ~25mm)
- **Point Title**: e.g., "จุดที่ 1: วงเวียน" (~10mm)
- **Content Columns (50% : 50% split)**:
  - **Left Column**:
    - **Detail Table**: Slim padding, compact font size (8.5pt).
    - **Main Installation Photo**: Sized nicely with a fixed aspect-ratio or height limit (e.g., `aspect-ratio: 16/9`, `max-height: 70mm`).
  - **Right Column**:
    - **Notes / Additional Info**: If present, shown at the top of the right column.
    - **Camera View Photos Grid (2x2)**:
      - Display up to 4 camera angles.
      - Arranged as a 2x2 grid.
      - Compact placeholder or image wrapper with fixed dimensions (e.g., `aspect-ratio: 16/10` or `aspect-ratio: 4/3` inside grid cells).

---

### Layout B: Portrait Mode (`width: 210mm`, `height: 297mm`)

We use a top-down then split layout because the height is abundant (297mm) but width is limited (210mm):

- **Header / Logo**: Top full-width strip (~25mm)
- **Point Title**: e.g., "จุดที่ 1: วงเวียน" (~10mm)
- **Detail Table**: Spans full width (100%) below the title.
- **Bottom Content Columns (50% : 50% split)**:
  - **Left Column**:
    - **Main Installation Photo**: Sized nicely (e.g., `aspect-ratio: 4/3` or `16/9`, `max-height: 90mm`).
  - **Right Column**:
    - **Camera View Photos Grid (2x2)**:
      - Sized to fit perfectly alongside the main photo.
      - Grid columns: 2 columns, grid-gap: 8px.
      - Box-sizing controls so it doesn't push down.

---

## 2. Technical Implementation details (CSS & HTML)

### Print styling overrides
```css
@page {
  size: A4 portrait; /* or A4 landscape depending on selected orientation */
  margin: 10mm;
}

@media print {
  body {
    background: none;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .page-container {
    width: 100% !important;
    height: 100% !important;
    page-break-after: always;
    break-after: page;
    box-sizing: border-box;
    margin: 0 !important;
    padding: 0 !important;
  }
}
```

### Component Structure
- Update `handlePrintSurveyReportPDF` in [App.tsx](file:///c:/Users/M4u_b/Gemini%20Project/CCTV%20package%20app/src/App.tsx):
  - Conditionally render different HTML/CSS layouts based on the `orientation` parameter.
  - Apply CSS Grid/Flexbox structures tailored to each layout.
  - Constrain image wrapper classes so they don't break page margins.

---

## 3. Verification Plan

### Automated Verification
- Run `npm run build` to ensure TypeScript compilation succeeds without any errors.

### Manual Verification
- Generate PDF survey reports for both **Portrait** and **Landscape** options.
- Inspect print preview window to verify:
  1. Points are divided strictly 1 point per page.
  2. In Landscape, details + main photo are on the left; notes + 2x2 grid are on the right.
  3. In Portrait, table is on top; main photo is bottom-left, 2x2 grid is bottom-right.
  4. Images are not cropped awkwardly and do not cause blank pages or overflow.
