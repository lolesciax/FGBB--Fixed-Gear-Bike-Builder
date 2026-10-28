import mongoose, { type ClientSession } from 'mongoose';
import { Subject, type SubjectDocument } from './models';
import { ApiError } from './security';
export const DAY = 86400000;
export type EventField = 'changes' | 'previews' | 'creates' | 'saves' | 'exports';
export async function withSubject<T>(id: string, fn: (subject: SubjectDocument, session: ClientSession) => Promise<T>): Promise<T> {
  await Subject.updateOne({ _id: id }, { $setOnInsert: { _id: id, ...(id.startsWith('guest:') ? { expiresAt: new Date(Date.now() + 31 * DAY) } : {}) } }, { upsert: true });
  return mongoose.connection.transaction(async session => {
    // Serialize every business mutation for this subject across all API instances.
    const subject = await Subject.findOneAndUpdate({ _id: id }, { $inc: { sequence: 1 } }, { returnDocument: 'after', session });
    if (!subject) throw new ApiError(500, 'SUBJECT_MISSING', 'Unable to load usage.');
    for (const field of ['changes', 'previews', 'creates', 'saves', 'exports'] as const) subject.set(field, subject[field].filter(t => t > Date.now() - (field === 'creates' ? 30 * DAY : field === 'saves' ? 3600000 : DAY)));
    const result = await fn(subject, session);
    await subject.save({ session });
    return result;
  });
}
export function charge(subject: { [k: string]: unknown }, field: EventField, limit: number, windowMs: number, code: string) {
  const now = Date.now();
  const events = (subject[field] as number[]).filter(t => t > now - windowMs);
  if (events.length >= limit) throw new ApiError(409, code, `Your ${field} allowance has been reached.`, { resetAt: new Date(events[0] + windowMs).toISOString(), limit }, Math.ceil((events[0] + windowMs - now) / 1000));
  (subject[field] as number[]).push(now);
}
