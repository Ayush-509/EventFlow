import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      minlength: 3,
      maxlength: 150,
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: 10,
      maxlength: 5000,
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: [
        'Tech',
        'Sports',
        'Workshop',
        'Cultural',
        'Business',
        'Education',
        'Health',
        'Other',
      ],
    },

    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },

    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: 200,
    },

    capacity: {
      type: Number,
      default: 0,
      min: [0, 'Capacity cannot be negative'],
    },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    posterUrl: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Search indexes
eventSchema.index({
  title: 'text',
  description: 'text',
  category: 'text',
});

// Useful query indexes
eventSchema.index({ date: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ organizer: 1, status: 1 });

export const Event = mongoose.model(
  'Event',
  eventSchema
);

export default Event;


