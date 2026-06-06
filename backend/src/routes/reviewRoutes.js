import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roles.js';

import {
  addReview,
  listReviews,
} from '../controllers/reviewController.js';

const router = Router();

// Public - view reviews for an event
router.get('/:id', listReviews);

// Authenticated users can submit reviews
router.post(
  '/:id',
  authenticate,
  authorizeRoles(
    'customer',
    'organizer',
    'admin'
  ),
  addReview
);

export default router;


