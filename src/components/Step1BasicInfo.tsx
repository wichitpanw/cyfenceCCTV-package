import React, { useState } from "react";
import { User, MapPin, Calendar, Building, Phone, ArrowRight, Crosshair } from "lucide-react";
import { CustomerInfo } from "../types";

const THAI_PROVINCES = [
  "กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร", "ขอนแก่น", "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท", "ชัยภูมิ", "ชุมพร", "เชียงราย", "เชียงใหม่", "ตรัง", "ตราด", "ตาก", "นครนายก", "นครปฐม", "นครพนม", "นครราชสีมา", "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี", "นราธิวาส", "น่าน", "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี", "ประจวบคีรีขันธ์", "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา", "พังงา", "พัทลุง", "พิจิตร", "พิษณุโลก", "เพชรบุรี", "เพชรบูรณ์", "แพร่", "พะเยา", "ภูเก็ต", "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน", "ยโสธร", "ยะลา", "ร้อยเอ็ด", "ระนอง", "ระยอง", "ราชบุรี", "ลพบุรี", "ลำปาง", "ลำพูน", "เลย", "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ", "สมุทรสงคราม", "สมุทรสาคร", "สระแก้ว", "สระบุรี", "สิงห์บุรี", "สุโขทัย", "สุพรรณบุรี", "สุราษฎร์ธานี", "สุรินทร์", "หนองคาย", "หนองบัวลำภู", "อ่างทอง", "อำนาจเจริญ", "อุดรธานี", "อุตรดิตถ์", "อุทัยธานี", "อุบลราชธานี"
];

interface Step1Props {
  data: CustomerInfo;
  onChange: (data: CustomerInfo) => void;
  onNext: () => void;
  onAutofillFullTemplate?: (type: "factory" | "home" | "office" | "subdistrict") => void;
}

export default function Step1BasicInfo({ data, onChange, onNext, onAutofillFullTemplate }: Step1Props) {
  const [errorObj, setErrorObj] = useState<Partial<Record<keyof CustomerInfo, string>>>({});

  const validate = () => {
    const newErrors: Partial<Record<keyof CustomerInfo, string>> = {};
    if (!data.province || !data.province.trim()) newErrors.province = "กรุณาเลือกจังหวัด";
    if (!data.customerName.trim()) newErrors.customerName = "กรุณากรอกชื่อลูกค้า/บริษัท";
    if (!data.projectName.trim()) newErrors.projectName = "กรุณากรอกชื่อโครงการ";
    if (!data.surveyorName.trim()) newErrors.surveyorName = "กรุณากรอกชื่อพนักงานผู้รับผิดชอบ";
    
    setErrorObj(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  const getGeoLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onChange({
            ...data,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          });
        },
        (error) => {
          console.warn("GPS error:", error.message);
        }
      );
    } else {
      console.warn("Geolocation not supported");
    }
  };

  const autofillTemplate = (type: "factory" | "home" | "office" | "subdistrict") => {
    if (onAutofillFullTemplate) {
      onAutofillFullTemplate(type);
      return;
    }

    if (type === "factory") {
      onChange({
        customerName: "บริษัท ไทยรุ่งเรืองอุตสาหกรรม จำกัด",
        projectName: "ติดตั้งกล้องวงจรปิดรอบโรงงานและไลน์การผลิต",
        contactPerson: "คุณสมศักดิ์ รักดี (ผู้จัดการโรงงาน)",
        contactPhone: "089-123-4567",
        address: "789 หมู่ 4 นิคมอุตสาหกรรมบางปู ซอย 9 ตำบลแพรกษา อำเภอเมือง จังหวัดสมุทรปราการ",
        latitude: "13.541234",
        longitude: "100.623456",
        surveyorName: "สมชาย รักบริการ (ทีมเทคนิค)",
        surveyDate: new Date().toISOString().split("T")[0],
        province: "สมุทรปราการ",
      });
    } else if (type === "home") {
      onChange({
        customerName: "บ้านคุณหญิง เพ็ญศรี",
        projectName: "ติดตั้ง CCTV รอบบ้านจัดสรร 2 ชั้น",
        contactPerson: "คุณหญิง เพ็ญศรี",
        contactPhone: "081-987-6543",
        address: "123/45 หมู่บ้านแสนสิริ ซอย 12 ถนนสุขุมวิท 101 แขวงบางจาก เขตพระโขนง กรุงเทพฯ",
        latitude: "13.689654",
        longitude: "100.609123",
        surveyorName: "นารี ดวงดี (ฝ่ายขายพรีเมียม)",
        surveyDate: new Date().toISOString().split("T")[0],
        province: "กรุงเทพมหานคร",
      });
    } else if (type === "office") {
      onChange({
        customerName: "บริษัท ซิกม่า ดิจิทัล โซลูชั่นส์ บจก.",
        projectName: "ติดตั้งกล้อง CCTV และ Access Control ในออฟฟิศชั้น 15",
        contactPerson: "คุณวิภาวรรณ ฝ่ายบุคคล",
        contactPhone: "02-111-2222 ต่อ 104",
        address: "อาคารสาทรสแควร์ ชั้น 15 ถนนสาทรเหนือ แขวงสีลม เขตบางรัก กรุงเทพฯ",
        latitude: "13.723145",
        longitude: "100.528456",
        surveyorName: "สมรัก ดีเสมอ (เจ้าหน้าที่โครงการ)",
        surveyDate: new Date().toISOString().split("T")[0],
        province: "กรุงเทพมหานคร",
      });
    } else if (type === "subdistrict") {
      onChange({
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
      });
    }
  };

  return (
    <div className="space-y-6" id="step1-container">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Client primary details */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
              จังหวัดติดตั้ง <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <MapPin className="h-4 w-4" />
              </span>
              <select
                id="province-select"
                value={data.province || ""}
                onChange={(e) => onChange({ ...data, province: e.target.value })}
                className={`blocks-input appearance-none pl-10 pr-10 py-2.5 transition-all cursor-pointer ${
                  errorObj.province ? "border-red-500 ring-1 ring-red-500" : ""
                }`}
              >
                <option value="">-- เลือกจังหวัด --</option>
                {THAI_PROVINCES.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>
            {errorObj.province && (
              <p className="text-red-500 text-[11px] mt-1 font-medium">{errorObj.province}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
              ชื่อลูกค้า / บริษัท <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Building className="h-4 w-4" />
              </span>
              <input
                id="customer-name-input"
                type="text"
                placeholder="เช่น บริษัท ยอดรัก อุตสาหกรรม จำกัด"
                value={data.customerName}
                onChange={(e) => onChange({ ...data, customerName: e.target.value })}
                className={`w-full pl-9 pr-4 py-2 rounded-xl border text-sm bg-white border-gray-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0071e3] focus:border-[#0071e3] transition-all ${
                  errorObj.customerName ? "border-red-500 ring-1 ring-red-500" : ""
                }`}
              />
            </div>
            {errorObj.customerName && (
              <p className="text-red-500 text-[11px] mt-1 font-medium">{errorObj.customerName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
              ชื่อโครงการ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Building className="h-4 w-4" />
              </span>
              <input
                id="project-name-input"
                type="text"
                placeholder="เช่น โครงการติดตั้งกล้องโรงงานเฟสแรก"
                value={data.projectName}
                onChange={(e) => onChange({ ...data, projectName: e.target.value })}
                className={`w-full pl-9 pr-4 py-2 rounded-xl border text-sm bg-white border-gray-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0071e3] focus:border-[#0071e3] transition-all ${
                  errorObj.projectName ? "border-red-500 ring-1 ring-red-500" : ""
                }`}
              />
            </div>
            {errorObj.projectName && (
              <p className="text-red-500 text-[11px] mt-1 font-medium">{errorObj.projectName}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                บุคคลที่ติดต่อได้
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  id="contact-person-input"
                  type="text"
                  placeholder="เดฟ / จัดซื้อ"
                  value={data.contactPerson}
                  onChange={(e) => onChange({ ...data, contactPerson: e.target.value })}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm bg-white border-gray-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0071e3] focus:border-[#0071e3] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                เบอร์โทรศัพท์ติดต่อ
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  id="contact-phone-input"
                  type="text"
                  placeholder="เช่น 02-xxx-xxxx"
                  value={data.contactPhone}
                  onChange={(e) => onChange({ ...data, contactPhone: e.target.value })}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm bg-white border-gray-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0071e3] focus:border-[#0071e3] transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Address and GIS geolocation */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
              สถานที่ตั้งหน้างาน / ที่อยู่ติดตั้ง
            </label>
            <div className="relative">
              <span className="absolute top-2.5 left-3 flex items-start pointer-events-none text-gray-400">
                <MapPin className="h-4 w-4" />
              </span>
              <textarea
                id="address-input"
                rows={3}
                placeholder="เลขที่ หมู่บ้าน ซอย ถนน แขวง เขต จังหวัด..."
                value={data.address}
                onChange={(e) => onChange({ ...data, address: e.target.value })}
                className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm bg-white border-gray-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0071e3] focus:border-[#0071e3] transition-all"
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#0071e3]" />
                พิกัดภูมิศาสตร์ (GIS GPS)
              </span>
              <button
                type="button"
                onClick={getGeoLocation}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Crosshair className="w-3 h-3" />
                ตรวจสอบพิกัดปัจจุบัน
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] text-gray-400 mb-1 font-mono uppercase tracking-wide">Latitude (ละติจูด)</label>
                <input
                  id="latitude-input"
                  type="text"
                  placeholder="13.7563"
                  value={data.latitude}
                  onChange={(e) => onChange({ ...data, latitude: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border text-xs font-mono bg-white border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0071e3]"
                />
              </div>
              <div>
                <label className="block text-[9px] text-gray-400 mb-1 font-mono uppercase tracking-wide">Longitude (ลองจิจูด)</label>
                <input
                  id="longitude-input"
                  type="text"
                  placeholder="100.5018"
                  value={data.longitude}
                  onChange={(e) => onChange({ ...data, longitude: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border text-xs font-mono bg-white border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0071e3]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-150 pt-6"></div>

      {/* Surveyor responsibility details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
            พนักงานผู้รับผิดชอบ / ผู้สำรวจ <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <User className="h-4 w-4" />
            </span>
            <input
              id="surveyor-name-input"
              type="text"
              placeholder="ชื่อ-นามสกุล พนักงาน"
              value={data.surveyorName}
              onChange={(e) => onChange({ ...data, surveyorName: e.target.value })}
              className={`w-full pl-9 pr-4 py-2 rounded-xl border text-sm bg-white border-gray-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0071e3] focus:border-[#0071e3] transition-all ${
                errorObj.surveyorName ? "border-red-500 ring-1 ring-red-500" : ""
              }`}
            />
          </div>
          {errorObj.surveyorName && (
            <p className="text-red-500 text-[11px] mt-1 font-medium">{errorObj.surveyorName}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
            เบอร์โทรพนักงาน
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Phone className="h-4 w-4" />
            </span>
            <input
              id="surveyor-phone-input"
              type="text"
              placeholder="เช่น 081-234-5678"
              value={data.surveyorPhone || ""}
              onChange={(e) => onChange({ ...data, surveyorPhone: e.target.value })}
              className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm bg-white border-gray-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0071e3] focus:border-[#0071e3] transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
            ส่วนงาน / แผนก
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Building className="h-4 w-4" />
            </span>
            <input
              id="surveyor-department-input"
              type="text"
              placeholder="เช่น ฝ่ายขาย / วิศวกรรม"
              value={data.surveyorDepartment || ""}
              onChange={(e) => onChange({ ...data, surveyorDepartment: e.target.value })}
              className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm bg-white border-gray-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0071e3] focus:border-[#0071e3] transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-0">
        <div />
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
            วันที่สำรวจ / สรุปความต้องการ
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Calendar className="h-4 w-4" />
            </span>
            <input
              id="survey-date-input"
              type="date"
              value={data.surveyDate}
              onChange={(e) => onChange({ ...data, surveyDate: e.target.value })}
              className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm bg-white border-gray-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0071e3] focus:border-[#0071e3] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex justify-end pt-4" id="step1-actions-bar">
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          ถัดไป: สเปกอุปกรณ์กล้องและจุดบันทึก
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
