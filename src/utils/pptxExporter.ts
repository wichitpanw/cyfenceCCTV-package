import pptxgen from "pptxgenjs";
import { ProjectSurvey } from "../types";

// Helper function to fetch an image and convert it to Base64 to bypass CORS and local path issues in pptxgenjs
async function fetchImageAsBase64(url: string): Promise<string | null> {
  if (!url) return null;
  try {
    // If it is already a base64 string, return it directly
    if (url.startsWith("data:")) return url;

    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Failed to fetch and convert image to base64:", url, error);
    return null;
  }
}

export async function exportSurveyReportToPPTX(
  project: ProjectSurvey,
  mapImageBase64: string | null
): Promise<void> {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_16x9";
  
  // Set theme colors (Hex strings without '#')
  const NT_BLUE = "002D62";
  const NT_ORANGE = "FF6F00";
  const TEXT_DARK = "111827";
  const BG_LIGHT = "F3F4F6";

  // Pre-load NT logos and backgrounds from template folder
  const logoYellowBase64 = await fetchImageAsBase64("/template/image3.png");
  const coverBgBase64 = await fetchImageAsBase64("/template/image10.jpeg");
  const logoBase64 = await fetchImageAsBase64("/cyfence_logo.png");

  // ==========================================
  // SLIDE 1: Cover & Project Map
  // ==========================================
  const slide1 = pptx.addSlide();
  
  if (coverBgBase64) {
    slide1.background = { data: coverBgBase64 };
  } else {
    slide1.background = { color: "FFFFFF" };
  }

  // Add decorative background semi-transparent overlay to ensure text readability on yellow backdrop
  slide1.addShape(pptx.shapes.RECTANGLE, {
    x: 0.2, y: 0.2, w: 3.8, h: 5.225,
    fill: { color: "FFFFFF", transparency: 15 }
  });

  // Left Column (Cover)
  if (logoYellowBase64) {
    slide1.addImage({
      data: logoYellowBase64,
      x: 0.5, y: 0.5, w: 1.8, h: 0.45
    });
  } else if (logoBase64) {
    slide1.addImage({
      data: logoBase64,
      x: 0.5, y: 0.5, w: 2.2, h: 0.5
    });
  } else {
    slide1.addText("NT Cyfence", {
      x: 0.5, y: 0.5, w: 3.0, h: 0.5,
      fontSize: 16, bold: true, color: NT_BLUE,
      fontFace: "Noto Sans Thai"
    });
  }

  slide1.addText(project.customerInfo?.projectName || "โครงการทั่วไป", {
    x: 0.5, y: 1.4, w: 3.2, h: 0.8,
    fontSize: 22, bold: true, color: NT_BLUE,
    fontFace: "Noto Sans Thai"
  });

  slide1.addText("รายงานผลการสำรวจจุดติดตั้งกล้อง\n(Survey Report)", {
    x: 0.5, y: 2.2, w: 3.2, h: 1.0,
    fontSize: 15, color: TEXT_DARK,
    bold: true,
    fontFace: "Noto Sans Thai"
  });

  const today = new Date().toLocaleDateString("th-TH", {
    year: "numeric", month: "long", day: "numeric"
  });

  const metadataText = `ลูกค้า: ${project.customerInfo?.customerName || "-"}\nวันที่สำรวจ: ${today}\nผู้สำรวจ: ${project.customerInfo?.surveyorName || "-"}\nจำนวนจุดติดตั้ง: ${project.cameraPoints?.length || 0} จุด`;
  slide1.addText(metadataText, {
    x: 0.5, y: 3.3, w: 3.2, h: 1.6,
    fontSize: 10.5, color: "374151",
    lineSpacing: 18,
    fontFace: "Noto Sans Thai"
  });

  // Right Column (Map image snapshot)
  if (mapImageBase64) {
    slide1.addImage({
      data: mapImageBase64,
      x: 4.3, y: 0.8, w: 5.2, h: 4.0,
      sizing: { type: "contain" }
    });
  } else {
    slide1.addText("[ไม่มีภาพแผนผังโครงการ]", {
      x: 4.3, y: 0.8, w: 5.2, h: 4.0,
      fill: { color: BG_LIGHT },
      align: "center",
      valign: "middle",
      color: "9CA3AF",
      fontSize: 14,
      fontFace: "Noto Sans Thai"
    });
  }

  // Footer for Cover Page
  slide1.addText("แผนผังโครงการ | NT Cyfence CCTV Survey System", {
    x: 0.5, y: 5.2, w: 9.0, h: 0.3,
    fontSize: 8, color: "9CA3AF",
    fontFace: "Noto Sans Thai"
  });

  // ==========================================
  // SLIDE 2+: Camera Points (1 slide per point)
  // ==========================================
  const points = project.cameraPoints || [];
  
  for (let idx = 0; idx < points.length; idx++) {
    const pt = points[idx];
    const slide = pptx.addSlide();
    slide.background = { color: "FFFFFF" };

    // Decorative side color bar
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0, y: 0, w: 0.12, h: 5.625,
      fill: { color: NT_BLUE }
    });

    // Slide Header
    if (logoYellowBase64) {
      slide.addImage({
        data: logoYellowBase64,
        x: 0.4, y: 0.15, w: 1.2, h: 0.3
      });
    } else if (logoBase64) {
      slide.addImage({
        data: logoBase64,
        x: 0.4, y: 0.2, w: 1.5, h: 0.34
      });
    }

    slide.addText(`จุดที่ ${idx + 1}: ${pt.name}`, {
      x: 2.2, y: 0.2, w: 7.3, h: 0.4,
      fontSize: 15, bold: true, color: NT_BLUE,
      align: "right",
      fontFace: "Noto Sans Thai"
    });

    // Separator line under header
    slide.addShape(pptx.shapes.LINE, {
      x: 0.4, y: 0.65, w: 9.2, h: 0,
      line: { color: "E5E7EB", width: 1.0 }
    });

    // ------------------------------------------
    // Left Column: Specs Table & Note Block
    // ------------------------------------------
    const hasPoe = pt.hasPoeSwitch ? "มี (Industrial Grade)" : "ไม่มี";
    const hasGround = pt.hasGroundRod ? "มี (Ground Rod 2.4m)" : "ไม่มี";
    const hasCabinet = pt.hasOutdoorCabinet ? "มี (ตู้กันน้ำระบายความร้อน)" : "ไม่มี";
    const hasUps = pt.hasCabinetUps ? "มี (UPS 800VA)" : "ไม่มี";
    const hasSd = pt.hasSdCard ? "มี (SD Card 128G)" : "ไม่มี";
    const hasPower = pt.hasPowerMeter ? "มี (มิเตอร์ไฟ + สาย THW)" : "ไม่มี";

    const tableData = [
      [
        { text: "หัวข้อคุณสมบัติ", options: { bold: true, fill: { color: "0F172A" }, color: "FFFFFF" } },
        { text: "รายละเอียดการติดตั้ง", options: { bold: true, fill: { color: "0F172A" }, color: "FFFFFF" } }
      ],
      [{ text: "ประเภทกล้อง" }, { text: pt.type || "Bullet", options: { bold: true } }],
      [{ text: "การติดตั้งเสา" }, { text: pt.poleType !== "None" ? pt.poleType : "ยึดติดอาคาร/ผนัง" }],
      [{ text: "ความยาวสาย LAN" }, { text: `${pt.lanCableLength || 25} เมตร` }],
      [{ text: "ตู้กันน้ำ/ฝน" }, { text: hasCabinet }],
      [{ text: "เครื่องสำรองไฟ" }, { text: hasUps }],
      [{ text: "สวิตช์ PoE" }, { text: hasPoe }],
      [{ text: "ระบบสายดิน" }, { text: hasGround }],
      [{ text: "SD Card" }, { text: hasSd }],
      [{ text: "มิเตอร์ไฟ" }, { text: hasPower }],
      [{ text: "ชุดกล้องที่จัดกลุ่ม" }, { text: pt.selectedSet || "Set 1", options: { color: "0071e3", bold: true } }],
      [{ text: "พิกัด GPS" }, { text: `${pt.lat?.toFixed(6) || "-"}, ${pt.lng?.toFixed(6) || "-"}`, options: { fontFace: "Courier New" } }]
    ];

    // Check if notes exist to dynamically size table height
    const hasNotes = !!pt.notes;
    const tableHeight = hasNotes ? 3.3 : 4.2;

    // Narrowed width w from 4.2 to 3.6 to leave more room for photos
    slide.addTable(tableData, {
      x: 0.4, y: 0.8, w: 3.6, h: tableHeight,
      fontSize: 8.0,
      fontFace: "Noto Sans Thai",
      border: { pt: 0.5, color: "E5E7EB" },
      colW: [1.2, 2.4],
      valign: "middle"
    });

    if (hasNotes) {
      slide.addText(`บันทึกเพิ่มเติม:\n${pt.notes}`, {
        x: 0.4, y: 4.25, w: 3.6, h: 0.85,
        fontSize: 8,
        color: "374151",
        fill: { color: "EFF6FF" },
        line: { color: "DBEAFE", width: 1 },
        inset: 0.08,
        fontFace: "Noto Sans Thai"
      });
    }

    // ------------------------------------------
    // Right Column: Main photo & View photos
    // ------------------------------------------
    
    // Fetch base64 data for all photos on this slide to bypass PowerPoint rendering issues
    const mainPhotoBase64 = await fetchImageAsBase64(pt.photoUrl);
    
    const camsCount = pt.selectedSet === "Set 2" ? 2 : pt.selectedSet === "Set 3" ? 3 : pt.selectedSet === "Set 4" ? 4 : 1;
    const viewUrls = pt.viewPhotoUrls || (pt.viewPhotoUrl ? [pt.viewPhotoUrl] : []);
    
    const viewPhotosBase64: (string | null)[] = [];
    for (let i = 0; i < camsCount; i++) {
      const b64 = await fetchImageAsBase64(viewUrls[i] || "");
      viewPhotosBase64.push(b64);
    }

    // Positions on slide (Expanded width rightColW from 4.8 to 5.2 to make photos much larger)
    const rightColX = 4.4;
    const rightColW = 5.2;

    // Upper Half: Main Photo
    if (mainPhotoBase64) {
      slide.addImage({
        data: mainPhotoBase64,
        x: rightColX, y: 0.8, w: rightColW, h: 2.3,
        sizing: { type: "contain" }
      });
    } else {
      slide.addText("[ไม่มีภาพประกอบจุดสำรวจหน้างาน]", {
        x: rightColX, y: 0.8, w: rightColW, h: 2.3,
        fill: { color: BG_LIGHT },
        align: "center",
        valign: "middle",
        color: "9CA3AF",
        fontSize: 10,
        fontFace: "Noto Sans Thai"
      });
    }

    // Lower Half: View Grid (1-4 sub-cams side-by-side in a single row to maximize image size)
    const gridStartY = 3.2;
    const gridH = 1.95;
    const gap = 0.08;
    const w = (rightColW - (camsCount - 1) * gap) / camsCount;

    for (let i = 0; i < camsCount; i++) {
      const x = rightColX + i * (w + gap);
      const b64 = viewPhotosBase64[i];

      if (b64) {
        slide.addImage({
          data: b64,
          x, y: gridStartY, w, h: gridH,
          sizing: { type: "contain" }
        });
      } else {
        slide.addText(`[ไม่มีภาพมุมกล้องตัวที่ ${i + 1}]`, {
          x, y: gridStartY, w, h: gridH,
          fill: { color: BG_LIGHT },
          align: "center",
          valign: "middle",
          color: "9CA3AF",
          fontSize: camsCount > 2 ? 6.5 : 8,
          fontFace: "Noto Sans Thai"
        });
      }
    }

    // Slide Footer details
    slide.addText(`หน้า ${idx + 1} จาก ${points.length} | NT Cyfence CCTV Survey System`, {
      x: 0.4, y: 5.25, w: 9.2, h: 0.3,
      fontSize: 8, color: "9CA3AF",
      fontFace: "Noto Sans Thai"
    });
  }

  // Download PPTX
  const filename = `Survey_Report_${project.customerInfo?.projectName || "Project"}.pptx`;
  await pptx.writeFile({ fileName: filename });
}
