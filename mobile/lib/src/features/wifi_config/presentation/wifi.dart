import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../../../core/constants/colors.dart';
import '../../../core/models/branch.dart';
import '../../../core/state/branch_scope.dart';
import '../../../core/config/company.dart';
import '../../../core/widgets/branch_selector.dart';

class WifiConfig {
  final String ssid;
  final String password;
  final bool enforceCheckIn;

  const WifiConfig({
    required this.ssid,
    required this.password,
    this.enforceCheckIn = true,
  });
}

// Cấu hình Wi-Fi theo chi nhánh (Key = branchId).
final Map<String, List<WifiConfig>> _wifiConfigs = {};

class WifiConfigScreen extends StatefulWidget {
  const WifiConfigScreen({super.key});

  @override
  State<WifiConfigScreen> createState() => _WifiConfigScreenState();
}

class _WifiEntry {
  final TextEditingController ssidController;
  final TextEditingController passwordController;
  bool enforceCheckIn;
  bool obscurePassword;

  _WifiEntry({
    required this.ssidController,
    required this.passwordController,
    required this.enforceCheckIn,
  }) : obscurePassword = true;
}

class _WifiConfigScreenState extends State<WifiConfigScreen> {
  final List<_WifiEntry> _entries = [];

  String? _loadedBranchId;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final Branch? branch = BranchScope.selectedBranch(context);
    if (branch == null) return;
    if (_loadedBranchId != branch.id) {
      _loadBranch(branch);
    }
  }

  void _loadBranch(Branch branch) {
    _loadedBranchId = branch.id;
    _disposeEntries();
    const String brandCode = CompanyConfig.brandCode;
    final String key = branch.id;
    final configs = _wifiConfigs[key] ??
        [
          WifiConfig(
            ssid: '${brandCode.toUpperCase()}_${branch.code}',
            password: '${brandCode.toLowerCase()}@${branch.code.toLowerCase()}',
          ),
        ];
    for (final config in configs) {
      _entries.add(_WifiEntry(
        ssidController: TextEditingController(text: config.ssid),
        passwordController: TextEditingController(text: config.password),
        enforceCheckIn: config.enforceCheckIn,
      ));
    }
  }

  void _disposeEntries() {
    for (final entry in _entries) {
      entry.ssidController.dispose();
      entry.passwordController.dispose();
    }
    _entries.clear();
  }

  void _addNetwork() {
    setState(() {
      _entries.add(_WifiEntry(
        ssidController: TextEditingController(),
        passwordController: TextEditingController(),
        enforceCheckIn: true,
      ));
    });
  }

  void _removeNetwork(int index) {
    final entry = _entries[index];
    entry.ssidController.dispose();
    entry.passwordController.dispose();
    setState(() => _entries.removeAt(index));
  }

  void _saveConfig(Branch branch) {
    setState(() {
      _wifiConfigs[branch.id] = [
        for (final entry in _entries)
          WifiConfig(
            ssid: entry.ssidController.text.trim(),
            password: entry.passwordController.text.trim(),
            enforceCheckIn: entry.enforceCheckIn,
          ),
      ];
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Đã lưu cấu hình Wi-Fi cho ${branch.name}!'),
        backgroundColor: AppColors.success,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _showBranchPicker() {
    final current = BranchScope.selectedBranch(context);
    const branches = kBranches;
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (sheetContext) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Padding(
              padding: EdgeInsets.fromLTRB(20, 16, 20, 12),
              child: Text(
                'Chọn chi nhánh để cấu hình Wi-Fi',
                style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
              ),
            ),
            for (final branch in branches)
              InkWell(
                onTap: () {
                  BranchScope.select(context, branch);
                  Navigator.pop(sheetContext);
                },
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  child: Row(
                    children: [
                      FaIcon(
                        FontAwesomeIcons.store,
                        color: current?.id == branch.id ? AppColors.primary : AppColors.textSecondary,
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              branch.name,
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: current?.id == branch.id ? AppColors.primary : AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(branch.address, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                          ],
                        ),
                      ),
                      if (current?.id == branch.id) const FaIcon(FontAwesomeIcons.check, color: AppColors.primary),
                    ],
                  ),
                ),
              ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _disposeEntries();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final Branch? branch = BranchScope.selectedBranch(context);
    final bool isAll = branch == null;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(
          'Cấu hình Wi-Fi',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        backgroundColor: Colors.white,
        centerTitle: true,
        elevation: 0,
        actions: const [
          BranchSelector(includeAll: false),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.primary.withValues(alpha: 0.25)),
            ),
            child: Row(
              children: [
                FaIcon(
                  isAll ? FontAwesomeIcons.store : FontAwesomeIcons.store,
                  color: AppColors.primary,
                  size: 28,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isAll ? 'Tổng (Tất cả chi nhánh)' : branch.name,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        isAll ? 'Chọn 1 chi nhánh cụ thể để cấu hình' : branch.address,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          if (isAll)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                children: [
                  const FaIcon(FontAwesomeIcons.wifi, size: 40, color: AppColors.textSecondary),
                  const SizedBox(height: 10),
                  const Text(
                    'Cấu hình Wi-Fi là theo từng chi nhánh',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Vui lòng dùng nút cửa hàng trên góc phải để chọn một chi nhánh cụ thể trước khi chỉnh sửa.',
                    style: TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.4),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: _showBranchPicker,
                    icon: const FaIcon(FontAwesomeIcons.store, size: 18),
                    label: const Text('Chọn chi nhánh'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      side: BorderSide(color: AppColors.primary.withValues(alpha: 0.4)),
                    ),
                  ),
                ],
              ),
            )
          else
            _buildConfigForm(branch),
        ],
      ),
    );
  }

  Widget _buildConfigForm(Branch branch) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Danh sách mạng Wi-Fi',
          style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
        ),
        const SizedBox(height: 6),
        const Text(
          'Có thể thêm nhiều mạng (SSID) để nhân viên kết nối chấm công.',
          style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
        ),
        const SizedBox(height: 12),

        for (int i = 0; i < _entries.length; i++) _buildNetworkCard(_entries[i], i),
        const SizedBox(height: 12),

        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            onPressed: _addNetwork,
            icon: const FaIcon(FontAwesomeIcons.plus, size: 18),
            label: const Text(
              'Thêm mạng Wi-Fi',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
            ),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.primary,
              side: BorderSide(color: AppColors.primary.withValues(alpha: 0.4)),
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
          ),
        ),
        const SizedBox(height: 20),

        SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton(
            onPressed: () => _saveConfig(branch),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            child: const Text(
              'Lưu cấu hình Wi-Fi',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildNetworkCard(_WifiEntry entry, int index) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  'Mạng ${index + 1}',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
              ),
              const Spacer(),
              if (_entries.length > 1)
                IconButton(
                  icon: const FaIcon(FontAwesomeIcons.trashCan, color: AppColors.error, size: 20),
                  tooltip: 'Xóa mạng',
                  onPressed: () => _removeNetwork(index),
                ),
            ],
          ),
          const SizedBox(height: 8),
          TextField(
            controller: entry.ssidController,
            decoration: InputDecoration(
              labelText: 'Tên mạng (SSID)',
              prefixIcon: const Icon(Icons.wifi_rounded, color: AppColors.primary, size: 22),
              hintText: 'Ví dụ: HRM_OFFICE_01',
              filled: true,
              fillColor: AppColors.background,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.grey.shade300),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.grey.shade300),
              ),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: entry.passwordController,
            obscureText: entry.obscurePassword,
            decoration: InputDecoration(
              labelText: 'Mật khẩu',
              prefixIcon: const Icon(Icons.lock_outline_rounded, color: AppColors.primary, size: 22),
              suffixIcon: IconButton(
                icon: Icon(
                  entry.obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                  color: AppColors.textSecondary,
                  size: 22,
                ),
                onPressed: () => setState(() => entry.obscurePassword = !entry.obscurePassword),
              ),
              filled: true,
              fillColor: AppColors.background,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.grey.shade300),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.grey.shade300),
              ),
            ),
          ),
          const SizedBox(height: 10),
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Bắt buộc dùng mạng này để chấm công',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'Nhân viên chỉ chấm công được khi kết nối đúng Wi-Fi chi nhánh',
                      style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Switch(
                value: entry.enforceCheckIn,
                activeTrackColor: AppColors.primary,
                onChanged: (value) => setState(() => entry.enforceCheckIn = value),
              ),
            ],
          ),
        ],
      ),
    );
  }
}