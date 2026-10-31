import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

let io: SocketIOServer | null = null;

export const initSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const secret = process.env.JWT_SECRET || 'super_secret_royal_knot_jwt_key_2026_luxury_weddings';
      const decoded = jwt.verify(token, secret) as { id: string; role: string };
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
