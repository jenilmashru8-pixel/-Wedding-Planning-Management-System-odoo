import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from './config/prisma.js';
import { getJwtSecret } from './utils/jwtSecret.js';

let io: SocketIOServer | null = null;

export const initSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL?.trim() || '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use(async (socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = jwt.verify(token, getJwtSecret()) as { id: string; role: string; tokenVersion?: number };
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { isActive: true, tokenVersion: true },
      });
      if (!user?.isActive || (decoded.tokenVersion ?? 0) !== user.tokenVersion) {
        return next(new Error('Authentication error'));
      }
      (socket as any).user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    if (user?.id) {
      socket.join(`user:${user.id}`);
    }

    socket.on('join_wedding', (weddingId: string) => {
      socket.join(`wedding:${weddingId}`);
    });

    socket.on('leave_wedding', (weddingId: string) => {
      socket.leave(`wedding:${weddingId}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

export const emitToWedding = (weddingId: string, event: string, data: any) => {
  if (io) {
    io.to(`wedding:${weddingId}`).emit(event, data);
  }
};

export const emitToUser = (userId: string, event: string, data: any) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

export const disconnectUserSockets = (userId: string): void => {
  io?.in(`user:${userId}`).disconnectSockets(true);
};
