import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../../../core/constants/colors.dart';
import 'request_detail.dart';

// ─── State Quản lý số lượng thông báo chưa đọc ────────────────────────────────
class NotificationState {
  static final ValueNotifier<int> unreadCount = ValueNotifier<int>(4);

  static void updateCount(int count) {
    unreadCount.value = count;
  }
}

// ─── Model ───────────────────────────────────────────────────────────────────

class NotificationItem {
  final String id;
  final String title;
  final String content;
  final String time;
  final FaIconData icon;
  final Color iconColor;
  bool isRead;

  // Thuộc tính yêu cầu đổi ca / nhờ làm thay (nếu có)
  final String? requestType; // 'cover' hoặc 'swap'
  final String? senderName;
  final String? senderRole;
  final String? senderPhone;
  final String? shiftName;
  final String? shiftTime;
  final String? shiftHours;
  final String? shiftDate;
  final String? branch;
  final String? shiftRole;
  final String? swapShiftName;
  final String? swapShiftTime;
  final String? swapShiftHours;
  final String? swapShiftDate;
  final String? swapShiftBranch;
  final String? swapShiftRole;
  final String? reason;
  ShiftRequestStatus requestStatus;

  NotificationItem({
    required this.id,
    required this.title,
    required this.content,
    required this.time,
    required this.icon,
    required this.iconColor,
    this.isRead = false,
    this.requestType,
    this.senderName,
    this.senderRole,
    this.senderPhone,
    this.shiftName,
    this.shiftTime,
    this.shiftHours,
    this.shiftDate,
    this.branch,
    this.shiftRole,
    this.swapShiftName,
    this.swapShiftTime,
    this.swapShiftHours,
    this.swapShiftDate,
    this.swapShiftBranch,
    this.swapShiftRole,
    this.reason,
    this.requestStatus = ShiftRequestStatus.pending,
  });
}

// ─── Screen ──────────────────────────────────────────────────────────────────

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  bool _isSelecting = false;
  final Set<String> _selectedIds = {};

  late List<NotificationItem> _notifications;

  @override
  void initState() {
    super.initState();
    _notifications = [
      NotificationItem(
        id: 'req1',
        title: 'Trần Văn B nhờ bạn làm thay ca Sáng',
        content: 'Trần Văn B nhờ bạn nhận làm thay Ca Sáng (07:00 - 12:00) Thứ Bảy ngày 22/08 tại chi nhánh của bạn.',
        time: '5 phút trước',
        icon: FontAwesomeIcons.userPlus,
        iconColor: Colors.orange,
        isRead: false,
        requestType: 'cover',
        senderName: 'Trần Văn B',
        senderRole: 'Barista',
        senderPhone: '0987.654.321',
        shiftName: 'Ca Sáng (07:00 - 12:00)',
        shiftTime: '07:00 - 12:00',
        shiftHours: '5.0 giờ',
        shiftDate: 'Thứ Bảy, 22/08/2026',
        branch: 'Chi nhánh 01',
        shiftRole: 'Barista',
        reason: 'Mình có lịch thi học kỳ đột xuất vào sáng Thứ 7 này, bạn cover giúp mình nhé! Cảm ơn bạn rất nhiều.',
        requestStatus: ShiftRequestStatus.pending,
      ),
      NotificationItem(
        id: 'req2',
        title: 'Lê Thị C gửi yêu cầu đổi ca',
        content: 'Lê Thị C muốn đổi Ca Chiều (12:00 - 17:00) ngày 23/08 lấy Ca Tối của bạn.',
        time: '25 phút trước',
        icon: FontAwesomeIcons.arrowsLeftRight,
        iconColor: AppColors.primary,
        isRead: false,
        requestType: 'swap',
        senderName: 'Lê Thị C',
        senderRole: 'Thu ngân',
        senderPhone: '0912.345.678',
        shiftName: 'Ca Chiều (12:00 - 17:00)',
        shiftTime: '12:00 - 17:00',
        shiftHours: '5.0 giờ',
        shiftDate: 'Chủ Nhật, 23/08/2026',
        branch: 'Chi nhánh 01',
        shiftRole: 'Thu ngân',
        swapShiftName: 'Ca Tối (17:00 - 22:00)',
        swapShiftTime: '17:00 - 22:00',
        swapShiftHours: '5.0 giờ',
        swapShiftDate: 'Thứ Sáu, 21/08/2026',
        swapShiftBranch: 'Chi nhánh 01',
        swapShiftRole: 'Phục vụ',
        reason: 'Chủ nhật nhà mình có việc gia đình bận, mình đổi sang ca tối thứ 6 để làm bù cho bạn nhé.',
        requestStatus: ShiftRequestStatus.pending,
      ),
      NotificationItem(
        id: 'n1',
        title: 'Phân công ca làm việc mới',
        content: 'Bạn được phân công Ca Sáng (07:00 - 12:00) ngày mai 21/08 tại chi nhánh của bạn.',
        time: '1 giờ trước',
        icon: FontAwesomeIcons.calendarDays,
        iconColor: Colors.blue,
        isRead: false,
      ),
      NotificationItem(
        id: 'n2',
        title: 'Yêu cầu đổi ca đã được duyệt',
        content: 'Quản lý Trần Minh Tuấn đã phê duyệt yêu cầu đổi ca Thứ 5 với bạn Phạm Quỳnh Trang.',
        time: '3 giờ trước',
        icon: FontAwesomeIcons.circleCheck,
        iconColor: Colors.green,
        isRead: false,
      ),
      NotificationItem(
        id: 'n3',
        title: 'Phiếu lương kỳ này đã cập nhật',
        content: 'Bảng tính công và tạm tính thu nhập kỳ 08/2026 đã sẵn sàng. Vui lòng vào mục Kỳ lương để đối soát.',
        time: 'Hôm qua, 18:30',
        icon: FontAwesomeIcons.moneyBill,
        iconColor: Colors.orange,
        isRead: true,
      ),
      NotificationItem(
        id: 'n4',
        title: 'Nhắc nhở ca làm sắp bắt đầu',
        content: 'Ca làm việc Chiều của bạn sẽ bắt đầu sau 15 phút. Vui lòng kết nối Wi-Fi chi nhánh để check-in đúng giờ.',
        time: '19/08, 11:45',
        icon: FontAwesomeIcons.clock,
        iconColor: AppColors.primary,
        isRead: true,
      ),
      NotificationItem(
        id: 'n5',
        title: 'Cập nhật tình trạng món menu',
        content: 'Món "Cà phê Muối Huế" đã được cập nhật trạng thái mở bán trở lại.',
        time: '18/08, 08:10',
        icon: FontAwesomeIcons.utensils,
        iconColor: Colors.teal,
        isRead: true,
      ),
    ];
    _syncUnreadCount();
  }

  void _syncUnreadCount() {
    final count = _notifications.where((n) => !n.isRead).length;
    NotificationState.updateCount(count);
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  void _markAllAsRead() {
    setState(() {
      for (var item in _notifications) {
        item.isRead = true;
      }
    });
    _syncUnreadCount();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        backgroundColor: Colors.green,
        content: Text('✅ Đã đánh dấu tất cả thông báo là đã đọc'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  void _toggleSelectionMode() {
    setState(() {
      _isSelecting = !_isSelecting;
      _selectedIds.clear();
    });
  }

  void _selectAll() {
    setState(() {
      if (_selectedIds.length == _notifications.length) {
        _selectedIds.clear();
      } else {
        _selectedIds.addAll(_notifications.map((n) => n.id));
      }
    });
  }

  void _markSelectedAsRead() {
    if (_selectedIds.isEmpty) return;
    setState(() {
      for (var item in _notifications) {
        if (_selectedIds.contains(item.id)) {
          item.isRead = true;
        }
      }
      _isSelecting = false;
      _selectedIds.clear();
    });
    _syncUnreadCount();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        backgroundColor: Colors.green,
        content: Text('✅ Đã đánh dấu đã đọc các thông báo đã chọn'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  void _deleteSelected() {
    if (_selectedIds.isEmpty) return;
    final count = _selectedIds.length;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Xoá thông báo', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
        content: Text('Bạn có chắc chắn muốn xoá $count thông báo đã chọn?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Huỷ'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              setState(() {
                _notifications.removeWhere((n) => _selectedIds.contains(n.id));
                _isSelecting = false;
                _selectedIds.clear();
              });
              _syncUnreadCount();
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  backgroundColor: AppColors.error,
                  content: Text('🗑️ Đã xoá $count thông báo'),
                  duration: const Duration(seconds: 2),
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('Xoá'),
          ),
        ],
      ),
    );
  }

  void _deleteSingle(NotificationItem item) {
    final index = _notifications.indexOf(item);
    setState(() {
      _notifications.remove(item);
    });
    _syncUnreadCount();
    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: AppColors.textPrimary,
        content: Text('🗑️ Đã xoá "${item.title}"'),
        action: SnackBarAction(
          label: 'Hoàn tác',
          textColor: Colors.amber,
          onPressed: () {
            setState(() {
              _notifications.insert(index, item);
            });
            _syncUnreadCount();
          },
        ),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  Future<void> _openRequestDetail(NotificationItem item) async {
    setState(() => item.isRead = true);
    _syncUnreadCount();

    final result = await Navigator.push<ShiftRequestStatus>(
      context,
      MaterialPageRoute(
        builder: (context) => ShiftRequestDetailScreen(
          requestId: item.id,
          title: item.title,
          senderName: item.senderName ?? 'Đồng nghiệp',
          senderRole: item.senderRole ?? 'Nhân viên',
          senderPhone: item.senderPhone ?? '0912.345.678',
          requestType: item.requestType ?? 'cover',
          requestTime: item.time,
          shiftName: item.shiftName ?? 'Ca làm việc',
          shiftTime: item.shiftTime ?? '08:00 - 17:00',
          shiftHours: item.shiftHours ?? '5.0 giờ',
          shiftDate: item.shiftDate ?? 'Hôm nay',
          branch: item.branch ?? 'Chi nhánh 01',
          shiftRole: item.shiftRole ?? 'Nhân viên',
          swapShiftName: item.swapShiftName,
          swapShiftTime: item.swapShiftTime,
          swapShiftHours: item.swapShiftHours,
          swapShiftDate: item.swapShiftDate,
          swapShiftBranch: item.swapShiftBranch,
          swapShiftRole: item.swapShiftRole,
          reason: item.reason ?? item.content,
          initialStatus: item.requestStatus,
          onStatusChanged: (newStatus) {
            setState(() {
              item.requestStatus = newStatus;
            });
          },
        ),
      ),
    );

    if (result != null) {
      setState(() {
        item.requestStatus = result;
      });
    }
  }

  void _showNotificationDetail(NotificationItem item) {
    setState(() => item.isRead = true);
    _syncUnreadCount();

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundColor: item.iconColor.withValues(alpha: 0.12),
                  child: FaIcon(item.icon, color: item.iconColor, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(item.title,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.textPrimary)),
                      Text(item.time, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(height: 1),
            const SizedBox(height: 14),
            Text(
              item.content,
              style: const TextStyle(fontSize: 14, height: 1.5, color: AppColors.textPrimary),
            ),
            if (item.requestType != null && item.requestType!.isNotEmpty) ...[
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pop(context);
                    _openRequestDetail(item);
                  },
                  icon: const FaIcon(FontAwesomeIcons.arrowRight, size: 15),
                  label: const Text('Xem chi tiết ca & Phản hồi', style: TextStyle(fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
            ],
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      Navigator.pop(context);
                      _deleteSingle(item);
                    },
                    icon: const FaIcon(FontAwesomeIcons.trashCan, size: 18, color: AppColors.error),
                    label: const Text('Xoá thông báo', style: TextStyle(color: AppColors.error)),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppColors.error),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(color: Colors.grey.shade300),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    child: const Text('Đóng', style: TextStyle(color: AppColors.textPrimary)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // ── Build ────────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final unreadCount = _notifications.where((n) => !n.isRead).length;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: _isSelecting ? _buildSelectionAppBar() : _buildNormalAppBar(unreadCount),
      body: _notifications.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  FaIcon(FontAwesomeIcons.bellSlash, size: 64, color: Colors.grey.shade400),
                  const SizedBox(height: 12),
                  const Text(
                    'Không có thông báo nào',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Tất cả thông báo đã được dọn sạch.',
                    style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                  ),
                ],
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              itemCount: _notifications.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final item = _notifications[index];
                return _buildNotificationCard(item);
              },
            ),
      bottomNavigationBar: _isSelecting ? _buildSelectionBottomBar() : null,
    );
  }

  PreferredSizeWidget _buildNormalAppBar(int unreadCount) {
    return AppBar(
      title: const Text('Thông báo'),
      backgroundColor: Colors.white,
      centerTitle: true,
      elevation: 0,
      actions: [
        PopupMenuButton<String>(
          icon: const FaIcon(FontAwesomeIcons.checkDouble, color: AppColors.textPrimary),
          tooltip: 'Tùy chọn thông báo',
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          onSelected: (value) {
            if (value == 'read_all') {
              _markAllAsRead();
            } else if (value == 'select_mode') {
              _toggleSelectionMode();
            }
          },
          itemBuilder: (context) => [
            const PopupMenuItem<String>(
              value: 'read_all',
              child: Row(
                children: [
                  FaIcon(FontAwesomeIcons.envelopeOpen, size: 20, color: AppColors.primary),
                  SizedBox(width: 10),
                  Text('Đọc hết (Tất cả đã đọc)'),
                ],
              ),
            ),
            const PopupMenuItem<String>(
              value: 'select_mode',
              child: Row(
                children: [
                  FaIcon(FontAwesomeIcons.listCheck, size: 20, color: AppColors.textPrimary),
                  SizedBox(width: 10),
                  Text('Đánh dấu & Chọn'),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  PreferredSizeWidget _buildSelectionAppBar() {
    final count = _selectedIds.length;
    final allSelected = count == _notifications.length && _notifications.isNotEmpty;

    return AppBar(
      leading: IconButton(
        icon: const FaIcon(FontAwesomeIcons.xmark, color: AppColors.textPrimary),
        onPressed: _toggleSelectionMode,
      ),
      title: Text(
        count > 0 ? 'Đã chọn $count' : 'Chọn thông báo',
        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
      ),
      backgroundColor: Colors.white,
      centerTitle: true,
      elevation: 0,
      actions: [
        TextButton(
          onPressed: _selectAll,
          child: Text(
            allSelected ? 'Bỏ chọn hết' : 'Chọn tất cả',
            style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary),
          ),
        ),
      ],
    );
  }

  Widget _buildSelectionBottomBar() {
    final count = _selectedIds.length;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: count > 0 ? _markSelectedAsRead : null,
                icon: const FaIcon(FontAwesomeIcons.envelopeOpen, size: 18),
                label: const Text('Đọc các mục chọn'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: ElevatedButton.icon(
                onPressed: count > 0 ? _deleteSelected : null,
                icon: const FaIcon(FontAwesomeIcons.trashCan, size: 18),
                label: Text('Xoá ($count)'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.error,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotificationCard(NotificationItem item) {
    final isSelected = _selectedIds.contains(item.id);

    return Dismissible(
      key: Key(item.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        decoration: BoxDecoration(
          color: AppColors.error,
          borderRadius: BorderRadius.circular(14),
        ),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            FaIcon(FontAwesomeIcons.trashCan, color: Colors.white, size: 24),
            SizedBox(width: 6),
            Text('Xoá', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
      onDismissed: (_) => _deleteSingle(item),
      child: InkWell(
        onTap: () {
          if (_isSelecting) {
            setState(() {
              if (isSelected) {
                _selectedIds.remove(item.id);
              } else {
                _selectedIds.add(item.id);
              }
            });
          } else {
            if (item.requestType != null && item.requestType!.isNotEmpty) {
              _openRequestDetail(item);
            } else {
              _showNotificationDetail(item);
            }
          }
        },
        onLongPress: () {
          if (!_isSelecting) {
            setState(() {
              _isSelecting = true;
              _selectedIds.add(item.id);
            });
          }
        },
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: item.isRead ? Colors.white : AppColors.primary.withValues(alpha: 0.04),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isSelected
                  ? AppColors.primary
                  : (item.isRead ? Colors.grey.shade200 : AppColors.primary.withValues(alpha: 0.2)),
              width: isSelected ? 1.5 : 1,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (_isSelecting) ...[
                Checkbox(
                  value: isSelected,
                  activeColor: AppColors.primary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                  onChanged: (val) {
                    setState(() {
                      if (val == true) {
                        _selectedIds.add(item.id);
                      } else {
                        _selectedIds.remove(item.id);
                      }
                    });
                  },
                ),
                const SizedBox(width: 4),
              ],
              // Icon
              CircleAvatar(
                radius: 20,
                backgroundColor: item.iconColor.withValues(alpha: 0.12),
                child: FaIcon(item.icon, color: item.iconColor, size: 20),
              ),
              const SizedBox(width: 12),

              // Title, content, time
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            item.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontWeight: item.isRead ? FontWeight.w600 : FontWeight.bold,
                              fontSize: 14,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ),
                        if (!item.isRead) ...[
                          const SizedBox(width: 6),
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: AppColors.primary,
                              shape: BoxShape.circle,
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      item.content,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 12.5,
                        height: 1.35,
                        color: item.isRead ? AppColors.textSecondary : const Color(0xFF333333),
                      ),
                    ),

                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Text(
                              item.time,
                              style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                            ),
                            if (item.requestType != null && item.requestType!.isNotEmpty) ...[
                              const SizedBox(width: 8),
                              _buildRequestStatusBadge(item.requestStatus),
                            ],
                          ],
                        ),
                        if (!_isSelecting)
                          InkWell(
                            onTap: () => _deleteSingle(item),
                            borderRadius: BorderRadius.circular(6),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                              child: FaIcon(FontAwesomeIcons.trashCan, size: 16, color: Colors.grey.shade400),
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRequestStatusBadge(ShiftRequestStatus status) {
    Color bg;
    Color text;
    String label;
    switch (status) {
      case ShiftRequestStatus.pending:
        bg = Colors.amber.shade50;
        text = Colors.amber.shade900;
        label = 'Chờ phản hồi';
        break;
      case ShiftRequestStatus.accepted:
        bg = Colors.green.shade50;
        text = Colors.green.shade800;
        label = 'Đã chấp nhận';
        break;
      case ShiftRequestStatus.rejected:
        bg = Colors.red.shade50;
        text = Colors.red.shade800;
        label = 'Đã từ chối';
        break;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: text.withValues(alpha: 0.3)),
      ),
      child: Text(
        label,
        style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: text),
      ),
    );
  }
}
