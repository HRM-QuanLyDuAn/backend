"use strict";

function isEmail(v) {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function validateBranch(body = {}) {
  const errors = [];
  if (!body.name) errors.push("Tên chi nhánh là bắt buộc");
  if (!body.slug) errors.push("Slug chi nhánh là bắt buộc");
  return errors;
}

function validateDepartment(body = {}) {
  const errors = [];
  if (!body.name) errors.push("Tên phòng ban là bắt buộc");
  if (!body.code) errors.push("Mã phòng ban là bắt buộc");
  return errors;
}

function validateEmployee(body = {}, isUpdate = false) {
  const errors = [];
  if (!isUpdate) {
    if (!body.name) errors.push("Tên nhân sự là bắt buộc");
    if (!body.email) errors.push("Email là bắt buộc");
    else if (!isEmail(body.email)) errors.push("Email không hợp lệ");
  } else if (body.email && !isEmail(body.email)) errors.push("Email không hợp lệ");
  if (body.systemRole && !["admin", "manager", "staff"].includes(body.systemRole)) {
    errors.push("Vai trò hệ thống chỉ nhận admin/manager/staff");
  }
  return errors;
}

module.exports = { validateBranch, validateDepartment, validateEmployee };
