import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../../../core/constants/colors.dart';

class WorkLogItem {
  final String date;
  final String checkIn;
  final String checkOut;
  final double hours;
  final int basePay;
  final String status;

  const WorkLogItem({
    required this.date,
    required this.checkIn,
    required this.checkOut,
    required this.hours,
    required this.basePay,
    required this.status,
  });
}

class SalaryScreen extends StatefulWidget {
  const SalaryScreen({super.key});

  @override
  State<SalaryScreen> createState() => _SalaryScreenState();
}

class _SalaryScreenState extends State<SalaryScreen> {
  String _selectedMonth = 'Tháng 08/2026';
  final List<String> _months = [
    'Tháng 08/2026 (Hiện tại)',
    'Tháng 07/2026',
    'Tháng 06/2026',
  ];

  final List<WorkLogItem> _workLogs = const [
    WorkLogItem(
      date: '20/08/2026 (T5)',
      checkIn: '07:55',
      checkOut: 'Đang làm...',
      hours: 4.0,
      basePay: 100000,
      status: 'Hợp lệ',
    ),
    WorkLogItem(
      date: '19/08/2026 (T4)',
      checkIn: '07:58',
      checkOut: '16:05',
      hours: 8.0,
      basePay: 200000,
      status: 'Hợp lệ',
    ),
    WorkLogItem(
      date: '18/08/2026 (T3)',
      checkIn: '11:50',
      checkOut: '18:02',
      hours: 6.0,
      basePay: 150000,
      status: 'Hợp lệ',
    ),
    WorkLogItem(
      date: '17/08/2026 (T2)',
      checkIn: '08:05',
      checkOut: '12:00',
      hours: 4.0,
      basePay: 100000,
      status: 'Trễ 5p',
    ),
    WorkLogItem(
      date: '15/08/2026 (T7)',
      checkIn: '13:55',
      checkOut: '22:10',
      hours: 8.0,
      basePay: 200000,
      status: 'Hợp lệ',
    ),
    WorkLogItem(
      date: '14/08/2026 (T6)',
      checkIn: '17:50',
      checkOut: '23:05',
      hours: 5.0,
      basePay: 125000,
      status: 'Hợp lệ',
    ),
  ];

  String _formatCurrency(int amount) {
    final str = amount.toString();
    final buffer = StringBuffer();
    int count = 0;
    for (int i = str.length - 1; i >= 0; i--) {
      buffer.write(str[i]);
      count++;
      if (count % 3 == 0 && i != 0) {
        buffer.write('.');
      }
    }
    return '${buffer.toString().split('').reversed.join('')} đ';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Kỳ lương & Chi tiết công'),
        backgroundColor: Colors.white,
        centerTitle: true,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Month Picker Dropdown
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  isExpanded: true,
                  value: _months.firstWhere(
                    (m) => m.startsWith(_selectedMonth),
                    orElse: () => _months.first,
                  ),
                  icon: const FaIcon(FontAwesomeIcons.chevronDown, color: AppColors.primary),
                  items: _months.map((m) {
                    return DropdownMenuItem<String>(
                      value: m,
                      child: Text(
                        'Kỳ: $m',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) {
                      final parts = val.split(' ');
                      setState(() {
                        _selectedMonth = '${parts[0]} ${parts[1]}';
                      });
                    }
                  },
                ),
              ),
            ),
            const SizedBox(height: 16),

            // 2. Main Net Salary Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF10B981), Color(0xFF059669)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF10B981).withValues(alpha: 0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'TẠM TÍNH THỰC LĨNH',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _formatCurrency(6800000),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Đã làm: 160 giờ • 22 công', style: TextStyle(color: Colors.white, fontSize: 12)),
                      Text('Ngày chốt: 31/08', style: TextStyle(color: Colors.white70, fontSize: 12)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // 3. Salary Breakdown
            _buildSectionHeader('Chi tiết các khoản thu nhập'),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                children: [
                  _buildSalaryRow('Số giờ làm việc được phân công', '160 giờ'),
                  const Divider(height: 16),
                  _buildSalaryRow('Số ca làm việc được phân công', '28 ca'),
                  const Divider(height: 16),
                  _buildSalaryRow('Số giờ làm việc tính lương', '158 giờ'),
                  const Divider(height: 16),
                  _buildSalaryRow('Số ca làm việc tính lương', '27 ca'),
                  const Divider(height: 16),
                  _buildSalaryRow('Số lần đi muộn', '2 lần'),
                  const Divider(height: 16),
                  _buildSalaryRow('Khấu trừ', '100.000 đ', isNegative: true),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // 4. Daily Work Log
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildSectionHeader('Nhật ký chấm công'),
                Text(
                  '${_workLogs.length} ca làm',
                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _workLogs.length,
                separatorBuilder: (context, index) => const Divider(height: 1),
                itemBuilder: (context, index) {
                  final log = _workLogs[index];
                  bool isWarning = log.status.contains('Trễ');

                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              log.date,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                            Text(
                              _formatCurrency(log.basePay),
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.primary),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Text(
                              'Vào: ${log.checkIn} - Ra: ${log.checkOut} (${log.hours}h)',
                              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                            ),
                            const Spacer(),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: isWarning
                                    ? Colors.orange.withValues(alpha: 0.12)
                                    : AppColors.success.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                log.status,
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: isWarning ? Colors.orange.shade800 : AppColors.success,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 24),

            // Khiếu nại phiếu lương
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () {
                  _showSupportSheet(context);
                },
                icon: const FaIcon(FontAwesomeIcons.triangleExclamation, size: 18),
                label: const Text(
                  'Khiếu nại phiếu lương',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                ),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.error,
                  side: BorderSide(color: AppColors.error.withValues(alpha: 0.4)),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
              ),
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 15,
        fontWeight: FontWeight.bold,
        color: AppColors.textPrimary,
      ),
    );
  }

  Widget _buildSalaryRow(String label, String amount, {bool isPositive = false, bool isNegative = false}) {
    Color amountColor = AppColors.textPrimary;
    if (isPositive) amountColor = const Color(0xFF10B981);
    if (isNegative) amountColor = AppColors.error;

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Text(
            label,
            style: const TextStyle(fontSize: 13, color: AppColors.textPrimary),
          ),
        ),
        Text(
          amount,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: amountColor,
          ),
        ),
      ],
    );
  }

  void _showSupportSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Khiếu nại công / Lương', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            const TextField(
              decoration: InputDecoration(
                labelText: 'Mô tả vấn đề',
                hintText: 'Ví dụ: Ca ngày 17/08 bị ghi nhận trễ 5p do sự cố Wi-Fi...',
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    backgroundColor: AppColors.success,
                    content: Text('✅ Đã gửi phản ánh tới phòng Nhân sự!'),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
              child: const Text('Gửi phản ánh', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }
}
