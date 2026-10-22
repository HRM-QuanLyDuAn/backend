import '../../../core/models/branch.dart';
import '../../../core/models/user.dart';

/// Mock users dùng cho môi trường thử nghiệm On-Premises (chưa có backend).
/// UI không hardcode user trực tiếp mà gọi qua [AuthRepository].
class MockUsers {
  static UserModel admin(String email, String branchId) {
    return UserModel(
      name: 'Trần Minh Tuấn',
      email: email,
      phone: '0901999888',
      role: 'admin',
      roleTitle: 'Quản trị viên',
      assignedBranchId: branchId,
      gender: 'Nam',
      birthDate: '12/10/1988',
      province: 'Hà Nội',
      ward: 'Phường Tràng Tiền',
      street: '25 Tràng Thi, Q. Hoàn Kiếm',
      cccd: '001088001234',
      issueDate: '15/04/2021',
      issuePlace: 'Cục CS QLHC về TTXH',
      bankName: 'Vietcombank',
      bankAccountNumber: '0011009998888',
      bankAccountName: 'TRAN MINH TUAN',
      salaryType: 'monthly',
      baseSalary: 25000000.0,
      hourlySalary: 100000.0,
    );
  }

  static UserModel manager(String email, String branchId) {
    return UserModel(
      name: 'Vũ Thành Công',
      email: email,
      phone: '0911223344',
      role: 'manager',
      roleTitle: 'Quản lý Chi nhánh',
      assignedBranchId: branchId,
      gender: 'Nam',
      birthDate: '18/06/1992',
      province: 'Hà Nội',
      ward: 'Phường Phan Chu Trinh',
      street: '42 Lý Thường Kiệt, Q. Hoàn Kiếm',
      cccd: '001092005678',
      issueDate: '12/08/2021',
      issuePlace: 'Cục CS QLHC về TTXH',
      bankName: 'VietinBank',
      bankAccountNumber: '102008899776',
      bankAccountName: 'VU THANH CONG',
      salaryType: 'monthly',
      baseSalary: 16000000.0,
      hourlySalary: 65000.0,
    );
  }

  static UserModel staff(String email, String branchId) {
    return UserModel(
      name: 'Nguyễn Thu Hà',
      email: email,
      phone: '0912345678',
      role: 'staff',
      roleTitle: 'Nhân viên',
      assignedBranchId: branchId,
      gender: 'Nữ',
      birthDate: '24/08/1999',
      province: 'Hà Nội',
      ward: 'Phường Hàng Bài',
      street: '15 Phố Hàng Bài, Q. Hoàn Kiếm',
      cccd: '001199014567',
      issueDate: '10/05/2021',
      issuePlace: 'Cục CS QLHC về TTXH',
      bankName: 'VietinBank',
      bankAccountNumber: '108876543210',
      bankAccountName: 'NGUYEN THU HA',
      salaryType: 'hourly',
      baseSalary: 0.0,
      hourlySalary: 35000.0,
    );
  }
}

/// Chi nhánh mặc định khi đăng nhập thử nghiệm.
Branch get defaultBranch => kBranches.first;
