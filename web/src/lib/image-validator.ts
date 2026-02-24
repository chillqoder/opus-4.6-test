import { ImageStatus } from './types';

export function validateImage(url: string, timeoutMs = 8000): Promise<ImageStatus> {
  return new Promise((resolve) => {
    const img = new window.Image();
    let done = false;

    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        resolve('broken');
      }
    }, timeoutMs);

    img.onload = () => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        resolve('valid');
      }
    };

    img.onerror = () => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        resolve('broken');
      }
    };

    img.src = url;
  });
}

export class ValidationQueue {
  private concurrency: number;
  private running = 0;
  private queue: Array<() => void> = [];
  private cache = new Map<string, Promise<ImageStatus>>();

  constructor(concurrency = 8) {
    this.concurrency = concurrency;
  }

  validate(url: string): Promise<ImageStatus> {
    const cached = this.cache.get(url);
    if (cached) return cached;

    const promise = new Promise<ImageStatus>((resolve) => {
      const run = async () => {
        this.running++;
        const result = await validateImage(url);
        this.running--;
        resolve(result);
        this.dequeue();
      };

      if (this.running < this.concurrency) {
        run();
      } else {
        this.queue.push(run);
      }
    });

    this.cache.set(url, promise);
    return promise;
  }

  private dequeue() {
    if (this.queue.length > 0 && this.running < this.concurrency) {
      const next = this.queue.shift()!;
      next();
    }
  }

  reset() {
    this.cache.clear();
    this.queue = [];
    this.running = 0;
  }
}
