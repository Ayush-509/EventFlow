import mongoose from 'mongoose';

import { connectDB } from './config/db.js';

import User from './models/User.js';
import Event from './models/Event.js';
import Registration from './models/Registration.js';
import Review from './models/Review.js';

import { generateQRCodeDataUrl } from './utils/qrcode.js';

async function run() {
  try {
    await connectDB();

    console.log('Cleaning database...');

    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      Registration.deleteMany({}),
      Review.deleteMany({}),
    ]);

    console.log('Creating users...');

    const customer = await User.create({
      name: 'Alice Customer',
      email: 'customer@example.com',
      password: 'password',
      role: 'customer',
      points: 25,
    });

    const organizer = await User.create({
      name: 'Oscar Organizer',
      email: 'organizer@example.com',
      password: 'password',
      role: 'organizer',
    });

    const admin = await User.create({
      name: 'Admin',
      email: 'anushikadhaked119@gmail.com',
      password: 'password',
      role: 'admin',
    });

    const now = new Date();

    console.log('Creating events...');

    const events = [];

    events.push(
      await Event.create({
        title: 'Tech Talk: MERN Essentials',
        description:
          'Intro to MERN stack for campus developers.',
        category: 'Tech',
        date: new Date(
          now.getTime() +
            3 * 24 * 60 * 60 * 1000
        ),
        location: 'Auditorium A',
        capacity: 100,
        organizer: organizer._id,
        status: 'approved',
        posterUrl: '/uploads/poster-1.jpg',
        tags: ['mern', 'javascript'],
      })
    );

    events.push(
      await Event.create({
        title:
          'Inter-College Football Meet',
        description:
          'Friendly football matches and skills workshop.',
        category: 'Sports',
        date: new Date(
          now.getTime() +
            10 * 24 * 60 * 60 * 1000
        ),
        location: 'Sports Ground',
        capacity: 60,
        organizer: organizer._id,
        status: 'approved',
        posterUrl: '/uploads/poster-2.jpg',
        tags: ['outdoor'],
      })
    );

    events.push(
      await Event.create({
        title:
          'Photography Basics Workshop',
        description:
          'Hands-on with composition and lighting.',
        category: 'Workshop',
        date: new Date(
          now.getTime() +
            5 * 24 * 60 * 60 * 1000
        ),
        location: 'Lab 204',
        capacity: 30,
        organizer: organizer._id,
        status: 'pending',
        posterUrl: '/uploads/poster-3.jpg',
        tags: ['creative'],
      })
    );

    events.push(
      await Event.create({
        title: 'Cultural Night 2025',
        description:
          'Dance, music, and drama from student clubs.',
        category: 'Cultural',
        date: new Date(
          now.getTime() +
            15 * 24 * 60 * 60 * 1000
        ),
        location:
          'Open Air Theatre',
        capacity: 200,
        organizer: organizer._id,
        status: 'approved',
        posterUrl: '/uploads/poster-5.jpg',
        tags: ['fest'],
      })
    );

    events.push(
      await Event.create({
        title:
          'Hackathon: Build for Campus',
        description:
          '24-hour hackathon to build campus utilities.',
        category: 'Tech',
        date: new Date(
          now.getTime() +
            20 * 24 * 60 * 60 * 1000
        ),
        location:
          'Innovation Lab',
        capacity: 80,
        organizer: organizer._id,
        status: 'approved',
        posterUrl: '/uploads/poster-6.jpg',
        tags: ['hackathon'],
      })
    );

    events.push(
      await Event.create({
        title:
          'Wellness Yoga Morning',
        description:
          'Relaxing yoga session for all students.',
        category: 'Workshop',
        date: new Date(
          now.getTime() +
            7 * 24 * 60 * 60 * 1000
        ),
        location: 'Campus Lawn',
        capacity: 50,
        organizer: organizer._id,
        status: 'approved',
        posterUrl: '/uploads/poster-7.jpg',
        tags: ['health'],
      })
    );

    console.log('Creating registration...');

    const payload = JSON.stringify({
      userId: customer._id.toString(),
      eventId: events[0]._id.toString(),
      at: Date.now(),
    });

    const qrCodeDataUrl =
      await generateQRCodeDataUrl(
        payload
      );

    await Registration.create({
      user: customer._id,
      event: events[0]._id,
      qrCodeDataUrl,
      status: 'registered',
    });

    console.log('Creating review...');

    await Review.create({
      user: customer._id,
      event: events[0]._id,
      rating: 5,
      comment: 'Great session!',
    });

    const ratingAgg =
      await Review.aggregate([
        {
          $match: {
            event: events[0]._id,
          },
        },
        {
          $group: {
            _id: '$event',
            avgRating: {
              $avg: '$rating',
            },
          },
        },
      ]);

    await Event.findByIdAndUpdate(
      events[0]._id,
      {
        averageRating:
          ratingAgg[0]?.avgRating || 0,
      }
    );

    console.log('\nSeed completed\n');

    console.table([
      {
        email: customer.email,
        role: customer.role,
      },
      {
        email: organizer.email,
        role: organizer.role,
      },
      {
        email: admin.email,
        role: admin.role,
      },
    ]);

    console.log(
      `Events created: ${events.length}`
    );
  } catch (error) {
    console.error(
      'Seed failed:',
      error
    );
  } finally {
    await mongoose.disconnect();
    console.log(
      'Database connection closed'
    );
    process.exit(0);
  }
}

run();
