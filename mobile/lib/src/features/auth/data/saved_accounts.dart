import '../../../core/models/user.dart';

class SavedAccountsService {
  static final List<UserModel> _savedAccounts = [
    const UserModel(
      name: 'Trần Minh Tuấn',
      email: 'admin@company.com',
      phone: '0901999888',
      role: 'admin',
      roleTitle: 'Quản trị viên',
      assignedBranchId: '01',
      gender: 'Nam',
      birthDate: '12/10/1988',
      province: 'Hà Nội',
      ward: 'Phường Tràng Tiền',
      street: '25 Tràng Thi, Q. Hoàn Kiếm',
      cccd: '001088001234',
      issueDate: '15/04/2021',
      issuePlace: 'Cục CS QLHC về TTXH',
      salaryType: 'monthly',
      baseSalary: 25000000.0,
      hourlySalary: 100000.0,
      bankName: 'Vietcombank',
      bankAccountNumber: '0011009998888',
      bankAccountName: 'TRAN MINH TUAN',
    ),
    const UserModel(
      name: 'Vũ Thành Công',
      email: 'manager@company.com',
      phone: '0911223344',
      role: 'manager',
      roleTitle: 'Quản lý Chi nhánh',
      assignedBranchId: '01',
      gender: 'Nam',
      birthDate: '18/06/1992',
      province: 'Hà Nội',
      ward: 'Phường Phan Chu Trinh',
      street: '42 Lý Thường Kiệt, Q. Hoàn Kiếm',
      cccd: '001092005678',
      issueDate: '12/08/2021',
      issuePlace: 'Cục CS QLHC về TTXH',
      salaryType: 'monthly',
      baseSalary: 16000000.0,
      hourlySalary: 65000.0,
      bankName: 'VietinBank',
      bankAccountNumber: '102008899776',
      bankAccountName: 'VU THANH CONG',
    ),
    const UserModel(
      name: 'Nguyễn Thu Hà',
      email: 'nhanvien@company.com',
      phone: '0912345678',
      role: 'staff',
      roleTitle: 'Nhân viên',
      assignedBranchId: '01',
      gender: 'Nữ',
      birthDate: '24/08/1999',
      province: 'Hà Nội',
      ward: 'Phường Hàng Bài',
      street: '15 Phố Hàng Bài, Q. Hoàn Kiếm',
      cccd: '001199014567',
      issueDate: '10/05/2021',
      issuePlace: 'Cục CS QLHC về TTXH',
      salaryType: 'hourly',
      baseSalary: 0.0,
      hourlySalary: 35000.0,
      bankName: 'VietinBank',
      bankAccountNumber: '108876543210',
      bankAccountName: 'NGUYEN THU HA',
    ),
  ];

  static List<UserModel> getSavedAccounts() => List.unmodifiable(_savedAccounts);

  static void saveAccount(UserModel user) {
    _savedAccounts.removeWhere((a) => a.email.toLowerCase() == user.email.toLowerCase());
    _savedAccounts.insert(0, user);
  }

  static void removeAccount(String email) {
    _savedAccounts.removeWhere((a) => a.email.toLowerCase() == email.toLowerCase());
  }
}
