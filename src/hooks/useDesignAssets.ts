import { useState, useEffect, useCallback } from 'react';
import { 
  DesignItem, 
  fetchDesignAssets, 
  fetchFilterOptions, 
  searchDesignAssets 
} from '@/lib/supabaseDesign';
import { FilterState } from '@/components/Gallery/FilterPanel';

interface FilterOptions {
  designContexts: string[];
  sculpturalForms: string[];
  interiorAreas: string[];
  placementTypes: string[];
}

interface UseDesignAssetsReturn {
  items: DesignItem[];
  filterOptions: FilterOptions;
  isLoading: boolean;
  error: string | null;
  search: (query: string, filters: FilterState) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useDesignAssets = (): UseDesignAssetsReturn => {
  const [items, setItems] = useState<DesignItem[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    designContexts: [],
    sculpturalForms: [],
    interiorAreas: [],
    placementTypes: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial load
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [assets, options] = await Promise.all([
        fetchDesignAssets(),
        fetchFilterOptions()
      ]);
      
      setItems(assets);
      setFilterOptions(options);
    } catch (err) {
      console.error('Error loading design assets:', err);
      setError('Failed to load design assets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Search with filters
  const search = useCallback(async (query: string, filters: FilterState) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // If no search and no filters, fetch all
      const hasFilters = Object.values(filters).some(arr => arr.length > 0);
      
      if (!query && !hasFilters) {
        const assets = await fetchDesignAssets();
        setItems(assets);
      } else {
        const results = await searchDesignAssets(query, filters);
        setItems(results);
      }
    } catch (err) {
      console.error('Error searching design assets:', err);
      setError('Failed to search design assets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh data
  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Load on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    items,
    filterOptions,
    isLoading,
    error,
    search,
    refresh
  };
};

export default useDesignAssets;
