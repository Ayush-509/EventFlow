import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roles.js';

import {
  registerForEvent,
  myRegistrations,
  participantsForEvent,
  checkInParticipant,
  exportParticipantsCsv,
} from '../controllers/registrationController.js';

const router = Router();

// Current user's registrations
router.get(
  '/me',
  authenticate,
  myRegistrations
);

// Register for an event
router.post(
  '/:id/register',
  authenticate,
  authorizeRoles(
    'customer',
    'organizer',
    'admin'
  ),
  registerForEvent
);

// Event participants
router.get(
  '/:id/participants',
  authenticate,
  authorizeRoles(
    'organizer',
    'admin'
  ),
  participantsForEvent
);

// Export participants CSV
router.get(
  '/:id/participants.csv',
  authenticate,
  authorizeRoles(
    'organizer',
    'admin'
  ),
  exportParticipantsCsv
);

// Check in participant
router.post(
  '/:id/checkin',
  authenticate,
  authorizeRoles(
    'organizer',
    'admin'
  ),
  checkInParticipant
);

export default router;


