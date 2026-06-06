import mongoose from 'mongoose';
import User from '../models/User.js';
import Registration from '../models/Registration.js';
import Event from '../models/Event.js';

export const leaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find({
      role: { $in: ['customer', 'organizer'] },
      isBlocked: false,
    })
      .sort({ points: -1, createdAt: 1 })
      .limit(10)
      .select('name points role');

    res.json({
      count: leaderboard.length,
      leaderboard,
    });
  } catch (err) {
    console.error('Leaderboard Error:', err);

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const recommendations = async (req, res) => {
  try {
    const registrations = await Registration.find({
      user: req.user.id,
    }).populate('event', 'category');

    const categories = [
      ...new Set(
        registrations
          .map((registration) => registration.event?.category)
          .filter(Boolean)
      ),
    ];

    const filter = {
      status: 'approved',
      date: { $gte: new Date() },
    };

    if (categories.length > 0) {
      filter.category = {
        $in: categories,
      };
    }

    const events = await Event.find(filter)
      .sort({ date: 1 })
      .limit(6)
      .populate('organizer', 'name');

    res.json({
      count: events.length,
      events,
    });
  } catch (err) {
    console.error('Recommendations Error:', err);

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const summary = async (req, res) => {
  try {
    const [
      totalEvents,
      approvedEvents,
      upcomingEvents,
      totalRegistrations,
      totalCustomers,
      totalOrganizers,
    ] = await Promise.all([
      Event.countDocuments(),
      Event.countDocuments({
        status: 'approved',
      }),
      Event.countDocuments({
        status: 'approved',
        date: {
          $gte: new Date(),
        },
      }),
      Registration.countDocuments(),
      User.countDocuments({
        role: 'customer',
        isBlocked: false,
      }),
      User.countDocuments({
        role: 'organizer',
        isBlocked: false,
      }),
    ]);

    res.json({
      totals: {
        events: totalEvents,
        approvedEvents,
        upcomingEvents,
        registrations: totalRegistrations,
        customers: totalCustomers,
        organizers: totalOrganizers,
      },
    });
  } catch (err) {
    console.error('Summary Error:', err);

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const trending = async (req, res) => {
  try {
    const popularAgg = await Registration.aggregate([
      {
        $match: {
          status: {
            $ne: 'cancelled',
          },
        },
      },
      {
        $group: {
          _id: '$event',
          registrations: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          registrations: -1,
        },
      },
      {
        $limit: 6,
      },
    ]);

    const popularIds = popularAgg.map(
      (item) => item._id
    );

    const popularEvents = await Event.find({
      _id: {
        $in: popularIds,
      },
      status: 'approved',
    }).lean();

    const registrationMap = new Map(
      popularAgg.map((item) => [
        String(item._id),
        item.registrations,
      ])
    );

    const popular = popularEvents
      .map((event) => ({
        ...event,
        registrations:
          registrationMap.get(
            String(event._id)
          ) || 0,
      }))
      .sort(
        (a, b) =>
          b.registrations -
          a.registrations
      );

    const topRated = await Event.find({
      status: 'approved',
    })
      .sort({
        averageRating: -1,
        createdAt: -1,
      })
      .limit(6)
      .lean();

    const recent = await Event.find({
      status: 'approved',
    })
      .sort({
        createdAt: -1,
      })
      .limit(6)
      .lean();

    res.json({
      popular,
      topRated,
      recent,
    });
  } catch (err) {
    console.error('Trending Error:', err);

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const dashboardStats = async (req, res) => {
  try {
    const categories = await Event.aggregate([
      {
        $match: {
          status: 'approved',
        },
      },
      {
        $group: {
          _id: '$category',
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    const upcomingByMonth =
      await Event.aggregate([
        {
          $match: {
            status: 'approved',
            date: {
              $gte: new Date(),
            },
          },
        },
        {
          $project: {
            month: {
              $dateToString: {
                format: '%Y-%m',
                date: '$date',
              },
            },
          },
        },
        {
          $group: {
            _id: '$month',
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
        {
          $limit: 12,
        },
      ]);

    res.json({
      categories,
      upcomingByMonth,
    });
  } catch (err) {
    console.error(
      'Dashboard Stats Error:',
      err
    );

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

