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
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ProjectSurvey, CustomerInfo, TechRequirements, CameraPoint, PricingItem } from "./types";
import Step1BasicInfo from "./components/Step1BasicInfo";
import Step2CameraRequirements from "./components/Step2CameraRequirements";
import Step4SurveyReport from "./components/Step4SurveyReport";
import Step5Summary from "./components/Step5Summary";
import Step6Pricing from "./components/Step6Pricing";
import ProjectHistory from "./components/ProjectHistory";
import { supabase, isSupabaseConfigured } from "./supabaseClient";

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
  surveyDate: new Date().toISOString().split("T")[0],
};

const DEFAULT_REQUIREMENTS: TechRequirements = {
  cameraCount: 4,
  cameraBrand: "Hikvision",
  nvrBrand: "ยี่ห้อเดียวกับกล้อง (แนะนำ)",
  nvrChannels: 8,
  storagePackage: "HDD 8TB (มาตรฐานส่วนกลาง 8CH NVR)",
  otherRequirements: "",
};

// Help helper for autoBOM items
function generatePricingItems(
  requirements: TechRequirements,
  hasSurvey: boolean,
  cameraPoints: CameraPoint[]
): PricingItem[] {
  const brand = requirements.cameraBrand || "Hikvision";
  const items: PricingItem[] = [];

  // 1. Cameras
  if (hasSurvey && cameraPoints.length > 0) {
    const domes = cameraPoints.filter(p => p.type === "Dome").length;
    const bullets = cameraPoints.filter(p => p.type === "Bullet").length;
    const ptzs = cameraPoints.filter(p => p.type === "PTZ" || p.type === "Speed Dome").length;
    const fisheyes = cameraPoints.filter(p => p.type === "Fisheye").length;

    if (bullets > 0) {
      items.push({
        id: "bom-cam-bullet",
        name: `กล้องความปลอดภัยสูงทรงกระบอก Bullet CCTV IP 4MP (${brand})`,
        quantity: bullets,
        unit: "ตัว",
        unitPrice: 1850,
        category: "hardware"
      });
    }
    if (domes > 0) {
      items.push({
        id: "bom-cam-dome",
        name: `กล้องครอบฝ้าเพดานภายใน Dome CCTV IP 4MP (${brand})`,
        quantity: domes,
        unit: "ตัว",
        unitPrice: 1650,
        category: "hardware"
      });
    }
    if (ptzs > 0) {
      items.push({
        id: "bom-cam-ptz",
        name: `กล้องหมุนรอบซูมระยะไกล PTZ Speed Dome Dual Lens (${brand})`,
        quantity: ptzs,
        unit: "ตัว",
        unitPrice: 5900,
        category: "hardware"
      });
    }
    if (fisheyes > 0) {
      items.push({
        id: "bom-cam-fisheye",
        name: `กล้องจานบินมุมกว้างพาโนรามา Fisheye CCTV 360° (${brand})`,
        quantity: fisheyes,
        unit: "ตัว",
        unitPrice: 4200,
        category: "hardware"
      });
    }
  } else {
    items.push({
      id: "bom-cam-bullet",
      name: `กล้องวงจรปิดกระบอกเอนกประสงค์ Bullet IP Camera 4MP (${brand})`,
      quantity: requirements.cameraCount,
      unit: "ตัว",
      unitPrice: 1800,
      category: "hardware"
    });
  }

  // 2. NVR
  let nvrUnitPrice = 3500;
  if (requirements.nvrChannels <= 4) nvrUnitPrice = 3200;
  else if (requirements.nvrChannels <= 8) nvrUnitPrice = 4500;
  else if (requirements.nvrChannels <= 16) nvrUnitPrice = 6800;
  else if (requirements.nvrChannels <= 32) nvrUnitPrice = 11900;
  else nvrUnitPrice = 24900;

  items.push({
    id: "bom-nvr",
    name: `เครื่องบันทึกภาพกล้องวงจรปิด NVR ${requirements.nvrChannels}CH (แบรนด์เดียวกับกล้อง: ${brand})`,
    quantity: 1,
    unit: "เครื่อง",
    unitPrice: nvrUnitPrice,
    category: "hardware"
  });

  // 3. Storage HDD
  let hddPrice = 4200;
  let hddQuantity = 1;
  let hddName = "ฮาร์ดดิสก์สำหรับบันทึกภาพกล้องวงจรปิด 4TB";

  if (requirements.nvrChannels <= 4) {
    hddPrice = 4200;
    hddQuantity = 1;
    hddName = "ฮาร์ดดิสก์ 4TB";
  } else if (requirements.nvrChannels <= 8) {
    hddPrice = 8500;
    hddQuantity = 1;
    hddName = "ฮาร์ดดิสก์ 8TB";
  } else if (requirements.nvrChannels <= 16) {
    hddPrice = 8500;
    hddQuantity = 2;
    hddName = "ฮาร์ดดิสก์ 8TB x 2 ลูก";
  } else if (requirements.nvrChannels <= 32) {
    hddPrice = 8500;
    hddQuantity = 4;
    hddName = "ฮาร์ดดิสก์ 8TB x 4 ลูก";
  } else {
    hddPrice = 8500;
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
      let price = 2500;
      if (poleType.includes("4 เมตร")) price = 3500;
      else if (poleType.includes("6 เมตร")) price = 5500;
      else if (poleType.includes("กัลวาไนซ์")) price = 4800;

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
        unitPrice: 850,
        category: "accessory"
      });
    }
  }

  // 5. Cables and pipes
  const camCount = hasSurvey ? cameraPoints.length : requirements.cameraCount;
  const rawCableMeters = camCount * 35; // average 35 meters per camera
  items.push({
    id: "bom-cable-lan",
    name: "สายสัญญาณ LINK CAT6 Outdoor Double Jacket ชิลด์กันน้ำและสัญญาณรบกวน",
    quantity: rawCableMeters,
    unit: "เมตร",
    unitPrice: 35,
    category: "accessory"
  });

  items.push({
    id: "bom-pipe-upvc",
    name: "ท่อร้อยสายสัญญาณ UPVC ตราช้าง สีขาว กันไฟลาม กันรังสียูวีดัดโค้งขนาด 20mm",
    quantity: Math.ceil(rawCableMeters / 3.0), // 3 meter per pipe
    unit: "ท่อ",
    unitPrice: 65,
    category: "accessory"
  });

  // 6. PoE Switch/Power
  const poePorts = camCount <= 4 ? 4 : camCount <= 8 ? 8 : camCount <= 16 ? 16 : 24;
  items.push({
    id: "bom-poe",
    name: `สวิตช์จ่ายไฟผ่านสายแลน PoE Switch Giga Speed เกรดอุสาหกรรม (${poePorts} Ports)`,
    quantity: Math.max(1, Math.ceil(camCount / poePorts)),
    unit: "เครื่อง",
    unitPrice: camCount <= 4 ? 1800 : camCount <= 8 ? 3200 : camCount <= 16 ? 5800 : 9500,
    category: "hardware"
  });

  // 7. Labor Installation
  items.push({
    id: "bom-labor-install",
    name: "ค่าบริการติดตั้งกล้อง เซ็ตระบบบันทึก และบันทึกบัญชีออนไลน์ผ่านคลาวด์",
    quantity: camCount,
    unit: "จุด",
    unitPrice: 1200,
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
        unitPrice: 1500,
        category: "labor"
      });
    }
  }

  return items;
}

export default function App() {
  const [step, setStep] = useState<number>(1);
  const [projectsList, setProjectsList] = useState<ProjectSurvey[]>([]);
  
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

  // Load project history on mount (Hybrid Cloud & Local Storage)
  const loadSavedProjects = async () => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Failed to fetch from Supabase:", error.message);
        } else if (data) {
          const parsed = data as ProjectSurvey[];
          setProjectsList(parsed);
          if (parsed.length > 0) {
            loadProject(parsed[0]);
          }
          return;
        }
      } catch (err) {
        console.error("Supabase load failed, falling back to LocalStorage:", err);
      }
    }

    // LocalStorage Fallback (if Supabase not configured or failed)
    const localData = localStorage.getItem("cctv_surveys_data");
    if (localData) {
      try {
        const parsed = JSON.parse(localData) as ProjectSurvey[];
        setProjectsList(parsed);
        if (parsed.length > 0) {
          loadProject(parsed[0]);
        }
      } catch (err) {
        console.error("Failed to parse existing local survey history:", err);
      }
    }
  };

  useEffect(() => {
    loadSavedProjects();
  }, []);

  // Sync state when step changes (specifically regenerating pricing items on entering summary or pricing)
  useEffect(() => {
    if (step === 3) {
      // Step 3 is now System Specs (originally Step 2)
      // Automatically calculate recommended NVR channels based on camera count
      const count = cameraPoints.length;
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
      const regenerated = generatePricingItems(requirements, hasSurveyReport, cameraPoints);
      
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
      status: "draft"
    };

    let updatedList: ProjectSurvey[] = [];
    if (projectsList.some(p => p.id === freshId)) {
      updatedList = projectsList.map(p => p.id === freshId ? formattedProject : p);
    } else {
      updatedList = [formattedProject, ...projectsList];
    }

    setProjectsList(updatedList);
    setActiveProjectId(freshId);

    // Save to Supabase Cloud if configured
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from("projects")
          .upsert(formattedProject);

        if (error) {
          console.error("Supabase Save Error:", error.message);
          alert("❌ ไม่สามารถสำรองข้อมูลลงระบบคลาวด์ได้: " + error.message);
        }
      } catch (err) {
        console.error("Supabase Save Exception:", err);
      }
    }

    // Always back up to LocalStorage (offline-first!)
    localStorage.setItem("cctv_surveys_data", JSON.stringify(updatedList));
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
              alert("❌ ไม่สามารถลบข้อมูลบนระบบคลาวด์ได้: " + error.message);
            }
          } catch (err) {
            console.error("Supabase Delete Exception:", err);
          }
        }

        // Update LocalStorage
        localStorage.setItem("cctv_surveys_data", JSON.stringify(updated));
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

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] flex flex-col font-sans" id="applet-primary-layout">
      
      {/* Top Professional Header Navigation - Apple Translucent style */}
      <header className="bg-white border-b border-zinc-200 py-3 px-6 shrink-0 shadow-xs relative z-40 w-full">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md transition-transform hover:scale-105 relative overflow-hidden border border-zinc-200 p-0.5">
              <img 
                src="/icon.png" 
                alt="NT Cyfence Logo" 
                className="w-full h-full object-contain hidden"
                id="header-logo-image"
                onError={(e) => {
                  const target = e.currentTarget;
                  // If /icon.png fails to load, try /logo.png
                  if (target.src.includes("/icon.png")) {
                    target.src = "/logo.png";
                  } else {
                    // Both failed, hide image and show fallback SVG
                    target.classList.add("hidden");
                    document.getElementById("logo-fallback-container")?.classList.remove("hidden");
                  }
                }}
                onLoad={(e) => {
                  e.currentTarget.classList.remove("hidden");
                  document.getElementById("logo-fallback-container")?.classList.add("hidden");
                }}
              />
              <div 
                id="logo-fallback-container" 
                className="absolute inset-0 bg-zinc-950 flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
                <svg className="w-5.5 h-5.5 text-white relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 9h6v4H9z" fill="currentColor" stroke="currentColor" strokeWidth="1" className="text-white/20" />
                  <path d="M15 11l3-2v4l-3-2z" fill="currentColor" stroke="currentColor" strokeWidth="1" className="text-white/20" strokeLinejoin="round" />
                  <circle cx="12" cy="11" r="1" fill="#0071e3" stroke="#0071e3" strokeWidth="1.5" />
                </svg>
              </div>
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

          {/* User Badge with Current Time */}
          <div className="flex items-center gap-3 text-xs font-normal text-zinc-600">
            <div className="flex items-center gap-1.5 bg-zinc-100/80 px-2.5 py-1.5 rounded-lg border border-zinc-200/40">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span className="font-mono text-[10px] font-medium text-zinc-700">2026-05-22 UTC</span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-100/80 px-2.5 py-1 rounded-lg border border-zinc-200/40">
              <div className="w-6 h-6 rounded-full bg-[#0071e3] text-center flex items-center justify-center font-bold text-white uppercase text-[10px]">
                {customerInfo.surveyorName?.substring(0, 2) || "SV"}
              </div>
              <div className="text-left leading-none">
                <span className="block text-zinc-400 text-[9px] uppercase font-semibold">Surveyor</span>
                <span className="text-[11px] font-semibold text-zinc-800">{customerInfo.surveyorName || "ผู้สำรวจระบบ"}</span>
              </div>
            </div>
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

                return (
                  <div
                    key={stepUnit.number}
                    className={`flex items-center gap-1.5 text-xs font-medium ${
                      isSurveyIgnored ? "opacity-25 line-through" : ""
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                        isCurrent
                          ? "bg-[#0071e3] text-white"
                          : isPassed
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          : "bg-zinc-100 text-zinc-400 border border-zinc-200/50"
                      }`}
                    >
                      {isPassed ? "✓" : stepUnit.number}
                    </div>
                    <span
                      className={`text-[11px] ${
                        isCurrent
                          ? "text-[#0071e3] font-semibold"
                          : isPassed
                          ? "text-zinc-650"
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
                  />
                )}

                {step === 3 && (
                  <Step2CameraRequirements
                    data={requirements}
                    onChange={setRequirements}
                    onNext={handleNextStep}
                    onPrev={handlePrevStep}
                    cameraCount={cameraPoints.length}
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
                    showConfirm={showConfirm}
                    onGoToStep1={() => setStep(1)}
                    cameraPoints={cameraPoints}
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
          <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-md flex items-center justify-center p-4 z-[9999] select-none font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-zinc-200/50 space-y-4"
            >
              <div className="text-center space-y-2">
                <h4 className="text-sm font-extrabold text-zinc-900 tracking-tight leading-snug">
                  {confirmModal.title}
                </h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  {confirmModal.message}
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    confirmModal.onCancel?.();
                  }}
                  className="grow py-2.5 font-bold text-xs bg-zinc-100 hover:bg-zinc-150 active:bg-zinc-200 text-zinc-655 rounded-xl transition-all cursor-pointer border border-zinc-250/30"
                >
                  {confirmModal.cancelText || "ยกเลิก"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    confirmModal.onConfirm();
                  }}
                  className="grow py-2.5 font-bold text-xs bg-zinc-900 hover:bg-zinc-850 active:bg-black text-white rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  {confirmModal.confirmText || "ยืนยัน"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
