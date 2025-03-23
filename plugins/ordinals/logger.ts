/**
 * Simple logger utility for the Ordinals Plugin
 */
export const logger = {
  info: (...args: any[]) => {
    console.info('[Ordinals]', ...args);
  },
  warn: (...args: any[]) => {
    console.warn('[Ordinals]', ...args);
  },
  error: (...args: any[]) => {
    console.error('[Ordinals]', ...args);
  },
  debug: (...args: any[]) => {
    if (process.env.DEBUG) {
      console.debug('[Ordinals]', ...args);
    }
  }
};
