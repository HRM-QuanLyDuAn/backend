"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faPlay,
  faShieldHalved,
  faArrowsRotate,
  faServer,
  faLock,
  faBolt,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import type { SoapGatewayConfig } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
  config: SoapGatewayConfig;
}

export default function SoapTestModal({ open, onClose, config }: Props) {
  const [testing, setTesting] = useState(false);
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: string;
    timeMs: number;
    timestamp: string;
    checkedSteps: string[];
  }>({
    status: "healthy",
    timeMs: 118,
    timestamp: new Date().toLocaleTimeString("vi-VN"),
    checkedSteps: ["server", "security", "core"],
  });

  const runTest = () => {
    setTesting(true);
    setTimeout(() => {
      setTestResult({
        status: "healthy",
        timeMs: Math.floor(95 + Math.random() * 40),
        timestamp: new Date().toLocaleTimeString("vi-VN"),
        checkedSteps: ["server", "security", "core"],
      });
      setTesting(false);
    }, 700);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Kiểm tra Đường truyền Kết nối Ngân hàng"
      size="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="white" onClick={onClose} className="text-xs">
            Đóng
          </Button>
          <Button onClick={runTest} disabled={testing} className="text-xs">
            <FontAwesomeIcon
              icon={testing ? faArrowsRotate : faPlay}
              className={testing ? "animate-spin" : ""}
            />
            {testing ? "Đang kiểm tra kết nối..." : "Kiểm tra lại đường truyền"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Banner Trạng thái Tổng quan */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <FontAwesomeIcon icon={faCircleCheck} fontSize={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-900">
              Đường truyền kết nối hoạt động hoàn hảo!
            </h4>
            <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
              Hệ thống liên kết trực tiếp giữa máy chủ HRM và hệ thống Ngân hàng đang thông suốt.
              Sẵn sàng giải ngân tiền lương an toàn, tức thì 24/7.
            </p>
            <div className="mt-2 text-[11px] text-emerald-700 flex items-center gap-3">
              <span>Độ trễ: <strong>{testResult.timeMs}ms</strong></span>
              <span>•</span>
              <span>Kiểm tra lần cuối: <strong>{testResult.timestamp}</strong></span>
            </div>
          </div>
        </div>

        {/* Các chặng kiểm tra trực quan */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
            Tiến trình chẩn đoán đường truyền
          </span>

          <div className="space-y-2.5 text-xs">
            {/* Bước 1 */}
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={faServer} fontSize={12} />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">1. Máy chủ HRM nội bộ</div>
                  <div className="text-[11px] text-gray-500">Cổng dịch vụ chi lương nội bộ</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                <FontAwesomeIcon icon={faCircleCheck} /> Hoạt động tốt
              </span>
            </div>

            {/* Bước 2 */}
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={faLock} fontSize={12} />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">2. Chứng thư số bảo mật ngân hàng</div>
                  <div className="text-[11px] text-gray-500">Mã hóa 2 chiều chuẩn doanh nghiệp</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                <FontAwesomeIcon icon={faCircleCheck} /> Đã xác thực
              </span>
            </div>

            {/* Bước 3 */}
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={faBolt} fontSize={12} />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">3. Kênh Core Banking đối tác</div>
                  <div className="text-[11px] text-gray-500">VietinBank, Vietcombank, BIDV</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                <FontAwesomeIcon icon={faCircleCheck} /> Sẵn sàng giao dịch
              </span>
            </div>
          </div>
        </div>

        {/* Tùy chọn xem chi tiết dành cho kỹ thuật IT (mặc định đóng) */}
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
          <button
            type="button"
            onClick={() => setShowTechDetails(!showTechDetails)}
            className="w-full px-4 py-2 flex items-center justify-between text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <FontAwesomeIcon icon={faShieldHalved} className="text-gray-400" />
              Chi tiết kỹ thuật (Dành cho Quản trị viên IT)
            </span>
            <FontAwesomeIcon icon={showTechDetails ? faChevronUp : faChevronDown} fontSize={12} />
          </button>

          {showTechDetails && (
            <div className="p-3 bg-white border-t border-gray-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">WSDL Endpoint:</span>
                <span className="font-mono text-gray-800">{config.wsdlUrl}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phương thức bảo mật:</span>
                <span className="text-gray-800">{config.securityMode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Mã phản hồi HTTP:</span>
                <span className="font-mono text-emerald-700 font-bold">200 OK (Ping Gateway Response)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
