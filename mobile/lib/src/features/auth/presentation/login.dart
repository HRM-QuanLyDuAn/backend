import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/colors.dart';
import '../../../core/state/branch_scope.dart';
import '../../../core/state/user_scope.dart';
import '../data/auth_repository.dart';
import '../data/mock_users.dart' as mock_data;

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _usernameController =
      TextEditingController(text: 'admin@company.com');
  final TextEditingController _passwordController =
      TextEditingController(text: '123456');
  bool _obscurePassword = true;
  bool _rememberMe = true;


  void _login() {
    final input = _usernameController.text.trim().toLowerCase();
    final password = _passwordController.text;

    if (input.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng nhập Email hoặc SĐT đăng nhập')),
      );
      return;
    }

    if (password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng nhập mật khẩu')),
      );
      return;
    }

    final initialBranch = mock_data.defaultBranch;
    BranchScope.select(context, initialBranch);

    const authRepository = AuthRepository();
    final user = authRepository.resolveUser(_usernameController.text);

    UserScope.setUser(context, user);

    context.pushReplacement('/main', extra: user);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // App Logo & Title
                Center(
                  child: Container(
                    width: 76,
                    height: 76,
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withValues(alpha: 0.35),
                          blurRadius: 16,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: const Center(
                      child: Icon(Icons.badge_outlined, size: 40, color: Colors.white),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'HRM System',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Quản lý nhân sự nội bộ doanh nghiệp',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                ),
                const SizedBox(height: 28),

                // Username input
                TextField(
                  controller: _usernameController,
                  decoration: InputDecoration(
                    labelText: 'Email hoặc số điện thoại',
                    prefixIcon: const Icon(Icons.person_outline_rounded, size: 22, color: AppColors.textSecondary),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 14),

                // Password input
                TextField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  decoration: InputDecoration(
                    labelText: 'Mật khẩu',
                    prefixIcon: const Icon(Icons.lock_outline_rounded, size: 22, color: AppColors.textSecondary),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                        size: 22,
                        color: AppColors.textSecondary,
                      ),
                      onPressed: () {
                        setState(() {
                          _obscurePassword = !_obscurePassword;
                        });
                      },
                    ),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 6),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Checkbox(
                          value: _rememberMe,
                          activeColor: AppColors.primary,
                          onChanged: (val) => setState(() => _rememberMe = val ?? true),
                        ),
                        const Text('Ghi nhớ', style: TextStyle(fontSize: 13)),
                      ],
                    ),
                    TextButton(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Mật khẩu mặc định là: 123456')),
                        );
                      },
                      child: const Text('Quên mật khẩu?', style: TextStyle(fontSize: 13, color: AppColors.primary)),
                    ),
                  ],
                ),
                const SizedBox(height: 18),

                // Login Button
                SizedBox(
                  height: 50,
                  child: ElevatedButton(
                    onPressed: _login,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                    child: const Text('Đăng nhập', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(height: 28),
                const Text(
                  '© 2026 HRM System — Ứng dụng Quản lý Nhân sự',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w400),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

}
