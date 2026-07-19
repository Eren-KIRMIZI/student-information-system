import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

export const formatDate = (date, format = 'DD MMMM YYYY') => dayjs(date).format(format);

export const formatDateTime = (date) => dayjs(date).format('DD MMMM YYYY, HH:mm');

export const formatTime = (date) => dayjs(date).format('HH:mm');

export const isUpcoming = (date) => new Date(date) >= new Date();

export const isPast = (date) => new Date(date) < new Date();

export const toISODate = (date) => dayjs(date).format('YYYY-MM-DD');
