import { sub } from 'date-fns';

export const dateTime = sub(new Date, { minutes: 0 }).toISOString();