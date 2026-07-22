import * as msgService from '../services/messaging.service.js';
import { successResponse } from '../utils/response.util.js';

export const getConversations = async (req, res, next) => {
  try {
    const convs = await msgService.getConversations(req.user.id);
    return successResponse(res, convs, 'Sohbetler getirildi', 200);
  } catch (e) {
    next(e);
  }
};

export const getConversationMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const messages = await msgService.getConversationMessages(id, req.user.id);
    return successResponse(res, messages, 'Mesajlar getirildi', 200);
  } catch (e) {
    next(e);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const msg = await msgService.sendMessage(id, content, req.user);
    return successResponse(res, msg, 'Mesaj gönderildi', 201);
  } catch (e) {
    next(e);
  }
};

export const startConversation = async (req, res, next) => {
  try {
    const { targetUserId } = req.body;
    const conv = await msgService.startConversation(targetUserId, req.user);
    return successResponse(res, conv, 'Sohbet başlatıldı', 201);
  } catch (e) {
    next(e);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await msgService.markAsRead(id, req.user);
    return successResponse(res, null, 'Okundu olarak işaretlendi', 200);
  } catch (e) {
    next(e);
  }
};
