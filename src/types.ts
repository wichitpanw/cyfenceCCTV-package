/**
 *Types for the CCTV Survey & Price Estimation App
 */

export interface CameraPoint {
  id: string;
  name: string; // e.g. "หน้าประตูทางเข้า", "ลานจอดรถ"
  type: string; // "Dome" | "Bullet" | "PTZ" | "Speed Dome"
  poleType: string; // "None" | "เสา 3 เมตร" | "เสา 4 เมตร" | "เสา 6 เมตร" | "เสาเหล็กกล่อง"
  hasSupportArm: boolean;
  notes: string;
  photoUrl: string; // Base64 or mock stock image URL
  // Visual position coordinates on our plan preview grid
  x: number; // percentage width (0-100)
  y: number; // percentage height (0-100)
  focalAngle: number; // in degrees, e.g. 90
  rotation: number; // rotation in degrees (0-360)
  lat?: number;
  lng?: number;
  lanCableLength?: number; // length of LAN cable in meters (default 25)
  hasOutdoorCabinet?: boolean; // field outdoor cabinet
  hasGroundRod?: boolean; // safety ground rod
  hasPowerMeter?: boolean; // THW power cable & meter
  hasSdCard?: boolean; // SD Card 128G
  hasCabinetUps?: boolean; // UPS 800 VA (outdoor)
  hasPoeSwitch?: boolean; // Switch POE 4 port (ruijie) Industrial Grade
  selectedSet?: "Set 1" | "Set 2" | "Set 3" | "Set 4" | "None";
}

export interface CustomerInfo {
  customerName: string;
  projectName: string;
  contactPerson: string;
  contactPhone: string;
  address: string;
  latitude: string;
  longitude: string;
  surveyorName: string;       // Staff in charge
  surveyorPhone?: string;     // Surveyor phone number
  surveyorDepartment?: string; // Surveyor department/unit
  surveyDate: string;
  province?: string; // Selected province for filtering
}

export interface TechRequirements {
  cameraCount: number;
  cameraBrand: string; // e.g. Hikvision, Dahua, Bosch, Axis, Generic
  nvrBrand: string;
  nvrChannels: number; // 4, 8, 16, 32, 64
  storagePackage: string; // e.g., "7 Days (1TB)", "15 Days (2TB)", "30 Days (4TB)"
  otherRequirements: string;
  standardCableLimit?: number; // standard cable limit per camera (default 25)
  extraCablePricePerMeter?: number; // price per extra meter for LAN cable (default 35)
  extraLaborPricePerMeter?: number; // labor fee per extra meter (default 25)
  rackType?: string; // "rack 19 นิ้ว 6U" | "rack 19 นิ้ว 16U" | "rack 19 นิ้ว 42U"
  monitorType?: string; // "จอ 27 นิ้ว" | "TV 55 นิ้ว"
  upsType?: string; // "UPS 1Kva" | "UPS 2Kva"
}

export interface PricingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  category: "hardware" | "accessory" | "labor" | "other";
}

export interface UserProfile {
  id: string;
  role: "superadmin" | "admin" | "head_user" | "user";
  displayName: string;
  email: string;
  province?: string;
  updatedAt: string;
}

export interface ProjectSurvey {
  id: string;
  customerInfo: CustomerInfo;
  requirements: TechRequirements;
  hasSurveyReport: boolean;
  cameraPoints: CameraPoint[];
  pricingItems: PricingItem[];
  discount: number;
  vatRate: number; // normally 7
  createdAt: string;
  status: "draft" | "completed";
  createdBy?: string; // UUID of the user who created it
  createdByEmail?: string; // Email of the user who created it (for admin/superadmin review)
}

export interface MasterCostDb {
  // --- ปลายทาง (Hardware & Accessory) ---
  camBullet: number;
  camDome: number;
  camPtz: number;
  camFisheye: number;
  poe4port: number; // Switch POE 4 Port Industrial Grade
  ups800va: number; // Ups 800 VA
  outdoorCabinet: number; // ตู้ Outdoor Cabinet แบบมีพัดลม
  sdCard128: number; // SDcard 128G
  supportArm: number; // แขน Support
  thw16sqmm: number; // ค่าสายไฟฟ้า THW IEC 16 sq.mm. 50 เมตร (ราคาต่อชุด 50 เมตร หรือต่อเมตรก็ได้ ในที่นี้กำหนดราคาต่อชุด 50 เมตร)

  // --- เสา ---
  poleSteel4m: number; // เสาเหล็ก 4 เมตร
  poleCement8m: number; // เสาปูน 8 เมตร

  // --- ต้นทาง ---
  nvr8ch: number;
  nvr16ch: number;
  nvr32ch: number;
  hdd8tb: number; // HDD 8TB
  rack6u: number; // rack 19 นิ้ว 6U
  rack16u: number; // rack 19 นิ้ว 16U
  rack42u: number; // rack 19 นิ้ว 42U
  monitor27: number; // จอ 27 นิ้ว
  tv55: number; // TV 55 นิ้ว
  ups1kva: number; // UPS 1Kva
  ups2kva: number; // UPS 2Kva

  // --- ค่าติดตั้งปลายทาง ---
  laborCctv: number; // ค่าติดตั้ง กล้อง CCTV (ค่าเดินสาย LAN 25 เมตรในท่อเฟล็กซ์อ่อนภายนอก + ติดตั้งกล้อง)
  laborSupportArm: number; // ค่าติดตั้ง แขน Support
  laborCabinet: number; // ค่าติดตั้งตู้ Outdoor cabinet (พัดลม 2 ตัว, ปลั๊กไฟ, Breaker)
  laborGroundRod: number; // ค่าติดตั้ง Ground Rod (ขุดเจาะบ่อกราวด์)
  laborPoleCement8m: number; // ค่าติดตั้งเสาปูน 8 เมตร (ปักเสาปูนพร้อมฐานราก)
  laborPoleSteel4m: number; // ค่าติดตั้งเสาเหล็กเสาเหล็กกัลวาไนซ์ สูง 4 เมตร (ติดตั้งพร้อมฐานราก)
  laborPowerThw: number; // ค่าติดตั้ง สายไฟฟ้า (สาย THW 16 sq.mm. 50 เมตร + ค่าแรกเข้ามิเตอร์ไฟ)

  // --- ค่าติดตั้งต้นทาง ---
  laborMonitor: number; // ค่าติดตั้งจอ Monitor (อุปกรณ์จับยึด, สาย HDMI)
  laborRack: number; // ค่าติดตั้งตู้ Rack (พัดลม, รางปลั๊กไฟ, UPS)
  laborNvr: number; // ค่าติดตั้ง NVR (เมาส์ไร้สาย, Config ดูภาพได้)
  laborRouter: number; // ค่าติดตั้ง Router (Config ให้ระบบทำงานได้)
  laborPowerVct: number; // ค่าเดินสายไฟฟ้าต้นทาง (สาย vct 30 เมตร, Breaker 16 A)

  lastUpdated: string;
}

