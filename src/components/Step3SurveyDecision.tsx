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
        <h3 className="text-lg font-semibold text-zinc-900 font-sans">
          ต้องการทำบันทึกรายงานสำรวจหน้างาน (Survey Report) หรือไม่?
        </h3>
        <p className="text-xs text-zinc-500 max-w-md mx-auto leading-normal">
          การทำ Survey Report จะช่วยให้คุณปักหมุดมุมกล้องวงจรปิดบนพิมพ์เขียว ระบุชนิดเสารองรับ รวมถึงเพิ่มรูปถ่ายแต่ละจุดได้ละเอียดสูงสุด
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Choice 1: Record Survey Report */}
        <div
          id="choice-survey-yes"
          onClick={() => onSelect(true)}
          className={`relative p-5 rounded-2xl border text-left cursor-pointer transition-all duration-350 flex flex-col justify-between h-56 shadow-2xs ${
            hasSurveyReport
              ? "bg-zinc-50 border-zinc-900"
              : "bg-white border-zinc-200 hover:border-zinc-400"
          }`}
        >
          <div className="space-y-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              hasSurveyReport 
                ? "bg-zinc-950 text-white" 
                : "bg-zinc-100 text-zinc-650"
            }`}>
              <MapPinned className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-zinc-850">
                ต้องการทำ Survey Report 📝
              </h4>
              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                ทำผังการติดตั้งโดยปักจุดกล้องวงจรปิดบนแผนที่ ระบุประเภทเสาเหล็ก แขนค้ำกล้อง และแนบภาพจริงประกอบแต่ละจุด
              </p>
            </div>
          </div>
          <div className="text-[10px] font-medium text-[#0071e3] mt-2 flex items-center gap-1">
            <span>สำหรับทีมวิศวกรและผู้ชำนาญการ</span>
          </div>

          {hasSurveyReport && (
            <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-[#0071e3] text-white flex items-center justify-center text-[9px] font-bold">
              ✓
            </div>
          )}
        </div>

        {/* Choice 2: Direct estimation (Skip Survey) */}
        <div
          id="choice-survey-no"
          onClick={() => onSelect(false)}
          className={`relative p-5 rounded-2xl border text-left cursor-pointer transition-all duration-350 flex flex-col justify-between h-56 shadow-2xs ${
            !hasSurveyReport
              ? "bg-zinc-50 border-zinc-900"
              : "bg-white border-zinc-200 hover:border-zinc-400"
          }`}
        >
          <div className="space-y-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              !hasSurveyReport 
                ? "bg-zinc-950 text-white" 
                : "bg-zinc-100 text-zinc-650"
            }`}>
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-zinc-850">
                ประเมินราคาเสร็จสมบูรณ์ทันที ⚡
              </h4>
              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                ข้ามขั้นตอนการเพิ่มรูปสำรวจกล้องรายจุด โดยคำนวณสเปกและชุดสายส่งข้อมูลจากสถิติเฉลี่ยหน้างานทันที ด้วยวิธีเร่งด่วน
              </p>
            </div>
          </div>
          <div className="text-[10px] font-medium text-zinc-400 mt-2">
            <span>เหมาะกับกรณีเสนอราคางบประมาณชั้นต้น</span>
          </div>

          {!hasSurveyReport && (
            <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-[#0071e3] text-white flex items-center justify-center text-[9px] font-bold">
              ✓
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-zinc-100 pt-6"></div>

      {/* Action buttons */}
      <div className="flex justify-between" id="step3-actions">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-1 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium rounded-xl border border-zinc-250 transition-all cursor-pointer"
        >
          ย้อนกลับ
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          {hasSurveyReport ? "ไปขั้นตอนตั้งจุดกล้องและประเภทเสา ✏️" : "ข้ามไปดูหน้ารายการราคาและสรุปงาน 💰"}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
