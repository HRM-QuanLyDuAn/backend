import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../../../core/constants/colors.dart';

class AdvanceRecord {
  final String id;
  final String amount;
  final String date;
  final String reason;
  final String status; // 'pending', 'approved', 'rejected'

  const AdvanceRecord({
    required this.id,
    required this.amount,
    required this.date,
    required this.reason,
    required this.status,
  });
}

class SalaryAdvanceScreen extends StatefulWidget {
  const SalaryAdvanceScreen({super.key});

  @override
  State<SalaryAdvanceScreen> createState() => _SalaryAdvanceScreenState();
}

class _SalaryAdvanceScreenState extends State<SalaryAdvanceScreen> {
  final List<AdvanceRecord> _records = [
    const AdvanceRecord(
      id: 'adv-1',
      amount: '2.000.000 đ',
      date: '16/08/2026',
      reason: 'Chi trả tiền thuê nhà đầu tháng',
      status: 'pending',
    ),
    const AdvanceRecord(
      id: 'adv-2',
      amount: '1.500.000 đ',
      date: '15/07/2026',
      reason: 'Chi phí y tế phát sinh',
      status: 'approved',
    ),
  ];

  void _showAdvanceModal() {
    final amountController = TextEditingController();
    final reasonController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (modalCtx) => Padding(
        padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 16,
          bottom: MediaQuery.of(modalCtx).viewInsets.bottom + 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2))),
            ),
            const SizedBox(height: 14),
            const Text('Tạo yêu cầu tạm ứng lương', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
            const SizedBox(height: 16),
            const Text('Số tiền muốn tạm ứng (VNĐ)', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
            const SizedBox(height: 6),
            TextField(
              controller: amountController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                hintText: 'Tối đa 3.400.000 đ',
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                suffixText: 'VNĐ',
              ),
            ),
            const SizedBox(height: 12),
            const Text('Lý do tạm ứng', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
            const SizedBox(height: 6),
            TextField(
              controller: reasonController,
              maxLines: 2,
              decoration: InputDecoration(
                hintText: 'Nhập lý do chi tiết...',
                contentPadding: const EdgeInsets.all(12),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
            const SizedBox(height: 18),
            ElevatedButton(
              onPressed: () {
                final amount = amountController.text.trim();
                final reason = reasonController.text.trim();
                if (amount.isEmpty || reason.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Vui lòng nhập đầy đủ số tiền và lý do')),
                  );
                  return;
                }
                setState(() {
                  _records.insert(
                    0,
                    AdvanceRecord(
                      id: 'adv-${DateTime.now().millisecondsSinceEpoch}',
                      amount: '$amount đ',
                      date: 'Hôm nay',
                      reason: reason,
                      status: 'pending',
                    ),
                  );
                });
                Navigator.pop(modalCtx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    backgroundColor: AppColors.success,
                    content: Text('✅ Đã gửi yêu cầu tạm ứng lương thành công!'),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: const Text('Gửi yêu cầu tạm ứng', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Tạm ứng lương', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.white,
        centerTitle: true,
        elevation: 0,
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAdvanceModal,
        backgroundColor: AppColors.primary,
        icon: const FaIcon(FontAwesomeIcons.plus, color: Colors.white),
        label: const Text('Tạo yêu cầu', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Thẻ hạn mức tạm ứng
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF047857), Color(0xFF059669)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF047857).withValues(alpha: 0.3),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Lương tạm tính tháng 08', style: TextStyle(color: Colors.white70, fontSize: 13)),
                    FaIcon(FontAwesomeIcons.wallet, color: Colors.white70, size: 20),
                  ],
                ),
                SizedBox(height: 4),
                Text('6.800.000 đ', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                Divider(color: Colors.white24, height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Hạn mức được ứng tối đa (50%):', style: TextStyle(color: Colors.white, fontSize: 12.5)),
                    Text('3.400.000 đ', style: TextStyle(color: Colors.amberAccent, fontSize: 14, fontWeight: FontWeight.bold)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          const Text('Lịch sử các đợt tạm ứng', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
          const SizedBox(height: 10),

          ..._records.map((rec) => _buildRecordCard(rec)),
        ],
      ),
    );
  }

  Widget _buildRecordCard(AdvanceRecord rec) {
    final bool isApproved = rec.status == 'approved';
    final Color color = isApproved ? AppColors.success : Colors.orange;

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      elevation: 0.5,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(rec.amount, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF047857))),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(6)),
                  child: Text(isApproved ? 'Đã chi' : 'Chờ duyệt', style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text('Ngày gửi: ${rec.date} • Lý do: ${rec.reason}', style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
          ],
        ),
      ),
    );
  }
}
