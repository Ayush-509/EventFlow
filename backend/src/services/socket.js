import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function initSocket(server, clientOrigin) {
  const io = new Server(server, {
    cors: {
      origin: clientOrigin,
      credentials: true,
    },
  });

  // JWT Authentication
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token;

      if (!token) {
        return next(
          new Error('Authentication required')
        );
      }

      const decoded = jwt.verify(
        token,
        env.jwtSecret
      );

      socket.user = decoded;

      next();
    } catch (err) {
      next(
        new Error('Invalid authentication token')
      );
    }
  });

  io.on('connection', (socket) => {
    console.log(
      `Socket connected: ${socket.id}`
    );

    console.log(
      `User: ${socket.user?.name || 'Unknown'}`
    );

    // Join event room
    socket.on('join-event', (eventId) => {
      if (!eventId) return;

      socket.join(`event:${eventId}`);

      socket.emit('joined-event', {
        eventId,
      });
    });

    // Leave event room
    socket.on('leave-event', (eventId) => {
      if (!eventId) return;

      socket.leave(`event:${eventId}`);
    });

    // Announcement (Admin / Organizer only)
    socket.on(
      'announce',
      ({ message, eventId }) => {
        try {
          if (
            !['admin', 'organizer'].includes(
              socket.user?.role
            )
          ) {
            return socket.emit('error', {
              message:
                'Not authorized to send announcements',
            });
          }

          if (
            !message ||
            typeof message !== 'string'
          ) {
            return;
          }

          const payload = {
            message: message.trim(),
            by: socket.user.name,
            role: socket.user.role,
            at: Date.now(),
          };

          if (eventId) {
            io.to(
              `event:${eventId}`
            ).emit(
              'announcement',
              payload
            );
          } else {
            io.emit(
              'announcement',
              payload
            );
          }
        } catch (err) {
          console.error(
            'Announcement Error:',
            err
          );
        }
      }
    );

    socket.on('disconnect', (reason) => {
      console.log(
        `Socket disconnected: ${socket.id}`
      );

      console.log(`Reason: ${reason}`);
    });
  });

  return io;
}


