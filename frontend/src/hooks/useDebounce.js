import { useState, useEffect } from 'react';

// Delays updating the returned value until the user stops typing.
// Why 400ms: short enough to feel responsive, long enough to avoid
// firing a request on every single keystroke. Standard UX practice.
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: if value changes before delay expires, cancel the previous timer
    // This is what makes it a debounce and not just a delayed setState
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
