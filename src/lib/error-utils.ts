/**
 * Error handling utilities to ensure robust functionality
 */

// Safe localStorage operations
export const safeLocalStorage = {
  getItem(key: string, defaultValue: string = ''): string {
    try {
      return localStorage.getItem(key) || defaultValue;
    } catch (error) {
      console.warn(`Failed to read localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  setItem(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(`Failed to write localStorage key "${key}":`, error);
      return false;
    }
  },

  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to remove localStorage key "${key}":`, error);
      return false;
    }
  },

  getJSON<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.warn(`Failed to parse localStorage JSON for key "${key}":`, error);
      return defaultValue;
    }
  },

  setJSON<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Failed to stringify/store JSON for key "${key}":`, error);
      return false;
    }
  }
};

// Safe JSON parsing
export function safeJSONParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.warn('Failed to parse JSON:', error);
    return defaultValue;
  }
}

// Safe async operation wrapper
export async function safeAsync<T>(
  operation: () => Promise<T>,
  defaultValue: T,
  errorMessage?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (errorMessage) {
      console.error(errorMessage, error);
    } else {
      console.error('Async operation failed:', error);
    }
    return defaultValue;
  }
}

// Safe API call wrapper
export async function safeApiCall<T>(
  apiCall: () => Promise<{ data?: T; error?: string }>,
  defaultValue: T
): Promise<{ data: T; error?: string }> {
  try {
    const result = await apiCall();
    if (result.error) {
      console.warn('API call returned error:', result.error);
      return { data: defaultValue, error: result.error };
    }
    return { data: result.data || defaultValue };
  } catch (error: any) {
    console.error('API call failed:', error);
    return { data: defaultValue, error: error.message || 'Unknown error' };
  }
}

// Safe navigation wrapper
export function safeNavigate(url: string, fallbackUrl: string = '/'): void {
  try {
    window.location.href = url;
  } catch (error) {
    console.error('Navigation failed:', error);
    try {
      window.location.href = fallbackUrl;
    } catch (fallbackError) {
      console.error('Fallback navigation also failed:', fallbackError);
    }
  }
}

// Safe clipboard operation
export async function safeCopyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.warn('Clipboard write failed:', error);
    // Fallback to older method
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch (fallbackError) {
      console.error('Fallback clipboard method also failed:', fallbackError);
      return false;
    }
  }
}

// Error boundary component helper
export class ErrorBoundary extends Error {
  constructor(message: string, public component?: string) {
    super(message);
    this.name = 'ErrorBoundary';
  }
}

// Validate required fields
export function validateRequired<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  for (const field of requiredFields) {
    if (!data[field]) {
      missing.push(String(field));
    }
  }
  return { valid: missing.length === 0, missing };
}

// Safe array access
export function safeArrayAccess<T>(
  array: T[] | undefined | null,
  index: number,
  defaultValue: T | undefined = undefined
): T | undefined {
  if (!array || !Array.isArray(array)) return defaultValue;
  if (index < 0 || index >= array.length) return defaultValue;
  return array[index];
}

// Safe object property access
export function safeGet<T, K extends keyof T>(
  obj: T | undefined | null,
  key: K,
  defaultValue?: T[K]
): T[K] | undefined {
  if (!obj || typeof obj !== 'object') return defaultValue;
  return obj[key] !== undefined ? obj[key] : defaultValue;
}

// Retry mechanism for critical operations
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.warn(`Operation failed (attempt ${i + 1}/${maxRetries}):`, error.message);
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError || new Error('Operation failed after retries');
}

// Network status checker
export function isOnline(): boolean {
  return navigator.onLine !== false;
}

// Debounce function to prevent rapid calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// Throttle function to limit call frequency
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
