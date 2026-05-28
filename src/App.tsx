import React, { useState, useEffect } from "react";
import { 
  Building, 
  Settings, 
  Layers, 
  MapPin, 
  Coins, 
  Clipboard, 
  User, 
  Glasses, 
  Smile, 
  Info, 
  CheckCircle, 
  RefreshCw,
  Clock,
  Home
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ProjectSurvey, CustomerInfo, TechRequirements, CameraPoint, PricingItem, MasterCostDb, UserProfile } from "./types";
import Step1BasicInfo from "./components/Step1BasicInfo";
import Step2CameraRequirements from "./components/Step2CameraRequirements";
import Step4SurveyReport from "./components/Step4SurveyReport";
import Step5Summary from "./components/Step5Summary";
import Step6Pricing from "./components/Step6Pricing";
import ProjectHistory from "./components/ProjectHistory";
import DashboardView from "./components/DashboardView";
import LoginScreen from "./components/LoginScreen";
import UserManagement from "./components/UserManagement";
import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { LogOut, Users, Loader2 } from "lucide-react";
import { Sidebar02 } from "../components/blocks/sidebar-02";
import { Dialog01 } from "../components/blocks/dialog-01";
import { CommandMenu01 } from "../components/blocks/command-menu-01";


// Primary default layout values
const DEFAULT_CUSTOMER_INFO: CustomerInfo = {
  customerName: "",
  projectName: "",
  contactPerson: "",
  contactPhone: "",
  address: "",
  latitude: "",
  longitude: "",
  surveyorName: "",
  surveyorPhone: "",
  surveyorDepartment: "",
  surveyDate: new Date().toISOString().split("T")[0],
  province: "",
};

const DEFAULT_REQUIREMENTS: TechRequirements = {
  cameraCount: 4,
  cameraBrand: "Hikvision",
  nvrBrand: "ยี่ห้อเดียวกับกล้อง (แนะนำ)",
  nvrChannels: 8,
  storagePackage: "HDD 8TB (มาตรฐานส่วนกลาง 8CH NVR)",
  otherRequirements: "",
  rackType: "Rack 19 นิ้ว 6U",
  monitorType: "จอ 27 นิ้ว",
  upsType: "UPS 1Kva",
};

const DEFAULT_MASTER_COSTS: MasterCostDb = {
  // --- ปลายทาง (Hardware & Accessory) ---
  camBullet: 1850,
  camDome: 1650,
  camPtz: 5900,
  camFisheye: 4200,
  poe4port: 1800, // Switch POE 4 Port Industrial Grade
  ups800va: 2200, // Ups 800 VA
  outdoorCabinet: 2500, // ตู้ Outdoor Cabinet แบบมีพัดลม
  sdCard128: 650, // SDcard 128G
  supportArm: 850, // แขน Support
  thw16sqmm: 3000, // ค่าสายไฟฟ้า THW IEC 16 sq.mm. 50 เมตร (ราคาชุดละ 50 เมตร)

  // --- เสา ---
  poleSteel4m: 3500, // เสาเหล็ก 4 เมตร
  poleCement8m: 6500, // เสาปูน 8 เมตร

  // --- ต้นทาง ---
  nvr8ch: 4500,
  nvr16ch: 6800,
  nvr32ch: 11900,
  hdd8tb: 8500, // HDD 8TB
  rack6u: 2800, // Rack 19 นิ้ว 6U
  rack16u: 5500, // Rack 19 นิ้ว 16U
  rack42u: 12900, // Rack 19 นิ้ว 42U
  monitor27: 4500, // จอ 27 นิ้ว
  tv55: 14900, // TV 55 นิ้ว
  ups1kva: 4200, // UPS 1Kva
  ups2kva: 8500, // UPS 2Kva
  routerHw: 3900, // Router VPN/Firewall
  

  // --- ค่าติดตั้งปลายทาง ---
  laborCctv: 1200, // ค่าติดตั้ง กล้อง CCTV (ค่าเดินสาย LAN 25 เมตรในท่อเฟล็กซ์อ่อนภายนอก + ติดตั้งกล้อง)
  laborSupportArm: 450, // ค่าติดตั้ง แขน Support (ความยาวไม่น้อยกว่า 1 เมตร)
  laborCabinet: 800, // ค่าติดตั้งตู้ Outdoor cabinet (พัดลมระบายอากาศ 2 ตัว, ปลั๊กไฟ, Breaker)
  laborGroundRod: 700, // ค่าติดตั้ง Ground Rod (ค่าขุดเจาะบ่อกราวด์)
  laborPoleCement8m: 2500, // ค่าติดตั้งเสาปูน 8 เมตร (ค่าปักเสาปูนพร้อมฐานราก)
  laborPoleSteel4m: 1500, // ค่าติดตั้งเสาเหล็กกัลวาไนซ์ สูง 4 เมตร (ค่าติดตั้งพร้อมฐานราก)
  laborPowerThw: 1200, // ค่าติดตั้ง สายไฟฟ้า (สาย THW 16 sq.mm. 50 เมตร + ค่าแรกเข้ามิเตอร์ไฟ)

  // --- ค่าติดตั้งต้นทาง ---
  laborMonitor: 1500, // ค่าติดตั้งจอ Monitor (พร้อมอุปกรณ์ยึดจับ, สาย HDMI)
  laborRack: 2200, // ค่าติดตั้งตู้ Rack (พัดลม, รางปลั๊กไฟ, UPS)
  laborNvr: 1000, // ค่าติดตั้ง NVR (เมาส์ไร้สาย, Config ให้ดูภาพได้)
  laborRouter: 1200, // ค่าติดตั้ง Router (Config ให้ระบบทำงานได้)
  laborPowerVct: 800, // ค่าเดินสายไฟฟ้าต้นทาง (สาย vct 30 เมตร, Breaker 16 A)

  // --- ค่าบริการบำรุงรักษารายปี (MA) สำหรับปีที่ 2 และ 3 ---
  maYear2: 3500, // สมมติราคาเริ่มต้นสำหรับค่าบริการ MA ปีที่ 2 ต่อปี
  maYear3: 3500, // สมมติราคาเริ่มต้นสำหรับค่าบริการ MA ปีที่ 3 ต่อปี

  lastUpdated: new Date("2026-05-28T19:15:00+07:00").toISOString(),
};

// Help helper for autoBOM items
function generatePricingItems(
  requirements: TechRequirements,
  hasSurvey: boolean,
  cameraPoints: CameraPoint[],
  costs: MasterCostDb
): PricingItem[] {
  const brand = requirements.cameraBrand || "Hikvision";
  const items: PricingItem[] = [];

  // --- 1. ปลายทาง: กล้อง CCTV ---
  let totalCams = requirements.cameraCount;
  if (hasSurvey && cameraPoints.length > 0) {
    totalCams = cameraPoints.reduce((sum, pt) => {
      let ptCams = 1;
      if (pt.selectedSet === "Set 1") ptCams = 1;
      else if (pt.selectedSet === "Set 2") ptCams = 2;
      else if (pt.selectedSet === "Set 3") ptCams = 3;
      else if (pt.selectedSet === "Set 4") ptCams = 4;
      return sum + ptCams;
    }, 0);
  }

  // แยกประเภทกล้องสำหรับกรณีมี Survey
  if (hasSurvey && cameraPoints.length > 0) {
    let domes = 0;
    let bullets = 0;
    let ptzs = 0;
    let fisheyes = 0;

    cameraPoints.forEach(p => {
      let ptCams = 1;
      if (p.selectedSet === "Set 1") ptCams = 1;
      else if (p.selectedSet === "Set 2") ptCams = 2;
      else if (p.selectedSet === "Set 3") ptCams = 3;
      else if (p.selectedSet === "Set 4") ptCams = 4;

      if (p.type === "Dome") domes += ptCams;
      else if (p.type === "PTZ" || p.type === "Speed Dome") ptzs += ptCams;
      else if (p.type === "Fisheye") fisheyes += ptCams;
      else bullets += ptCams; // Default is Bullet
    });

    if (bullets > 0) {
      items.push({
        id: "bom-cam-bullet",
        name: `กล้อง CCTV Bullet IP Camera 5MP (${brand})`,
        quantity: bullets,
        unit: "ตัว",
        unitPrice: costs.camBullet,
        category: "hardware"
      });
    }
    if (domes > 0) {
      items.push({
        id: "bom-cam-dome",
        name: `กล้อง CCTV Dome IP Camera 5MP (${brand})`,
        quantity: domes,
        unit: "ตัว",
        unitPrice: costs.camDome,
        category: "hardware"
      });
    }
    if (ptzs > 0) {
      items.push({
        id: "bom-cam-ptz",
        name: `กล้อง CCTV PTZ Speed Dome (${brand})`,
        quantity: ptzs,
        unit: "ตัว",
        unitPrice: costs.camPtz,
        category: "hardware"
      });
    }
    if (fisheyes > 0) {
      items.push({
        id: "bom-cam-fisheye",
        name: `กล้อง CCTV Fisheye 360° (${brand})`,
        quantity: fisheyes,
        unit: "ตัว",
        unitPrice: costs.camFisheye,
        category: "hardware"
      });
    }
  } else {
    items.push({
      id: "bom-cam-bullet",
      name: `กล้อง CCTV Bullet IP Camera 5MP (${brand})`,
      quantity: totalCams,
      unit: "ตัว",
      unitPrice: costs.camBullet,
      category: "hardware"
    });
  }

  // --- 2. ปลายทาง: Switch POE 4 Port Industrial Grade ---
  // การจ่าย POE ปลายทางจะคิดตามจุด (1 จุดต่อ 1 เครื่อง Switch POE 4 Port)
  const poeQty = (hasSurvey && cameraPoints.length > 0) ? cameraPoints.length : Math.max(1, Math.ceil(totalCams / 4));
  items.push({
    id: "bom-poe-4port",
    name: "Switch POE 4 Port Industrial Grade",
    quantity: poeQty,
    unit: "เครื่อง",
    unitPrice: costs.poe4port,
    category: "hardware"
  });

  // --- 3. ปลายทาง: อุปกรณ์เสริมยิบย่อยตามแฟล็กของ CameraPoint ---
  if (hasSurvey && cameraPoints.length > 0) {
    let ups800vaCount = 0;
    let outdoorCabinetCount = 0;
    let sdCardCount = 0;
    let supportArmCount = 0;
    let powerMeterCount = 0;

    cameraPoints.forEach(p => {
      if (p.hasCabinetUps) ups800vaCount++;
      if (p.hasOutdoorCabinet) outdoorCabinetCount++;
      if (p.hasSdCard) sdCardCount++;
      if (p.hasSupportArm) supportArmCount++;
      if (p.hasPowerMeter) powerMeterCount++;
    });

    if (ups800vaCount > 0) {
      items.push({
        id: "bom-ups-800va",
        name: "Ups 800 VA (เครื่องสำรองไฟสำหรับตู้ควบคุมปลายทาง)",
        quantity: ups800vaCount,
        unit: "เครื่อง",
        unitPrice: costs.ups800va,
        category: "hardware"
      });
    }
    if (outdoorCabinetCount > 0) {
      items.push({
        id: "bom-outdoor-cabinet",
        name: "ตู้ Outdoor Cabinet แบบมีพัดลมระบายอากาศภายในตู้",
        quantity: outdoorCabinetCount,
        unit: "ตู้",
        unitPrice: costs.outdoorCabinet,
        category: "accessory"
      });
    }
    if (sdCardCount > 0) {
      items.push({
        id: "bom-sdcard-128g",
        name: "SDcard 128G (เมมโมรี่การ์ดบันทึกสำรองปลายทาง)",
        quantity: sdCardCount,
        unit: "ใบ",
        unitPrice: costs.sdCard128,
        category: "accessory"
      });
    }
    if (supportArmCount > 0) {
      items.push({
        id: "bom-support-arm",
        name: "แขน Support ยึดกล้อง (ความยาวไม่น้อยกว่า 1 เมตร)",
        quantity: supportArmCount,
        unit: "ชุด",
        unitPrice: costs.supportArm,
        category: "accessory"
      });
    }
    if (powerMeterCount > 0) {
      items.push({
        id: "bom-power-thw-cable",
        name: "ค่าสายไฟฟ้า THW IEC 16 sq.mm. 50 เมตร (สำหรับจ่ายไฟเมนปลายทาง)",
        quantity: powerMeterCount,
        unit: "ชุด",
        unitPrice: costs.thw16sqmm,
        category: "accessory"
      });
    }
  }

  // --- 4. เสา (กรณีไม่ได้ติดตั้งกับเสาของการไฟฟ้า) ---
  if (hasSurvey && cameraPoints.length > 0) {
    let poleSteel4mCount = 0;
    let poleCement8mCount = 0;

    cameraPoints.forEach(p => {
      if (p.poleType === "เสาเหล็กกัลวาไนซ์ 4 เมตร") poleSteel4mCount++;
      else if (p.poleType === "เสาปูน 8 เมตร") poleCement8mCount++;
    });

    if (poleSteel4mCount > 0) {
      items.push({
        id: "bom-pole-steel-4m",
        name: "เสาเหล็ก 4 เมตร (สำหรับติดตั้งกล้องนอกอาคาร)",
        quantity: poleSteel4mCount,
        unit: "ต้น",
        unitPrice: costs.poleSteel4m,
        category: "accessory"
      });
    }
    if (poleCement8mCount > 0) {
      items.push({
        id: "bom-pole-cement-8m",
        name: "เสาปูน 8 เมตร (สำหรับติดตั้งโยธาภายนอก)",
        quantity: poleCement8mCount,
        unit: "ต้น",
        unitPrice: costs.poleCement8m,
        category: "accessory"
      });
    }
  }

  // --- 5. ต้นทาง: เครื่องบันทึก NVR ---
  let nvrPrice = costs.nvr8ch;
  let nvrName = "NVR 8 ch";
  if (requirements.nvrChannels <= 8) {
    nvrPrice = costs.nvr8ch;
    nvrName = "NVR 8 ch";
  } else if (requirements.nvrChannels <= 16) {
    nvrPrice = costs.nvr16ch;
    nvrName = "NVR 16 ch";
  } else {
    nvrPrice = costs.nvr32ch;
    nvrName = "NVR 32 ch";
  }

  items.push({
    id: "bom-nvr",
    name: `${nvrName} (เครื่องบันทึกภาพกล้องวงจรปิด แบรนด์: ${brand})`,
    quantity: 1,
    unit: "เครื่อง",
    unitPrice: nvrPrice,
    category: "hardware"
  });

  // --- 6. ต้นทาง: HDD ---
  let hddQty = 1;
  if (requirements.nvrChannels <= 8) {
    hddQty = 1;
  } else if (requirements.nvrChannels <= 16) {
    hddQty = 2;
  } else {
    hddQty = 4;
  }

  items.push({
    id: "bom-hdd",
    name: `HDD (ฮาร์ดดิสก์ขนาด 8TB สำหรับบันทึกกล้องวงจรปิด)`,
    quantity: hddQty,
    unit: "ลูก",
    unitPrice: costs.hdd8tb,
    category: "hardware"
  });

  // --- 7. ต้นทาง: ตู้ Rack 19 นิ้ว ---
  let rackPrice = costs.rack6u;
  let rackName = "Rack 19 นิ้ว 6U";
  const selectedRack = requirements.rackType || "Rack 19 นิ้ว 6U";
  if (selectedRack === "Rack 19 นิ้ว 16U") {
    rackPrice = costs.rack16u;
    rackName = "Rack 19 นิ้ว 16U";
  } else if (selectedRack === "Rack 19 นิ้ว 42U") {
    rackPrice = costs.rack42u;
    rackName = "Rack 19 นิ้ว 42U";
  }

  items.push({
    id: "bom-rack",
    name: rackName,
    quantity: 1,
    unit: "ตู้",
    unitPrice: rackPrice,
    category: "accessory"
  });

  // --- 8. ต้นทาง: จอภาพ ---
  let monitorPrice = costs.monitor27;
  let monitorName = "จอ 27 นิ้ว";
  const selectedMonitor = requirements.monitorType || "จอ 27 นิ้ว";
  if (selectedMonitor === "TV 55 นิ้ว") {
    monitorPrice = costs.tv55;
    monitorName = "TV 55 นิ้ว";
  }

  items.push({
    id: "bom-monitor",
    name: monitorName,
    quantity: 1,
    unit: "เครื่อง",
    unitPrice: monitorPrice,
    category: "hardware"
  });

  // --- 9. ต้นทาง: UPS ---
  let upsPrice = costs.ups1kva;
  let upsName = "UPS 1Kva";
  const selectedUps = requirements.upsType || "UPS 1Kva";
  if (selectedUps === "UPS 2Kva") {
    upsPrice = costs.ups2kva;
    upsName = "UPS 2Kva";
  }

  items.push({
    id: "bom-ups-head",
    name: upsName,
    quantity: 1,
    unit: "เครื่อง",
    unitPrice: upsPrice,
    category: "hardware"
  });

  // --- 10. ต้นทาง: Router VPN/Firewall ---
  items.push({
    id: "bom-router-hw",
    name: "Router VPN/Firewall",
    quantity: 1,
    unit: "เครื่อง",
    unitPrice: costs.routerHw || 3900,
    category: "hardware"
  });

  // ==================== รายการค่าติดตั้ง (ปลายทาง) ====================
  // 1. ค่าติดตั้ง กล้อง CCTV (ค่าเดินสาย LAN 25 เมตร/ตัว + ติดตั้งกล้อง)
  items.push({
    id: "bom-labor-cctv",
    name: "ค่าติดตั้ง กล้อง CCTV (เดินสาย LAN ระยะ 25 ม./ตัว ในท่อเฟล็กซ์อ่อนภายนอก + ติดตั้งกล้อง)",
    quantity: totalCams,
    unit: "จุด",
    unitPrice: costs.laborCctv,
    category: "labor"
  });

  if (hasSurvey && cameraPoints.length > 0) {
    let supportArmCount = 0;
    let cabinetCount = 0;
    let groundRodCount = 0;
    let cement8mCount = 0;
    let steel4mCount = 0;
    let powerThwCount = 0;

    cameraPoints.forEach(p => {
      if (p.hasSupportArm) supportArmCount++;
      if (p.hasOutdoorCabinet) cabinetCount++;
      if (p.hasGroundRod) groundRodCount++;
      if (p.poleType === "เสาปูน 8 เมตร") cement8mCount++;
      if (p.poleType === "เสาเหล็กกัลวาไนซ์ 4 เมตร") steel4mCount++;
      if (p.hasPowerMeter) powerThwCount++;
    });

    // 2. ค่าติดตั้ง แขน Support
    if (supportArmCount > 0) {
      items.push({
        id: "bom-labor-support-arm",
        name: "ค่าติดตั้ง แขน Support (ความยาวไม่น้อยกว่า 1 เมตร)",
        quantity: supportArmCount,
        unit: "ชุด",
        unitPrice: costs.laborSupportArm,
        category: "labor"
      });
    }

    // 3. ค่าติดตั้งตู้ Outdoor cabinet
    if (cabinetCount > 0) {
      items.push({
        id: "bom-labor-cabinet",
        name: "ค่าติดตั้งตู้ Outdoor Cabinet (พร้อมพัดลมระบายอากาศ 2 ตัว, ปลั๊กไฟ, Circuit Breaker)",
        quantity: cabinetCount,
        unit: "ตู้",
        unitPrice: costs.laborCabinet,
        category: "labor"
      });
    }

    // 4. ค่าติดตั้ง Ground Rod
    if (groundRodCount > 0) {
      items.push({
        id: "bom-labor-ground-rod",
        name: "ค่าติดตั้ง Ground Rod (ค่าขุดเจาะบ่อกราวด์เพื่อความปลอดภัย)",
        quantity: groundRodCount,
        unit: "จุด",
        unitPrice: costs.laborGroundRod,
        category: "labor"
      });
    }

    // 5. ค่าติดตั้งเสาปูน 8 เมตร
    if (cement8mCount > 0) {
      items.push({
        id: "bom-labor-pole-cement-8m",
        name: "ค่าติดตั้งเสาปูน 8 เมตร (ค่าปักเสาปูนพร้อมฐานรากงานโยธา)",
        quantity: cement8mCount,
        unit: "ต้น",
        unitPrice: costs.laborPoleCement8m,
        category: "labor"
      });
    }

    // 6. ค่าติดตั้งเสาเหล็ก 4 เมตร
    if (steel4mCount > 0) {
      items.push({
        id: "bom-labor-pole-steel-4m",
        name: "ค่าติดตั้งเสาเหล็กกัลวาไนซ์ สูง 4 เมตร (ค่าติดตั้งพร้อมฐานราก)",
        quantity: steel4mCount,
        unit: "ต้น",
        unitPrice: costs.laborPoleSteel4m,
        category: "labor"
      });
    }

    // 7. ค่าติดตั้ง สายไฟฟ้า
    if (powerThwCount > 0) {
      items.push({
        id: "bom-labor-power-thw",
        name: "ค่าติดตั้ง สายไฟฟ้า (สาย THW IEC 16 sq.mm. 50 เมตร + ค่าแรกเข้าติดตั้งมิเตอร์ไฟฟ้า)",
        quantity: powerThwCount,
        unit: "ชุด",
        unitPrice: costs.laborPowerThw,
        category: "labor"
      });
    }
  }

  // ==================== รายการค่าติดตั้ง (ต้นทาง) ====================
  // 1. ค่าติดตั้งจอ Monitor
  items.push({
    id: "bom-labor-monitor",
    name: "ค่าติดตั้งจอ Monitor (พร้อมอุปกรณ์ยึดจับและสาย HDMI)",
    quantity: 1,
    unit: "ชุด",
    unitPrice: costs.laborMonitor,
    category: "labor"
  });

  // 2. ค่าติดตั้งตู้ Rack
  items.push({
    id: "bom-labor-rack",
    name: "ค่าติดตั้งตู้ Rack (พัดลมระบายอากาศ, รางปลั๊กไฟฟ้า และเครื่อง UPS สำรองไฟ)",
    quantity: 1,
    unit: "ตู้",
    unitPrice: costs.laborRack,
    category: "labor"
  });

  // 3. ค่าติดตั้ง NVR
  items.push({
    id: "bom-labor-nvr",
    name: "ค่าติดตั้ง NVR (พร้อมเมาส์ไร้สาย และค่า Config ระบบ)",
    quantity: 1,
    unit: "เครื่อง",
    unitPrice: costs.laborNvr,
    category: "labor"
  });

  // 4. ค่าติดตั้ง Router
  items.push({
    id: "bom-labor-router",
    name: "ค่าติดตั้ง Router ต้นทาง (ค่า Config ระบบให้สามารถทำงานได้)",
    quantity: 1,
    unit: "เครื่อง",
    unitPrice: costs.laborRouter,
    category: "labor"
  });

  // 5. ค่าเดินสายไฟฟ้าต้นทาง
  items.push({
    id: "bom-labor-power-vct",
    name: "ค่าเดินสายไฟฟ้าต้นทาง (สายไฟฟ้า VCT 30 เมตร พร้อม Circuit Breaker 16 A)",
    quantity: 1,
    unit: "ชุด",
    unitPrice: costs.laborPowerVct,
    category: "labor"
  });

  // --- 10. ค่าบริการบำรุงรักษารายปี (MA) สำหรับปีที่ 2 และ 3 ---
  // เพิ่มรายการ MA ปีที่ 2 และ 3 ในใบประเมิน (คิดเป็น 1 งานต่อปี)
  items.push({
    id: "bom-ma-year-2",
    name: "ค่าบริการบำรุงรักษารายปี MA ปีที่ 2 (บำรุงรักษาเชิงป้องกัน ตรวจเช็คระบบกล้องและห้องควบคุม)",
    quantity: 1,
    unit: "ปี",
    unitPrice: costs.maYear2,
    category: "labor"
  });

  items.push({
    id: "bom-ma-year-3",
    name: "ค่าบริการบำรุงรักษารายปี MA ปีที่ 3 (บำรุงรักษาเชิงป้องกัน ตรวจเช็คระบบกล้องและห้องควบคุม)",
    quantity: 1,
    unit: "ปี",
    unitPrice: costs.maYear3,
    category: "labor"
  });

  return items;
}

export default function App() {
  const [step, setStep] = useState<number>(1);
  const [isViewingDashboard, setIsViewingDashboard] = useState<boolean>(false);
  const [projectsList, setProjectsList] = useState<ProjectSurvey[]>([]);
  
  // Authentication & RBAC states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isUserMgmtOpen, setIsUserMgmtOpen] = useState<boolean>(false);

  // Active Project Data state
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>(DEFAULT_CUSTOMER_INFO);
  const [requirements, setRequirements] = useState<TechRequirements>(DEFAULT_REQUIREMENTS);
  const [hasSurveyReport, setHasSurveyReport] = useState<boolean>(true);
  const [cameraPoints, setCameraPoints] = useState<CameraPoint[]>([]);
  const [pricingItems, setPricingItems] = useState<PricingItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [vatRate, setVatRate] = useState<number>(7);
  const [activeProjectStatus, setActiveProjectStatus] = useState<"draft" | "completed" | "presented" | "delivered">("presented");
  const [activeProjectDeliveryDate, setActiveProjectDeliveryDate] = useState<string | undefined>(undefined);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState<boolean>(false);

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });

  // Master Cost Database states
  const [masterCosts, setMasterCosts] = useState<MasterCostDb>(() => {
    const saved = localStorage.getItem("CCTV_MASTER_COSTS");
    if (saved) {
      try {
        return { ...DEFAULT_MASTER_COSTS, ...JSON.parse(saved) };
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_MASTER_COSTS;
  });

  const [tempCosts, setTempCosts] = useState<MasterCostDb>(DEFAULT_MASTER_COSTS);
  const [isCostsModalOpen, setIsCostsModalOpen] = useState<boolean>(false);
  const [adminPinPurpose, setAdminPinPurpose] = useState<"settings" | "costs" | "pricing_admin" | null>(null);
  const [isAdminVerified, setIsAdminVerified] = useState<boolean>(false);

  // Load user session and monitor changes
  useEffect(() => {
    const checkUserSession = async () => {
      setAuthLoading(true);
      try {
        // 1. ตรวจสอบเซสชันผู้ใช้และอายุเซสชันหมดเวลา 2 ชั่วโมงก่อน
        const savedSession = localStorage.getItem("CCTV_USER_SESSION");
        const sessionExpiry = localStorage.getItem("CCTV_SESSION_EXPIRY");

        if (savedSession) {
          if (sessionExpiry) {
            const expiryTime = parseInt(sessionExpiry, 10);
            if (!isNaN(expiryTime) && Date.now() > expiryTime) {
              // เซสชันหมดอายุแล้ว!
              localStorage.removeItem("CCTV_USER_SESSION");
              localStorage.removeItem("CCTV_SESSION_EXPIRY");
              await supabase.auth.signOut();
              setCurrentUser(null);
              setUserProfile(null);
              setAuthLoading(false);
              alert("🔒 เซสชันของคุณหมดอายุแล้วเนื่องจากไม่มีการเคลื่อนไหวเกิน 6 ชั่วโมง กรุณาเข้าสู่ระบบใหม่อีกครั้งเพื่อความปลอดภัยค่ะ");
              return;
            }
          }

          const parsed = JSON.parse(savedSession);
          setCurrentUser(parsed.user);
          setUserProfile(parsed.profile);
          setAuthLoading(false);
          return;
        }

        // 2. ดึงข้อมูลจาก Supabase Auth ปกติ (Fallback)
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          setCurrentUser(session.user);
          await loadUserProfile(session.user.id, session.user.email || "");
          const expiryTime = Date.now() + 6 * 60 * 60 * 1000;
          localStorage.setItem("CCTV_SESSION_EXPIRY", expiryTime.toString());
        } else {
          setCurrentUser(null);
          setUserProfile(null);
          setAuthLoading(false);
        }
      } catch (err) {
        console.error("Auth init failed:", err);
        setAuthLoading(false);
      }
    };

    checkUserSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && session.user) {
        setCurrentUser(session.user);
        await loadUserProfile(session.user.id, session.user.email || "");
        if (event === "SIGNED_IN") {
          const expiryTime = Date.now() + 6 * 60 * 60 * 1000;
          localStorage.setItem("CCTV_SESSION_EXPIRY", expiryTime.toString());
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setAuthLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      let activeProf: UserProfile;
      if (data) {
        activeProf = {
          id: data.id,
          role: data.role || "user",
          displayName: data.display_name || "ผู้ใช้",
          email: email,
          province: data.province || "",
          updatedAt: data.updated_at
        };
      } else {
        // Fallback profile if row is not created yet
        const defaultProf: UserProfile = {
          id: userId,
          role: "user",
          displayName: email.split("@")[0],
          email: email,
          province: "",
          updatedAt: new Date().toISOString()
        };
        activeProf = defaultProf;
        
        // Auto-create profile row if missing
        await supabase.from("profiles").upsert({
          id: userId,
          role: "user",
          display_name: defaultProf.displayName,
          province: "",
          updated_at: new Date().toISOString()
        });
      }

      setUserProfile(activeProf);

      // Persist profile in session to avoid loss during reload
      const sessionStr = localStorage.getItem("CCTV_USER_SESSION");
      if (sessionStr) {
        try {
          const parsed = JSON.parse(sessionStr);
          parsed.profile = activeProf;
          localStorage.setItem("CCTV_USER_SESSION", JSON.stringify(parsed));
        } catch (e) {
          // ignore
        }
      }
    } catch (err) {
      console.error("Load user profile failed:", err);
    } finally {
      setAuthLoading(false);
    }
  };

  // Reusable handleLogout function
  const handleLogout = () => {
    localStorage.removeItem("CCTV_USER_SESSION");
    localStorage.removeItem("CCTV_SESSION_EXPIRY");
    setCurrentUser(null);
    setUserProfile(null);
    window.location.reload();
  };

  // Rolling Expiry Activity Tracker (ต่ออายุอีก 2 ชั่วโมงเมื่อมีการเคลื่อนไหว)
  useEffect(() => {
    if (!currentUser) return;

    let lastUpdated = Date.now();
    const updateExpiry = () => {
      const now = Date.now();
      // Throttle: อัปเดตลง localStorage อย่างมากที่สุดทุกๆ 10 วินาที เพื่อไม่ให้เบราว์เซอร์ทำงานหนักเกินไป
      if (now - lastUpdated > 10000) {
        const newExpiry = now + 6 * 60 * 60 * 1000;
        localStorage.setItem("CCTV_SESSION_EXPIRY", newExpiry.toString());
        lastUpdated = now;
      }
    };

    window.addEventListener("click", updateExpiry);
    window.addEventListener("keydown", updateExpiry);

    return () => {
      window.removeEventListener("click", updateExpiry);
      window.removeEventListener("keydown", updateExpiry);
    };
  }, [currentUser]);

  // Background interval checking for session expiration (เช็คทุกๆ 15 วินาที)
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(() => {
      const expiry = localStorage.getItem("CCTV_SESSION_EXPIRY");
      if (expiry) {
        const expiryTime = parseInt(expiry, 10);
        if (!isNaN(expiryTime) && Date.now() > expiryTime) {
          clearInterval(interval);
          alert("🔒 เซสชันของคุณหมดอายุแล้วเนื่องจากไม่มีการเคลื่อนไหวเกิน 6 ชั่วโมง กรุณาเข้าสู่ระบบใหม่อีกครั้งเพื่อความปลอดภัยค่ะ");
          handleLogout();
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [currentUser]);

  // Sync tempCosts when opening the costs modal
  useEffect(() => {
    if (isCostsModalOpen) {
      setTempCosts(masterCosts);
    }
  }, [isCostsModalOpen, masterCosts]);

  // Load master costs from Supabase on mount if configured
  useEffect(() => {
    const loadCostsFromSupabase = async () => {
      if (!isSupabaseConfigured) return;
      try {
        const { data, error } = await supabase
          .from("cctv_master_costs")
          .select("costs")
          .eq("id", "default");
        
        if (data && data.length > 0 && data[0].costs) {
          console.log("Loaded master costs from Supabase:", data[0].costs);
          setMasterCosts({ ...DEFAULT_MASTER_COSTS, ...data[0].costs });
        } else {
          console.log("No master costs record found on Supabase. Table is empty. Initializing...");
          // Gracefully initialize the row with masterCosts (either from localStorage or defaults)
          await supabase
            .from("cctv_master_costs")
            .upsert({
              id: "default",
              costs: masterCosts,
              updated_at: new Date().toISOString()
            });
        }
      } catch (err) {
        console.error("Failed to load master costs from Supabase:", err);
      }
    };
    loadCostsFromSupabase();
  }, []);

  // Save master costs to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("CCTV_MASTER_COSTS", JSON.stringify(masterCosts));
  }, [masterCosts]);

  // Admin Settings states
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [adminPinInput, setAdminPinInput] = useState<string>("");
  const [adminPinError, setAdminPinError] = useState<string>("");

  const handleVerifyAdminPin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (adminPinInput === "8888") {
      setIsAdminPinModalOpen(false);
      setAdminPinInput("");
      setAdminPinError("");
      setIsAdminVerified(true);
      if (adminPinPurpose === "costs") {
        setIsCostsModalOpen(true);
      } else if (adminPinPurpose === "pricing_admin") {
        // Just sets verification state to reveal cost columns in Step 6
      } else {
        setIsAdminModalOpen(true);
      }
    } else {
      setAdminPinError("รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้งค่ะ");
    }
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: { confirmText?: string; cancelText?: string; onCancel?: () => void }
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      onCancel: options?.onCancel,
      confirmText: options?.confirmText,
      cancelText: options?.cancelText
    });
  };

  // Shorthand: show an informational alert (single OK button)
  const showAlert = (title: string, message: string) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {},
      confirmText: "✅ ตกลง",
      cancelText: "",
    });
  };

  // Load project history on mount (Hybrid Cloud & Local Storage)
  const loadSavedProjects = async () => {
    if (isSupabaseConfigured) {
      try {
        // Fetch projects with related camera_points and pricing_items
        // ดึงข้อมูลอีเมลผู้สร้างงานมาด้วย โดยการทำ join หรือ fetch profiles เพิ่มเติม
        let query = supabase.from("projects").select("*");
        if (currentUser && userProfile) {
          if (userProfile.role === "head_user") {
            if (userProfile.province) {
              query = query.or(`created_by.eq.${currentUser.id},province.eq.${userProfile.province}`);
            } else {
              query = query.eq("created_by", currentUser.id);
            }
          } else if (userProfile.role === "user") {
            query = query.eq("created_by", currentUser.id);
          }
          // superadmin และ admin มองเห็นงานได้ทั้งหมด
        }
        const { data: projectsData, error: projectsError } = await query
          .order("created_at", { ascending: false });

        if (projectsError) {
          console.error("Failed to fetch projects from Supabase:", projectsError.message);
        } else if (projectsData) {
          if (projectsData.length === 0) {
            setProjectsList([]);
            return;
          }
          const projectIds = projectsData.map((p: any) => p.id);

          // ดึงข้อมูลผู้ใช้งานระบบทั้งหมด (profiles) เพื่อเอาอีเมลมาแสดง
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, email");

          const profileMap = new Map((profilesData || []).map(p => [p.id, p.email]));

          // Fetch all camera_points for these projects
          const { data: camsData } = await supabase
            .from("camera_points")
            .select("*")
            .in("project_id", projectIds)
            .order("point_index", { ascending: true });

          // Fetch all pricing_items for these projects
          const { data: pricesData } = await supabase
            .from("pricing_items")
            .select("*")
            .in("project_id", projectIds)
            .order("item_index", { ascending: true });

          // Reconstruct ProjectSurvey objects
          const assembled: ProjectSurvey[] = projectsData.map((row: any) => {
            const cams = (camsData || []).filter((c: any) => c.project_id === row.id);
            const prices = (pricesData || []).filter((p: any) => p.project_id === row.id);
            return {
              id: row.id,
              customerInfo: {
                customerName: row.customer_name || "",
                projectName: row.project_name || "",
                contactPerson: row.contact_person || "",
                contactPhone: row.contact_phone || "",
                address: row.address || "",
                latitude: row.latitude || "",
                longitude: row.longitude || "",
                surveyorName: row.surveyor_name || "",
                surveyorPhone: row.surveyor_phone || "",
                surveyorDepartment: row.surveyor_department || "",
                surveyDate: row.survey_date || "",
                province: row.province || "",
                deliveryDate: row.delivery_date || undefined,
              },
              requirements: {
                cameraCount: row.camera_count || 4,
                cameraBrand: row.camera_brand || "Hikvision",
                nvrBrand: row.nvr_brand || "",
                nvrChannels: row.nvr_channels || 8,
                storagePackage: row.storage_package || "",
                otherRequirements: row.other_requirements || "",
                standardCableLimit: row.standard_cable_limit ?? 25,
                extraCablePricePerMeter: row.extra_cable_price_per_m ?? 35,
                extraLaborPricePerMeter: row.extra_labor_price_per_m ?? 25,
                rackType: row.rack_type ?? undefined,
                monitorType: row.monitor_type ?? undefined,
                upsType: row.ups_type ?? undefined,
              },
              hasSurveyReport: row.has_survey_report ?? true,
              discount: parseFloat(row.discount) || 0,
              vatRate: parseFloat(row.vat_rate) || 7,
              status: row.status || "presented",
              deliveryDate: row.delivery_date || undefined,
              createdAt: row.created_at || new Date().toISOString(),
              createdBy: row.created_by || null,
              createdByEmail: row.created_by ? profileMap.get(row.created_by) : undefined,
              cameraPoints: cams.map((c: any) => ({
                id: c.id.replace(`${row.id}-`, ""),
                name: c.name || "",
                type: c.type || "Dome",
                poleType: c.pole_type || "None",
                hasSupportArm: c.has_support_arm || false,
                notes: c.notes || "",
                photoUrl: c.photo_url_cache || "",
                x: parseFloat(c.x) || 50,
                y: parseFloat(c.y) || 50,
                focalAngle: parseFloat(c.focal_angle) || 90,
                rotation: parseFloat(c.rotation) || 0,
                lat: c.lat ?? undefined,
                lng: c.lng ?? undefined,
                lanCableLength: c.lan_cable_length ?? 25,
                hasOutdoorCabinet: c.has_outdoor_cabinet || false,
                hasGroundRod: c.has_ground_rod || false,
                hasPowerMeter: c.has_power_meter || false,
                hasSdCard: c.has_sd_card || false,
                hasCabinetUps: c.has_cabinet_ups || false,
                hasPoeSwitch: c.has_poe_switch || false,
                selectedSet: c.selected_set ?? undefined,
              })),
              pricingItems: prices.map((p: any) => ({
                id: p.id.replace(`${row.id}-`, ""),
                name: p.name || "",
                quantity: parseFloat(p.quantity) || 1,
                unit: p.unit || "ชิ้น",
                unitPrice: parseFloat(p.unit_price) || 0,
                category: p.category || "hardware",
              })),
            };
          });

          setProjectsList(assembled);
          // Don't auto-load first project — let user choose from history
          return;
        }
      } catch (err) {
        console.error("Supabase load failed, falling back to LocalStorage:", err);
      }
    }

    // เคลียร์ประวัติใน LocalStorage ทิ้งตามความต้องการของคุณบีม เนื่องจากใช้งาน Cloud + RLS สมบูรณ์แล้ว
    localStorage.removeItem("cctv_surveys_data");
  };

  useEffect(() => {
    loadSavedProjects();
  }, [userProfile]);

  useEffect(() => {
    if (step === 3) {
      // Step 3 is now System Specs (originally Step 2)
      // Automatically calculate recommended NVR channels based on camera count
      const count = cameraPoints.reduce((sum, pt) => {
        let ptCams = 1;
        if (pt.selectedSet === "Set 1") ptCams = 1;
        else if (pt.selectedSet === "Set 2") ptCams = 2;
        else if (pt.selectedSet === "Set 3") ptCams = 3;
        else if (pt.selectedSet === "Set 4") ptCams = 4;
        return sum + ptCams;
      }, 0);
      let recCh = 8;
      if (count <= 4) recCh = 4;
      else if (count <= 8) recCh = 8;
      else if (count <= 16) recCh = 16;
      else if (count <= 32) recCh = 32;
      else recCh = 64;

      // Only update if it hasn't been set or if we want to suggest it dynamically
      if (requirements.nvrChannels !== recCh) {
        const pkg = recCh <= 4 ? "HDD 4TB (มาตรฐานราชการ 4CH)" 
                  : recCh <= 8 ? "HDD 8TB (มาตรฐานราชการ 8CH)" 
                  : recCh <= 16 ? "HDD 16TB (8TB x 2 ลูก มาตรฐานราชการ)" 
                  : recCh <= 32 ? "HDD 32TB (8TB x 4 ลูก มาตรฐานราชการ)" 
                  : "HDD 64TB (8TB x 8 ลูก มาตรฐานราชการ)";
        setRequirements(prev => ({
          ...prev,
          nvrChannels: recCh,
          storagePackage: pkg
        }));
      }
    }

    if (step === 4 || step === 5) {
      // Re-generate BOM dynamically to reflect latest edits if they don't exist yet or need updates
      const regenerated = generatePricingItems(requirements, hasSurveyReport, cameraPoints, masterCosts);
      
      // We carry over unitPrice if they correspond to matches we already customized!
      const customizedMatched = regenerated.map(item => {
        const found = pricingItems.find(p => p.id === item.id || p.name === item.name);
        if (found) {
          return { ...item, unitPrice: found.unitPrice };
        }
        return item;
      });
      setPricingItems(customizedMatched);
    }
  }, [step, cameraPoints.length]);

  const handleAutofillFullTemplate = (type: "factory" | "home" | "office" | "subdistrict") => {
    if (type === "subdistrict") {
      const info: CustomerInfo = {
        customerName: "องค์การบริหารส่วนตำบลหนองนาคำ (อบต.หนองนาคำ)",
        projectName: "โครงการติดตั้งระบบกล้องวงจรปิดเฝ้าระวังภัยจุดเสี่ยงทางร่วมทางแยกและชุมชน",
        contactPerson: "นายสมเกียรติ พรหมดี (ปลัด อบต.)",
        contactPhone: "042-219-876",
        address: "155 หมู่ 2 ตำบลหนองนาคำ อำเภอเมืองอุดรธานี จังหวัดอุดรธานี 41000",
        latitude: "17.398642",
        longitude: "102.859345",
        surveyorName: "วิศวกรระบบสำรวจ NT",
        surveyDate: new Date().toISOString().split("T")[0],
        province: "อุดรธานี",
        surveyorPhone: "081-234-5678",
        surveyorDepartment: "ส่วนบริการลูกค้าจังหวัดอุดรธานี (NT)",
      };
      
      const points: CameraPoint[] = [
        {
          id: "pt-1",
          name: "สี่แยกทางเข้า อบต. (จุดตรวจร่วม)",
          type: "Bullet",
          poleType: "เสา 6 เมตร",
          hasSupportArm: true,
          notes: "ติดตั้งบนเสาเหล็กกลม 6 เมตร บริเวณมุมสามแยกเพื่อส่องทางตรงและฝั่ง อบต. พร้อมกล่องเหล็กกันน้ำภายนอก",
          x: 30,
          y: 40,
          focalAngle: 90,
          rotation: 45,
          lat: 17.3988,
          lng: 102.8595,
          lanCableLength: 120,
          hasOutdoorCabinet: true,
          hasGroundRod: true,
          hasPowerMeter: true,
          hasSdCard: true,
          hasCabinetUps: true,
          hasPoeSwitch: true,
          selectedSet: "Set 2",
        },
        {
          id: "pt-2",
          name: "สามแยกหน้า รร.บ้านหนองนาคำ (จุดตรวจและทางเข้าชุมชน)",
          type: "Bullet",
          poleType: "เสา 6 เมตร",
          hasSupportArm: true,
          notes: "จุดทางแยกหลักหน้ารูปปั้นหลวงพ่อ บริเวณหน้าโรงเรียน ส่องได้ 3 ทิศทาง ซ้อนชุดกล้อง",
          x: 70,
          y: 35,
          focalAngle: 120,
          rotation: 135,
          lat: 17.3992,
          lng: 102.8598,
          lanCableLength: 80,
          hasOutdoorCabinet: true,
          hasGroundRod: true,
          hasPowerMeter: true,
          hasSdCard: true,
          hasCabinetUps: true,
          hasPoeSwitch: true,
          selectedSet: "Set 3",
        },
        {
          id: "pt-3",
          name: "ทางเข้าหมู่บ้านหนองนาคำ หมู่ 2",
          type: "Bullet",
          poleType: "เสา 6 เมตร",
          hasSupportArm: true,
          notes: "กล้องทรงกระบอก Bullet ตรวจสอบป้ายทะเบียนรถเข้า-ออกชุมชน ส่องภาพคมชัดความละเอียดสูง",
          x: 45,
          y: 65,
          focalAngle: 60,
          rotation: 220,
          lat: 17.3975,
          lng: 102.8588,
          lanCableLength: 150,
          hasOutdoorCabinet: true,
          hasGroundRod: true,
          hasPowerMeter: true,
          hasSdCard: true,
          hasCabinetUps: true,
          hasPoeSwitch: true,
          selectedSet: "Set 1",
        },
        {
          id: "pt-4",
          name: "จุดกลับรถถนนมิตรภาพ-หนองนาคำ",
          type: "Bullet",
          poleType: "เสา 4 เมตร",
          hasSupportArm: true,
          notes: "ติดตั้งฝั่งเลนเข้าเมืองเพื่อดูรถผ่านไปมา ติดบนเสา 4 เมตร",
          x: 20,
          y: 75,
          focalAngle: 90,
          rotation: 315,
          lat: 17.3965,
          lng: 102.8575,
          lanCableLength: 90,
          hasOutdoorCabinet: true,
          hasGroundRod: true,
          hasPowerMeter: true,
          hasSdCard: true,
          hasCabinetUps: true,
          hasPoeSwitch: true,
          selectedSet: "Set 2",
        },
      ];

      const req: TechRequirements = {
        cameraCount: 8,
        cameraBrand: "Hikvision",
        nvrBrand: "ยี่ห้อเดียวกับกล้อง (แนะนำ)",
        nvrChannels: 8,
        storagePackage: "HDD 8TB (มาตรฐานราชการ 8CH)",
        otherRequirements: "ต้องการระบบเช่า 3 ปี รวมบริการบำรุงรักษาหลังการขายแบบ On-site Service 24 ชั่วโมง",
      };

      setCustomerInfo(info);
      setCameraPoints(points);
      setRequirements(req);
      
      const regenerated = generatePricingItems(req, true, points, masterCosts);
      setPricingItems(regenerated);
      setDiscount(0);
      setVatRate(7);
    }
  };

  // Load project Survey into main workflow inputs
  const loadProject = (proj: ProjectSurvey) => {
    setActiveProjectId(proj.id);
    setCustomerInfo(proj.customerInfo);
    setRequirements(proj.requirements);
    setHasSurveyReport(proj.hasSurveyReport);
    setCameraPoints(proj.cameraPoints);
    setPricingItems(proj.pricingItems);
    setDiscount(proj.discount);
    setVatRate(proj.vatRate);
    setActiveProjectStatus(proj.status || "presented");
    setActiveProjectDeliveryDate(proj.deliveryDate || proj.customerInfo.deliveryDate);
    setIsEditMode(false); // Default to view summary BOM only, not editing other steps
    setStep(5); // switch to the summary/pricing screen so the user can view results immediately
    setIsViewingDashboard(false);
  };

  // Create a brand new workspace draft
  const handleNewProject = () => {
    setActiveProjectId(null);
    setCustomerInfo({
      customerName: "",
      projectName: "",
      contactPerson: "",
      contactPhone: "",
      address: "",
      latitude: "",
      longitude: "",
      surveyorName: "",
      surveyDate: new Date().toISOString().split("T")[0],
      province: "",
    });
    setRequirements({
      cameraCount: 4,
      cameraBrand: "Hikvision",
      nvrBrand: "ยี่ห้อเดียวกับกล้อง (แนะนำ)",
      nvrChannels: 8,
      storagePackage: "HDD 8TB (มาตรฐานส่วนกลาง 8CH NVR)",
      otherRequirements: "",
      rackType: "Rack 19 นิ้ว 6U",
      monitorType: "จอ 27 นิ้ว",
      upsType: "UPS 1Kva",
    });
    setHasSurveyReport(true);
    setCameraPoints([]);
    setPricingItems([]);
    setDiscount(0);
    setVatRate(7);
    setActiveProjectStatus("presented");
    setActiveProjectDeliveryDate(undefined);
    setIsEditMode(true); // New project draft is fully editable
    setStep(1);
    setIsViewingDashboard(false);
  };

  // Save/Update main project to list and database/LocalStorage
  const handleSaveProject = async () => {
    const freshId = activeProjectId || `survey-id-${Date.now()}`;
    const formattedProject: ProjectSurvey = {
      id: freshId,
      customerInfo: {
        ...customerInfo,
        deliveryDate: activeProjectDeliveryDate,
      },
      requirements,
      hasSurveyReport,
      cameraPoints,
      pricingItems,
      discount,
      vatRate,
      createdAt: new Date().toISOString(),
      status: activeProjectStatus || "presented",
      deliveryDate: activeProjectDeliveryDate,
      createdBy: currentUser?.id || null
    };

    let updatedList: ProjectSurvey[] = [];
    if (projectsList.some(p => p.id === freshId)) {
      updatedList = projectsList.map(p => p.id === freshId ? formattedProject : p);
    } else {
      updatedList = [formattedProject, ...projectsList];
    }

    setProjectsList(updatedList);
    setActiveProjectId(freshId);

    // Save to Supabase Cloud (3-table schema)
    if (isSupabaseConfigured) {
      try {
        // 1. Upsert main project row
        const projectRow = {
          id: freshId,
          customer_name: customerInfo.customerName,
          project_name: customerInfo.projectName,
          contact_person: customerInfo.contactPerson,
          contact_phone: customerInfo.contactPhone,
          address: customerInfo.address,
          latitude: customerInfo.latitude,
          longitude: customerInfo.longitude,
          surveyor_name: customerInfo.surveyorName,
          surveyor_phone: customerInfo.surveyorPhone || "",
          surveyor_department: customerInfo.surveyorDepartment || "",
          survey_date: customerInfo.surveyDate,
          province: customerInfo.province || "",
          camera_count: requirements.cameraCount,
          camera_brand: requirements.cameraBrand,
          nvr_brand: requirements.nvrBrand,
          nvr_channels: requirements.nvrChannels,
          storage_package: requirements.storagePackage,
          other_requirements: requirements.otherRequirements,
          standard_cable_limit: requirements.standardCableLimit ?? 25,
          extra_cable_price_per_m: requirements.extraCablePricePerMeter ?? 35,
          extra_labor_price_per_m: requirements.extraLaborPricePerMeter ?? 25,
          rack_type: requirements.rackType ?? null,
          monitor_type: requirements.monitorType ?? null,
          ups_type: requirements.upsType ?? null,
          has_survey_report: hasSurveyReport,
          discount,
          vat_rate: vatRate,
          status: activeProjectStatus || "presented",
          delivery_date: activeProjectDeliveryDate || null,
          created_by: currentUser?.id || null
        };

        const { error: projError } = await supabase
          .from("projects")
          .upsert(projectRow);

        if (projError) {
          console.error("Supabase project upsert error:", projError.message);
          showAlert("❌ บันทึกไม่สำเร็จ", "ไม่สามารถบันทึกข้อมูลหลักได้: " + projError.message);
          return;
        }

        // 2. & 3. Replace camera_points and pricing_items concurrently to reduce round-trip time and prevent statement timeout
        let hasDetailError = false;
        let detailErrorMessage = "";

        const cameraPointsPromise = (async () => {
          // Delete old camera points
          const { error: delError } = await supabase.from("camera_points").delete().eq("project_id", freshId);
          if (delError) {
            console.error("Camera points delete error:", delError.message);
          }
          
          // Insert new camera points
          if (cameraPoints.length > 0) {
            const camRows = cameraPoints.map((c, idx) => ({
              id: `${freshId}-${c.id}`,
              project_id: freshId,
              point_index: idx,
              name: c.name,
              type: c.type,
              pole_type: c.poleType,
              has_support_arm: c.hasSupportArm,
              notes: c.notes,
              photo_url_cache: c.photoUrl,
              x: c.x,
              y: c.y,
              focal_angle: c.focalAngle,
              rotation: c.rotation,
              lat: c.lat ?? null,
              lng: c.lng ?? null,
              lan_cable_length: c.lanCableLength ?? 25,
              has_outdoor_cabinet: c.hasOutdoorCabinet || false,
              has_ground_rod: c.hasGroundRod || false,
              has_power_meter: c.hasPowerMeter || false,
              has_sd_card: c.hasSdCard || false,
              has_cabinet_ups: c.hasCabinetUps || false,
              has_poe_switch: c.hasPoeSwitch || false,
              selected_set: c.selectedSet ?? null,
            }));
            const { error: camError } = await supabase.from("camera_points").insert(camRows);
            if (camError) {
              console.error("Camera points insert error:", camError.message);
              hasDetailError = true;
              detailErrorMessage += "\n- ไม่สามารถบันทึกจุดติดตั้งกล้องได้: " + camError.message;
            }
          }
        })();

        const pricingItemsPromise = (async () => {
          // Delete old pricing items
          const { error: delError } = await supabase.from("pricing_items").delete().eq("project_id", freshId);
          if (delError) {
            console.error("Pricing items delete error:", delError.message);
          }

          // Insert new pricing items
          if (pricingItems.length > 0) {
            const priceRows = pricingItems.map((p, idx) => ({
              id: `${freshId}-${p.id}`,
              project_id: freshId,
              item_index: idx,
              name: p.name,
              quantity: p.quantity,
              unit: p.unit,
              unit_price: p.unitPrice,
              category: p.category,
            }));
            const { error: priceError } = await supabase.from("pricing_items").insert(priceRows);
            if (priceError) {
              console.error("Pricing items insert error:", priceError.message);
              hasDetailError = true;
              detailErrorMessage += "\n- ไม่สามารถบันทึกรายการราคาประเมินได้: " + priceError.message;
            }
          }
        })();

        // Wait for both sub-table updates to finish concurrently
        await Promise.all([cameraPointsPromise, pricingItemsPromise]);

        if (hasDetailError) {
          showAlert("⚠️ บันทึกข้อมูลไม่สมบูรณ์", "ข้อมูลหลักถูกบันทึกแล้ว แต่พบปัญหาในส่วนข้อมูลย่อย:" + detailErrorMessage);
          return false;
        }
      } catch (err) {
        console.error("Supabase Save Exception:", err);
        showAlert("❌ บันทึกไม่สำเร็จ", "เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + (err instanceof Error ? err.message : String(err)));
        return false;
      }
    }

    // เคลียร์ประวัติใน LocalStorage ทิ้งตามความต้องการของคุณบีม
    localStorage.removeItem("cctv_surveys_data");
    
    // แสดงป๊อปอัปแจ้งผลสำเร็จก่อน และเมื่อกด "ตกลง" ค่อยสลับกลับไปหน้าแรก (Step 1)
    setConfirmModal({
      isOpen: true,
      title: "✅ บันทึกสำเร็จ",
      message: "บันทึกโครงการ เรียบร้อยแล้วค่ะ ✨",
      confirmText: "✅ ตกลง",
      cancelText: "",
      onConfirm: () => {
        handleNewProject();
      }
    });
    
    return true;
  };

  // Delete a project from list and database/LocalStorage
  const handleDeleteProject = (id: string) => {
    const proj = projectsList.find(p => p.id === id);
    const projName = proj?.customerInfo.customerName || "ไม่ระบุชื่อ";
    showConfirm(
      "🗑️ ยืนยันการลบโครงการ",
      `คุณแน่ใจหรือไม่ว่าต้องการลบแบบบันทึกรายงานสำรวจโครงการของ "${projName}"? ข้อมูลทั้งหมดจะถูกลบถาวรและไม่สามารถกู้คืนได้`,
      async () => {
        const updated = projectsList.filter(p => p.id !== id);
        setProjectsList(updated);

        // Delete from Supabase Cloud if configured
        if (isSupabaseConfigured) {
          try {
            const { error } = await supabase
              .from("projects")
              .delete()
              .eq("id", id);

            if (error) {
              console.error("Supabase Delete Error:", error.message);
              showAlert("❌ ลบไม่สำเร็จ", "ไม่สามารถลบข้อมูลบนระบบคลาวด์ได้: " + error.message);
            }
          } catch (err) {
            console.error("Supabase Delete Exception:", err);
          }
        }

        // Update LocalStorage
        localStorage.removeItem("cctv_surveys_data");
        if (activeProjectId === id) {
          handleNewProject();
        }
      }
    );
  };

  // Assistant Dialogue Bubbles based on state
  const getAssistantMessage = () => {
    switch (step) {
      case 1:
        return "ยินดีต้อนรับสู่ระบบประเมินราคา CCTV อัจฉริยะ! ระบบพร้อมช่วยเก็บข้อมูลสำรวจและคำนวณราคาจัดทำ BOM อัตโนมัติค่ะ เริ่มบันทึกรายละเอียดลูกค้าและสถานที่ติดตั้งด้านขวาเพื่อเริ่มแผนผังงานสำรวจดาวเทียมได้เลยนะคะ";
      case 2:
        return "แผนผังหน้างานจำลองพิกัดจริงค่ะ! ท่านสามารถเพิ่มจุดติดตั้งกล้อง เลือกแบรนด์กล้องชั้นนำด้านบน ปรับระดับมุมเลนส์ ปรับเปลี่ยนเสายึด และอัปโหลดภาพถ่ายประกอบหน้างานได้ครบถ้วนรายจุดเลยค่ะ";
      case 3:
        return "หน้าคำนวณสเปกระบบส่วนกลางค่ะ ระบบช่วยวิเคราะห์และแนะนำขนาดช่องสัญญาณ NVR รวมถึง HDD ที่เหมาะสมสอดคล้องตามจำนวนจุดติดตั้งที่สำรวจไว้ให้แล้วค่ะ สามารถปรับจอหรือตู้แร็คเพิ่มเติมได้เลยนะคะ";
      case 4:
        return "นี่คือรายงานสรุปสเปกทางวิศวกรรม พร้อมตารางบัญชีแสดงส่วนประกอบวัสดุ (Bill of Materials - BOM) ทั้งหมดที่วิเคราะห์และประมาณการขึ้นโดยอัตโนมัติค่ะ ลองตรวจสอบความถูกต้องก่อนไปขั้นสุดท้ายนะคะ";
      case 5:
        return "หน้าตารางสรุปงบประมาณและจัดทำงวดราคาค่ะ! ท่านสามารถแก้ไขจำนวน ราคาต่อหน่วย ปรับส่วนลด และกดปุ่มพิมพ์ใบเสนอราคา (Print/PDF) คลีนดีไซน์เพื่อนำเสนอเอกสารได้ทันทีเลยค่ะ";
      default:
        return "หากมีหัวข้อใดต้องการให้ระบบช่วยเหลือเพิ่มเติม สามารถดำเนินการได้เลยนะคะ";
    }
  };

  // Step wizard controls
  const handleNextStep = () => {
    setStep((prev) => Math.min(5, prev + 1));
  };

  const handlePrevStep = () => {
    if (!isEditMode) {
      setStep((prev) => Math.max(4, prev - 1));
    } else {
      setStep((prev) => Math.max(1, prev - 1));
    }
  };

  // Human steps label
  const STAGE_STEPS = [
    { number: 1, label: "ข้อมูลลูกค้า" },
    { number: 2, label: "รายละเอียดงานติดตั้งปลายทาง" },
    { number: 3, label: "รายละเอียดงานติดตั้งต้นทาง" },
    { number: 4, label: "รายการอุปกรณ์ BOM" },
    { number: 5, label: "สรุปงวดราคา" },
  ];

  const formattedCostTimestamp = masterCosts.lastUpdated ? (() => {
    try {
      const d = new Date(masterCosts.lastUpdated);
      const dateStr = d.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" });
      const timeStr = d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false });
      return `${dateStr} ${timeStr} น.`;
    } catch (e) {
      return "";
    }
  })() : "";

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center shrink-0">
          <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
        </div>
        <span className="text-xs font-medium text-gray-500 mt-4 animate-pulse">กำลังเตรียมระบบความปลอดภัย...</span>
      </div>
    );
  }

  if (isSupabaseConfigured && !currentUser) {
    return (
      <LoginScreen 
        onLoginSuccess={(user, profile) => {
          setCurrentUser(user);
          setUserProfile(profile);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans" id="applet-primary-layout">
      
      {/* Top Header — blocks.so style */}
      <header className="bg-white border-b border-gray-200 py-3 px-6 shrink-0 relative z-40 w-full">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden p-1 transition-transform hover:scale-105">
              <img 
                src="/cyfence_logo.png" 
                alt="NT Cyfence Logo" 
                className="w-full h-full object-contain"
                id="header-logo-image"
              />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 tracking-tight leading-tight">
                CCTV Package by NT Cyfence
              </h1>
              <p className="text-[11px] text-gray-500 leading-tight">
                เครื่องมือสำรวจออกแบบกล้องวงจรปิด
              </p>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            {/* Home Button */}
            {step > 1 && (
              <button
                id="btn-go-home"
                type="button"
                onClick={() => {
                  showConfirm(
                    "🏠 กลับหน้าแรก",
                    "ต้องการกลับไปหน้าแรก (ขั้นตอนที่ 1) ใช่ไหมคะ? ข้อมูลที่กรอกไว้จะยังคงอยู่ค่ะ",
                    () => setStep(1)
                  );
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-700 font-medium text-xs rounded-lg transition-all cursor-pointer"
                title="กลับหน้าแรก"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">หน้าแรก</span>
              </button>
            )}
            {/* Clock */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span className="font-mono text-xs text-gray-600">
                {new Date().toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </div>
            {/* User Badge */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-gray-900 text-center flex items-center justify-center font-bold text-white uppercase text-[10px]">
                {userProfile?.displayName?.substring(0, 2) || "SV"}
              </div>
              <div className="text-left leading-none">
                <span className="block text-[9px] text-gray-400 uppercase font-semibold tracking-wider">{userProfile?.role || "user"}</span>
                <span className="text-xs font-semibold text-gray-800">{userProfile?.displayName || "ผู้ใช้งาน"}</span>
              </div>
            </div>

            {/* Log Out Button */}
            <button
              type="button"
              onClick={() => {
            showConfirm(
              "🔐 ออกจากระบบ",
              "คุณต้องการออกจากระบบ ใช่หรือไม่คะ?",
              async () => {
                await handleLogout();
              },
              {
                confirmText: "🔐 ออกจากระบบ",
                cancelText: "ยกเลิก"
              }
            );
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 text-gray-600 hover:text-red-600 text-xs font-medium rounded-lg transition-all cursor-pointer"
              title="ออกจากระบบ (Log Out)"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
            {/* User Management Button - superadmin only */}
            {userProfile?.role === "superadmin" && (
              <button
                type="button"
                onClick={() => { setIsUserMgmtOpen(true); }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 text-xs font-medium rounded-lg transition-all cursor-pointer"
                title="จัดการสิทธิ์ผู้ใช้งาน"
              >
                <Users className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">จัดการสิทธิ์</span>
              </button>
            )}
            
            {/* Master Cost Button - admin */}
            {(userProfile?.role === "superadmin" || userProfile?.role === "admin") && (
              <button
                type="button"
                onClick={() => {
                  setAdminPinInput("");
                  setAdminPinError("");
                  setAdminPinPurpose("costs");
                  setIsAdminPinModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-amber-50 border border-gray-200 hover:border-amber-200 text-gray-600 hover:text-amber-700 text-xs font-medium rounded-lg transition-all cursor-pointer"
                title="แก้ไขราคาต้นทุนกลาง"
              >
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">ราคากลาง</span>
              </button>
            )}

            {/* Admin Settings Button - admin */}
            {(userProfile?.role === "superadmin" || userProfile?.role === "admin") && (
              <button
                type="button"
                onClick={() => {
                  setAdminPinInput("");
                  setAdminPinError("");
                  setAdminPinPurpose("settings");
                  setIsAdminPinModalOpen(true);
                }}
                className="p-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-700 rounded-lg transition-all cursor-pointer"
                title="Admin Panel"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main body area */}
      <main className="grow max-w-7xl w-full mx-auto px-4 md:px-6 py-5 flex flex-col lg:flex-row lg:items-start gap-5">
        
        {/* SIDE BAR (COL 3): Project history logs */}
        <section className="w-full lg:w-80 shrink-0 space-y-4">

          {/* Project Saved Records catalog */}
          <ProjectHistory
            projects={projectsList}
            onLoadProject={(id) => {
              if (activeProjectId === id) {
                // หากคลิกที่ชื่อโครงการที่กำลังเปิดอยู่อีกครั้ง ให้ปิดหน้านี้และสลับกลับมาหน้า "เปิดไฟล์งานใหม่" (Step 1)
                handleNewProject();
              } else {
                const proj = projectsList.find(p => p.id === id);
                if (proj) {
                  loadProject(proj);
                  setIsEditMode(false); // ดูสรุปโครงการเท่านั้น ล็อคไม่ให้แก้ไข
                  setStep(4); // ดูสรุปโครงการ (หน้ารายการอุปกรณ์ BOM) แทนการเข้าไปแก้ไขโดยตรง
                }
              }
            }}
            onEditProject={(id) => {
              const proj = projectsList.find(p => p.id === id);
              if (proj) {
                const projName = proj.customerInfo.projectName || "ไม่ระบุชื่อโครงการ";
                showConfirm(
                  "✏️ ยืนยันการแก้ไขโครงการ",
                  `คุณบีมต้องการปลดล็อคเพื่อแก้ไขรายละเอียดและสเปกของโครงการ "${projName}" ใช่หรือไม่?`,
                  () => {
                    loadProject(proj);
                    setIsEditMode(true); // ปลดล็อคให้แก้ไขโครงการได้ทั้งหมด!
                    setStep(5); // เข้าหน้าแก้ไขราคาประเมินและสเปกส่วนกลาง
                  },
                  {
                    confirmText: "ยืนยันการแก้ไข",
                    cancelText: "ยกเลิก"
                  }
                );
              }
            }}
            onDeleteProject={handleDeleteProject}
            onNewProject={handleNewProject}
            currentProjectId={activeProjectId}
            isCloudSyncActive={isSupabaseConfigured}
            costLastUpdated={formattedCostTimestamp}
            userRole={userProfile?.role || "user"}
            currentUserId={currentUser?.id || null}
            onToggleDashboard={() => setIsViewingDashboard(!isViewingDashboard)}
            isViewingDashboard={isViewingDashboard}
            showConfirm={showConfirm}
            onUpdateProjectStatus={async (id, newStatus, deliveryDate) => {
              // Update state locally first
              const updated = projectsList.map(p => {
                if (p.id === id) {
                  const updatedProj = {
                    ...p,
                    status: newStatus,
                    deliveryDate: deliveryDate,
                    customerInfo: {
                      ...p.customerInfo,
                      deliveryDate: deliveryDate
                    }
                  };
                  // If active project is current one, sync state
                  if (activeProjectId === id) {
                    setActiveProjectStatus(newStatus);
                    setActiveProjectDeliveryDate(deliveryDate);
                    setCustomerInfo(prev => ({
                      ...prev,
                      deliveryDate: deliveryDate
                    }));
                  }
                  return updatedProj;
                }
                return p;
              });
              setProjectsList(updated);

              // Update in database if configured
              if (isSupabaseConfigured) {
                try {
                  // We update 'status' first as it's guaranteed to exist, then we try 'delivery_date' or 'deliveryDate' dynamically to bypass schema cache issues
                  const updatePayload: any = { status: newStatus };
                  
                  // Let's set both or fallback if one fails
                  updatePayload.delivery_date = deliveryDate || null;
                  
                  const { error } = await supabase
                    .from("projects")
                    .update(updatePayload)
                    .eq("id", id);
                    
                  if (error) {
                    console.error("Failed to update status with delivery_date in Supabase:", error.message);
                    
                    // Fallback to update status only if delivery_date is missing or cache error occurs
                    const { error: fallbackError } = await supabase
                      .from("projects")
                      .update({ status: newStatus })
                      .eq("id", id);
                      
                    if (fallbackError) {
                      console.error("Fallback update also failed:", fallbackError.message);
                      showAlert("❌ อัปเดตล้มเหลว", "เกิดข้อผิดพลาดในการบันทึกฐานข้อมูล: " + fallbackError.message);
                      // Rollback local state to match database state immediately
                      await loadSavedProjects();
                    } else {
                      await loadSavedProjects();
                    }
                  } else {
                    // Refetch projects list to confirm exact database sync
                    await loadSavedProjects();
                  }
                } catch (e) {
                  console.error("Error updating project status in database:", e);
                }
              }
              
              showAlert("📦 อัปเดตสถานะสำเร็จ", `เปลี่ยนสถานะโครงการเป็น '${newStatus === "delivered" ? "ส่งมอบงานแล้ว" : "นำเสนอ"}' เรียบร้อยค่ะ! ✨`);
            }}
          />
        </section>

        {/* WORKSPACE AREA (COL 9): Wizard steps and components */}
        <section className="grow flex flex-col min-w-0">
          {/* Stepper / Steps Indicator — blocks.so Sidebar02 style */}
          {isViewingDashboard ? (
            <DashboardView
              projects={projectsList}
              onBack={() => setIsViewingDashboard(false)}
              onLoadProject={(id) => {
                const proj = projectsList.find(p => p.id === id);
                if (proj) {
                  loadProject(proj);
                  setStep(4); // เมื่อกดจากหน้า dashboard ให้สลับไปดูใบสรุปอุปกรณ์ BOM เช่นกัน
                }
              }}
            />
          ) : (
            <>
              {(() => {
                const sidebarSteps = STAGE_STEPS.map((stepUnit) => {
                  const isPassed = stepUnit.number < step;
                  const isCurrent = stepUnit.number === step;
                  const isSurveyIgnored = (stepUnit.number === 4) && !hasSurveyReport;
                  // ล็อคไม่ให้คลิกข้ามหน้าอื่นหากไม่ได้อยู่ในโหมดแก้ไข (อนุมัติให้ดูได้เฉพาะหน้า BOM(4) หรือหน้า Pricing(5))
                  const isClickable = isEditMode 
                    ? ((isPassed || isCurrent) || !!activeProjectId)
                    : (stepUnit.number === 4 || stepUnit.number === 5);
                  return {
                    number: stepUnit.number,
                    label: stepUnit.label,
                    isPassed,
                    isCurrent,
                    isClickable,
                    isIgnored: isSurveyIgnored,
                  };
                });
                return (
                  <Sidebar02 
                    steps={sidebarSteps} 
                    onStepSelect={(targetStep) => {
                      if (!isEditMode && targetStep !== 4 && targetStep !== 5) {
                        showAlert("🔒 โหมดดูสรุปโครงการ", "หากต้องการแก้ไขข้อมูลโครงการนี้ กรุณากดปุ่มดินสอ ✏️ ที่โครงการในแถบด้านข้างก่อนนะคะ");
                        return;
                      }
                      setStep(targetStep);
                    }} 
                    className="mb-5 flex flex-col md:flex-row gap-2 bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm md:items-center space-y-0"
                  />
                );
              })()}

              {/* Active Step Panel */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-7 shadow-sm grow">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="h-full"
                  >
                    {step === 1 && (
                      <Step1BasicInfo
                        data={customerInfo}
                        onChange={setCustomerInfo}
                        onNext={handleNextStep}
                        onAutofillFullTemplate={handleAutofillFullTemplate}
                      />
                    )}
                    
                    {step === 2 && (
                      <Step4SurveyReport
                        cameraPoints={cameraPoints}
                        cameraCount={requirements.cameraCount}
                        onChange={setCameraPoints}
                        onNext={handleNextStep}
                        onPrev={handlePrevStep}
                        customerInfo={customerInfo}
                        requirements={requirements}
                        onUpdateCameraBrand={(brand) => setRequirements(p => ({ ...p, cameraBrand: brand }))}
                        showConfirm={showConfirm}
                        onUpdateCustomerInfo={setCustomerInfo}
                      />
                    )}

                    {step === 3 && (
                      <Step2CameraRequirements
                        data={requirements}
                        onChange={setRequirements}
                        onNext={handleNextStep}
                        onPrev={handlePrevStep}
                        cameraCount={cameraPoints.reduce((sum, pt) => {
                          let ptCams = 1;
                          if (pt.selectedSet === "Set 1") ptCams = 1;
                          else if (pt.selectedSet === "Set 2") ptCams = 2;
                          else if (pt.selectedSet === "Set 3") ptCams = 3;
                          else if (pt.selectedSet === "Set 4") ptCams = 4;
                          return sum + ptCams;
                        }, 0)}
                        cameraPoints={cameraPoints}
                      />
                    )}

                    {step === 4 && (
                      <Step5Summary
                        customerInfo={customerInfo}
                        requirements={requirements}
                        hasSurveyReport={hasSurveyReport}
                        cameraPoints={cameraPoints}
                        pricingItems={pricingItems}
                        onNext={handleNextStep}
                        onPrev={handlePrevStep}
                        isEditMode={isEditMode}
                      />
                    )}

                    {step === 5 && (
                      <Step6Pricing
                        pricingItems={pricingItems}
                        discount={discount}
                        vatRate={vatRate}
                        onUpdateDiscount={setDiscount}
                        onUpdateVatRate={setVatRate}
                        onUpdateItems={setPricingItems}
                        onSaveProject={handleSaveProject}
                        onPrev={handlePrevStep}
                        customerName={customerInfo.customerName}
                        customerInfo={customerInfo}
                        requirements={requirements}
                        showConfirm={showConfirm}
                        onGoToStep1={() => setStep(1)}
                        cameraPoints={cameraPoints}
                        isAdminVerified={userProfile?.role === "admin" || userProfile?.role === "superadmin"}
                        onVerifyAdmin={(userProfile?.role === "user" || userProfile?.role === "head_user") ? undefined : () => {
                          setAdminPinInput("");
                          setAdminPinError("");
                          setAdminPinPurpose("pricing_admin");
                          setIsAdminPinModalOpen(true);
                        }}
                        isEditMode={isEditMode}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </>
          )}
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 px-6 shrink-0 mt-auto">
        <div className="max-w-7xl mx-auto text-center text-xs text-gray-400">
          <span>Powered by Warapon Wichitpan © 2026 · NT Cyfence</span>
        </div>
      </footer>

      {/* Confirmation Modal — blocks.so style */}
      <Dialog01
        open={confirmModal.isOpen}
        onOpenChange={(open) => setConfirmModal(prev => ({ ...prev, isOpen: open }))}
        title={confirmModal.title}
        description={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        onConfirm={confirmModal.onConfirm}
        onCancel={confirmModal.onCancel}
        variant={confirmModal.title.includes("❌") || confirmModal.title.includes("🗑️") || confirmModal.title.includes("ลบ") ? "danger" : "default"}
        icon={confirmModal.title.match(/[\u{1F000}-\u{1FFFF}]|[\u2600-\u27FF]/u)?.[0] || "💬"}
      />

      {/* Quick Command Menu */}
      <CommandMenu01
        open={isCommandMenuOpen}
        setOpen={setIsCommandMenuOpen}
        onSelectAction={(action) => {
          if (action === "Dashboard" || action === "Home") setStep(1);
          else if (action === "Projects") setStep(1);
          else if (action === "Sign out") handleLogout();
          else if (action === "Preferences" || action === "Appearance") {
            setAdminPinInput("");
            setAdminPinError("");
            setAdminPinPurpose("costs");
            setIsAdminPinModalOpen(true);
          }
        }}
      />

      {/* Admin PIN Modal — blocks.so style */}
      <AnimatePresence>
        {isAdminPinModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-2xl max-w-sm w-full shadow-xl border border-gray-200 p-7 space-y-5"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto text-2xl">
                  🔒
                </div>
                <h4 className="text-sm font-bold text-gray-900">
                  ยืนยันสิทธิ์ผู้ดูแลระบบ
                </h4>
                <p className="text-xs text-gray-500">
                  ระบุรหัส PIN ของผู้ดูแลระบบเพื่อเข้าสู่หน้าต่างการตั้งค่า
                </p>
              </div>

              <form onSubmit={handleVerifyAdminPin} className="space-y-4">
                <div>
                  <input
                    type="password"
                    maxLength={4}
                    value={adminPinInput}
                    onChange={(e) => {
                      setAdminPinInput(e.target.value.replace(/\D/g, ""));
                      setAdminPinError("");
                    }}
                    className="w-full text-center tracking-[1.5em] text-xl font-mono py-3 bg-gray-50 border border-gray-300 hover:border-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/8 rounded-xl outline-none transition-all placeholder-gray-400"
                    placeholder="••••"
                    autoFocus
                  />
                  {adminPinError && (
                    <p className="text-xs text-red-600 text-center mt-2 font-medium">
                      ⚠️ {adminPinError}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdminPinModalOpen(false);
                      setAdminPinInput("");
                      setAdminPinError("");
                    }}
                    className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-all cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 active:bg-gray-700 rounded-lg transition-all cursor-pointer"
                  >
                    ยืนยัน
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Panel Modal — blocks.so style */}
      <AnimatePresence>
        {isAdminModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-gray-200 overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-700" />
                  <span className="text-sm font-semibold text-gray-900">
                    Admin Panel
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Database Connection
                  </p>

                  {isSupabaseConfigured ? (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          ✓
                        </div>
                        <div className="text-xs">
                          <span className="block font-semibold text-emerald-800">
                            เชื่อมต่อคลาวด์ Supabase สำเร็จ!
                          </span>
                          <span className="block text-emerald-600 leading-relaxed mt-0.5">
                            ข้อมูลโครงการของคุณถูกสำรองและซิงก์ออนไลน์เรียลไทม์แล้วค่ะ
                          </span>
                        </div>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-[10px] space-y-1 font-mono text-gray-600 break-all">
                        <div className="font-semibold text-gray-400 uppercase text-[9px] tracking-wider">REST Endpoint URL</div>
                        <div>https://tkcpmtqvdakgxjcwmzdw.supabase.co/rest/v1/</div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-gray-400 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          !
                        </div>
                        <div className="text-xs">
                          <span className="block font-semibold text-gray-800">
                            ทำงานในโหมด Offline (LocalStorage)
                          </span>
                          <span className="block text-gray-500 leading-relaxed mt-0.5">
                            ยังไม่ได้เชื่อมต่อกับระบบฐานข้อมูลคลาวด์ ข้อมูลจะถูกจัดเก็บในหน่วยความจำของอุปกรณ์นี้อย่างปลอดภัย
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-800 leading-relaxed space-y-1">
                  <div className="font-semibold">💡 ข้อแนะนำสำหรับผู้ดูแล</div>
                  <div className="text-amber-700">ตรวจสอบสถานะการเชื่อมต่อฐานข้อมูล หากพบปัญหา กรุณาประสานงานกับทีมผู้พัฒนาระบบค่ะ</div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Master Cost Database Modal — blocks.so style */}
      <AnimatePresence>
        {isCostsModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-2xl max-w-2xl w-full shadow-xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2.5">
                  <Coins className="w-4.5 h-4.5 text-amber-500" />
                  <div>
                    <span className="text-sm font-bold text-gray-900 block">
                      Master Cost Database
                    </span>
                    <span className="text-xs text-gray-500 block mt-0.5">
                      แก้ไขราคามาตรฐานต้นทุน (ไม่มีผลย้อนหลังกับใบเสนอราคาที่เซฟแล้ว)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCostsModalOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Content Form */}
              <div className="overflow-y-auto p-6 space-y-6 flex-1">
                
                {/* Section 1: IP Cameras & Basic Hardware */}
                <div className="space-y-3.5">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-2 flex items-center gap-1.5">
                    <span>📷</span> อุปกรณ์หลักปลายทาง (Hardware)
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">กล้องทรงกระบอก Bullet (บาท)</label>
                      <input type="number" min={0} value={tempCosts.camBullet}
                        onChange={(e) => setTempCosts(p => ({ ...p, camBullet: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">กล้องครอบฝ้า Dome (บาท)</label>
                      <input type="number" min={0} value={tempCosts.camDome}
                        onChange={(e) => setTempCosts(p => ({ ...p, camDome: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">กล้องหมุน PTZ Speed Dome (บาท)</label>
                      <input type="number" min={0} value={tempCosts.camPtz}
                        onChange={(e) => setTempCosts(p => ({ ...p, camPtz: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">กล้องจานบิน Fisheye 360° (บาท)</label>
                      <input type="number" min={0} value={tempCosts.camFisheye}
                        onChange={(e) => setTempCosts(p => ({ ...p, camFisheye: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Switch POE 4 Port Industrial (บาท)</label>
                      <input type="number" min={0} value={tempCosts.poe4port}
                        onChange={(e) => setTempCosts(p => ({ ...p, poe4port: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Ups 800 VA ปลายทาง (บาท)</label>
                      <input type="number" min={0} value={tempCosts.ups800va}
                        onChange={(e) => setTempCosts(p => ({ ...p, ups800va: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                  </div>
                </div>

                {/* Section 2: Cabinets & Cables & Poles */}
                <div className="space-y-3.5">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-2 flex items-center gap-1.5">
                    <span>🗼</span> ตู้ควบคุม สายไฟ และเสาปลายทาง
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">ตู้ Outdoor Cabinet มีพัดลม (บาท)</label>
                      <input type="number" min={0} value={tempCosts.outdoorCabinet}
                        onChange={(e) => setTempCosts(p => ({ ...p, outdoorCabinet: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">SDcard 128G (บาท)</label>
                      <input type="number" min={0} value={tempCosts.sdCard128}
                        onChange={(e) => setTempCosts(p => ({ ...p, sdCard128: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">แขน Support (บาท)</label>
                      <input type="number" min={0} value={tempCosts.supportArm}
                        onChange={(e) => setTempCosts(p => ({ ...p, supportArm: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">สายไฟฟ้า THW 16 sq.mm. 50 เมตร (บาท/ชุด)</label>
                      <input type="number" min={0} value={tempCosts.thw16sqmm}
                        onChange={(e) => setTempCosts(p => ({ ...p, thw16sqmm: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">เสาเหล็ก 4 เมตร (บาท)</label>
                      <input type="number" min={0} value={tempCosts.poleSteel4m}
                        onChange={(e) => setTempCosts(p => ({ ...p, poleSteel4m: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">เสาปูน 8 เมตร (บาท)</label>
                      <input type="number" min={0} value={tempCosts.poleCement8m}
                        onChange={(e) => setTempCosts(p => ({ ...p, poleCement8m: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                  </div>
                </div>

                {/* Section 3: Recorders & Equipment Room (Headend) */}
                <div className="space-y-3.5">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-2 flex items-center gap-1.5">
                    <span>🗄️</span> อุปกรณ์ฝั่งต้นทาง (Control Room Headend)
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-1">NVR 8CH (บาท)</label>
                      <input type="number" min={0} value={tempCosts.nvr8ch}
                        onChange={(e) => setTempCosts(p => ({ ...p, nvr8ch: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-1">NVR 16CH (บาท)</label>
                      <input type="number" min={0} value={tempCosts.nvr16ch}
                        onChange={(e) => setTempCosts(p => ({ ...p, nvr16ch: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-1">NVR 32CH (บาท)</label>
                      <input type="number" min={0} value={tempCosts.nvr32ch}
                        onChange={(e) => setTempCosts(p => ({ ...p, nvr32ch: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-1">HDD 8TB (บาท)</label>
                      <input type="number" min={0} value={tempCosts.hdd8tb}
                        onChange={(e) => setTempCosts(p => ({ ...p, hdd8tb: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-1">Rack 6U (บาท)</label>
                      <input type="number" min={0} value={tempCosts.rack6u}
                        onChange={(e) => setTempCosts(p => ({ ...p, rack6u: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-1">Rack 16U (บาท)</label>
                      <input type="number" min={0} value={tempCosts.rack16u}
                        onChange={(e) => setTempCosts(p => ({ ...p, rack16u: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-1">Rack 42U (บาท)</label>
                      <input type="number" min={0} value={tempCosts.rack42u}
                        onChange={(e) => setTempCosts(p => ({ ...p, rack42u: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-1">จอ 27 นิ้ว (บาท)</label>
                      <input type="number" min={0} value={tempCosts.monitor27}
                        onChange={(e) => setTempCosts(p => ({ ...p, monitor27: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">TV 55 นิ้ว (บาท)</label>
                      <input type="number" min={0} value={tempCosts.tv55}
                        onChange={(e) => setTempCosts(p => ({ ...p, tv55: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">UPS 1Kva (บาท)</label>
                      <input type="number" min={0} value={tempCosts.ups1kva}
                        onChange={(e) => setTempCosts(p => ({ ...p, ups1kva: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                     <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">UPS 2Kva (บาท)</label>
                      <input type="number" min={0} value={tempCosts.ups2kva}
                        onChange={(e) => setTempCosts(p => ({ ...p, ups2kva: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Router VPN/Firewall (บาท)</label>
                      <input type="number" min={0} value={tempCosts.routerHw}
                        onChange={(e) => setTempCosts(p => ({ ...p, routerHw: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                  </div>
                </div>

                {/* Section 4: Labor Costs (Destinations) */}
                <div className="space-y-3.5">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-2 flex items-center gap-1.5">
                    <span>🛠️</span> ค่าบริการงานติดตั้งฝั่งปลายทาง (Labor Field)
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">ค่าติดตั้งกล้อง CCTV + LAN 25ม. (บาท/จุด)</label>
                      <input type="number" min={0} value={tempCosts.laborCctv}
                        onChange={(e) => setTempCosts(p => ({ ...p, laborCctv: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">ค่าติดตั้งแขน Support 1ม.+ (บาท/ชุด)</label>
                      <input type="number" min={0} value={tempCosts.laborSupportArm}
                        onChange={(e) => setTempCosts(p => ({ ...p, laborSupportArm: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">ค่าติดตั้งตู้ Outdoor (พัดลม,ปลั๊ก,Breaker) (บาท)</label>
                      <input type="number" min={0} value={tempCosts.laborCabinet}
                        onChange={(e) => setTempCosts(p => ({ ...p, laborCabinet: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">ค่าติดตั้ง Ground Rod ขุดบ่อกราวด์ (บาท/จุด)</label>
                      <input type="number" min={0} value={tempCosts.laborGroundRod}
                        onChange={(e) => setTempCosts(p => ({ ...p, laborGroundRod: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">ค่าติดตั้งเสาปูน 8ม.+ฐานราก (บาท/ต้น)</label>
                      <input type="number" min={0} value={tempCosts.laborPoleCement8m}
                        onChange={(e) => setTempCosts(p => ({ ...p, laborPoleCement8m: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">ค่าติดตั้งเสาเหล็ก 4ม.+ฐานราก (บาท/ต้น)</label>
                      <input type="number" min={0} value={tempCosts.laborPoleSteel4m}
                        onChange={(e) => setTempCosts(p => ({ ...p, laborPoleSteel4m: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">ค่าติดตั้งสาย THW 50ม.+มิเตอร์ไฟ (บาท/ชุด)</label>
                      <input type="number" min={0} value={tempCosts.laborPowerThw}
                        onChange={(e) => setTempCosts(p => ({ ...p, laborPowerThw: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                  </div>
                </div>

                {/* Section 5: Labor Costs (Headend Control Room) */}
                <div className="space-y-3.5 pb-4">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-2 flex items-center gap-1.5">
                    <span>🖥️</span> ค่าบริการงานติดตั้งฝั่งต้นทาง (Labor Control Room)
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">ค่าติดตั้งจอ Monitor + HDMI (บาท/ชุด)</label>
                      <input type="number" min={0} value={tempCosts.laborMonitor}
                        onChange={(e) => setTempCosts(p => ({ ...p, laborMonitor: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">ค่าติดตั้งตู้ Rack + UPS (บาท/ตู้)</label>
                      <input type="number" min={0} value={tempCosts.laborRack}
                        onChange={(e) => setTempCosts(p => ({ ...p, laborRack: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">ค่าติดตั้ง NVR + Config ดูภาพ (บาท/เครื่อง)</label>
                      <input type="number" min={0} value={tempCosts.laborNvr}
                        onChange={(e) => setTempCosts(p => ({ ...p, laborNvr: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">ค่าติดตั้ง Router ต้นทาง (พร้อม Config ระบบ) (บาท/เครื่อง)</label>
                      <input type="number" min={0} value={tempCosts.laborRouter}
                        onChange={(e) => setTempCosts(p => ({ ...p, laborRouter: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">ค่าเดินสายไฟต้นทาง VCT 30ม. (บาท/ชุด)</label>
                      <input type="number" min={0} value={tempCosts.laborPowerVct}
                        onChange={(e) => setTempCosts(p => ({ ...p, laborPowerVct: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                  </div>
                </div>

                {/* Section 6: Annual Maintenance Costs (MA) */}
                <div className="space-y-3.5 pb-4">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-2 flex items-center gap-1.5">
                    <span>🛡️</span> ค่าบริการบำรุงรักษารายปี (Annual Maintenance - MA)
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">ค่าบริการ MA ปีที่ 2 (บาทต่อปี)</label>
                      <input type="number" min={0} value={tempCosts.maYear2}
                        onChange={(e) => setTempCosts(p => ({ ...p, maYear2: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">ค่าบริการ MA ปีที่ 3 (บาทต่อปี)</label>
                      <input type="number" min={0} value={tempCosts.maYear3}
                        onChange={(e) => setTempCosts(p => ({ ...p, maYear3: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 focus:bg-white rounded-lg outline-none text-sm font-mono font-semibold text-gray-800 transition-all" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    showConfirm(
                      "🔄 คืนค่าเริ่มต้นโรงงาน",
                      "คุณต้องการคืนค่าคู่มือราคาต้นทุนมาตรฐานของโรงงาน (Factory Defaults) ใช่หรือไม่คะ?",
                      () => { setTempCosts(DEFAULT_MASTER_COSTS); },
                      { confirmText: "🔄 ยืนยันคืนค่า", cancelText: "ยกเลิก" }
                    );
                  }}
                  className="px-4 py-2 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 text-gray-600 hover:text-red-600 text-sm font-medium rounded-lg transition-all cursor-pointer">
                  คืนค่าเริ่มต้น
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCostsModalOpen(false)}
                    className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg transition-all cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const updated = {
                        ...tempCosts,
                        lastUpdated: new Date().toISOString()
                      };
                      setMasterCosts(updated);
                      
                      // Also save to Supabase if configured
                      if (isSupabaseConfigured) {
                        try {
                          const { error } = await supabase
                            .from("cctv_master_costs")
                            .upsert({
                              id: "default",
                              costs: updated,
                              updated_at: new Date().toISOString()
                            });
                          if (error) {
                            console.error("Failed to save master costs to Supabase:", error.message);
                            alert("💾 บันทึกในเบราว์เซอร์สำเร็จ แต่ไม่สามารถซิงค์ขึ้น Supabase ได้ค่ะ:\n" + error.message);
                          } else {
                            alert("💾 บันทึกราคาต้นทุนมาตรฐานสำเร็จและซิงค์ขึ้นระบบ Cloud Supabase เรียบร้อยแล้วค่ะ!");
                          }
                        } catch (err: any) {
                          console.error("Failed to save master costs to Supabase:", err);
                          alert("💾 บันทึกในเบราว์เซอร์สำเร็จ แต่ไม่สามารถซิงค์ขึ้น Supabase ได้ค่ะ");
                        }
                      } else {
                        alert("💾 บันทึกราคาต้นทุนมาตรฐานสำเร็จเรียบร้อยแล้วค่ะ! (โหมดบันทึกในเครื่อง)");
                      }
                      
                      setIsCostsModalOpen(false);
                    }}
                    className="px-5 py-2 bg-gray-900 hover:bg-gray-800 active:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-all cursor-pointer"
                  >
                    บันทึกต้นทุนใหม่
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Management Modal — blocks.so style */}
      <AnimatePresence>
        {isUserMgmtOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-2xl max-w-4xl w-full shadow-xl border border-gray-200 overflow-x-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2.5">
                  <Users className="w-5 h-5 text-gray-700" />
                  <div>
                    <span className="text-sm font-bold text-gray-900 block">
                      User Management
                    </span>
                    <span className="text-xs text-gray-500 block mt-0.5">
                      จัดการสิทธิ์และกลุ่มจังหวัดของพนักงานสำรวจ (superAdmin Only)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUserMgmtOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto p-6 flex-1">
                <UserManagement />
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setIsUserMgmtOpen(false)}
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  ปิดหน้าต่างจัดการ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
