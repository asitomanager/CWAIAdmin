import * as React from "react";

export interface Selection<T = string> {
  deselectAll: () => void;
  deselectOne: (key: T) => void;
  selectAll: () => void;
  selectOne: (key: T) => void;
  toggleSelection: (key: T) => void; // ✅ Added toggleSelection function
  selected: Set<T>;
  selectedAny: boolean;
  selectedAll: boolean;
}

// IMPORTANT: To prevent infinite loops, `keys` argument must be memoized with React.useMemo.
export function useSelection<T = string>(keys: T[] = []): Selection<T> {
  const [selected, setSelected] = React.useState<Set<T>>(new Set());

  // Reset selection when keys change
  React.useEffect(() => {
    setSelected(new Set());
  }, [keys]);

  const handleDeselectAll = React.useCallback(() => {
    setSelected(new Set());
  }, []);

  const handleDeselectOne = React.useCallback((key: T) => {
    setSelected((prev) => {
      const copy = new Set(prev);
      copy.delete(key);
      return copy;
    });
  }, []);

  const handleSelectAll = React.useCallback(() => {
    setSelected(new Set(keys));
  }, [keys]);

  const handleSelectOne = React.useCallback((key: T) => {
    setSelected((prev) => {
      const copy = new Set(prev);
      copy.add(key);
      return copy;
    });
  }, []);

  // ✅ New toggleSelection function to handle both select & deselect
  const toggleSelection = React.useCallback((key: T) => {
    setSelected((prev) => {
      const copy = new Set(prev);
      if (copy.has(key)) {
        copy.delete(key); // Deselect if already selected
      } else {
        copy.add(key); // Select if not selected
      }
      return copy;
    });
  }, []);

  const selectedAny = selected.size > 0;
  const selectedAll = selected.size === keys.length;

  return {
    deselectAll: handleDeselectAll,
    deselectOne: handleDeselectOne,
    selectAll: handleSelectAll,
    selectOne: handleSelectOne,
    toggleSelection, // ✅ Now included in return object
    selected,
    selectedAny,
    selectedAll,
  };
}