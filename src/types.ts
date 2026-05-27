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
  creatorName?: string; // display name of the user who created it
}

export interface MasterCostDb {
  camBullet: number;
  camDome: number;
  camPtz: number;
  camFisheye: number;
  nvr4ch: number;
  nvr8ch: number;
  nvr16ch: number;
  nvr32ch: number;
  nvr64ch: number;
  hdd4tb: number;
  hdd8tb: number;
  pole3m: number;
  pole4m: number;
  pole6m: number;
  poleGalvanized: number;
  supportArm: number;
  lanCable: number;
  conduit: number;
  poe4port: number;
  poe8port: number;
  poe16port: number;
  poe24port: number;
  laborCamera: number;
  laborPole: number;
  lastUpdated: string;
}

