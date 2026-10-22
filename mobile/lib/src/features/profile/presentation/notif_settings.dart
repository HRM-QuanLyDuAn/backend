import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../../../core/constants/colors.dart';

class NotificationSettingsScreen extends StatefulWidget {
  const NotificationSettingsScreen({super.key});

  @override
  State<NotificationSettingsScreen> createState() => _NotificationSettingsScreenState();
}

class _NotificationSettingsScreenState extends State<NotificationSettingsScreen> {
  // 1. Nhắc nhở Check-in (Vào ca)
  bool _checkInBefore1Hour = true;
  bool _checkInBefore30Min = true;
  bool _checkInBefore10Min = true;

  // 2. Nhắc nhở Check-out (Ra ca)
  bool _checkOutBefore10Min = true;
  bool _missedCheckOutAfter10Min = true;
  bool _missedCheckOutAfter30Min = true;
  bool _missedCheckOutAfter1Hour = true;

  // 3. Thông báo từ tab Thông báo (Hệ thống / Yêu cầu ca / Tin tức)
  bool _tabNotificationAlert = true;
  bool _soundEnabled = true;
  bool _vibrateEnabled = true;

  void _showSavedToast(String label, bool value) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(value ? 'Đã bật: $label' : 'Đã tắt: $label'),
        duration: const Duration(milliseconds: 1200),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Cài đặt thông báo'),
        backgroundColor: Colors.white,
        centerTitle: true,
        elevation: 0,
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.chevronLeft, size: 20, color: AppColors.textPrimary),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          // Nhóm 1: Nhắc nhở Check-in (Vào ca)
          _buildSectionHeader('Nhắc nhở Chấm công vào ca (Check-in)'),
          _buildSettingsCard([
            _buildSwitchItem(
              title: 'Nhắc nhở check-in trước 1 tiếng',
              subtitle: 'Gửi thông báo nhắc nhở 60 phút trước khi bắt đầu ca làm',
              value: _checkInBefore1Hour,
              onChanged: (val) {
                setState(() => _checkInBefore1Hour = val);
                _showSavedToast('Nhắc check-in trước 1 tiếng', val);
              },
            ),
            const Divider(height: 1),
            _buildSwitchItem(
              title: 'Nhắc nhở check-in trước 30 phút',
              subtitle: 'Gửi thông báo nhắc nhở 30 phút trước khi bắt đầu ca làm',
              value: _checkInBefore30Min,
              onChanged: (val) {
                setState(() => _checkInBefore30Min = val);
                _showSavedToast('Nhắc check-in trước 30 phút', val);
              },
            ),
            const Divider(height: 1),
            _buildSwitchItem(
              title: 'Nhắc nhở check-in trước 10 phút',
              subtitle: 'Gửi thông báo chuẩn bị vào ca trước 10 phút',
              value: _checkInBefore10Min,
              onChanged: (val) {
                setState(() => _checkInBefore10Min = val);
                _showSavedToast('Nhắc check-in trước 10 phút', val);
              },
            ),
          ]),
          const SizedBox(height: 20),

          // Nhóm 2: Nhắc nhở Check-out (Ra ca)
          _buildSectionHeader('Nhắc nhở Chấm công ra ca (Check-out)'),
          _buildSettingsCard([
            _buildSwitchItem(
              title: 'Nhắc nhở check-out trước 10 phút',
              subtitle: 'Nhắc nhở chuẩn bị kết thúc ca và chấm công ra',
              value: _checkOutBefore10Min,
              onChanged: (val) {
                setState(() => _checkOutBefore10Min = val);
                _showSavedToast('Nhắc check-out trước 10 phút', val);
              },
            ),
            const Divider(height: 1),
            _buildSwitchItem(
              title: 'Nhắc nhở quên check-out sau 10 phút',
              subtitle: 'Cảnh báo nếu chưa chấm công ra ca sau 10 phút hết giờ',
              value: _missedCheckOutAfter10Min,
              onChanged: (val) {
                setState(() => _missedCheckOutAfter10Min = val);
                _showSavedToast('Nhắc quên check-out sau 10 phút', val);
              },
            ),
            const Divider(height: 1),
            _buildSwitchItem(
              title: 'Nhắc nhở quên check-out sau 30 phút',
              subtitle: 'Cảnh báo nếu chưa chấm công ra ca sau 30 phút hết giờ',
              value: _missedCheckOutAfter30Min,
              onChanged: (val) {
                setState(() => _missedCheckOutAfter30Min = val);
                _showSavedToast('Nhắc quên check-out sau 30 phút', val);
              },
            ),
            const Divider(height: 1),
            _buildSwitchItem(
              title: 'Nhắc nhở quên check-out sau 1 tiếng',
              subtitle: 'Cảnh báo khẩn nếu chưa chấm công ra ca sau 1 tiếng hết giờ',
              value: _missedCheckOutAfter1Hour,
              onChanged: (val) {
                setState(() => _missedCheckOutAfter1Hour = val);
                _showSavedToast('Nhắc quên check-out sau 1 tiếng', val);
              },
            ),
          ]),
          const SizedBox(height: 20),

          // Nhóm 3: Thông báo từ tab Thông báo
          _buildSectionHeader('Thông báo chung & Hộp thư thông báo'),
          _buildSettingsCard([
            _buildSwitchItem(
              title: 'Thông báo từ trung tâm thông báo',
              subtitle: 'Nhận thông báo khi có tin nhắn, phân công ca, đổi ca từ mục Thông báo',
              value: _tabNotificationAlert,
              onChanged: (val) {
                setState(() => _tabNotificationAlert = val);
                _showSavedToast('Thông báo trung tâm', val);
              },
            ),
            const Divider(height: 1),
            _buildSwitchItem(
              title: 'Âm thanh thông báo',
              subtitle: 'Phát âm thanh khi nhận thông báo mới',
              value: _soundEnabled,
              enabled: _tabNotificationAlert,
              onChanged: (val) {
                setState(() => _soundEnabled = val);
                _showSavedToast('Âm thanh thông báo', val);
              },
            ),
            const Divider(height: 1),
            _buildSwitchItem(
              title: 'Rung khi có thông báo',
              subtitle: 'Rung thiết bị khi nhận thông báo',
              value: _vibrateEnabled,
              enabled: _tabNotificationAlert,
              onChanged: (val) {
                setState(() => _vibrateEnabled = val);
                _showSavedToast('Rung thông báo', val);
              },
            ),
          ]),
          const SizedBox(height: 30),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 13.5,
          fontWeight: FontWeight.bold,
          color: AppColors.textPrimary,
        ),
      ),
    );
  }

  Widget _buildSettingsCard(List<Widget> children) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      clipBehavior: Clip.antiAlias,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: Column(children: children),
      ),
    );
  }

  Widget _buildSwitchItem({
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
    bool enabled = true,
  }) {
    final Color textColor = enabled ? AppColors.textPrimary : Colors.grey.shade400;
    final Color subColor = enabled ? AppColors.textSecondary : Colors.grey.shade400;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: textColor,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 12,
                    color: subColor,
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Switch(
            value: value,
            activeThumbColor: Colors.white,
            activeTrackColor: AppColors.primary,
            inactiveThumbColor: Colors.white,
            inactiveTrackColor: Colors.grey.shade300,
            onChanged: enabled ? onChanged : null,
          ),
        ],
      ),
    );
  }
}
