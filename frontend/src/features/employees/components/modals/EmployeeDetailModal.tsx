"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faCheck,
  faXmark,
  faUser,
  faBuilding,
  faPhone,
  faEnvelope,
  faIdCard,
  faBriefcase,
  faCalendarDay,
  faMoneyBillWave,
  faShieldHalved,
  faBuildingColumns,
  faCreditCard,
  faClock,
  faInfoCircle,
  faLocationDot,
  faHouse,
  faImage,
  faCamera,
  faStore,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Form";
import Badge, { StatusBadge } from "@/components/ui/Badge";
import { branches, departments } from "@/mock-data/portal";
import type { Employee, UserRole } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSave?: (updated: Employee) => void;
  isManager?: boolean;
  managerBranch?: string;
}

const COMMON_BANKS = [
  "Vietcombank",
  "VietinBank",
  "BIDV",
  "Techcombank",
  "MBBank",
  "Agribank",
  "VPBank",
  "ACB",
  "TPBank",
  "Sacombank",
  "HDBank",
  "VIB",
];

type DetailTab = "profile" | "job" | "salary" | "cccd";

export default function EmployeeDetailModal({
  open,
  onClose,
  employee,
  onSave,
  isManager = false,
  managerBranch = "HN-1",
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>("profile");

  // 1. Hồ sơ cá nhân & Liên hệ
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("Nam");
  const [birthDate, setBirthDate] = useState("15/03/1998");

  // 2. Địa chỉ hiện tại
  const [province, setProvince] = useState("Hà Nội");
  const [ward, setWard] = useState("Phường Tràng Tiền");
  const [street, setStreet] = useState("12 Tràng Thi");

  // 3. Công tác & Phân quyền
  const [branch, setBranch] = useState("HN-1");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [systemRole, setSystemRole] = useState<UserRole>("staff");
  const [status, setStatus] = useState<"đang làm" | "vô hiệu hóa">("đang làm");
  const [joinDate, setJoinDate] = useState("01/01/2024");

  // 4. Tiền lương & Ngân hàng
  const [salaryType, setSalaryType] = useState<"hourly" | "monthly">("monthly");
  const [hourlySalary, setHourlySalary] = useState<number>(35_000);
  const [baseSalary, setBaseSalary] = useState<number>(8_500_000);
  const [bankName, setBankName] = useState("Vietcombank");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");

  // 5. Thông tin CCCD
  const [cccd, setCccd] = useState("079098012345");
  const [issueDate, setIssueDate] = useState("20/05/2021");
  const [issuePlace, setIssuePlace] = useState("Cục CS QLHC về TTXH");

  // Đồng bộ dữ liệu khi mở modal hoặc thay đổi employee
  useEffect(() => {
    if (employee) {
      setName(employee.name);
      setPhone(employee.phone);
      setEmail(employee.email);
      setGender(employee.gender || "Nam");
      setBirthDate(employee.birthDate || "15/03/1998");

      setProvince(employee.province || "Hà Nội");
      setWard(employee.ward || "Phường Tràng Tiền");
      setStreet(employee.street || "12 Tràng Thi");

      setBranch(employee.branch);
      setDepartment(employee.department || departments[0]?.name || "Phòng Vận Hành");
      setRole(employee.role);
      setSystemRole(employee.systemRole || "staff");
      setStatus(employee.status);
      setJoinDate(employee.joinDate || "01/01/2024");

      setSalaryType(employee.salaryType || "monthly");
      setHourlySalary(employee.hourlySalary ?? 35_000);
      setBaseSalary(employee.baseSalary ?? 8_500_000);
      setBankName(employee.bankName || "Vietcombank");
      setBankAccountNumber(employee.bankAccountNumber || "108876543210");
      setBankAccountName(employee.bankAccountName || employee.name.toUpperCase());

      setCccd(employee.cccd || "079098012345");
      setIssueDate(employee.issueDate || "20/05/2021");
      setIssuePlace(employee.issuePlace || "Cục CS QLHC về TTXH");

      setIsEditing(false);
      setActiveTab("profile");
    }
  }, [employee, open]);

  if (!employee) return null;

  const handleCancelEdit = () => {
    // Hoàn tác về thông tin ban đầu
    setName(employee.name);
    setPhone(employee.phone);
    setEmail(employee.email);
    setGender(employee.gender || "Nam");
    setBirthDate(employee.birthDate || "15/03/1998");

    setProvince(employee.province || "Hà Nội");
    setWard(employee.ward || "Phường Tràng Tiền");
    setStreet(employee.street || "12 Tràng Thi");

    setBranch(employee.branch);
    setDepartment(employee.department || departments[0]?.name || "Phòng Vận Hành");
    setRole(employee.role);
    setSystemRole(employee.systemRole || "staff");
    setStatus(employee.status);
    setJoinDate(employee.joinDate || "01/01/2024");

    setSalaryType(employee.salaryType || "monthly");
    setHourlySalary(employee.hourlySalary ?? 35_000);
    setBaseSalary(employee.baseSalary ?? 8_500_000);
    setBankName(employee.bankName || "Vietcombank");
    setBankAccountNumber(employee.bankAccountNumber || "108876543210");
    setBankAccountName(employee.bankAccountName || employee.name.toUpperCase());

    setCccd(employee.cccd || "079098012345");
    setIssueDate(employee.issueDate || "20/05/2021");
    setIssuePlace(employee.issuePlace || "Cục CS QLHC về TTXH");

    setIsEditing(false);
  };

  const handleSave = () => {
    const updated: Employee = {
      ...employee,
      name,
      phone,
      email,
      gender,
      birthDate,
      province,
      ward,
      street,
      branch: isManager ? managerBranch : branch,
      department,
      role,
      systemRole,
      status,
      joinDate,
      salaryType,
      hourlySalary: Number(hourlySalary) || 0,
      baseSalary: Number(baseSalary) || 0,
      bankName,
      bankAccountNumber,
      bankAccountName: bankAccountName.trim().toUpperCase(),
      cccd,
      issueDate,
      issuePlace,
      cccdFront: true,
      cccdBack: true,
    };

    if (onSave) {
      onSave(updated);
    }
    setIsEditing(false);
  };

  const getSystemRoleLabel = (r: UserRole) => {
    switch (r) {
      case "admin":
        return "Quản trị viên (Admin)";
      case "manager":
        return "Quản lý Chi nhánh (Manager)";
      case "staff":
      default:
        return "Nhân viên (Staff)";
    }
  };

  const fullAddress = [street, ward, province].filter(Boolean).join(", ");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Chỉnh sửa hồ sơ nhân viên" : "Hồ sơ chi tiết nhân sự"}
      size="2xl"
      footer={
        isEditing ? (
          <>
            <Button variant="white" onClick={handleCancelEdit}>
              <FontAwesomeIcon icon={faXmark} className="mr-1.5" />
              Huỷ
            </Button>
            <Button onClick={handleSave}>
              <FontAwesomeIcon icon={faCheck} className="mr-1.5" />
              Lưu thay đổi
            </Button>
          </>
        ) : (
          <>
            <Button variant="white" onClick={onClose}>
              Đóng
            </Button>
            <Button onClick={() => setIsEditing(true)}>
              <FontAwesomeIcon icon={faPencil} className="mr-1.5" />
              Sửa
            </Button>
          </>
        )
      }
    >
      <div className="space-y-6">
        {/* ===================== HERO PROFILE CARD ===================== */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-50 via-white to-gray-50 border border-gray-200 p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4 min-w-0">
              {/* Avatar circle */}
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border-2 border-primary/20 text-primary flex items-center justify-center text-2xl font-black shadow-inner shrink-0">
                {employee.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight truncate">
                    {isEditing ? name || employee.name : employee.name}
                  </h3>
                  <StatusBadge status={isEditing ? status : employee.status} />
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                    {getSystemRoleLabel(isEditing ? systemRole : employee.systemRole)}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${
                      (isEditing ? salaryType : employee.salaryType) === "hourly"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-emerald-50 text-emerald-800 border-emerald-200"
                    }`}
                  >
                    {(isEditing ? salaryType : employee.salaryType) === "hourly"
                      ? "Lương theo giờ"
                      : "Lương cơ bản tháng"}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-x-4 gap-y-1 text-xs text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <strong className="text-gray-700">Mã NV:</strong>
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 font-semibold">
                      {employee.id}
                    </span>
                  </span>
                  <span>•</span>
                  <span>
                    Chi nhánh: <strong className="text-gray-800">{isEditing ? branch : employee.branch}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Phòng ban: <strong className="text-gray-800">{isEditing ? department : employee.department || "Chưa gán"}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Chức danh: <strong className="text-gray-800">{isEditing ? role : employee.role}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action / Status Tag */}
            <div className="shrink-0 flex items-center gap-2">
              {isEditing ? (
                <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faPencil} className="text-amber-600" />
                  Đang chỉnh sửa
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-dark transition-all text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <FontAwesomeIcon icon={faPencil} />
                  Sửa thông tin
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ===================== TABBED NAVIGATION ===================== */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-px" aria-label="Tabs">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`py-2.5 px-3.5 inline-flex items-center gap-2 border-b-2 font-semibold text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === "profile"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FontAwesomeIcon icon={faUser} />
              1. Hồ sơ cá nhân & Địa chỉ
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("job")}
              className={`py-2.5 px-3.5 inline-flex items-center gap-2 border-b-2 font-semibold text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === "job"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FontAwesomeIcon icon={faBuilding} />
              2. Công tác & Phân quyền
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("salary")}
              className={`py-2.5 px-3.5 inline-flex items-center gap-2 border-b-2 font-semibold text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === "salary"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FontAwesomeIcon icon={faMoneyBillWave} />
              3. Tiền lương & Ngân hàng
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("cccd")}
              className={`py-2.5 px-3.5 inline-flex items-center gap-2 border-b-2 font-semibold text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === "cccd"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FontAwesomeIcon icon={faIdCard} />
              4. Định danh CCCD
            </button>
          </nav>
        </div>

        {/* ===================== TAB CONTENT AREA ===================== */}

        {/* ----- TAB 1: HỒ SƠ CÁ NHÂN & ĐỊA CHỈ ----- */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            {!isEditing ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Khối 1: Thông tin cá nhân */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm">
                      <FontAwesomeIcon icon={faUser} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Thông tin cá nhân cơ bản</h4>
                      <p className="text-xs text-gray-500">Đồng bộ hồ sơ tài khoản hệ thống</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                      <span className="text-gray-500 text-xs">Họ và tên:</span>
                      <span className="font-bold text-gray-900 text-sm">{employee.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                      <span className="text-gray-500 text-xs">Giới tính:</span>
                      <span className="font-semibold text-gray-800 text-xs">
                        {employee.gender || "Nam"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                      <span className="text-gray-500 text-xs">Ngày sinh:</span>
                      <span className="font-semibold text-gray-800 text-xs">
                        {employee.birthDate || "15/03/1998"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                      <span className="text-gray-500 text-xs">Số điện thoại:</span>
                      <span className="font-mono font-semibold text-gray-900 text-xs">
                        {employee.phone}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-gray-500 text-xs">Email công việc:</span>
                      <span className="font-medium text-primary text-xs">{employee.email}</span>
                    </div>
                  </div>
                </div>

                {/* Khối 2: Địa chỉ hiện tại */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
                      <FontAwesomeIcon icon={faHouse} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Địa chỉ cư trú hiện tại</h4>
                      <p className="text-xs text-gray-500">Nơi ở và địa chỉ liên lạc thường trú</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                      <span className="text-gray-500 text-xs">Tỉnh / Thành phố:</span>
                      <span className="font-semibold text-gray-800 text-xs">
                        {employee.province || "Hà Nội"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                      <span className="text-gray-500 text-xs">Xã / Phường / Quận:</span>
                      <span className="font-semibold text-gray-800 text-xs">
                        {employee.ward || "Phường Tràng Tiền"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                      <span className="text-gray-500 text-xs">Số nhà / Tên đường:</span>
                      <span className="font-semibold text-gray-800 text-xs">
                        {employee.street || "12 Tràng Thi"}
                      </span>
                    </div>
                    <div className="pt-2">
                      <span className="text-gray-500 text-xs block mb-1">Địa chỉ đầy đủ:</span>
                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-800 flex items-start gap-2">
                        <FontAwesomeIcon icon={faLocationDot} className="text-primary mt-0.5" />
                        <span>{fullAddress || "Chưa cập nhật"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Edit mode Tab 1 */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <FontAwesomeIcon icon={faUser} /> Thông tin cá nhân
                  </h5>
                  <Field label="Họ và tên nhân viên" required>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Giới tính" required>
                      <Select value={gender} onChange={(e) => setGender(e.target.value)}>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </Select>
                    </Field>
                    <Field label="Ngày sinh" required>
                      <Input
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        placeholder="dd/mm/yyyy"
                      />
                    </Field>
                  </div>
                  <Field label="Số điện thoại" required>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0912345678"
                    />
                  </Field>
                  <Field label="Email công việc" required>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@company.com"
                    />
                  </Field>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                    <FontAwesomeIcon icon={faHouse} /> Địa chỉ cư trú
                  </h5>
                  <Field label="Tỉnh / Thành phố" required>
                    <Input
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      placeholder="Hà Nội / TP. Hồ Chí Minh / Đà Nẵng..."
                    />
                  </Field>
                  <Field label="Quận / Xã / Phường" required>
                    <Input
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      placeholder="Phường Tràng Tiền / Phường Hàng Bài..."
                    />
                  </Field>
                  <Field label="Số nhà / Tên đường" required>
                    <Input
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="12 Tràng Thi / 15 Phố Hàng Bài..."
                    />
                  </Field>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----- TAB 2: CÔNG TÁC & PHÂN QUYỀN ----- */}
        {activeTab === "job" && (
          <div className="space-y-6">
            {!isEditing ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Khối vị trí công tác */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm">
                      <FontAwesomeIcon icon={faBuilding} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Cơ cấu & Vị trí công tác</h4>
                      <p className="text-xs text-gray-500">Đơn vị chi nhánh và phòng ban trực thuộc</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                      <span className="text-gray-500 text-xs">Mã nhân viên (ID):</span>
                      <span className="font-mono font-bold text-gray-900 text-xs">{employee.id}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                      <span className="text-gray-500 text-xs">Chi nhánh làm việc:</span>
                      <span className="font-semibold text-primary text-xs">
                        {employee.branch}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                      <span className="text-gray-500 text-xs">Phòng ban:</span>
                      <span className="font-semibold text-gray-800 text-xs">
                        {employee.department || "Chưa gán"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-gray-500 text-xs">Vị trí chức danh:</span>
                      <span className="font-bold text-gray-900 text-xs">{employee.role}</span>
                    </div>
                  </div>
                </div>

                {/* Khối phân quyền hệ thống */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-sm">
                      <FontAwesomeIcon icon={faShieldHalved} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Phân quyền & Trạng thái</h4>
                      <p className="text-xs text-gray-500">Phạm vi thao tác trên cổng thông tin</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                      <span className="text-gray-500 text-xs">Cấp vai trò:</span>
                      <span className="font-bold text-purple-700 text-xs">
                        {getSystemRoleLabel(employee.systemRole)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                      <span className="text-gray-500 text-xs">Trạng thái hoạt động:</span>
                      <StatusBadge status={employee.status} />
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                      <span className="text-gray-500 text-xs">Ngày vào làm việc:</span>
                      <span className="font-semibold text-gray-800 text-xs">
                        {employee.joinDate || "01/01/2024"}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 text-xs text-purple-900 space-y-1.5">
                      <div className="font-bold flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faInfoCircle} className="text-purple-600" />
                        Phạm vi quyền hạn:
                      </div>
                      <p className="text-[11px] leading-relaxed text-purple-800">
                        {employee.systemRole === "admin"
                          ? "Toàn quyền quản trị tất cả các phân hệ, quản lý tất cả chi nhánh, cấu hình Wi-Fi, bảng lương và cổng SOAP Ngân hàng."
                          : employee.systemRole === "manager"
                          ? "Quản lý vận hành chi nhánh phụ trách: xếp ca, phê duyệt đề xuất đổi ca / nghỉ phép, giám sát quân số trực ca thời gian thực."
                          : "Thao tác cá nhân: xem ca làm, đăng ký ca tuần tới, chấm công Wi-Fi chi nhánh, xin đổi ca và xem phiếu lương."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Edit mode Tab 2 */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <FontAwesomeIcon icon={faBuilding} /> Vị trí công tác
                  </h5>
                  <Field label="Chi nhánh làm việc" required>
                    {isManager ? (
                      <div className="px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm font-bold text-gray-800 flex items-center justify-between">
                        <span>{managerBranch}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-primary-50 text-primary border border-primary-200">
                          Cố định theo quản lý
                        </span>
                      </div>
                    ) : (
                      <Select value={branch} onChange={(e) => setBranch(e.target.value)}>
                        {branches.map((b) => (
                          <option key={b.id} value={b.slug.toUpperCase()}>
                            {b.name} ({b.slug.toUpperCase()})
                          </option>
                        ))}
                      </Select>
                    )}
                  </Field>

                  <Field label="Phòng ban trực thuộc" required>
                    <Select value={department} onChange={(e) => setDepartment(e.target.value)}>
                      {departments.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Vị trí / Chức vụ" required>
                    <Input
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Nhân viên kinh doanh / Thu ngân..."
                    />
                  </Field>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-2">
                    <FontAwesomeIcon icon={faShieldHalved} /> Quyền hạn & Trạng thái
                  </h5>
                  <Field label="Cấp vai trò hệ thống" required>
                    <Select
                      value={systemRole}
                      onChange={(e) => setSystemRole(e.target.value as UserRole)}
                      disabled={isManager}
                    >
                      <option value="staff">Nhân viên (Staff)</option>
                      <option value="manager">Quản lý Chi nhánh (Manager)</option>
                      <option value="admin">Quản trị viên (Admin)</option>
                    </Select>
                  </Field>

                  <Field label="Trạng thái tài khoản" required>
                    <Select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as "đang làm" | "vô hiệu hóa")}
                    >
                      <option value="đang làm">Đang làm</option>
                      <option value="vô hiệu hóa">Vô hiệu hóa</option>
                    </Select>
                  </Field>

                  <Field label="Ngày vào làm việc" required>
                    <Input
                      value={joinDate}
                      onChange={(e) => setJoinDate(e.target.value)}
                      placeholder="01/01/2024"
                    />
                  </Field>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----- TAB 3: TIỀN LƯƠNG & NGÂN HÀNG ----- */}
        {activeTab === "salary" && (
          <div className="space-y-6">
            {!isEditing ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Khối cơ chế tính lương */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm">
                      <FontAwesomeIcon icon={faMoneyBillWave} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Cơ chế tiền lương & Chấm công</h4>
                      <p className="text-xs text-gray-500">Quy tắc tính thù lao khi hoàn thành ca làm</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                      <span className="text-gray-500 text-xs">Hình thức tính lương:</span>
                      <span className="font-bold text-gray-900 text-xs">
                        {employee.salaryType === "hourly"
                          ? "Lương theo giờ làm (Ca kíp)"
                          : "Lương cơ bản cố định (Theo tháng)"}
                      </span>
                    </div>

                    {employee.salaryType === "hourly" ? (
                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-gray-500 text-xs">Đơn giá giờ làm:</span>
                        <span className="font-bold text-amber-700 text-sm">
                          {(employee.hourlySalary ?? 35_000).toLocaleString("vi-VN")} ₫ / giờ
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-gray-500 text-xs">Lương cơ bản tháng:</span>
                        <span className="font-bold text-emerald-700 text-sm">
                          {(employee.baseSalary ?? 8_500_000).toLocaleString("vi-VN")} ₫ / tháng
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Khối tài khoản ngân hàng */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm">
                      <FontAwesomeIcon icon={faBuildingColumns} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Tài khoản Ngân hàng nhận lương</h4>
                      <p className="text-xs text-gray-500">Kết nối trực tiếp Cổng SOAP Chi lương</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                      <span className="text-gray-500 text-xs">Ngân hàng:</span>
                      <span className="font-bold text-gray-900 text-xs">
                        {employee.bankName || "Vietcombank"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                      <span className="text-gray-500 text-xs">Số tài khoản (STK):</span>
                      <span className="font-mono font-bold text-primary text-sm tracking-wider">
                        {employee.bankAccountNumber || "108876543210"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                      <span className="text-gray-500 text-xs">Chủ tài khoản:</span>
                      <span className="font-bold text-gray-900 text-xs tracking-wide">
                        {employee.bankAccountName || employee.name.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-gray-500 text-xs">Trạng thái giải ngân:</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                        Sẵn sàng chi trả tự động
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Edit mode Tab 3 */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-2">
                    <FontAwesomeIcon icon={faMoneyBillWave} /> Cấu hình cơ chế tiền lương
                  </h5>
                  <Field label="Hình thức tính lương" required>
                    <Select
                      value={salaryType}
                      onChange={(e) => setSalaryType(e.target.value as "hourly" | "monthly")}
                    >
                      <option value="hourly">Lương theo giờ (Cộng theo giờ khi checkout ca)</option>
                      <option value="monthly">Lương cơ bản tháng (Cố định, chỉ trừ khi phạt)</option>
                    </Select>
                  </Field>

                  {salaryType === "hourly" ? (
                    <Field label="Mức lương theo giờ (VNĐ/h)" required>
                      <Input
                        type="number"
                        value={hourlySalary}
                        onChange={(e) => setHourlySalary(Number(e.target.value))}
                        placeholder="35000"
                      />
                      <p className="text-[11px] text-amber-700 mt-1">
                        * Khi checkout, tiền công ca sẽ bằng: <strong>Số giờ làm × {Number(hourlySalary || 0).toLocaleString()} ₫</strong>
                      </p>
                    </Field>
                  ) : (
                    <Field label="Mức lương cơ bản tháng (VNĐ/tháng)" required>
                      <Input
                        type="number"
                        value={baseSalary}
                        onChange={(e) => setBaseSalary(Number(e.target.value))}
                        placeholder="8500000"
                      />
                    </Field>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <FontAwesomeIcon icon={faBuildingColumns} /> Tài khoản ngân hàng nhận lương
                  </h5>
                  <Field label="Tên ngân hàng" required>
                    <Select value={bankName} onChange={(e) => setBankName(e.target.value)}>
                      {COMMON_BANKS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Số tài khoản ngân hàng (STK)" required>
                    <Input
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      placeholder="108876543210"
                    />
                  </Field>

                  <Field label="Tên chủ tài khoản (In hoa không dấu)" required>
                    <Input
                      value={bankAccountName}
                      onChange={(e) => setBankAccountName(e.target.value.toUpperCase())}
                      placeholder="NGUYEN THU HA"
                    />
                  </Field>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----- TAB 4: ĐỊNH DANH CCCD ----- */}
        {activeTab === "cccd" && (
          <div className="space-y-6">
            {!isEditing ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Thông tin Căn cước công dân */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm">
                      <FontAwesomeIcon icon={faIdCard} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Thông tin Căn cước công dân</h4>
                      <p className="text-xs text-gray-500">Định danh cá nhân và giấy tờ tùy thân</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                      <span className="text-gray-500 text-xs">Số CCCD (12 chữ số):</span>
                      <span className="font-mono font-bold text-gray-900 text-sm tracking-wider">
                        {employee.cccd || "079098012345"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                      <span className="text-gray-500 text-xs">Ngày cấp:</span>
                      <span className="font-semibold text-gray-800 text-xs">
                        {employee.issueDate || "20/05/2021"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                      <span className="text-gray-500 text-xs">Nơi cấp:</span>
                      <span className="font-semibold text-gray-800 text-xs">
                        {employee.issuePlace || "Cục CS QLHC về TTXH"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                      <span className="text-gray-500 text-xs">Loại thẻ:</span>
                      <span className="font-semibold text-gray-800 text-xs">
                        Căn cước công dân gắn chip
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-gray-500 text-xs">Trạng thái định danh:</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold flex items-center gap-1">
                        <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                        Đã xác thực định danh
                      </span>
                    </div>
                  </div>
                </div>

                {/* Thẻ mô phỏng ảnh CCCD */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-sm">
                      <FontAwesomeIcon icon={faImage} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Bản chụp Căn cước công dân</h4>
                      <p className="text-xs text-gray-500">Hình ảnh 2 mặt chứng minh nhân sự</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Thẻ mặt trước */}
                    <div className="relative rounded-xl border border-gray-200 bg-gradient-to-br from-emerald-50/50 via-teal-50/30 to-blue-50/50 p-4 shadow-2xs flex flex-col justify-between h-36">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                          Mặt trước CCCD
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          ✓ Đã chụp
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-7 rounded bg-amber-200 border border-amber-300 flex items-center justify-center text-[10px] font-bold text-amber-800 shadow-2xs">
                          CHIP
                        </div>
                        <div className="min-w-0">
                          <p className="font-mono text-xs font-bold text-gray-900 truncate">
                            {employee.cccd || "079098012345"}
                          </p>
                          <p className="text-[10px] text-gray-500 truncate">{employee.name}</p>
                        </div>
                      </div>
                      <div className="text-[9px] text-gray-400 text-right">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                    </div>

                    {/* Thẻ mặt sau */}
                    <div className="relative rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 p-4 shadow-2xs flex flex-col justify-between h-36">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700">
                          Mặt sau CCCD
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          ✓ Đã chụp
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="h-4 bg-gray-200 rounded border border-gray-300 flex items-center px-2 text-[8px] font-mono text-gray-600">
                          |||| ||||| |||| |||||||| ||||
                        </div>
                        <p className="text-[9px] text-gray-500">
                          Cục CS QLHC về TTXH • {employee.issueDate || "20/05/2021"}
                        </p>
                      </div>
                      <div className="text-[9px] font-mono text-gray-400 truncate">
                        IDVNM079098012345&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Edit mode Tab 4 */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <FontAwesomeIcon icon={faIdCard} /> Thông tin số CCCD
                  </h5>
                  <Field label="Số CCCD (12 chữ số)" required>
                    <Input
                      value={cccd}
                      onChange={(e) => setCccd(e.target.value)}
                      placeholder="079098012345"
                    />
                  </Field>
                  <Field label="Ngày cấp" required>
                    <Input
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      placeholder="20/05/2021"
                    />
                  </Field>
                  <Field label="Nơi cấp" required>
                    <Input
                      value={issuePlace}
                      onChange={(e) => setIssuePlace(e.target.value)}
                      placeholder="Cục CS QLHC về TTXH"
                    />
                  </Field>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-teal-700 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCamera} /> Cập nhật ảnh CCCD 2 mặt
                  </h5>
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center hover:bg-gray-100 transition-colors cursor-pointer">
                      <FontAwesomeIcon icon={faCamera} className="text-gray-400 text-lg mb-1" />
                      <p className="text-xs font-semibold text-gray-700">Tải lên ảnh Mặt trước CCCD</p>
                      <p className="text-[10px] text-gray-400">Định dạng JPG, PNG dưới 5MB</p>
                    </div>
                    <div className="p-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center hover:bg-gray-100 transition-colors cursor-pointer">
                      <FontAwesomeIcon icon={faCamera} className="text-gray-400 text-lg mb-1" />
                      <p className="text-xs font-semibold text-gray-700">Tải lên ảnh Mặt sau CCCD</p>
                      <p className="text-[10px] text-gray-400">Định dạng JPG, PNG dưới 5MB</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
