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

// Types for design assets - matching actual database columns
export interface DesignAsset {
  id: string;
  image_path: string;
  title: string | null;
  description: string | null;
  sculpture_type: string | null;
  room: string | null;
  style: string | null;
  is_active: boolean;
  created_at: string | null;
}

// Mapped type for gallery display
export interface DesignItem {
  id: string;
  title: string;
  description: string;
  sculptureType: string;
  room: string;
  style: string;
  imageUrl: string;
  imageAlt: string;
  price?: string;
}

// Parse database asset to display item
export const parseDesignAsset = (asset: DesignAsset): DesignItem => {
  return {
    id: asset.id,
    title: asset.title || 'Untitled',
    description: asset.description || '',
    sculptureType: asset.sculpture_type || '',
    room: asset.room || '',
    style: asset.style || '',
    imageUrl: getStorageImageUrl(asset.image_path),
    imageAlt: asset.title || 'Design asset image',
    price: 'Inquire'
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

// Fetch distinct filter options from database columns
export const fetchFilterOptions = async (): Promise<{
  sculptureTypes: string[];
  roomTypes: string[];
  styles: string[];
}> => {
  const client = getSupabaseClient();
  if (!client) {
    return { sculptureTypes: [], roomTypes: [], styles: [] };
  }
  
  const { data, error } = await client
    .from('design_assets')
    .select('sculpture_type, room, style')
    .eq('is_active', true);
  
  if (error) {
    console.error('Error fetching filter options:', error);
    return { sculptureTypes: [], roomTypes: [], styles: [] };
  }
  
  const sculptureTypesSet = new Set<string>();
  const roomTypesSet = new Set<string>();
  const stylesSet = new Set<string>();
  
  (data || []).forEach(asset => {
    if (asset.sculpture_type) sculptureTypesSet.add(asset.sculpture_type);
    if (asset.room) roomTypesSet.add(asset.room);
    if (asset.style) stylesSet.add(asset.style);
  });
  
  return {
    sculptureTypes: Array.from(sculptureTypesSet).sort(),
    roomTypes: Array.from(roomTypesSet).sort(),
    styles: Array.from(stylesSet).sort()
  };
};

// Search and filter design assets using database queries
export const searchDesignAssets = async (
  searchQuery: string,
  filters: {
    sculptureType: string[];
    roomType: string[];
    style: string[];
  }
): Promise<DesignItem[]> => {
  const client = getSupabaseClient();
  if (!client) {
    return [];
  }
  
  let query = client
    .from('design_assets')
    .select('*')
    .eq('is_active', true);
  
  // Apply search across title and description
  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
  }
  
  // Apply sculpture_type filter (AND with other filters)
  if (filters.sculptureType.length > 0) {
    query = query.in('sculpture_type', filters.sculptureType);
  }
  
  // Apply room filter (AND with other filters)
  if (filters.roomType.length > 0) {
    query = query.in('room', filters.roomType);
  }
  
  // Apply style filter (AND with other filters)
  if (filters.style.length > 0) {
    query = query.in('style', filters.style);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error searching design assets:', error);
    return [];
  }
  
  return (data || []).map(parseDesignAsset);
};
