const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

// Get user notifications
router.get('/', auth, async (req, res) => {
  try {
    const { isRead, limit = 20, page = 1 } = req.query;

    let query = { recipient: req.user.id };

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false,
    });

    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notification by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check permissions
    if (notification.recipient.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check permissions
    if (notification.recipient.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (notification.isRead) {
      return res.status(400).json({ message: 'Notification is already read' });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    res.json({
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check permissions
    if (notification.recipient.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create notification (internal use - for admins/trainers to send notifications)
router.post('/', auth, async (req, res) => {
  try {
    // Check permissions - only admins and trainers can create notifications
    if (req.user.role !== 'admin' && req.user.role !== 'trainer') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { recipient, type, title, message, data, priority, channels, expiresAt } = req.body;

    const notification = new Notification({
      recipient,
      type,
      title,
      message,
      data: data || {},
      priority: priority || 'medium',
      channels: channels || ['in_app'],
      expiresAt,
    });

    await notification.save();

    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send bulk notifications (admin only)
router.post('/bulk', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { recipients, type, title, message, data, priority, channels, expiresAt } = req.body;

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ message: 'Recipients array is required' });
    }

    const notifications = recipients.map(recipient => ({
      recipient,
      type,
      title,
      message,
      data: data || {},
      priority: priority || 'medium',
      channels: channels || ['in_app'],
      expiresAt,
    }));

    const createdNotifications = await Notification.insertMany(notifications);

    res.status(201).json({
      message: 'Bulk notifications sent successfully',
      count: createdNotifications.length,
    });
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notification statistics (admin only)
router.get('/admin/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const stats = await Notification.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          read: { $sum: { $cond: ['$isRead', 1, 0] } },
          unread: { $sum: { $cond: ['$isRead', 0, 1] } },
          byType: {
            $push: {
              type: '$type',
              isRead: '$isRead',
            },
          },
        },
      },
    ]);

    const typeStats = {};
    if (stats.length > 0) {
      stats[0].byType.forEach(item => {
        if (!typeStats[item.type]) {
          typeStats[item.type] = { total: 0, read: 0, unread: 0 };
        }
        typeStats[item.type].total += 1;
        if (item.isRead) {
          typeStats[item.type].read += 1;
        } else {
          typeStats[item.type].unread += 1;
        }
      });
    }

    res.json({
      period: `${period} days`,
      total: stats[0]?.total || 0,
      read: stats[0]?.read || 0,
      unread: stats[0]?.unread || 0,
      readRate: stats[0] ? ((stats[0].read / stats[0].total) * 100).toFixed(2) : 0,
      byType: typeStats,
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;