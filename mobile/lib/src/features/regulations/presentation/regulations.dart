import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../../../core/constants/colors.dart';

class CompanyRegulationsScreen extends StatelessWidget {
  const CompanyRegulationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Nội quy công ty', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.white,
        centerTitle: true,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildHeaderBanner(),
          const SizedBox(height: 16),
          _buildSection(
            number: '1',
            title: 'Quy định giờ giấc & Chấm công Wi-Fi',
            icon: FontAwesomeIcons.clock,
            color: Colors.blue,
            content:
                '• Nhân sự phải có mặt và kết nối Wi-Fi chi nhánh để chấm công trước giờ vào ca ít nhất 5 phút.\n'
                '• Thời gian ân hạn (grace period) là 5 phút. Đi trễ từ 6 - 15 phút bị trừ 20.000 đ/lần. Trễ trên 15 phút phải có sự đồng ý của Quản lý chi nhánh.\n'
                '• Khi kết thúc ca làm việc, bắt buộc bấm "Chấm công ra ca" để hệ thống tính tròn giờ công.',
          ),
          _buildSection(
            number: '2',
            title: 'Quy trình Xin nghỉ & Đổi ca',
            icon: FontAwesomeIcons.calendarCheck,
            color: Colors.orange,
            content:
                '• Nghỉ phép năm: Nộp đơn trên ứng dụng trước ít nhất 48 giờ để Quản lý sắp xếp người làm thay.\n'
                '• Nghỉ ốm đột xuất: Báo ngay cho Quản lý chi nhánh trước ca trực 2 giờ và bổ sung giấy chỉ định y tế khi đi làm lại.\n'
                '• Đổi ca / Nhờ làm thay: Hai nhân viên tự thỏa thuận và xác nhận đồng ý với nhau trên ứng dụng là hoàn tất đổi ca. Trường hợp phát sinh gấp hoặc bận, Quản lý chi nhánh có quyền duyệt đồng ý hộ.',
          ),
          _buildSection(
            number: '3',
            title: 'Tác phong & Văn hóa doanh nghiệp',
            icon: FontAwesomeIcons.circleCheck,
            color: Colors.teal,
            content:
                '• Trang phục gọn gàng, lịch sự hoặc đồng phục theo quy định của từng bộ phận.\n'
                '• Giữ thái độ thân thiện, hợp tác với đồng nghiệp và chu đáo với khách hàng.\n'
                '• Tuyệt đối bảo mật thông tin nội bộ và dữ liệu khách hàng của doanh nghiệp.',
          ),
          _buildSection(
            number: '4',
            title: 'Chính sách Lương, Thưởng & Phúc lợi',
            icon: FontAwesomeIcons.coins,
            color: Colors.green,
            content:
                '• Kỳ tính lương: Từ ngày 01 đến ngày cuối cùng của tháng.\n'
                '• Ngày nhận lương: Ngày 05 hằng tháng qua tài khoản ngân hàng.\n'
                '• Hạn mức tạm ứng lương: Tối đa 50% số tiền đã kiếm được trong kỳ, gửi yêu cầu qua mục "Tạm ứng lương".',
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildHeaderBanner() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const FaIcon(FontAwesomeIcons.hammer, color: AppColors.primary, size: 28),
          ),
          const SizedBox(width: 14),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Sổ tay Nội quy Lao động',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.textPrimary),
                ),
                SizedBox(height: 2),
                Text(
                  'Áp dụng cho toàn thể nhân sự, ban quản lý và ban điều hành.',
                  style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSection({
    required String number,
    required String title,
    required FaIconData icon,
    required Color color,
    required String content,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0.5,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 14,
                  backgroundColor: color.withValues(alpha: 0.12),
                  child: Text(number, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 13)),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14.5, color: AppColors.textPrimary)),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              content,
              style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.5),
            ),
          ],
        ),
      ),
    );
  }
}
