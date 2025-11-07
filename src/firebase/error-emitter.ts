
import { EventEmitter } from 'events';
import type { FirestorePermissionError } from './errors';

// Extend the default EventEmitter typing
declare interface TypedEventEmitter<T> {
  on<K extends keyof T>(event: K, listener: (arg: T[K]) => void): this;
  off<K extends keyof T>(event: K, listener: (arg: T[K]) => void): this;
  emit<K extends keyof T>(event: K, arg: T[K]): boolean;
}

// Define the event map
interface ErrorEvents {
  'permission-error': FirestorePermissionError;
}

// We are intentionally not using the generic version to keep the JS output
class ErrorEventEmitter extends EventEmitter {}

export const errorEmitter = new ErrorEventEmitter() as TypedEventEmitter<ErrorEvents>;
