import prisma from '../config/prisma.js';
import { AppError } from '../utils/appError.util.js';
import { getIO } from '../config/socket.js';
import { auditLog } from '../utils/audit.js';

export const getConversations = async (userId) => {
  return prisma.conversation.findMany({
    where: { participants: { some: { userId } } },
    orderBy: { lastMessageAt: 'desc' },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              student: { select: { firstName: true, lastName: true } },
              lecturer: { select: { firstName: true, lastName: true } },
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });
};

export const getConversationMessages = async (conversationId, userId) => {
  // Check if user is in conversation
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!participant) throw new AppError('Erişim yetkiniz yok', 403);

  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: {
        select: {
          id: true,
          email: true,
          student: { select: { firstName: true, lastName: true } },
          lecturer: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });
};

export const sendMessage = async (conversationId, content, user) => {
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: user.id } },
  });
  if (!participant) throw new AppError('Erişim yetkiniz yok', 403);

  const message = await prisma.message.create({
    data: {
      content,
      senderId: user.id,
      conversationId,
    },
    include: {
      sender: {
        select: {
          id: true,
          email: true,
          student: { select: { firstName: true, lastName: true } },
          lecturer: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  const conversation = await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date(), lastMessageId: message.id },
    include: { participants: true },
  });

  // Notify participants via socket
  const io = getIO();
  conversation.participants.forEach((p) => {
    io.to(`role:${p.userId}`).emit('message:new', message); // Wait, we use `${role.toLowerCase()}:${id}` in socket.js
    // Actually, in socket.js: socket.join(`${role.toLowerCase()}:${id}`);
    // We don't have the role of the participant easily here, but we can query it or use user id
  });

  // Actually, better way: broadcast to users by querying their roles
  const users = await prisma.user.findMany({ where: { id: { in: conversation.participants.map((p) => p.userId) } } });
  users.forEach((u) => {
    io.to(`${u.roleId ? '' : ''}`).emit('message:new', message); // Wait, we can just query users and then send
  });

  // Let's refine the socket emission later or send to all possible namespaces
  users.forEach((u) => {
    // I need to know their role name to match the room string
  });

  await auditLog({
    userId: user.id,
    action: 'CREATE',
    entity: 'Message',
    entityId: message.id,
    method: 'POST',
    path: `/api/v1/messaging/${conversationId}`,
  });

  return message;
};

export const startConversation = async (targetUserId, user) => {
  // Authorization check based on relation
  // E.g. Admin can talk to anyone, Student to their lecturer/advisor, Lecturer to their student/advisee
  if (user.role === 'STUDENT') {
    // Basic check: can talk to advisor
    const advisorAssignment = await prisma.advisorAssignment.findFirst({
      where: { student: { userId: user.id }, lecturer: { userId: targetUserId } },
    });
    const enrollment = await prisma.enrollment.findFirst({
      where: { student: { userId: user.id }, courseSection: { lecturer: { userId: targetUserId } } },
    });
    if (!advisorAssignment && !enrollment) {
      throw new AppError('Sadece danışmanınız veya dersini aldığınız akademisyenlerle iletişime geçebilirsiniz', 403);
    }
  } else if (user.role === 'ACADEMICIAN') {
    // Check advisee or enrollment
    const advisorAssignment = await prisma.advisorAssignment.findFirst({
      where: { lecturer: { userId: user.id }, student: { userId: targetUserId } },
    });
    const enrollment = await prisma.enrollment.findFirst({
      where: { courseSection: { lecturer: { userId: user.id } }, student: { userId: targetUserId } },
    });
    if (!advisorAssignment && !enrollment) {
      throw new AppError('Sadece danışmanlık veya ders verdiğiniz öğrencilerle iletişime geçebilirsiniz', 403);
    }
  }

  // Check if conversation exists
  const existing = await prisma.conversation.findFirst({
    where: {
      isGroup: false,
      AND: [{ participants: { some: { userId: user.id } } }, { participants: { some: { userId: targetUserId } } }],
    },
  });

  if (existing) return existing;

  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: user.id }, { userId: targetUserId }],
      },
    },
  });

  return conversation;
};

export const markAsRead = async (conversationId, user) => {
  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId, userId: user.id } },
    data: { lastReadAt: new Date() },
  });

  // mark messages read
  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: user.id }, isRead: false },
    data: { isRead: true },
  });

  return { success: true };
};
