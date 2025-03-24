/**
 * Debug utilities for tracing and monitoring the token launcher components
 */

import { TestModeConfig } from '@/types/token';

// Debug levels
export type DebugLevel = 'error' | 'warn' | 'info' | 'debug';

// Debug namespace to organize logs by component
export type DebugNamespace = 
  | 'token-service' 
  | 'token-list' 
  | 'trade-token' 
  | 'launch-token' 
  | 'trending-tokens' 
  | 'token-visualizer' 
  | 'test-mode';

// Set this to true to enable debug mode
const DEBUG_ENABLED = process.env.NODE_ENV !== 'production';

// Configure which debug levels and namespaces to show
const DEBUG_CONFIG = {
  levels: {
    error: true,
    warn: true, 
    info: true,
    debug: DEBUG_ENABLED,
  },
  namespaces: {
    'token-service': true,
    'token-list': true,
    'trade-token': true,
    'launch-token': true,
    'trending-tokens': true,
    'token-visualizer': true,
    'test-mode': true,
  }
};

// Main debug logger function
export function debugLog(
  namespace: DebugNamespace,
  level: DebugLevel,
  message: string,
  data?: any
): void {
  // Skip logging if this namespace or level is disabled
  if (!DEBUG_CONFIG.namespaces[namespace] || !DEBUG_CONFIG.levels[level]) {
    return;
  }

  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${namespace}] [${level.toUpperCase()}]`;
  
  // Style based on level
  let consoleMethod: 'error' | 'warn' | 'info' | 'debug' = 'info';
  let style = '';
  
  switch (level) {
    case 'error':
      consoleMethod = 'error';
      style = 'color: #ff5555; font-weight: bold';
      break;
    case 'warn':
      consoleMethod = 'warn';
      style = 'color: #ffbb33; font-weight: bold';
      break;
    case 'info':
      consoleMethod = 'info';
      style = 'color: #33bbff';
      break;
    case 'debug':
      consoleMethod = 'debug';
      style = 'color: #bbbbbb';
      break;
  }

  // Log the message with styling
  if (data) {
    console[consoleMethod](`%c${prefix} ${message}`, style, data);
  } else {
    console[consoleMethod](`%c${prefix} ${message}`, style);
  }
}

// Helper functions for specific log levels
export const logError = (namespace: DebugNamespace, message: string, data?: any) => 
  debugLog(namespace, 'error', message, data);

export const logWarn = (namespace: DebugNamespace, message: string, data?: any) => 
  debugLog(namespace, 'warn', message, data);

export const logInfo = (namespace: DebugNamespace, message: string, data?: any) => 
  debugLog(namespace, 'info', message, data);

export const logDebug = (namespace: DebugNamespace, message: string, data?: any) => 
  debugLog(namespace, 'debug', message, data);

// Helper to log test mode changes
export const logTestModeChange = (prevMode: TestModeConfig, newMode: TestModeConfig) => {
  const stateChange = `${prevMode.enabled ? prevMode.mode : 'disabled'} -> ${newMode.enabled ? newMode.mode : 'disabled'}`;
  logInfo('test-mode', `Test mode changed: ${stateChange}`, { prevMode, newMode });
};

// Helper to log API requests
export const logApiRequest = (
  namespace: DebugNamespace,
  endpoint: string,
  method: string,
  data?: any,
  testMode?: TestModeConfig
) => {
  logDebug(
    namespace, 
    `API ${method} request to ${endpoint}`, 
    { data, testMode }
  );
};

// Helper to log API responses
export const logApiResponse = (
  namespace: DebugNamespace,
  endpoint: string,
  response: any,
  testMode?: TestModeConfig
) => {
  if (!response.success) {
    logWarn(
      namespace, 
      `API response error from ${endpoint}`, 
      { response, testMode }
    );
  } else {
    logDebug(
      namespace, 
      `API response from ${endpoint}`, 
      { response, testMode }
    );
  }
};
