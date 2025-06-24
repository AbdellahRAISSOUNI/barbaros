// API Response caching and optimization utilities
type CacheEntry<T> = {
  data: T;
  timestamp: number;
  etag?: string;
};

class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxAge: number;
  private maxEntries: number;

  constructor(maxAge = 5 * 60 * 1000, maxEntries = 100) { // 5 minutes, 100 entries
    this.maxAge = maxAge;
    this.maxEntries = maxEntries;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T, etag?: string): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      etag
    });
  }

  clear(): void {
    this.cache.clear();
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxEntries: this.maxEntries,
      maxAge: this.maxAge
    };
  }
}

// Global cache instance
export const apiCache = new ApiCache();

// Optimized fetch function with caching and retry logic
export async function optimizedFetch<T>(
  url: string,
  options: RequestInit & {
    cacheKey?: string;
    cacheDuration?: number;
    retries?: number;
    retryDelay?: number;
  } = {}
): Promise<T> {
  const {
    cacheKey = url,
    cacheDuration = 5 * 60 * 1000, // 5 minutes
    retries = 3,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  // Try cache first (for GET requests)
  if (!fetchOptions.method || fetchOptions.method === 'GET') {
    const cached = apiCache.get<T>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Fetch with retry logic
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      });

      if (!response.ok) {
        // Don't retry for client errors (4xx)
        if (response.status >= 400 && response.status < 500 && attempt < retries) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Retry for server errors (5xx) and network issues
        if (response.status >= 500 && attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
          continue;
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Cache successful GET responses
      if (!fetchOptions.method || fetchOptions.method === 'GET') {
        const etag = response.headers.get('etag');
        apiCache.set(cacheKey, data, etag || undefined);
      }

      return data;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
    }
  }

  throw new Error('Max retries exceeded');
}

// Batch request optimization
export class BatchRequestManager {
  private pendingRequests = new Map<string, Promise<any>>();
  private batchQueue: Array<{ url: string; resolve: Function; reject: Function }> = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private batchDelay = 50; // 50ms debounce

  async request<T>(url: string): Promise<T> {
    // Check if there's already a pending request for this URL
    if (this.pendingRequests.has(url)) {
      return this.pendingRequests.get(url);
    }

    // Create a new promise for this request
    const promise = new Promise<T>((resolve, reject) => {
      this.batchQueue.push({ url, resolve, reject });
      
      // Debounce batch execution
      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout);
      }
      
      this.batchTimeout = setTimeout(() => {
        this.executeBatch();
      }, this.batchDelay);
    });

    this.pendingRequests.set(url, promise);
    return promise;
  }

  private async executeBatch() {
    if (this.batchQueue.length === 0) return;

    const currentBatch = [...this.batchQueue];
    this.batchQueue.length = 0;

    // Group similar requests
    const groupedRequests = this.groupRequests(currentBatch);

    // Execute batched requests
    for (const [batchUrl, requests] of Object.entries(groupedRequests)) {
      try {
        if (requests.length === 1) {
          // Single request
          const data = await optimizedFetch(requests[0].url);
          requests[0].resolve(data);
        } else {
          // Multiple requests - could be optimized with a batch API endpoint
          const promises = requests.map(req => optimizedFetch(req.url));
          const results = await Promise.allSettled(promises);
          
          results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              requests[index].resolve(result.value);
            } else {
              requests[index].reject(result.reason);
            }
          });
        }
      } catch (error) {
        requests.forEach(req => req.reject(error));
      } finally {
        // Clean up pending requests
        requests.forEach(req => {
          this.pendingRequests.delete(req.url);
        });
      }
    }
  }

  private groupRequests(requests: Array<{ url: string; resolve: Function; reject: Function }>) {
    const groups: { [key: string]: Array<{ url: string; resolve: Function; reject: Function }> } = {};
    
    requests.forEach(request => {
      const baseUrl = request.url.split('?')[0];
      if (!groups[baseUrl]) {
        groups[baseUrl] = [];
      }
      groups[baseUrl].push(request);
    });
    
    return groups;
  }
}

export const batchRequestManager = new BatchRequestManager();

// Optimized search with debouncing
export function createDebouncedSearch<T>(
  searchFn: (query: string) => Promise<T[]>,
  delay = 300
) {
  let timeoutId: NodeJS.Timeout;
  let lastQuery = '';
  
  return {
    search: (query: string): Promise<T[]> => {
      return new Promise((resolve, reject) => {
        clearTimeout(timeoutId);
        
        // Return immediately if query hasn't changed
        if (query === lastQuery) {
          return searchFn(query).then(resolve).catch(reject);
        }
        
        lastQuery = query;
        
        timeoutId = setTimeout(async () => {
          try {
            const results = await searchFn(query);
            resolve(results);
          } catch (error) {
            reject(error);
          }
        }, delay);
      });
    },
    
    cancel: () => {
      clearTimeout(timeoutId);
    }
  };
}

// Performance monitoring
export class PerformanceMonitor {
  private metrics = new Map<string, number[]>();
  
  time<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    
    return fn().then(
      result => {
        this.recordMetric(label, performance.now() - start);
        return result;
      },
      error => {
        this.recordMetric(label, performance.now() - start);
        throw error;
      }
    );
  }
  
  private recordMetric(label: string, duration: number) {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    
    const times = this.metrics.get(label)!;
    times.push(duration);
    
    // Keep only last 100 measurements
    if (times.length > 100) {
      times.shift();
    }
  }
  
  getStats(label: string) {
    const times = this.metrics.get(label) || [];
    if (times.length === 0) return null;
    
    const sorted = [...times].sort((a, b) => a - b);
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    
    return {
      average: Math.round(avg * 100) / 100,
      median: Math.round(median * 100) / 100,
      p95: Math.round(p95 * 100) / 100,
      min: Math.round(sorted[0] * 100) / 100,
      max: Math.round(sorted[sorted.length - 1] * 100) / 100,
      count: times.length
    };
  }
  
  getAllStats() {
    const stats: { [key: string]: any } = {};
    for (const [label] of this.metrics) {
      stats[label] = this.getStats(label);
    }
    return stats;
  }
}

export const performanceMonitor = new PerformanceMonitor(); 