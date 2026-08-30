import notificationService from "../services/notification.service.js";
import ApiResponse from "../utils/api-response.js";

/**
 * Sanitizes a notification object and its nested sender details.
 */
const sanitizeNotification = (notif) => {
  if (!notif) return null;
  const obj = typeof notif.toObject === "function" ? notif.toObject() : { ...notif };
  delete obj.__v;

  if (obj.sender) {
    if (typeof obj.sender.toObject === "function") {
      obj.sender = obj.sender.toObject();
    } else {
      obj.sender = { ...obj.sender };
    }
    delete obj.sender.auth0Sub;
    delete obj.sender.__v;
  }
  return obj;
};

const sanitizeNotifications = (notifications) => {
  return notifications.map(sanitizeNotification);
};

/**
 * GET /api/notifications
 */
export const getMyNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const result = await notificationService.getMyNotifications(req.user.userId, page, limit);

    const responseData = {
      notifications: sanitizeNotifications(result.notifications),
      pagination: {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    return ApiResponse.success(res, responseData, "Notifications retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/notifications/unread-count
 */
export const getUnreadCount = async (req, res, next) => {
  try {
    const countData = await notificationService.getUnreadCount(req.user.userId);
    return ApiResponse.success(res, countData, "Unread count retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/:id/read
 */
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user.userId);
    return ApiResponse.success(res, sanitizeNotification(notification), "Notification marked as read successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/read-all
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.userId);
    return ApiResponse.success(res, null, "All notifications marked as read successfully");
  } catch (error) {
    next(error);
  }
};

export default {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
