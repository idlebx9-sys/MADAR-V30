/**
 * Asynchronous In-Memory Resource Mutex / Lock Manager
 * 
 * Provides atomic serialization for concurrent transactions on the same resource
 * (e.g. `wallet:123`, `deposit:456`), preventing double-spending, race conditions,
 * and concurrent modification anomalies.
 */

export class AsyncMutex {
  private static locks: Map<string, Promise<void>> = new Map();

  /**
   * Execute `fn` while holding an exclusive lock on `key`.
   * Concurrent calls with the same `key` will wait in a FIFO queue.
   */
  static async withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const currentLock = this.locks.get(key) || Promise.resolve();

    let releaseLock: () => void = () => {};
    const nextLock = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });

    // Replace the current lock tail with nextLock
    this.locks.set(key, currentLock.then(() => nextLock));

    // Wait for the previous lock holder to finish
    await currentLock;

    try {
      return await fn();
    } finally {
      releaseLock();
      // Clean up if this was the last lock
      if (this.locks.get(key) === nextLock) {
        this.locks.delete(key);
      }
    }
  }

  /**
   * Lock multiple keys simultaneously in deterministic sorted order
   * to avoid deadlocks.
   */
  static async withLocks<T>(keys: string[], fn: () => Promise<T>): Promise<T> {
    const sortedKeys = [...new Set(keys)].sort();

    const acquireNext = async (index: number): Promise<T> => {
      if (index >= sortedKeys.length) {
        return await fn();
      }
      return await this.withLock(sortedKeys[index], () => acquireNext(index + 1));
    };

    return await acquireNext(0);
  }
}
