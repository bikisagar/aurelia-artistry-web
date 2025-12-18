import { createClient } from '@supabase/supabase-js';
import content from '@/data/content.json';

// Get Supabase config from content.json
const supabaseUrl = content.design?.supabase?.url || '';
const supabaseAnonKey = content.design?.supabase?.anonKey || '';
const bucketName = content.design?.supabase?.bucketName || 'Images';

// Create Supabase client for design page
export const supabaseDesign = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

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

// Types for design assets
export interface DesignAsset {
  id: string;
  image_path: string;
  title: string | null;
  description: string | null;
  style: string | null;
  tags: string | null;
  is_active: boolean;
  timestamp: string | null;
}

// Mapped type for gallery display
export interface DesignItem {
  id: string;
  title: string;
  description: string;
  sculptureType: string;
  roomType: string[];
  style: string[];
  imageUrl: string;
  imageAlt: string;
  tags: string[];
  price?: string;
}

// Parse tags string into arrays for filtering
export const parseDesignAsset = (asset: DesignAsset): DesignItem => {
  const tags = asset.tags ? asset.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
  const styles = asset.style ? asset.style.split(',').map(s => s.trim()).filter(Boolean) : [];
  
  // Extract sculpture type and room from tags (first tag as sculpture type, rest as rooms)
  // This is flexible - you can adjust the logic based on your tagging convention
  const sculptureType = tags[0] || 'Sculpture';
  const roomType = tags.slice(1).length > 0 ? tags.slice(1) : ['Living Room'];
  
  return {
    id: asset.id,
    title: asset.title || 'Untitled',
    description: asset.description || '',
    sculptureType,
    roomType,
    style: styles.length > 0 ? styles : ['Traditional'],
    imageUrl: getStorageImageUrl(asset.image_path),
    imageAlt: asset.title || 'Design asset image',
    tags,
    price: 'Inquire'
  };
};

// Fetch all active design assets
export const fetchDesignAssets = async (): Promise<DesignItem[]> => {
  if (!supabaseDesign) {
    console.warn('Supabase not configured. Please add credentials to content.json');
    return [];
  }
  
  const { data, error } = await supabaseDesign
    .from('design_assets')
    .select('*')
    .eq('is_active', true)
    .order('timestamp', { ascending: false });
  
  if (error) {
    console.error('Error fetching design assets:', error);
    return [];
  }
  
  return (data || []).map(parseDesignAsset);
};

// Fetch distinct filter options from database
export const fetchFilterOptions = async (): Promise<{
  sculptureTypes: string[];
  roomTypes: string[];
  styles: string[];
}> => {
  if (!supabaseDesign) {
    return { sculptureTypes: [], roomTypes: [], styles: [] };
  }
  
  const { data, error } = await supabaseDesign
    .from('design_assets')
    .select('style, tags')
    .eq('is_active', true);
  
  if (error) {
    console.error('Error fetching filter options:', error);
    return { sculptureTypes: [], roomTypes: [], styles: [] };
  }
  
  const stylesSet = new Set<string>();
  const sculptureTypesSet = new Set<string>();
  const roomTypesSet = new Set<string>();
  
  (data || []).forEach(asset => {
    // Parse styles
    if (asset.style) {
      asset.style.split(',').forEach((s: string) => {
        const trimmed = s.trim();
        if (trimmed) stylesSet.add(trimmed);
      });
    }
    
    // Parse tags - first is sculpture type, rest are room types
    if (asset.tags) {
      const tags = asset.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      if (tags[0]) sculptureTypesSet.add(tags[0]);
      tags.slice(1).forEach(t => roomTypesSet.add(t));
    }
  });
  
  return {
    sculptureTypes: Array.from(sculptureTypesSet).sort(),
    roomTypes: Array.from(roomTypesSet).sort(),
    styles: Array.from(stylesSet).sort()
  };
};

// Search and filter design assets
export const searchDesignAssets = async (
  searchQuery: string,
  filters: {
    sculptureType: string[];
    roomType: string[];
    style: string[];
  }
): Promise<DesignItem[]> => {
  if (!supabaseDesign) {
    return [];
  }
  
  let query = supabaseDesign
    .from('design_assets')
    .select('*')
    .eq('is_active', true);
  
  // Apply search across title, description, tags
  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,tags.ilike.%${searchQuery}%`);
  }
  
  // Apply style filter
  if (filters.style.length > 0) {
    const styleConditions = filters.style.map(s => `style.ilike.%${s}%`).join(',');
    query = query.or(styleConditions);
  }
  
  const { data, error } = await query.order('timestamp', { ascending: false });
  
  if (error) {
    console.error('Error searching design assets:', error);
    return [];
  }
  
  let results = (data || []).map(parseDesignAsset);
  
  // Apply client-side filtering for tags-based filters (sculpture type and room)
  if (filters.sculptureType.length > 0) {
    results = results.filter(item => filters.sculptureType.includes(item.sculptureType));
  }
  
  if (filters.roomType.length > 0) {
    results = results.filter(item => item.roomType.some(r => filters.roomType.includes(r)));
  }
  
  return results;
};
