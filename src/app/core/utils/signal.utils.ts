import { signal, computed, Signal } from '@angular/core';

export function createLoadingState<T>() {
  const data = signal<T | null>(null);
  const loading = signal(false);
  const error = signal<Error | null>(null);

  const state = computed(() => ({
    data: data(),
    loading: loading(),
    error: error(),
    hasData: data() !== null,
    hasError: error() !== null,
  }));

  return {
    data,
    loading,
    error,
    state,
    setData: (value: T) => {
      data.set(value);
      loading.set(false);
      error.set(null);
    },
    setLoading: (value: boolean) => loading.set(value),
    setError: (err: Error) => {
      error.set(err);
      loading.set(false);
    },
    reset: () => {
      data.set(null);
      loading.set(false);
      error.set(null);
    },
  };
}