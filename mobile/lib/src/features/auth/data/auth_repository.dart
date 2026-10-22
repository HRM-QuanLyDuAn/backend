import '../../../core/models/user.dart';
import 'mock_users.dart';

/// Tầng data cho Auth: phân giải user từ email nhập vào.
/// Sau này thay bằng gọi API/SOAP On-Premises mà không cần sửa UI.
class AuthRepository {
  const AuthRepository();

  /// Trả về [UserModel] tương ứng với email nhập. Mật khẩu mock là `123456`.
  UserModel resolveUser(String rawInput) {
    final input = rawInput.trim().toLowerCase();
    final email = rawInput.trim();
    final branchId = defaultBranch.id;

    if (input.contains('admin') || input.contains('giamdoc')) {
      return MockUsers.admin(email, branchId);
    }
    if (input.contains('quanly') || input.contains('manager')) {
      return MockUsers.manager(email, branchId);
    }
    return MockUsers.staff(email, branchId);
  }
}
