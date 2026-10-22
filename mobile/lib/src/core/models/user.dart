/// Mô hình người dùng cho hệ thống HRM On-Premises.
class UserModel {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String role; // 'admin', 'manager', 'staff'
  final String roleTitle;

  /// Chi nhánh được gán cho nhân sự (Admin và Manager cũng thuộc chi nhánh/HQ).
  final String? assignedBranchId;

  /// Thông tin cá nhân & Địa chỉ cư trú (đồng bộ hệ thống)
  final String gender;
  final String birthDate;
  final String province;
  final String ward;
  final String street;

  /// Thông tin Căn cước công dân (CCCD)
  final String cccd;
  final String issueDate;
  final String issuePlace;

  /// Cấu hình tính lương & Tài khoản ngân hàng
  final String salaryType; // 'hourly' (Lương theo giờ) hoặc 'monthly' (Lương cơ bản tháng)
  final double hourlySalary; // VNĐ/giờ (khi checkout ca sẽ nhân số giờ làm)
  final double baseSalary; // VNĐ/tháng (cố định, checkout không cộng giờ, chỉ trừ khi phạt)
  final String bankName; // Tên ngân hàng nhận lương
  final String bankAccountNumber; // Số tài khoản ngân hàng
  final String bankAccountName; // Tên chủ tài khoản

  const UserModel({
    this.id = '1',
    required this.name,
    required this.email,
    this.phone = '0912345678',
    required this.role,
    required this.roleTitle,
    this.assignedBranchId = '01',
    this.gender = 'Nữ',
    this.birthDate = '24/08/1999',
    this.province = 'Hà Nội',
    this.ward = 'Phường Hàng Bài',
    this.street = '15 Phố Hàng Bài, Q. Hoàn Kiếm',
    this.cccd = '001199014567',
    this.issueDate = '10/05/2021',
    this.issuePlace = 'Cục CS QLHC về TTXH',
    this.salaryType = 'hourly',
    this.hourlySalary = 35000.0,
    this.baseSalary = 8500000.0,
    this.bankName = 'VietinBank',
    this.bankAccountNumber = '108876543210',
    this.bankAccountName = 'NGUYEN THU HA',
  });

  bool get isAdmin => role == 'admin';
  bool get isManager => role == 'manager';
  bool get isStaff => role == 'staff' || role == 'employee';
  bool get canManage => isAdmin || isManager;
  bool get isHourlySalary => salaryType == 'hourly';
}
