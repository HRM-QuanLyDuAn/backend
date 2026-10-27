"use strict";

const database = require("../config/database");
const { SEED_NOTIFICATIONS } = require("../../prisma/seed");

let memoryNotifications = JSON.parse(JSON.stringify(SEED_NOTIFICATIONS)).map((n) => ({
  ...n,
  createdAt: new Date(),
}));

async function findMany({ employeeId, branchSlug } = {}) {
  const prisma = database.getPrisma();
  if (!prisma) {
    return memoryNotifications.filter((n) => {
      // broadcast: targetEmployeeId == null
      if (!n.targetEmployeeId) return true;
      if (employeeId && n.targetEmployeeId === employeeId) return true;
      if (branchSlug && n.branchSlug === branchSlug) return true;
      return false;
    });
  }
  const where = {
    OR: [
      { targetEmployeeId: null },
      ...(employeeId ? [{ targetEmployeeId: employeeId }] : []),
      ...(branchSlug ? [{ branchSlug }] : []),
    ],
  };
  return prisma.notification.findMany({ where, orderBy: { createdAt: "desc" } });
}

async function findById(id) {
  const prisma = database.getPrisma();
  if (!prisma) {
    return memoryNotifications.find((n) => n.id === id) || null;
  }
  return prisma.notification.findUnique({ where: { id } });
}

async function create(data) {
  const prisma = database.getPrisma();
  if (!prisma) {
    const newNotif = {
      id: data.id || `notif-${Date.now()}`,
      isRead: false,
      ...data,
      createdAt: new Date(),
    };
    memoryNotifications.unshift(newNotif);
    return newNotif;
  }
  return prisma.notification.create({ data });
}

async function markAsRead(id) {
  const prisma = database.getPrisma();
  if (!prisma) {
    const idx = memoryNotifications.findIndex((n) => n.id === id);
    if (idx === -1) return null;
    memoryNotifications[idx].isRead = true;
    return memoryNotifications[idx];
  }
  return prisma.notification.update({ where: { id }, data: { isRead: true } });
}

async function deleteById(id) {
  const prisma = database.getPrisma();
  if (!prisma) {
    const idx = memoryNotifications.findIndex((n) => n.id === id);
    if (idx === -1) return false;
    memoryNotifications.splice(idx, 1);
    return true;
  }
  await prisma.notification.delete({ where: { id } });
  return true;
}

let memorySettings = {};

async function getSettings(userId) {
  return memorySettings[userId] || {
    remindCheckIn: true,
    remindCheckOut: true,
    remindShift: true,
    notifyTask: true,
    notifyLeave: true,
  };
}

async function updateSettings(userId, data) {
  memorySettings[userId] = {
    ...(await getSettings(userId)),
    ...data,
  };
  return memorySettings[userId];
}

module.exports = {
  findMany,
  findById,
  create,
  markAsRead,
  deleteById,
  getSettings,
  updateSettings,
};
