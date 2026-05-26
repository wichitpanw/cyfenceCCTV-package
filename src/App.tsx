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
import LoginScreen from "./components/LoginScreen";
import UserManagement from "./components/UserManagement";
import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { User } from "@supabase/supabase-js";
import { LogOut, Users, Loader2 } from "lucide-react";

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
};

const DEFAULT_MASTER_COSTS: MasterCostDb = {
  camBullet: 1850,
  camDome: 1650,
  camPtz: 5900,
  camFisheye: 4200,
  nvr4ch: 3200,
  nvr8ch: 4500,
  nvr16ch: 6800,
  nvr32ch: 11900,
  nvr64ch: 24900,
  hdd4tb: 4200,
  hdd8tb: 8500,
  pole3m: 2500,
  pole4m: 3500,
  pole6m: 5500,
  poleGalvanized: 4800,
  supportArm: 850,
  lanCable: 35,
  conduit: 65,
  poe4port: 1800,
  poe8port: 3200,
  poe16port: 5800,
  poe24port: 9500,
  laborCamera: 1200,
  laborPole: 1500,
  lastUpdated: new Date("2026-05-25T11:33:00+07:00").toISOString(),
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

  // 1. Cameras
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
      else if (p.type === "Bullet") bullets += ptCams;
      else if (p.type === "PTZ" || p.type === "Speed Dome") ptzs += ptCams;
      else if (p.type === "Fisheye") fisheyes += ptCams;
      else bullets += ptCams;
    });

    if (bullets > 0) {
      items.push({
        id: "bom-cam-bullet",
        name: `กล้องความปลอดภัยสูงทรงกระบอก Bullet CCTV IP 4MP (${brand})`,
        quantity: bullets,
        unit: "ตัว",
        unitPrice: costs.camBullet,
        category: "hardware"
      });
    }
    if (domes > 0) {
      items.push({
        id: "bom-cam-dome",
        name: `กล้องครอบฝ้าเพดานภายใน Dome CCTV IP 4MP (${brand})`,
        quantity: domes,
        unit: "ตัว",
        unitPrice: costs.camDome,
        category: "hardware"
      });
    }
    if (ptzs > 0) {
      items.push({
        id: "bom-cam-ptz",
        name: `กล้องหมุนรอบซูมระยะไกล PTZ Speed Dome Dual Lens (${brand})`,
        quantity: ptzs,
        unit: "ตัว",
        unitPrice: costs.camPtz,
        category: "hardware"
      });
    }
    if (fisheyes > 0) {
      items.push({
        id: "bom-cam-fisheye",
        name: `กล้องจานบินมุมกว้างพาโนรามา Fisheye CCTV 360° (${brand})`,
        quantity: fisheyes,
        unit: "ตัว",
        unitPrice: costs.camFisheye,
        category: "hardware"
      });
    }
  } else {
    items.push({
      id: "bom-cam-bullet",
      name: `กล้องวงจรปิดกระบอกเอนกประสงค์ Bullet IP Camera 4MP (${brand})`,
      quantity: requirements.cameraCount,
      unit: "ตัว",
      unitPrice: costs.camBullet,
      category: "hardware"
    });
  }

  // 2. NVR
  let nvrUnitPrice = costs.nvr4ch;
  if (requirements.nvrChannels <= 4) nvrUnitPrice = costs.nvr4ch;
  else if (requirements.nvrChannels <= 8) nvrUnitPrice = costs.nvr8ch;
  else if (requirements.nvrChannels <= 16) nvrUnitPrice = costs.nvr16ch;
  else if (requirements.nvrChannels <= 32) nvrUnitPrice = costs.nvr32ch;
  else nvrUnitPrice = costs.nvr64ch;

  items.push({
    id: "bom-nvr",
    name: `เครื่องบันทึกภาพกล้องวงจรปิด NVR ${requirements.nvrChannels}CH (แบรนด์เดียวกับกล้อง: ${brand})`,
    quantity: 1,
    unit: "เครื่อง",
    unitPrice: nvrUnitPrice,
    category: "hardware"
  });

  // 3. Storage HDD
  let hddPrice = costs.hdd4tb;
  let hddQuantity = 1;
  let hddName = "ฮาร์ดดิสก์สำหรับบันทึกภาพกล้องวงจรปิด 4TB";

  if (requirements.nvrChannels <= 4) {
    hddPrice = costs.hdd4tb;
    hddQuantity = 1;
    hddName = "ฮาร์ดดิสก์ 4TB";
  } else if (requirements.nvrChannels <= 8) {
    hddPrice = costs.hdd8tb;
    hddQuantity = 1;
    hddName = "ฮาร์ดดิสก์ 8TB";
  } else if (requirements.nvrChannels <= 16) {
    hddPrice = costs.hdd8tb;
    hddQuantity = 2;
    hddName = "ฮาร์ดดิสก์ 8TB x 2 ลูก";
  } else if (requirements.nvrChannels <= 32) {
    hddPrice = costs.hdd8tb;
    hddQuantity = 4;
    hddName = "ฮาร์ดดิสก์ 8TB x 4 ลูก";
  } else {
    hddPrice = costs.hdd8tb;
    hddQuantity = 8;
    hddName = "ฮาร์ดดิสก์ 8TB x 8 ลูก";
  }

  items.push({
    id: "bom-hdd",
    name: hddName,
    quantity: hddQuantity,
    unit: "ลูก",
    unitPrice: hddPrice,
    category: "hardware"
  });

  // 4. Poles & Support arms from Survey
  if (hasSurvey) {
    const poleTypesCount: Record<string, number> = {};
    let supportArms = 0;
    cameraPoints.forEach(p => {
      if (p.poleType !== "None") {
        poleTypesCount[p.poleType] = (poleTypesCount[p.poleType] || 0) + 1;
      }
      if (p.hasSupportArm) {
        supportArms++;
      }
    });

    Object.entries(poleTypesCount).forEach(([poleType, count]) => {
      let price = costs.pole3m;
      if (poleType.includes("4 เมตร")) price = costs.pole4m;
      else if (poleType.includes("6 เมตร")) price = costs.pole6m;
      else if (poleType.includes("กัลวาไนซ์")) price = costs.poleGalvanized;

      items.push({
        id: `bom-pole-${poleType}`,
        name: `เสาเหล็กกลมโครงสร้างยึดกล้อง (${poleType}) พร้อมแท่นเทปูนสำเร็จหน้างาน`,
        quantity: count,
        unit: "ต้น",
        unitPrice: price,
        category: "accessory"
      });
    });

    if (supportArms > 0) {
      items.push({
        id: "bom-support-arm",
        name: "แขนรองรับกล้องยื่นเสริมเหล็กลดมุมอับ (Support Arm Bracket Standard)",
        quantity: supportArms,
        unit: "ชุด",
        unitPrice: costs.supportArm,
        category: "accessory"
      });
    }
  }

  // 5. Cables and pipes
  let camCount = requirements.cameraCount;
  if (hasSurvey && cameraPoints.length > 0) {
    camCount = cameraPoints.reduce((sum, pt) => {
      let ptCams = 1;
      if (pt.selectedSet === "Set 1") ptCams = 1;
      else if (pt.selectedSet === "Set 2") ptCams = 2;
      else if (pt.selectedSet === "Set 3") ptCams = 3;
      else if (pt.selectedSet === "Set 4") ptCams = 4;
      return sum + ptCams;
    }, 0);
  }
  const rawCableMeters = camCount * 35; // average 35 meters per camera
  items.push({
    id: "bom-cable-lan",
    name: "สายสัญญาณ LINK CAT6 Outdoor Double Jacket ชิลด์กันน้ำและสัญญาณรบกวน",
    quantity: rawCableMeters,
    unit: "เมตร",
    unitPrice: costs.lanCable,
    category: "accessory"
  });

  items.push({
    id: "bom-pipe-upvc",
    name: "ท่อร้อยสายสัญญาณ UPVC ตราช้าง สีขาว กันไฟลาม กันรังสียูวีดัดโค้งขนาด 20mm",
    quantity: Math.ceil(rawCableMeters / 3.0), // 3 meter per pipe
    unit: "ท่อ",
    unitPrice: costs.conduit,
    category: "accessory"
  });

  // 6. PoE Switch/Power
  const poePorts = camCount <= 4 ? 4 : camCount <= 8 ? 8 : camCount <= 16 ? 16 : 24;
  let poeUnitPrice = costs.poe4port;
  if (camCount <= 4) poeUnitPrice = costs.poe4port;
  else if (camCount <= 8) poeUnitPrice = costs.poe8port;
  else if (camCount <= 16) poeUnitPrice = costs.poe16port;
  else poeUnitPrice = costs.poe24port;

  items.push({
    id: "bom-poe",
    name: `สวิตช์จ่ายไฟผ่านสายแลน PoE Switch Giga Speed เกรดอุสาหกรรม (${poePorts} Ports)`,
    quantity: Math.max(1, Math.ceil(camCount / poePorts)),
    unit: "เครื่อง",
    unitPrice: poeUnitPrice,
    category: "hardware"
  });

  // 7. Labor Installation
  items.push({
    id: "bom-labor-install",
    name: "ค่าบริการติดตั้งกล้อง เซ็ตระบบบันทึก และบันทึกบัญชีออนไลน์ผ่านคลาวด์",
    quantity: camCount,
    unit: "จุด",
    unitPrice: costs.laborCamera,
    category: "labor"
  });

  if (hasSurvey) {
    const surveyorsPoles = cameraPoints.filter(p => p.poleType !== "None").length;
    if (surveyorsPoles > 0) {
      items.push({
        id: "bom-labor-pole",
        name: "ค่าแรงงานทหารช่าง ปูนบ่อเสา และปรับระดับดินโครงยึดเสาระบบกล้องหน้างาน",
        quantity: surveyorsPoles,
        unit: "จุด",
        unitPrice: costs.laborPole,
        category: "labor"
      });
    }
  }

  return items;
}

export default function App() {
  const [step, setStep] = useState<number>(1);
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
        return JSON.parse(saved);
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
        // 1. ตรวจสอบเซสชันผู้ใช้แบบ Password-less (LocalStorage) ก่อน
        const savedSession = localStorage.getItem("CCTV_USER_SESSION");
        if (savedSession) {
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

      if (data) {
        setUserProfile({
          id: data.id,
          role: data.role || "user",
          displayName: data.display_name || "ผู้ใช้",
          email: email,
          province: data.province || "",
          updatedAt: data.updated_at
        });
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
        setUserProfile(defaultProf);
        
        // Auto-create profile row if missing
        await supabase.from("profiles").upsert({
          id: userId,
          role: "user",
          display_name: defaultProf.displayName,
          province: "",
          updated_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Load user profile failed:", err);
    } finally {
      setAuthLoading(false);
    }
  };

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
          setMasterCosts(data[0].costs);
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
              status: row.status || "draft",
              createdAt: row.created_at || new Date().toISOString(),
              createdBy: row.created_by || null,
              cameraPoints: cams.map((c: any) => ({
                id: c.id,
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
                id: p.id,
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
    setStep(5); // switch to the summary/pricing screen so the user can view results immediately
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
    });
    setHasSurveyReport(true);
    setCameraPoints([]);
    setPricingItems([]);
    setDiscount(0);
    setVatRate(7);
    setStep(1);
  };

  // Save/Update main project to list and database/LocalStorage
  const handleSaveProject = async () => {
    const freshId = activeProjectId || `survey-id-${Date.now()}`;
    const formattedProject: ProjectSurvey = {
      id: freshId,
      customerInfo,
      requirements,
      hasSurveyReport,
      cameraPoints,
      pricingItems,
      discount,
      vatRate,
      createdAt: new Date().toISOString(),
      status: "draft",
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
          status: "draft",
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

        // 2. Replace camera_points: delete old, insert new
        let hasDetailError = false;
        let detailErrorMessage = "";

        await supabase.from("camera_points").delete().eq("project_id", freshId);
        if (cameraPoints.length > 0) {
          const camRows = cameraPoints.map((c, idx) => ({
            id: c.id,
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

        // 3. Replace pricing_items: delete old, insert new
        await supabase.from("pricing_items").delete().eq("project_id", freshId);
        if (pricingItems.length > 0) {
          const priceRows = pricingItems.map((p, idx) => ({
            id: p.id,
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

        if (hasDetailError) {
          showAlert("⚠️ บันทึกข้อมูลไม่สมบูรณ์", "ข้อมูลหลักถูกบันทึกแล้ว แต่พบปัญหาในส่วนข้อมูลย่อย:" + detailErrorMessage);
          return;
        }
      } catch (err) {
        console.error("Supabase Save Exception:", err);
      }
    }

    // เคลียร์ประวัติใน LocalStorage ทิ้งตามความต้องการของคุณบีม
    localStorage.removeItem("cctv_surveys_data");
    showAlert("✅ บันทึกสำเร็จ", "บันทึกโครงการ เรียบร้อยแล้วค่ะ ✨");
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
    setStep((prev) => Math.max(1, prev - 1));
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
      <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
          <Loader2 className="w-6 h-6 text-indigo-650 animate-spin" />
        </div>
        <span className="text-xs font-bold text-zinc-500 mt-4 animate-pulse">กำลังเตรียมระบบความปลอดภัย...</span>
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
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] flex flex-col font-sans" id="applet-primary-layout">
      
      {/* Top Professional Header Navigation - Apple Translucent style */}
      <header className="bg-white border-b border-zinc-200 py-3 px-6 shrink-0 shadow-xs relative z-40 w-full">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md transition-transform hover:scale-105 relative overflow-hidden border border-zinc-200 p-1">
              <img 
                src="/cyfence_logo.png" 
                alt="NT Cyfence Logo" 
                className="w-full h-full object-contain"
                id="header-logo-image"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-zinc-900">
                  CCTV Package by NT Cyfence
                </h1>
              </div>
              <p className="text-[10px] text-zinc-500 font-normal">
                เครื่องมือสำรวจออกแบบกล้องวงจรปิด
              </p>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2 text-xs font-normal text-zinc-600">
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-250 text-zinc-700 font-semibold text-[11px] transition-all border border-zinc-200/50 cursor-pointer"
                title="กลับหน้าแรก"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">หน้าแรก</span>
              </button>
            )}
            {/* Clock */}
            <div className="flex items-center gap-1.5 bg-zinc-100/80 px-2.5 py-1.5 rounded-lg border border-zinc-200/40">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span className="font-mono text-[10px] font-medium text-zinc-700">
                {new Date().toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </div>
            {/* Surveyor Badge */}
            <div className="flex items-center gap-2 bg-zinc-100/80 px-2.5 py-1 rounded-lg border border-zinc-200/40">
              <div className="w-6 h-6 rounded-full bg-[#0071e3] text-center flex items-center justify-center font-bold text-white uppercase text-[10px]">
                {userProfile?.displayName?.substring(0, 2) || "SV"}
              </div>
              <div className="text-left leading-none">
                <span className="block text-zinc-450 text-[8px] uppercase font-extrabold tracking-wider">{userProfile?.role || "user"}</span>
                <span className="text-[11px] font-bold text-zinc-800">{userProfile?.displayName || "ผู้ใช้งาน"}</span>
              </div>
            </div>

            {/* Log Out Button */}
            <button
              type="button"
              onClick={async () => {
                if (confirm("🚪 คุณต้องการออกจากระบบใช่หรือไม่?")) {
                  localStorage.removeItem("CCTV_USER_SESSION");
                  await supabase.auth.signOut();
                  setCurrentUser(null);
                  setUserProfile(null);
                  window.location.reload();
                }
              }}
              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 active:bg-red-150 text-red-650 transition-all border border-red-200/50 cursor-pointer flex items-center justify-center gap-1 sm:px-2.5 shadow-2xs"
              title="ออกจากระบบ (Log Out)"
            >
              <LogOut className="w-3.5 h-3.5 text-red-500" />
              <span className="text-[10px] font-bold text-red-700 hidden sm:inline">ออกจากระบบ</span>
            </button>
            {/* User Management Button (Users Icon) - superadmin only */}
            {userProfile?.role === "superadmin" && (
              <button
                type="button"
                onClick={() => {
                  setIsUserMgmtOpen(true);
                }}
                className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-150 text-indigo-650 transition-all border border-indigo-200/50 cursor-pointer flex items-center justify-center gap-1 sm:px-2.5 shadow-2xs"
                title="จัดการสิทธิ์ผู้ใช้งาน (User Management)"
              >
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[10px] font-bold text-indigo-700 hidden sm:inline">จัดการสิทธิ์</span>
              </button>
            )}
            
            {/* Master Cost Database Button (Coins Icon) - superadmin or admin */}
            {(userProfile?.role === "superadmin" || userProfile?.role === "admin") && (
              <button
                type="button"
                onClick={() => {
                  setAdminPinInput("");
                  setAdminPinError("");
                  setAdminPinPurpose("costs");
                  setIsAdminPinModalOpen(true);
                }}
                className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-250 text-zinc-650 transition-all border border-zinc-200/50 cursor-pointer flex items-center justify-center gap-1 sm:px-2.5"
                title="แก้ไขราคาต้นทุนกลาง (Master Cost Database)"
              >
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[10px] font-bold text-zinc-700 hidden sm:inline">สำหรับผู้ดูแลระบบ</span>
              </button>
            )}

            {/* Admin Settings Button (Gear Icon) - superadmin or admin */}
            {(userProfile?.role === "superadmin" || userProfile?.role === "admin") && (
              <button
                type="button"
                onClick={() => {
                  setAdminPinInput("");
                  setAdminPinError("");
                  setAdminPinPurpose("settings");
                  setIsAdminPinModalOpen(true);
                }}
                className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-250 text-zinc-650 transition-all border border-zinc-200/50 cursor-pointer flex items-center justify-center"
                title="สำหรับผู้ดูแลระบบ (Admin Panel)"
              >
                <Settings className="w-4 h-4 text-zinc-650" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main body area */}
      <main className="grow max-w-7xl w-full mx-auto px-4 md:px-6 py-6 flex flex-col lg:flex-row lg:items-start gap-6">
        
        {/* SIDE BAR (COL 3): Project history logs */}
        <section className="w-full lg:w-80 shrink-0 space-y-4">

          {/* Project Saved Records catalog */}
          <ProjectHistory
            projects={projectsList}
            onLoadProject={(id) => {
              const proj = projectsList.find(p => p.id === id);
              if (proj) loadProject(proj);
            }}
            onDeleteProject={handleDeleteProject}
            onNewProject={handleNewProject}
            currentProjectId={activeProjectId}
            isCloudSyncActive={isSupabaseConfigured}
            costLastUpdated={formattedCostTimestamp}
            userRole={userProfile?.role || "user"}
            currentUserId={currentUser?.id || null}
          />
        </section>

        {/* WORKSPACE AREA (COL 9): Wizard steps and components */}
        <section className="grow flex flex-col min-w-0">
          
          {/* Breadcrumbs / Steps Indicator for Wizard */}
          <div className="bg-white rounded-2xl p-4 border border-zinc-250 mb-6 shadow-xs">
            <div className="flex justify-between items-center flex-wrap gap-2">
              {STAGE_STEPS.map((stepUnit) => {
                const isPassed = stepUnit.number < step;
                const isCurrent = stepUnit.number === step;
                const isSurveyIgnored = (stepUnit.number === 4) && !hasSurveyReport;
                const isClickable = (isPassed || isCurrent) && activeProjectId;

                return (
                  <div
                    key={stepUnit.number}
                    onClick={() => {
                      if (isClickable && !isCurrent) setStep(stepUnit.number);
                    }}
                    className={`flex items-center gap-1.5 text-xs font-medium transition-all ${
                      isSurveyIgnored ? "opacity-25 line-through" : ""
                    } ${
                      isClickable && !isCurrent
                        ? "cursor-pointer group"
                        : "cursor-default"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                        isCurrent
                          ? "bg-[#0071e3] text-white"
                          : isPassed
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500"
                          : "bg-zinc-100 text-zinc-400 border border-zinc-200/50"
                      }`}
                    >
                      {isPassed ? "✓" : stepUnit.number}
                    </div>
                    <span
                      className={`text-[11px] transition-colors ${
                        isCurrent
                          ? "text-[#0071e3] font-semibold"
                          : isPassed
                          ? "text-zinc-650 group-hover:text-[#0071e3] group-hover:underline underline-offset-2"
                          : "text-zinc-400 font-normal"
                      }`}
                    >
                      {stepUnit.label}
                    </span>
                    {stepUnit.number < 5 && (
                      <span className="text-zinc-300 font-normal text-[10px] ml-1.5">/</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Step Panel */}
          <div className="bg-white border border-zinc-250/80 rounded-2xl p-6 md:p-8 shadow-xs grow">
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
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

      </main>

      {/* Footer copyright and attribution */}
      <footer className="bg-white py-5 px-6 text-center text-xs shrink-0 border-t border-zinc-200/60 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-zinc-550 font-sans">
          <span>Powered by Warapon Wichitpan © 2026 · NT Cyfence</span>
        </div>
      </footer>

      {/* Central Apple-style Glassmorphic Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] select-none font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="bg-white rounded-2xl max-w-xs w-full shadow-2xl overflow-hidden border border-zinc-100"
            >
              {/* Content area */}
              <div className="px-6 pt-7 pb-5 text-center space-y-2">
                <div className="text-2xl mb-3 leading-none">
                  {confirmModal.title.match(/[\u{1F000}-\u{1FFFF}]|[\u2600-\u27FF]/u)?.[0] || "💬"}
                </div>
                <h4 className="text-sm font-bold text-zinc-900 leading-snug">
                  {confirmModal.title.replace(/^[\u{1F000}-\u{1FFFF}]|^[\u2600-\u27FF]\s*/u, "").trim()}
                </h4>
                <p className="text-[11.5px] text-zinc-500 leading-relaxed">
                  {confirmModal.message}
                </p>
              </div>
              {/* Divider */}
              <div className="h-px bg-zinc-100" />
              {/* Action buttons */}
              <div className={`flex ${confirmModal.cancelText === "" ? "" : "divide-x divide-zinc-100"}`}>
                {confirmModal.cancelText !== "" && (
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmModal(prev => ({ ...prev, isOpen: false }));
                      confirmModal.onCancel?.();
                    }}
                    className="flex-1 py-3.5 text-xs font-semibold text-zinc-500 hover:bg-zinc-50 active:bg-zinc-100 transition-colors cursor-pointer"
                  >
                    {confirmModal.cancelText || "ยกเลิก"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    confirmModal.onConfirm();
                  }}
                  className={`flex-1 py-3.5 text-xs font-bold transition-colors cursor-pointer ${
                    confirmModal.title.includes("❌") || confirmModal.title.includes("🗑️")
                      ? "text-red-500 hover:bg-red-50 active:bg-red-100"
                      : "text-[#0071e3] hover:bg-blue-50 active:bg-blue-100"
                  }`}
                >
                  {confirmModal.confirmText || "ยืนยัน"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin PIN Verification Modal */}
      <AnimatePresence>
        {isAdminPinModalOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-zinc-100 p-6 space-y-4"
            >
              <div className="text-center space-y-2">
                <div className="text-3xl">🔒</div>
                <h4 className="text-sm font-bold text-zinc-950">
                  ยืนยันสิทธิ์ผู้ดูแลระบบ
                </h4>
                <p className="text-[11px] text-zinc-500">
                  ระบุรหัส PIN ของผู้ดูแลระบบเพื่อเข้าสู่หน้าต่างการตั้งค่า
                </p>
              </div>

              <form onSubmit={handleVerifyAdminPin} className="space-y-3">
                <div>
                  <input
                    type="password"
                    maxLength={4}
                    value={adminPinInput}
                    onChange={(e) => {
                      setAdminPinInput(e.target.value.replace(/\D/g, ""));
                      setAdminPinError("");
                    }}
                    className="w-full text-center tracking-[1.5em] text-lg font-mono py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white"
                    placeholder="••••"
                    autoFocus
                  />
                  {adminPinError && (
                    <p className="text-[10px] text-red-500 text-center mt-1.5 font-medium">
                      ⚠️ {adminPinError}
                    </p>
                  )}
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdminPinModalOpen(false);
                      setAdminPinInput("");
                      setAdminPinError("");
                    }}
                    className="flex-1 py-2 text-xs font-semibold text-zinc-500 bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-250 rounded-xl transition-all cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 text-xs font-bold text-white bg-[#0071e3] hover:bg-blue-650 active:bg-blue-700 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                  >
                    ยืนยัน
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Panel Modal */}
      <AnimatePresence>
        {isAdminModalOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-zinc-100 overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-zinc-700" />
                  <span className="text-xs font-bold text-zinc-800">
                    หน้าต่างควบคุมสำหรับผู้ดูแลระบบ (Admin Panel)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-zinc-650 transition-colors cursor-pointer text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-zinc-400 block uppercase font-mono tracking-wider">
                    DATABASE CONNECTION / การเชื่อมต่อระบบคลาวด์
                  </span>

                  {isSupabaseConfigured ? (
                    <div className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-xl space-y-3">
                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 animate-pulse">
                          ✓
                        </div>
                        <div className="text-xs">
                          <span className="block font-bold text-emerald-800">
                            เชื่อมต่อคลาวด์ Supabase สำเร็จ!
                          </span>
                          <span className="block text-[10.5px] text-emerald-600/90 leading-relaxed mt-0.5">
                            ข้อมูลโครงการของคุณถูกสำรองและซิงก์ออนไลน์เรียลไทม์แล้วค่ะ
                          </span>
                        </div>
                      </div>
                      <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100 text-[10px] space-y-1 font-mono text-zinc-650 break-all">
                        <div className="font-semibold text-zinc-400 uppercase text-[8px] tracking-wider">REST Endpoint URL</div>
                        <div>https://tkcpmtqvdakgxjcwmzdw.supabase.co/rest/v1/</div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl space-y-2">
                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-zinc-400 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          !
                        </div>
                        <div className="text-xs">
                          <span className="block font-bold text-zinc-800">
                            ทำงานในโหมด Offline (LocalStorage)
                          </span>
                          <span className="block text-[10.5px] text-zinc-500 leading-relaxed mt-0.5">
                            ยังไม่ได้เชื่อมต่อกับระบบฐานข้อมูลคลาวด์ ข้อมูลจะถูกจัดเก็บในหน่วยความจำของอุปกรณ์นี้อย่างปลอดภัย
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-amber-50/50 border border-amber-200/60 p-3.5 rounded-xl text-[10.5px] text-amber-800 leading-relaxed space-y-1">
                  <div className="font-bold">💡 ข้อแนะนำเพิ่มเติมสำหรับผู้ดูแล</div>
                  <div>ในหน้านี้ ผู้ดูแลสามารถตรวจสอบสถานะการเชื่อมต่อฐานข้อมูลปลายทาง หากพบปัญหาเกี่ยวกับโครงสร้าง ตาราง หรือข้อมูลการเชื่อมต่อ สามารถประสานงานกับทีมผู้พัฒนาระบบเพื่อดูแลรักษาเซิร์ฟเวอร์ต่อไปได้ค่ะ</div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3.5 bg-zinc-50/50 border-t border-zinc-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Master Cost Database Modal */}
      <AnimatePresence>
        {isCostsModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-[9999] font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-zinc-150 bg-zinc-50/50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <Coins className="w-4.5 h-4.5 text-amber-500" />
                  <div>
                    <span className="text-xs font-extrabold text-zinc-900 block uppercase tracking-wider font-mono">
                      ราคาต้นทุนอุปกรณ์และบริการกลาง (Master Cost Database)
                    </span>
                    <span className="text-[9.5px] text-zinc-400 font-sans block mt-0.5 leading-none">
                      แก้ไขราคามาตรฐานต้นทุนสำหรับคำนวณโครงการถัดไป (ไม่มีผลย้อนหลังกับใบเสนอราคาที่เซฟแล้ว)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCostsModalOpen(false)}
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors cursor-pointer text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Content Form */}
              <div className="overflow-y-auto p-6 space-y-6 max-h-[70vh] scrollbar-thin">
                
                {/* Section 1: IP Cameras */}
                <div className="space-y-3.5">
                  <h5 className="text-[10px] font-bold text-[#0071e3] uppercase tracking-wider font-mono border-b border-blue-100 pb-1 flex items-center gap-1.5">
                    <span>📷</span> กล้องวงจรปิด IP Cameras
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-650 mb-1">กล้องทรงกระบอก Bullet (บาท)</label>
                      <input type="number" min={0} value={tempCosts.camBullet}
                        onChange={(e) => setTempCosts(p => ({ ...p, camBullet: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-xs font-mono font-bold text-zinc-800" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-650 mb-1">กล้องครอบฝ้า Dome (บาท)</label>
                      <input type="number" min={0} value={tempCosts.camDome}
                        onChange={(e) => setTempCosts(p => ({ ...p, camDome: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-xs font-mono font-bold text-zinc-800" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-650 mb-1">กล้องหมุน PTZ Speed Dome (บาท)</label>
                      <input type="number" min={0} value={tempCosts.camPtz}
                        onChange={(e) => setTempCosts(p => ({ ...p, camPtz: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-xs font-mono font-bold text-zinc-800" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-650 mb-1">กล้องจานบิน Fisheye 360° (บาท)</label>
                      <input type="number" min={0} value={tempCosts.camFisheye}
                        onChange={(e) => setTempCosts(p => ({ ...p, camFisheye: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-xs font-mono font-bold text-zinc-800" />
                    </div>
                  </div>
                </div>

                {/* Section 2: Recorders NVR */}
                <div className="space-y-3.5">
                  <h5 className="text-[10px] font-bold text-[#0071e3] uppercase tracking-wider font-mono border-b border-blue-100 pb-1 flex items-center gap-1.5">
                    <span>🗄️</span> เครื่องบันทึกภาพ NVR
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-[9px] font-semibold text-zinc-650 mb-1">NVR 4CH</label>
                      <input type="number" min={0} value={tempCosts.nvr4ch}
                        onChange={(e) => setTempCosts(p => ({ ...p, nvr4ch: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-2 py-1.5 bg-zinc-50 border border-zinc-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-xs font-mono font-bold text-zinc-800" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-zinc-650 mb-1">NVR 8CH</label>
                      <input type="number" min={0} value={tempCosts.nvr8ch}
                        onChange={(e) => setTempCosts(p => ({ ...p, nvr8ch: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-2 py-1.5 bg-zinc-50 border border-zinc-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-xs font-mono font-bold text-zinc-800" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-zinc-650 mb-1">NVR 16CH</label>
                      <input type="number" min={0} value={tempCosts.nvr16ch}
                        onChange={(e) => setTempCosts(p => ({ ...p, nvr16ch: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-2 py-1.5 bg-zinc-50 border border-zinc-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-xs font-mono font-bold text-zinc-800" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-zinc-650 mb-1">NVR 32CH</label>
                      <input type="number" min={0} value={tempCosts.nvr32ch}
                        onChange={(e) => setTempCosts(p => ({ ...p, nvr32ch: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-2 py-1.5 bg-zinc-50 border border-zinc-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-xs font-mono font-bold text-zinc-800" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-zinc-650 mb-1">NVR 64CH</label>
                      <input type="number" min={0} value={tempCosts.nvr64ch}
                        onChange={(e) => setTempCosts(p => ({ ...p, nvr64ch: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-2 py-1.5 bg-zinc-50 border border-zinc-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-xs font-mono font-bold text-zinc-800" />
                    </div>
                  </div>
                </div>

                {/* Section 3: HDD Storage */}
                <div className="space-y-3.5">
                  <h5 className="text-[10px] font-bold text-[#0071e3] uppercase tracking-wider font-mono border-b border-blue-100 pb-1 flex items-center gap-1.5">
                    <span>💾</span> ฮาร์ดดิสก์สะสมภาพ
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-650 mb-1">HDD ขนาด 4TB (บาท)</label>
                      <input type="number" min={0} value={tempCosts.hdd4tb}
                        onChange={(e) => setTempCosts(p => ({ ...p, hdd4tb: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-xs font-mono font-bold text-zinc-800" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-650 mb-1">HDD ขนาด 8TB (บาท)</label>
                      <input type="number" min={0} value={tempCosts.hdd8tb}
                        onChange={(e) => setTempCosts(p => ({ ...p, hdd8tb: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-xs font-mono font-bold text-zinc-800" />
                    </div>
                  </div>
                </div>

                {/* Section 4: Poles & Support Arms */}
                <div className="space-y-3.5">
                  <h5 className="text-[10px] font-bold text-[#0071e3] uppercase tracking-wider font-mono border-b border-blue-100 pb-1 flex items-center gap-1.5">
                    <span>🗼</span> เสาเหล็กยึดกล้องและอุปกรณ์เสริม
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-[9px] font-semibold text-zinc-650 mb-1">เสา 3 เมตร</label>
                      <input type="number" min={0} value={tempCosts.pole3m}
                        onChange={(e) => setTempCosts(p => ({ ...p, pole3m: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-2 py-1.5 bg-zinc-50 border border-zinc-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-xs font-mono font-bold text-zinc-800" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-zinc-650 mb-1">เสา 4 เมตร</label>
                      <input type="number" min={0} value={tempCosts.pole4m}
                        onChange={(e) => setTempCosts(p => ({ ...p, pole4m: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-2 py-1.5 bg-zinc-50 border border-zinc-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-xs font-mono font-bold text-zinc-800" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-zinc-650 mb-1">เสา 6 เมตร</label>
                      <input type="number" min={0} value={tempCosts.pole6m}
                        onChange={(e) => setTempCosts(p => ({ ...p, pole6m: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-2 py-1.5 bg-zinc-50 border border-zinc-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-xs font-mono font-bold text-zinc-800" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-zinc-650 mb-1">เสากัลวาไนซ์</label>
                      <input type="number" min={0} value={tempCosts.poleGalvanized}
                        onChange={(e) => setTempCosts(p => ({ ...p, poleGalvanized: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-2 py-1.5 bg-zinc-50 border border-zinc-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-xs font-mono font-bold text-zinc-800" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-zinc-650 mb-1">แขนยื่น Support</label>
                      <input type="number" min={0} value={tempCosts.supportArm}
                        onChange={(e) => setTempCosts(p => ({ ...p, supportArm: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-2 py-1.5 bg-zinc-50 border border-zinc-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-xs font-mono font-bold text-zinc-800" />
                    </div>
                  </div>
                </div>

                {/* Section 5: Cables, Pipes & PoE Switches */}
                <div className="space-y-3.5">
                  <h5 className="text-[10px] font-bold text-[#0071e3] uppercase tracking-wider font-mono border-b border-blue-100 pb-1 flex items-center gap-1.5">
                    <span>🔌</span> อุปกรณ์เชื่อมต่อและ Switch PoE
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-650 mb-1">สายสัญญาณแลน LAN CAT6 (บาทต่อเมตร)</label>
                      <input type="number" min={0} value={tempCosts.lanCable}
                        onChange={(e) => setTempCosts(p => ({ ...p, lanCable: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-xs font-mono font-bold text-zinc-800" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-650 mb-1">ท่อร้อยสายสัญญาณ uPVC (บาทต่อท่อ 3 ม.)</label>
                      <input type="number" min={0} value={tempCosts.conduit}
                        onChange={(e) => setTempCosts(p => ({ ...p, conduit: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-xs font-mono font-bold text-zinc-800" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    <div>
                      <label className="block text-[9px] font-semibold text-zinc-650 mb-1">Switch PoE 4P</label>
                      <input type="number" min={0} value={tempCosts.poe4port}
                        onChange={(e) => setTempCosts(p => ({ ...p, poe4port: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-2 py-1.5 bg-zinc-50 border border-zinc-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-xs font-mono font-bold text-zinc-800" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-zinc-650 mb-1">Switch PoE 8P</label>
                      <input type="number" min={0} value={tempCosts.poe8port}
                        onChange={(e) => setTempCosts(p => ({ ...p, poe8port: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-2 py-1.5 bg-zinc-50 border border-zinc-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-xs font-mono font-bold text-zinc-800" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-zinc-650 mb-1">Switch PoE 16P</label>
                      <input type="number" min={0} value={tempCosts.poe16port}
                        onChange={(e) => setTempCosts(p => ({ ...p, poe16port: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-2 py-1.5 bg-zinc-50 border border-zinc-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-xs font-mono font-bold text-zinc-800" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-zinc-650 mb-1">Switch PoE 24P</label>
                      <input type="number" min={0} value={tempCosts.poe24port}
                        onChange={(e) => setTempCosts(p => ({ ...p, poe24port: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-2 py-1.5 bg-zinc-50 border border-zinc-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-xs font-mono font-bold text-zinc-800" />
                    </div>
                  </div>
                </div>

                {/* Section 6: Labor Fees */}
                <div className="space-y-3.5 pb-4">
                  <h5 className="text-[10px] font-bold text-[#0071e3] uppercase tracking-wider font-mono border-b border-blue-100 pb-1 flex items-center gap-1.5">
                    <span>🛠️</span> ค่าบริการงานติดตั้งและเทปูน
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-650 mb-1">ค่าบริการแรงงานติดตั้งกล้อง (บาทต่อจุด)</label>
                      <input type="number" min={0} value={tempCosts.laborCamera}
                        onChange={(e) => setTempCosts(p => ({ ...p, laborCamera: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-xs font-mono font-bold text-zinc-800" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-650 mb-1">ค่าแรงปูนบ่อและเสาเข็มโครงยึด (บาทต่อจุดเสา)</label>
                      <input type="number" min={0} value={tempCosts.laborPole}
                        onChange={(e) => setTempCosts(p => ({ ...p, laborPole: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-xs font-mono font-bold text-zinc-800" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 bg-zinc-50/50 border-t border-zinc-150 flex justify-between items-center shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("🔄 คุณต้องการคืนค่าคู่มือราคาต้นทุนมาตรฐานของโรงงาน (Factory Defaults) ใช่หรือไม่?")) {
                      setTempCosts(DEFAULT_MASTER_COSTS);
                    }
                  }}
                  className="px-3.5 py-2 bg-red-50 hover:bg-red-100 active:bg-red-150 text-red-600 border border-red-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  คืนค่าเริ่มต้นโรงงาน
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCostsModalOpen(false)}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-250 text-zinc-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
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
                    className="px-5 py-2 bg-[#0071e3] hover:bg-blue-650 active:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-sm transition-all cursor-pointer"
                  >
                    บันทึกต้นทุนใหม่
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* superAdmin User Management Modal */}
      <AnimatePresence>
        {isUserMgmtOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-[9999] font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-zinc-150 bg-zinc-50/50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-650" />
                  <div>
                    <span className="text-xs font-extrabold text-zinc-900 block uppercase tracking-wider font-mono">
                      ระบบจัดการผู้ใช้งานและสิทธิ์ความปลอดภัย (User Auth Control Center)
                    </span>
                    <span className="text-[9.5px] text-zinc-400 font-sans block mt-0.5 leading-none">
                      ( superAdmin Only ) แก้ไขสิทธิ์การเข้าถึงข้อมูลต้นทุนและจัดกลุ่มจังหวัดของพนักงานสำรวจทั้งหมด
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUserMgmtOpen(false)}
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors cursor-pointer text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto p-6 max-h-[70vh] scrollbar-thin">
                <UserManagement />
              </div>

              {/* Footer */}
              <div className="px-6 py-3.5 bg-zinc-50/50 border-t border-zinc-100 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setIsUserMgmtOpen(false)}
                  className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
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
