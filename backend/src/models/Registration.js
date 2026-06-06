import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event is required'],
      index: true,
    },

    status: {
      type: String,
      enum: ['registered', 'attended', 'cancelled'],
      default: 'registered',
      index: true,
    },

    qrCodeDataUrl: {
      type: String,
      default: null,
    },

    checkedInAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Prevent duplicate registrations
registrationSchema.index(
  { user: 1, event: 1 },
  { unique: true }
);

// Common query patterns
registrationSchema.index({
  event: 1,
  status: 1,
});

registrationSchema.index({
  user: 1,
  createdAt: -1,
});

// Auto-set check-in timestamp
registrationSchema.pre('save', function (next) {
  if (
    this.isModified('status') &&
    this.status === 'attended' &&
    !this.checkedInAt
  ) {
    this.checkedInAt = new Date();
  }

  next();
});

// Clean JSON response
registrationSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export const Registration = mongoose.model(
  'Registration',
  registrationSchema
);

export default Registration;


