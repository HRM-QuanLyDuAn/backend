import 'package:flutter/material.dart';
import '../../../core/constants/colors.dart';

enum TaskSourceType {
  manager, // Quản lý giao riêng
  shift,   // Cố định theo ca
}

enum TaskStatus {
  pending,    // Cần thực hiện
  inProgress, // Đang làm (giữ enum cho backward compatibility nếu có)
  overdue,    // Quá giờ
  completed,  // Đã xong
}

enum TaskPriority {
  urgent, // Khẩn cấp
  high,   // Quan trọng
  normal, // Bình thường
}

class TaskModel {
  final String id;
  final String title;
  final String description;
  final TaskSourceType sourceType;
  final String assignedByName; // Tên quản lý hoặc người giao
  final String? shiftName;     // Ca gắn liền (nếu có)
  final String branch;
  final DateTime dueDate;
  TaskStatus status;
  final TaskPriority priority;
  final String? assignedToEmail;
  final String? assignedToName;
  DateTime? completedAt;
  final bool requirePhoto;      // Quản trị viên yêu cầu chụp ảnh kết quả
  String? proofPhotoUrl;        // Ảnh chụp minh chứng kết quả công việc

  TaskModel({
    required this.id,
    required this.title,
    required this.description,
    required this.sourceType,
    required this.assignedByName,
    this.shiftName,
    required this.branch,
    required this.dueDate,
    this.status = TaskStatus.pending,
    this.priority = TaskPriority.normal,
    this.assignedToEmail,
    this.assignedToName,
    this.completedAt,
    this.requirePhoto = false,
    this.proofPhotoUrl,
  });

  bool get isOverdue {
    if (status == TaskStatus.completed) return false;
    return DateTime.now().isAfter(dueDate);
  }

  TaskStatus get computedStatus {
    if (status == TaskStatus.completed) return TaskStatus.completed;
    if (status == TaskStatus.inProgress) return TaskStatus.inProgress;
    if (isOverdue) return TaskStatus.overdue;
    return TaskStatus.pending;
  }

  String get sourceLabel => sourceType == TaskSourceType.manager
      ? 'Quản lý giao riêng'
      : 'Cố định theo ca';

  String get shortSourceLabel => sourceType == TaskSourceType.manager
      ? 'Giao riêng'
      : 'Theo ca';

  IconData get sourceIcon => sourceType == TaskSourceType.manager
      ? Icons.push_pin_rounded
      : Icons.sync_rounded;

  Color get sourceColor => sourceType == TaskSourceType.manager
      ? AppColors.primary
      : const Color(0xFF2563EB);

  String get priorityLabel {
    switch (priority) {
      case TaskPriority.urgent:
        return 'Khẩn cấp';
      case TaskPriority.high:
        return 'Quan trọng';
      case TaskPriority.normal:
        return 'Bình thường';
    }
  }

  Color get priorityColor {
    switch (priority) {
      case TaskPriority.urgent:
        return const Color(0xFFDC2626);
      case TaskPriority.high:
        return const Color(0xFFEA580C);
      case TaskPriority.normal:
        return const Color(0xFF64748B);
    }
  }

  String get statusLabel {
    switch (computedStatus) {
      case TaskStatus.completed:
        return 'Đã xong';
      case TaskStatus.inProgress:
        return 'Đang làm';
      case TaskStatus.overdue:
        return 'Quá giờ';
      case TaskStatus.pending:
        return 'Cần thực hiện';
    }
  }

  Color get statusColor {
    switch (computedStatus) {
      case TaskStatus.completed:
        return AppColors.success;
      case TaskStatus.inProgress:
        return const Color(0xFFF59E0B);
      case TaskStatus.overdue:
        return const Color(0xFFDC2626);
      case TaskStatus.pending:
        return const Color(0xFF3B82F6);
    }
  }
}

class TaskService {
  static final List<TaskModel> _mockTasks = [
    // 1. Quá giờ - Cố định theo ca sáng (BẮT BUỘC CHỤP ẢNH)
    TaskModel(
      id: 'task-1',
      title: 'Kiểm tra nhiệt độ tủ lạnh & máy pha chế',
      description: 'Ghi chép nhiệt độ tủ bảo quản sữa và cài đặt áp suất máy pha trước giờ mở cửa đón khách.',
      sourceType: TaskSourceType.shift,
      assignedByName: 'Quy trình chuẩn Ca Sáng',
      shiftName: 'Ca Sáng (07:00 - 14:00)',
      branch: 'HN-1',
      dueDate: DateTime.now().subtract(const Duration(minutes: 45)), // Đã quá 45 phút
      status: TaskStatus.pending,
      priority: TaskPriority.high,
      assignedToEmail: 'shift_all',
      assignedToName: 'Tất cả nhân sự trực Ca Sáng',
      requirePhoto: true,
    ),

    // 2. Quản lý giao riêng (KHÔNG BẮT BUỘC ẢNH)
    TaskModel(
      id: 'task-2',
      title: 'Bàn giao sổ chấm công và hướng dẫn nhân sự mới',
      description: 'Hỗ trợ bạn thực tập sinh mới làm quen với vị trí và xác thực Wi-Fi chấm công chi nhánh.',
      sourceType: TaskSourceType.manager,
      assignedByName: 'Vũ Thành Công (Quản lý)',
      shiftName: 'Ca Sáng (07:00 - 14:00)',
      branch: 'HN-1',
      dueDate: DateTime.now().add(const Duration(hours: 2)),
      status: TaskStatus.pending,
      priority: TaskPriority.urgent,
      assignedToEmail: 'nhanvien@company.com',
      assignedToName: 'Nguyễn Thu Hà',
      requirePhoto: false,
    ),

    // 3. Cần thực hiện - Cố định theo ca (BẮT BUỘC CHỤP ẢNH)
    TaskModel(
      id: 'task-3',
      title: 'Vệ sinh quầy bar & kiểm kê dụng cụ cuối ca',
      description: 'Lau dọn máy pha, máy xay, bổ sung nguyên vật liệu và bàn giao cho ca chiều.',
      sourceType: TaskSourceType.shift,
      assignedByName: 'Quy trình bàn giao ca',
      shiftName: 'Ca Sáng (07:00 - 14:00)',
      branch: 'HN-1',
      dueDate: DateTime.now().add(const Duration(hours: 4)),
      status: TaskStatus.pending,
      priority: TaskPriority.normal,
      assignedToEmail: 'shift_all',
      assignedToName: 'Tất cả nhân sự trực Ca Sáng',
      requirePhoto: true,
    ),

    // 4. Cần thực hiện - Quản lý giao riêng (BẮT BUỘC CHỤP ẢNH)
    TaskModel(
      id: 'task-4',
      title: 'Kiểm tra tem nhãn nguyên liệu mới nhập kho',
      description: 'Đối chiếu ngày sản xuất, hạn sử dụng và dán tem lưu kho theo quy chuẩn an toàn.',
      sourceType: TaskSourceType.manager,
      assignedByName: 'Vũ Thành Công (Quản lý)',
      branch: 'HN-1',
      dueDate: DateTime.now().add(const Duration(hours: 6)),
      status: TaskStatus.pending,
      priority: TaskPriority.high,
      assignedToEmail: 'nhanvien@company.com',
      assignedToName: 'Nguyễn Thu Hà',
      requirePhoto: true,
    ),

    // 5. Đã xong (Đã có ảnh minh chứng)
    TaskModel(
      id: 'task-5',
      title: 'Điểm danh đầu ca và kiểm tra đồng phục',
      description: 'Đảm bảo 100% nhân sự ca sáng đeo bảng tên và mặc đồng phục đúng quy định.',
      sourceType: TaskSourceType.shift,
      assignedByName: 'Quy trình đầu ca',
      shiftName: 'Ca Sáng (07:00 - 14:00)',
      branch: 'HN-1',
      dueDate: DateTime.now().subtract(const Duration(hours: 2)),
      status: TaskStatus.completed,
      priority: TaskPriority.normal,
      assignedToEmail: 'shift_all',
      assignedToName: 'Tất cả nhân sự trực Ca Sáng',
      completedAt: DateTime.now().subtract(const Duration(hours: 1, minutes: 30)),
      requirePhoto: true,
      proofPhotoUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=500',
    ),
  ];

  /// Lấy danh sách việc của nhân viên
  static List<TaskModel> getTasksForUser({String? userEmail}) {
    return List.from(_mockTasks);
  }

  /// Cập nhật trạng thái công việc
  static void updateTaskStatus(String taskId, TaskStatus newStatus, {String? proofPhotoUrl}) {
    final index = _mockTasks.indexWhere((t) => t.id == taskId);
    if (index != -1) {
      _mockTasks[index].status = newStatus;
      if (newStatus == TaskStatus.completed) {
        _mockTasks[index].completedAt = DateTime.now();
        if (proofPhotoUrl != null) {
          _mockTasks[index].proofPhotoUrl = proofPhotoUrl;
        }
      } else {
        _mockTasks[index].completedAt = null;
      }
    }
  }

  /// Hoàn thành công việc kèm ảnh minh chứng (nếu có)
  static void completeTask(String taskId, {String? proofPhotoUrl}) {
    updateTaskStatus(taskId, TaskStatus.completed, proofPhotoUrl: proofPhotoUrl);
  }

  /// Thêm công việc mới (dành cho Quản lý / Admin)
  static void addTask(TaskModel newTask) {
    _mockTasks.insert(0, newTask);
  }

  /// Thống kê số lượng việc
  static Map<String, int> getTaskStats() {
    int total = _mockTasks.length;
    int pending = 0;
    int inProgress = 0;
    int overdue = 0;
    int completed = 0;

    for (final t in _mockTasks) {
      switch (t.computedStatus) {
        case TaskStatus.pending:
          pending++;
          break;
        case TaskStatus.inProgress:
          inProgress++;
          break;
        case TaskStatus.overdue:
          overdue++;
          break;
        case TaskStatus.completed:
          completed++;
          break;
      }
    }

    return {
      'total': total,
      'pending': pending,
      'inProgress': inProgress,
      'overdue': overdue,
      'completed': completed,
    };
  }
}
