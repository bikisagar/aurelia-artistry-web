import { createClient, SupabaseClient } from '@supabase/supabase-js';
import content from '@/data/content.json';

// Get Supabase config from content.json
const supabaseUrl = content.design?.supabase?.url || '';
const supabaseAnonKey = content.design?.supabase?.anonKey || '';
const bucketName = content.design?.supabase?.bucketName || 'Images';

// Validate URL is a proper HTTP/HTTPS URL
const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

// Lazy-initialize Supabase client to avoid module-level execution issues
let _supabaseDesign: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (_supabaseDesign) return _supabaseDesign;
  
  if (isValidUrl(supabaseUrl) && supabaseAnonKey) {
    _supabaseDesign = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabaseDesign;
};

// Legacy export for backward compatibility
export const supabaseDesign = getSupabaseClient;

// Build public URL for storage images
export const getStorageImageUrl = (imagePath: string): string => {
  if (!supabaseUrl || !imagePath) {
    return 'https://placehold.co/600x400?text=Image+Unavailable';
  }
  // If imagePath is already a full URL, return as-is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  // Build storage public URL
  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${imagePath}`;
};

// Types for design assets - matching new database column names
export interface DesignAsset {
  id: string;
  image_path: string;
  title: string | null;
  description: string | null;
  design_context: string | null;
  sculptural_form: string | null;
  interior_area: string | null;
  placement_type: string | null;
  is_active: boolean;
  is_sculpture_available: boolean | null;
  created_at: string | null;
}

// Mapped type for gallery display
export interface DesignItem {
  id: string;
  title: string;
  description: string;
  designContext: string;
  sculpturalForm: string;
  interiorArea: string;
  placementType: string;
  imageUrl: string;
  imageAlt: string;
  price?: string;
  isSculptureAvailable: boolean;
}

// Helper to parse array-like strings (handles ['value1', 'value2'] format from database)
const parseArrayString = (value: string): string[] | null => {
  if (!value.startsWith('[') || !value.endsWith(']')) return null;
  
  // Try JSON parse first (double quotes)
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter(Boolean).map(v => String(v).trim());
    }
  } catch {
    // Not valid JSON, try parsing single-quoted format
  }
  
  // Parse single-quoted array format: ['value1', 'value2']
  const inner = value.slice(1, -1).trim();
  if (!inner) return [];
  
  // Match values inside single quotes
  const matches = inner.match(/'([^']+)'/g);
  if (matches) {
    return matches.map(m => m.slice(1, -1).trim()).filter(Boolean);
  }
  
  // Fallback: split by comma for unquoted values
  return inner.split(',').map(v => v.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
};

// Helper to format database values - handles arrays, JSON strings, or plain strings
export const formatFieldValue = (value: unknown): string => {
  if (!value) return '';
  
  // If it's already a string, check if it's an array format
  if (typeof value === 'string') {
    const parsed = parseArrayString(value);
    if (parsed) {
      return parsed.join(', ');
    }
    return value;
  }
  
  // If it's an array, join with commas
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(', ');
  }
  
  return String(value);
};

// Parse database asset to display item
export const parseDesignAsset = (asset: DesignAsset): DesignItem => {
  return {
    id: asset.id,
    title: asset.title || 'Untitled',
    description: asset.description || '',
    designContext: formatFieldValue(asset.design_context),
    sculpturalForm: formatFieldValue(asset.sculptural_form),
    interiorArea: formatFieldValue(asset.interior_area),
    placementType: formatFieldValue(asset.placement_type),
    imageUrl: getStorageImageUrl(asset.image_path),
    imageAlt: asset.title || 'Design asset image',
    price: 'Inquire',
    isSculptureAvailable: asset.is_sculpture_available ?? false
  };
};

// Fetch all active design assets
export const fetchDesignAssets = async (): Promise<DesignItem[]> => {
  const client = getSupabaseClient();
  if (!client) {
    console.warn('Supabase not configured. Please add credentials to content.json');
    return [];
  }
  
  const { data, error } = await client
    .from('design_assets')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching design assets:', error);
    return [];
  }
  
  return (data || []).map(parseDesignAsset);
};

// Helper to extract unique values from a field (handles arrays and JSON strings)
const extractUniqueValues = (values: unknown[]): string[] => {
  const uniqueSet = new Set<string>();
  
  values.forEach(value => {
    if (!value) return;
    
    if (typeof value === 'string') {
      // Check if it's an array format
      const parsed = parseArrayString(value);
      if (parsed) {
        parsed.forEach(v => uniqueSet.add(v));
        return;
      }
      uniqueSet.add(value.trim());
    } else if (Array.isArray(value)) {
      value.filter(Boolean).forEach(v => uniqueSet.add(String(v).trim()));
    }
  });
  
  return Array.from(uniqueSet).filter(Boolean).sort();
};

// Fetch distinct filter options from database columns
export const fetchFilterOptions = async (): Promise<{
  designContexts: string[];
  sculpturalForms: string[];
  interiorAreas: string[];
  placementTypes: string[];
}> => {
  const client = getSupabaseClient();
  if (!client) {
    return { designContexts: [], sculpturalForms: [], interiorAreas: [], placementTypes: [] };
  }
  
  // New column names from schema
  const { data, error } = await client
    .from('design_assets')
    .select('design_context, sculptural_form, interior_area, placement_type')
    .eq('is_active', true);
  
  if (error) {
    console.error('Error fetching filter options:', error);
    return { designContexts: [], sculpturalForms: [], interiorAreas: [], placementTypes: [] };
  }
  
  const designContextValues = (data || []).map(d => d.design_context);
  const sculpturalFormValues = (data || []).map(d => d.sculptural_form);
  const interiorAreaValues = (data || []).map(d => d.interior_area);
  const placementTypeValues = (data || []).map(d => d.placement_type);
  
  return {
    designContexts: extractUniqueValues(designContextValues),
    sculpturalForms: extractUniqueValues(sculpturalFormValues),
    interiorAreas: extractUniqueValues(interiorAreaValues),
    placementTypes: extractUniqueValues(placementTypeValues)
  };
};

// Helper to check if a database field value matches any of the selected filter values
// Handles plain strings, JSON arrays, single-quoted arrays, and comma-separated values
const fieldMatchesFilter = (fieldValue: unknown, selectedValues: string[]): boolean => {
  if (selectedValues.length === 0) return true;
  if (!fieldValue) return false;
  
  // Normalize selected filter values
  const normalizedFilters = selectedValues.map(v => v.trim().toLowerCase());
  
  // Parse the field value to get all actual values
  let actualValues: string[] = [];
  
  if (typeof fieldValue === 'string') {
    // Check if it's an array format
    const parsed = parseArrayString(fieldValue);
    if (parsed) {
      actualValues = parsed.map(v => v.toLowerCase());
    } else {
      actualValues = [fieldValue.trim().toLowerCase()];
    }
  } else if (Array.isArray(fieldValue)) {
    actualValues = fieldValue.filter(Boolean).map(v => String(v).trim().toLowerCase());
  }
  
  // Check if any actual value matches any selected filter
  return actualValues.some(actual => normalizedFilters.includes(actual));
};

// Search and filter design assets - fetch all then filter client-side for accuracy
export const searchDesignAssets = async (
  searchQuery: string,
  filters: {
    designContext: string[];
    sculpturalForm: string[];
    interiorArea: string[];
    placementType: string[];
  }
): Promise<DesignItem[]> => {
  const client = getSupabaseClient();
  if (!client) {
    return [];
  }
  
  // Build base query
  let query = client
    .from('design_assets')
    .select('*')
    .eq('is_active', true);
  
  // Apply search at database level (this is safe with ilike)
  if (searchQuery) {
    const searchTerm = searchQuery.trim();
    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error searching design assets:', error);
    return [];
  }
  
  if (!data) return [];
  
  // Apply filters client-side with normalized comparison
  const hasFilters = filters.designContext.length > 0 || 
                     filters.sculpturalForm.length > 0 || 
                     filters.interiorArea.length > 0 ||
                     filters.placementType.length > 0;
  
  let filteredData = data;
  
  if (hasFilters) {
    filteredData = data.filter(asset => {
      // All active filters must match (AND logic)
      const matchesDesignContext = fieldMatchesFilter(asset.design_context, filters.designContext);
      const matchesSculpturalForm = fieldMatchesFilter(asset.sculptural_form, filters.sculpturalForm);
      const matchesInteriorArea = fieldMatchesFilter(asset.interior_area, filters.interiorArea);
      const matchesPlacementType = fieldMatchesFilter(asset.placement_type, filters.placementType);
      
      return matchesDesignContext && matchesSculpturalForm && matchesInteriorArea && matchesPlacementType;
    });
  }
  
  return filteredData.map(parseDesignAsset);
};
