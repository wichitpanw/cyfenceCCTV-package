# Design Spec: PowerPoint (PPTX) Survey Report & Interactive Preview

This spec details the design and implementation for replacing the current PDF Survey Report printing function with a modern, high-fidelity PowerPoint (PPTX) exporter along with an interactive slide preview modal directly in the web application.

---

## 1. Goal & Objectives

- **Primary Goal:** Export the project survey reports as PowerPoint presentations (`.pptx`) with a standard landscape 16:9 aspect ratio.
- **Client Experience:** Users can review the slides directly on the web app using an interactive Slide Preview Modal before downloading the actual PPTX file.
- **Device Support:** Ensure the interactive modal fits beautifully on different screen sizes (desktops, iPads, and mobile phones) by using proportional CSS scaling.
- **High-Quality Output:** Generated PowerPoint slides will contain editable text, tables, and correctly positioned images rather than a static screenshot, giving the users flexibility to edit slides post-download.

---

## 2. Key Dependencies

We will install two essential libraries on the client side:
1. **`pptxgenjs`**: A powerful client-side library to generate editable PowerPoint files (`.pptx`).
2. **`html2canvas`**: Used specifically to capture the dynamic OpenStreetMap (Leaflet) view with all placed markers as a static image, so it can be embedded into the first slide.

---

## 3. UI Flow & Component Design

### 3.1 Dialog trigger change in `ProjectHistory.tsx`
- The current survey report option modal (which asks for "Portrait" or "Landscape" PDF orientation) will be replaced or updated.
- Clicking the **"รายงานผลการสำรวจ (Survey Report)"** button will directly launch the **PowerPoint Slide Preview Modal** since PPTX uses a fixed 16:9 landscape layout, removing the need for orientation selection.

### 3.2 The Interactive Modal: `SurveyReportPreviewModal`
- **Location:** A new component in `src/components/SurveyReportPreviewModal.tsx`.
- **Top Header Bar:** 
  - Title: "ตัวอย่างรายงานผลการสำรวจ (PowerPoint Preview)"
  - Button: 📥 **"ดาวน์โหลด PowerPoint (.pptx)"**
  - Button: ❌ **"ปิด"**
- **Slide Preview Container (16:9 Viewport):**
  - Displays one slide at a time.
  - Sized at a responsive max-width (e.g., `800px` to `1000px`), with height automatically computed at `width * 9 / 16`.
  - Uses CSS transform scaling `scale(factor)` on small screens (like iPad or mobile) to fit the viewport without breaking the layout.
- **Navigation Controls:**
  - Previous (◀️) and Next (▶️) buttons with page indicators (e.g., "หน้า 1 จาก 5").
  - Arrow keys support for desktop users.

---

## 4. Slide Content & Layout Specifications

All slides are designed in a 16:9 widescreen layout:

### 4.1 Slide 1: Cover & Project Map (Cover Page)
- **Left Column (40% width):**
  - NT Cyfence logo.
  - Large title: "รายงานผลการสำรวจจุดติดตั้งกล้อง (Survey Report)".
  - Metadata block: Project name, Customer name, Surveyor, Survey date, coordinates, and total camera points.
- **Right Column (60% width):**
  - An image box containing the static snapshot of the Leaflet Map with all plotted markers.
  - Captured dynamically using `html2canvas` from a hidden or preview Leaflet map instance initialized in the modal.

### 4.2 Slide 2+: Point Details (One slide per Camera Point)
- **Slide Header:** NT Cyfence logo on the left, and Point title (e.g., "จุดที่ 1: หน้าประตูทางเข้าหลัก") on the right.
- **Left Column (45% width):**
  - Specs table with columns: "ข้อมูลทางเทคนิค" and "รายละเอียด".
  - Rows: Camera Type, Pole Type, LAN Cable Length, Weatherproof Cabinet, UPS, PoE Switch, GPS coordinates.
  - Note Box: Located below the table if the survey point has any custom remarks/notes.
- **Right Column (55% width):**
  - **Upper Half:** Main site survey photo (contained to prevent distortion).
  - **Lower Half:** View grid showing the camera views (1 to 4 views based on camera set config).
    - 1-2 cameras: 1x2 side-by-side.
    - 3-4 cameras: 2x2 grid.

---

## 5. PowerPoint Generation Details (`pptxgenjs` Logic)

- **Slide Dimensions:** `16:9` layout (`10` inches width by `5.625` inches height).
- **Theme Colors:** 
  - NT Blue: `#002D62` (Main accents, table headers, titles).
  - NT Orange: `#FF6F00` (Secondary branding elements).
  - Background: White / light gray.
- **Editable Components:**
  - Titles: Rendered as PPTX Textboxes.
  - Technical Specs: Rendered as a native PPTX Table with custom cell padding, borders, and alternating background colors.
  - Metadata: Rendered as native Textboxes.
- **Media Assets:**
  - Logos, main photos, view photos, and the map snapshot are added as PPTX Images using their URLs or base64 data, with explicit position (`x`, `y`), width (`w`), and height (`h`) matching the responsive CSS design.

---

## 6. Spec Self-Review

1. **Placeholder Scan:** No "TBD" or "TODO" items remain in the spec. All items are concrete.
2. **Consistency Check:** The PPTX schema elements match the UI layouts perfectly.
3. **Scope Check:** This focus remains strictly on the Survey Report PowerPoint export. No other application pages are affected.
4. **Ambiguity Check:** The map capture mechanism is clarified to use `html2canvas` to ensure the Leaflet map is fully rendered before exporting.
