import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '../lib/socket';
import toast from 'react-hot-toast';

export const useSocketEvent = (event, handler) => {
  const stableHandler = useCallback(handler, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on(event, stableHandler);
    return () => socket.off(event, stableHandler);
  }, [event, stableHandler]);
};

export const useAnnouncementSocket = () => {
  const qc = useQueryClient();
  useSocketEvent('announcement:created', () => {
    qc.invalidateQueries({ queryKey: ['announcements'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
    toast.success('Yeni duyuru geldi!');
  });
  useSocketEvent('announcement:updated', () => {
    qc.invalidateQueries({ queryKey: ['announcements'] });
  });
  useSocketEvent('announcement:deleted', () => {
    qc.invalidateQueries({ queryKey: ['announcements'] });
  });
};

export const useGradeSocket = () => {
  const qc = useQueryClient();
  useSocketEvent('grade:updated', () => {
    qc.invalidateQueries({ queryKey: ['grades'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
    toast.success('Notunuz guncellendi!');
  });
};

export const useEnrollmentSocket = () => {
  const qc = useQueryClient();
  useSocketEvent('enrollment:created', () => {
    qc.invalidateQueries({ queryKey: ['enrollments'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
    toast('Yeni ders kayit talebi var');
  });
  useSocketEvent('enrollment:updated', (data) => {
    qc.invalidateQueries({ queryKey: ['enrollments'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
    if (data.status === 'ACTIVE') toast.success('Kaydiniz onaylandi!');
    else if (data.status === 'REJECTED') toast.error('Kaydiniz reddedildi');
  });
};

export const useAttendanceSocket = () => {
  const qc = useQueryClient();
  useSocketEvent('attendance:updated', () => {
    qc.invalidateQueries({ queryKey: ['attendance'] });
  });
};

export const useCalendarSocket = () => {
  const qc = useQueryClient();
  useSocketEvent('calendar:updated', () => {
    qc.invalidateQueries({ queryKey: ['calendar'] });
  });
  useSocketEvent('calendar:created', () => {
    qc.invalidateQueries({ queryKey: ['calendar'] });
    toast('Akademik takvim guncellendi');
  });
  useSocketEvent('calendar:deleted', () => {
    qc.invalidateQueries({ queryKey: ['calendar'] });
  });
};

export const useUserStatusSocket = () => {
  const qc = useQueryClient();
  useSocketEvent('user:statusChanged', () => {
    qc.invalidateQueries({ queryKey: ['users'] });
  });
};
