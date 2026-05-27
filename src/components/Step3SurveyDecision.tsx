import React from "react";
import { ArrowLeft, ArrowRight, ClipboardCopy, MapPinned, FileSpreadsheet, Eye } from "lucide-react";

interface Step3Props {
  hasSurveyReport: boolean;
  onSelect: (hasSurvey: boolean) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Step3SurveyDecision({ hasSurveyReport, onSelect, onNext, onPrev }: Step3Props) {
  
  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4" id="step3-container">
      <div className="text-center space-y-2">
        <h3 className="text-base font-bold text-gray-900">
          ต้องการทำบันทึกรายงานสำรวจหน้างาน (Survey Report) หรือไม่?
        </h3>
        <p className="text-sm text-gray-600 max-w-md mx-auto leading-normal">
          การทำ Survey Report จะช่วยให้คุณปักหมุดมุมกล้องวงจรปิดบนพิมพ์เขียว ระบุชนิดเสารองรับ รวมถึงเพิ่มรูปถ่ายแต่ละจุดได้ละเอียดสูงสุด
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Choice 1: Record Survey Report */}
        <div
          id="choice-survey-yes"
          onClick={() => onSelect(true)}
          className={`relative p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between h-56 ${
            hasSurveyReport
              ? "border-gray-900 bg-gray-50 ring-2 ring-gray-900/10 font-medium"
              : "bg-white border-gray-200 hover:border-gray-900"
          }`}
        >
          <div className="space-y-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              hasSurveyReport 
                ? "bg-gray-900 text-white" 
                : "bg-gray-100 text-gray-600"
            }`}>
              <MapPinned className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-950">
                ต้องการทำ Survey Report 📝
              </h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                ทำผังการติดตั้งโดยปักจุดกล้องวงจรปิดบนแผนที่ ระบุประเภทเสาเหล็ก แขนค้ำกล้อง และแนบภาพจริงประกอบแต่ละจุด
              </p>
            </div>
          </div>
          <div className="text-xs font-semibold text-gray-900 mt-2 flex items-center gap-1">
            <span>สำหรับทีมวิศวกรและผู้ชำนาญการ</span>
          </div>

          {hasSurveyReport && (
            <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-gray-900 text-white flex items-center justify-center text-[9px] font-bold">
              ✓
            </div>
          )}
        </div>

        {/* Choice 2: Direct estimation (Skip Survey) */}
        <div
          id="choice-survey-no"
          onClick={() => onSelect(false)}
          className={`relative p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between h-56 ${
            !hasSurveyReport
              ? "border-gray-900 bg-gray-50 ring-2 ring-gray-900/10 font-medium"
              : "bg-white border-gray-200 hover:border-gray-900"
          }`}
        >
          <div className="space-y-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              !hasSurveyReport 
                ? "bg-gray-900 text-white" 
                : "bg-gray-100 text-gray-600"
            }`}>
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-950">
                ประเมินราคาเสร็จสมบูรณ์ทันที ⚡
              </h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                ข้ามขั้นตอนการเพิ่มรูปสำรวจกล้องรายจุด โดยคำนวณสเปกและชุดสายส่งข้อมูลจากสถิติเฉลี่ยหน้างานทันที ด้วยวิธีเร่งด่วน
              </p>
            </div>
          </div>
          <div className="text-xs font-medium text-gray-400 mt-2">
            <span>เหมาะกับกรณีเสนอราคางบประมาณชั้นต้น</span>
          </div>

          {!hasSurveyReport && (
            <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-gray-900 text-white flex items-center justify-center text-[9px] font-bold">
              ✓
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6"></div>

      {/* Action buttons */}
      <div className="flex justify-between" id="step3-actions">
        <button
          type="button"
          onClick={onPrev}
          className="blocks-btn-secondary"
        >
          ย้อนกลับ
        </button>

        <button
          type="button"
          onClick={onNext}
          className="blocks-btn-primary inline-flex items-center gap-1.5"
        >
          {hasSurveyReport ? "ไปขั้นตอนตั้งจุดกล้องและประเภทเสา ✏️" : "ข้ามไปดูหน้ารายการราคาและสรุปงาน 💰"}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
