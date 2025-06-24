import { useState, useEffect, useCallback, useRef } from 'react';

interface UseRealTimeDataOptions<T> {
  fetchFn: () => Promise<T>;
  initialData?: T;
  refreshInterval?: number;
  dependencies?: any[];
  onError?: (error: Error) => void;
  onSuccess?: (data: T) => void;
}

export function useRealTimeData<T>({
  fetchFn,
  initialData,
  refreshInterval = 30000, // 30 seconds default
  dependencies = [],
  onError,
  onSuccess
}: UseRealTimeDataOptions<T>) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isComponentMountedRef = useRef(true);

  const fetchData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);
      
      const result = await fetchFn();
      
      if (isComponentMountedRef.current) {
        setData(result);
        setLastUpdated(new Date());
        onSuccess?.(result);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      if (isComponentMountedRef.current) {
        setError(error);
        onError?.(error);
      }
    } finally {
      if (isComponentMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [fetchFn, onError, onSuccess]);

  const refresh = useCallback(() => {
    fetchData(false); // Don't show loading spinner for manual refresh
  }, [fetchData]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchData(false); // Background refresh without loading spinner
      }, refreshInterval);
    }
  }, [refreshInterval, fetchData]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Initial fetch and setup polling
  useEffect(() => {
    isComponentMountedRef.current = true;
    fetchData(true);
    startPolling();

    return () => {
      isComponentMountedRef.current = false;
      stopPolling();
    };
  }, dependencies);

  // Update polling when interval changes
  useEffect(() => {
    startPolling();
    return stopPolling;
  }, [startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isComponentMountedRef.current = false;
      stopPolling();
    };
  }, [stopPolling]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refresh,
    startPolling,
    stopPolling
  };
}

// Optimized fetch function with caching
export function createCachedFetcher<T>(
  url: string, 
  cacheKey: string,
  cacheDuration: number = 300000 // 5 minutes default
) {
  const cache = new Map<string, { data: T; timestamp: number }>();
  
  return async (): Promise<T> => {
    const now = Date.now();
    const cached = cache.get(cacheKey);
    
    // Return cached data if valid
    if (cached && (now - cached.timestamp) < cacheDuration) {
      return cached.data;
    }
    
    // Fetch fresh data
    const response = await fetch(url, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the result
    cache.set(cacheKey, { data, timestamp: now });
    
    return data;
  };
}

// Real-time event system for immediate updates
class RealTimeEventBus {
  private listeners = new Map<string, Set<(data: any) => void>>();
  
  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    
    return () => this.off(event, callback);
  }
  
  off(event: string, callback: (data: any) => void) {
    this.listeners.get(event)?.delete(callback);
  }
  
  emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }
  
  clear() {
    this.listeners.clear();
  }
}

export const realTimeEvents = new RealTimeEventBus();

// Hook for listening to real-time events
export function useRealTimeEvent<T>(
  event: string, 
  callback: (data: T) => void,
  dependencies: any[] = []
) {
  useEffect(() => {
    const unsubscribe = realTimeEvents.on(event, callback);
    return unsubscribe;
  }, dependencies);
} 