"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faEye, faEyeSlash, faLock, faUserGear } from "@fortawesome/free-solid-svg-icons";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Field, Input, Checkbox } from "@/components/ui/Form";
import { useCurrentUser } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useCurrentUser();
  const [email, setEmail] = useState("admin@company.com");
  const [password, setPassword] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
    router.push("/dashboard/employees");
  };


  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <span className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-md">
              <FontAwesomeIcon icon={faUserGear} fontSize={28} />
            </span>
            <span className="text-2xl font-bold text-gray-800 tracking-tight">HRM System</span>
          </div>
          <h1 className="text-2xl font-semibold mb-1 text-gray-900">Đăng nhập Quản trị</h1>
          <p className="text-gray-500 text-sm">Cổng quản trị dành cho Ban Giám đốc & Quản lý Chi nhánh</p>
        </div>


        <div className="bg-white rounded-xl border border-gray-300 shadow-card p-6">
          <form onSubmit={handleLogin}>
            <Field label="Email tài khoản" required>
              <div className="relative">
                <FontAwesomeIcon icon={faEnvelope} fontSize={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="admin@company.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </Field>

            <Field label="Mật khẩu" required>
              <div className="relative">
                <FontAwesomeIcon icon={faLock} fontSize={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  aria-label="Hiện/ẩn mật khẩu"
                >
                  {showPassword ? <FontAwesomeIcon icon={faEyeSlash} fontSize={16} /> : <FontAwesomeIcon icon={faEye} fontSize={16} />}
                </button>
              </div>
            </Field>

            <div className="flex items-center justify-between mb-5">
              <Checkbox label="Ghi nhớ đăng nhập" defaultChecked />
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-sm text-primary hover:underline cursor-pointer"
              >
                Quên mật khẩu?
              </button>
            </div>

            <Button type="submit" block size="lg">
              Đăng nhập hệ thống
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 HRM System — Hệ thống Quản lý Nhân sự nội bộ doanh nghiệp
        </p>
      </div>

      <Modal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        title="Quên mật khẩu"
        size="sm"
        footer={
          <>
            <Button variant="white" onClick={() => setForgotOpen(false)}>Hủy</Button>
            <Button onClick={() => setForgotOpen(false)}>Gửi liên kết đặt lại mật khẩu</Button>
          </>
        }
      >
        <Field label="Email" required>
          <Input type="email" placeholder="admin@company.com" />
        </Field>
      </Modal>
    </main>
  );
}
