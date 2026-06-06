import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roles.js';

import {
  approveEvent,
  rejectEvent,
  listPendingEvents,
  blockUser,
  unblockUser,
} from '../controllers/adminController.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate);
router.use(authorizeRoles('admin'));

// Events
router.get('/events/pending', listPendingEvents);
router.patch('/events/:id/approve', approveEvent);
router.patch('/events/:id/reject', rejectEvent);

// Users
router.patch('/users/:id/block', blockUser);
router.patch('/users/:id/unblock', unblockUser);

export default router;
