export class EventEmitter<
  T extends Record<string, {
    args: unknown[];
    return: unknown;
  }>
> {
  events: {
    [K in keyof T]?: ((...args: T[K]['args']) => T[K]['return'])[]
  } = {};

  on<K extends keyof T>(
    name: K, listener: (...args: T[K]['args']) => T[K]['return']
  ): void {
    this.events[name] ??= [];
    this.events[name].push(listener);
  }

  emit<K extends keyof T>(
    name: K, ...args: T[K]['args']
  ): T[K]['return'][] {
    return (this.events[name] ?? []).map(f => f(...args));
  }
}