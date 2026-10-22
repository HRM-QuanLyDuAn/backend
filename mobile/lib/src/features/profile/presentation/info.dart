import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../../../core/constants/colors.dart';
import '../../../core/models/user.dart';
import '../../../core/state/branch_scope.dart';
import '../../../core/state/user_scope.dart';

class PersonalInfoScreen extends StatefulWidget {
  final String name;
  final String email;
  final String phone;
  final bool isManager;
  final UserModel? user;

  const PersonalInfoScreen({
    super.key,
    required this.name,
    required this.email,
    required this.phone,
    required this.isManager,
    this.user,
  });

  @override
  State<PersonalInfoScreen> createState() => _PersonalInfoScreenState();
}

class _PersonalInfoScreenState extends State<PersonalInfoScreen> {
  late TextEditingController _nameCtrl;
  late TextEditingController _phoneCtrl;
  late TextEditingController _cccdCtrl;
  bool _isEditing = false;

  late String _birthDate;
  late String _gender;
  late String _province;
  late String _ward;
  late String _street;
  late String _bankAcc;
  late String _bankName;
  late String _cccd;
  late String _issueDate;
  late String _issuePlace;

  @override
  void initState() {
    super.initState();
    _nameCtrl = TextEditingController(text: widget.name);
    _phoneCtrl = TextEditingController(text: widget.phone);
    _birthDate = widget.user?.birthDate ?? '24/08/1999';
    _gender = widget.user?.gender ?? 'Nữ';
    _province = widget.user?.province ?? 'Hà Nội';
    _ward = widget.user?.ward ?? 'Phường Hàng Bài';
    _street = widget.user?.street ?? '15 Phố Hàng Bài, Q. Hoàn Kiếm';
    _bankAcc = widget.user?.bankAccountNumber ?? '108876543210';
    _bankName = widget.user?.bankName ?? 'VietinBank';
    _cccd = widget.user?.cccd ?? '001199014567';
    _issueDate = widget.user?.issueDate ?? '10/05/2021';
    _issuePlace = widget.user?.issuePlace ?? 'Cục CS QLHC về TTXH';
    _cccdCtrl = TextEditingController(text: _cccd);
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _cccdCtrl.dispose();
    super.dispose();
  }

  void _handleAutoLeave() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(children: [FaIcon(FontAwesomeIcons.rightFromBracket, color: AppColors.error), SizedBox(width: 8), Text('Tự động nghỉ', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold))]),
        content: const Text('Bạn có chắc muốn gửi yêu cầu thôi việc khỏi hệ thống? Hành động này sẽ đăng xuất tài khoản của bạn.', style: TextStyle(fontSize: 13, height: 1.4)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Hủy')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
            onPressed: () {
              Navigator.pop(ctx);
              final current = UserScope.currentUser(context);
              if (current != null) {
                UserScope.setUser(context, null);
              }
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(backgroundColor: AppColors.error, content: Text('✅ Đã xác nhận — bạn đã đăng xuất khỏi hệ thống.')));
              Navigator.pop(context);
            },
            child: const Text('Xác nhận nghỉ', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _toggleEdit() {
    if (_isEditing) {
      // Lưu
      setState(() {
        _cccd = _cccdCtrl.text.trim();
        _isEditing = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(backgroundColor: AppColors.success, content: Text('✅ Đã lưu thông tin cá nhân')));
    } else {
      setState(() => _isEditing = true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: const Text('Thông tin cá nhân'),
        actions: [
          PopupMenuButton<String>(
            icon: const FaIcon(FontAwesomeIcons.ellipsisVertical, color: AppColors.textPrimary),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            onSelected: (v) {
              if (v == 'edit') _toggleEdit();
              if (v == 'leave') _handleAutoLeave();
            },
            itemBuilder: (_) => [
              PopupMenuItem(value: 'edit', child: Row(children: [FaIcon(_isEditing ? FontAwesomeIcons.floppyDisk : FontAwesomeIcons.penToSquare, size: 18, color: AppColors.primary), const SizedBox(width: 10), Text(_isEditing ? 'Lưu' : 'Sửa')])),
              const PopupMenuItem(value: 'leave', child: Row(children: [FaIcon(FontAwesomeIcons.rightFromBracket, size: 18, color: AppColors.error), SizedBox(width: 10), Text('Tự động nghỉ', style: TextStyle(color: AppColors.error))])),
            ],
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200)),
            child: Row(children: [
              CircleAvatar(radius: 32, backgroundColor: AppColors.primary.withValues(alpha: 0.12), child: FaIcon(widget.isManager ? FontAwesomeIcons.userShield : FontAwesomeIcons.person, color: AppColors.primary, size: 32)),
              const SizedBox(width: 14),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(_nameCtrl.text, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(widget.email, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary), overflow: TextOverflow.ellipsis),
                const SizedBox(height: 4),
                Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(20)), child: Text(BranchScope.label(context), style: const TextStyle(fontSize: 11, color: AppColors.primary, fontWeight: FontWeight.bold))),
              ])),
            ]),
          ),
          const SizedBox(height: 16),
          _groupTitle('Hồ sơ cá nhân', FontAwesomeIcons.user),
          _card(children: [
            _editableRow('Họ và tên', _nameCtrl, FontAwesomeIcons.user, enabled: _isEditing),
            _divider(),
            _row('Ngày sinh', _birthDate, FontAwesomeIcons.cakeCandles, onTap: _isEditing ? () async { final d = await showDatePicker(context: context, initialDate: DateTime(1998, 3, 15), firstDate: DateTime(1950), lastDate: DateTime.now()); if (d != null) setState(() => _birthDate = '${d.day.toString().padLeft(2,'0')}/${d.month.toString().padLeft(2,'0')}/${d.year}'); } : null),
            _divider(),
            _row('Giới tính', _gender, FontAwesomeIcons.restroom),
            _divider(),
            _editableRow('Số điện thoại', _phoneCtrl, FontAwesomeIcons.phone, enabled: _isEditing),
            _divider(),
            _row('Email', widget.email, FontAwesomeIcons.envelope),
          ]),
          const SizedBox(height: 14),
          _groupTitle('Địa chỉ hiện tại', FontAwesomeIcons.house),
          _card(children: [
            _row('Tỉnh/ Thành phố', _province, FontAwesomeIcons.city),
            _divider(),
            _row('Xã/ Phường', _ward, FontAwesomeIcons.locationDot),
            _divider(),
            _row('Số nhà/ Tên đường', _street, FontAwesomeIcons.signsPost),
          ]),
          const SizedBox(height: 14),
          _groupTitle('Thông tin ngân hàng', FontAwesomeIcons.buildingColumns),
          _card(children: [
            _row('Số tài khoản', _bankAcc, FontAwesomeIcons.creditCard),
            _divider(),
            _row('Tên ngân hàng', _bankName, FontAwesomeIcons.wallet),
          ]),
          const SizedBox(height: 14),
          _groupTitle('Thông tin CCCD', FontAwesomeIcons.idCard),
          _card(children: [
            _editableRow('Số CCCD', _cccdCtrl, FontAwesomeIcons.idCard, enabled: _isEditing),
            _divider(),
            _row('Ngày cấp', _issueDate, FontAwesomeIcons.calendarDays, onTap: _isEditing ? () async { final d = await showDatePicker(context: context, initialDate: DateTime(2021, 5, 20), firstDate: DateTime(2000), lastDate: DateTime.now()); if (d != null) setState(() => _issueDate = '${d.day.toString().padLeft(2,'0')}/${d.month.toString().padLeft(2,'0')}/${d.year}'); } : null),
            _divider(),
            _row('Nơi cấp', _issuePlace, FontAwesomeIcons.locationDot),
            _divider(),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              child: Row(children: [
                const FaIcon(FontAwesomeIcons.image, size: 18, color: AppColors.textSecondary),
                const SizedBox(width: 10),
                const Expanded(child: Text('Ảnh CCCD', style: TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w600))),
                const SizedBox(width: 10),
                _cccdThumb('Mặt trước', true),
                const SizedBox(width: 8),
                _cccdThumb('Mặt sau', true),
              ]),
            ),
          ]),
          const SizedBox(height: 30),
        ],
      ),
    );
  }

  Widget _groupTitle(String title, FaIconData icon) => Padding(
        padding: const EdgeInsets.only(left: 4, bottom: 8),
        child: Row(children: [Container(width: 3, height: 14, decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(2))), const SizedBox(width: 8), FaIcon(icon, size: 14, color: AppColors.primary), const SizedBox(width: 6), Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.primary))]),
      );

  Widget _card({required List<Widget> children}) => Container(decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.grey.shade200)), child: Column(children: children));

  Widget _row(String label, String value, FaIconData icon, {VoidCallback? onTap}) => InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          child: Row(children: [
            FaIcon(icon, size: 18, color: AppColors.textSecondary),
            const SizedBox(width: 10),
            SizedBox(width: 120, child: Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w600))),
            Expanded(child: Text(value, textAlign: TextAlign.right, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary), overflow: TextOverflow.ellipsis)),
            if (onTap != null) const Padding(padding: EdgeInsets.only(left: 6), child: FaIcon(FontAwesomeIcons.chevronRight, size: 16, color: AppColors.textSecondary)),
          ]),
        ),
      );

  Widget _editableRow(String label, TextEditingController ctrl, FaIconData icon, {bool enabled = false}) => Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        child: Row(children: [
          FaIcon(icon, size: 18, color: AppColors.textSecondary),
          const SizedBox(width: 10),
          SizedBox(width: 110, child: Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w600))),
          Expanded(child: enabled ? TextField(controller: ctrl, textAlign: TextAlign.right, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold), decoration: const InputDecoration(isDense: true, border: InputBorder.none, contentPadding: EdgeInsets.zero)) : Text(ctrl.text, textAlign: TextAlign.right, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold), overflow: TextOverflow.ellipsis)),
        ]),
      );

  Widget _divider() => Divider(height: 1, indent: 46, color: Colors.grey.shade200);

  Widget _cccdThumb(String label, bool uploaded) => Container(
        width: 64,
        height: 44,
        decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(8), border: Border.all(color: Colors.green.shade200)),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [const FaIcon(FontAwesomeIcons.circleCheck, size: 16, color: Colors.green), const SizedBox(height: 2), Text(label, style: const TextStyle(fontSize: 9, color: Colors.green, fontWeight: FontWeight.w600))]),
      );
}
