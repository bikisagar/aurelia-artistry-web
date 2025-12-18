/**
 * Utility to generate Google Drive direct image URLs.
 * Uses the 'lh3.googleusercontent.com' domain for high performance and dynamic resizing.
 * 
 * @param driveId - The Google Drive File ID.
 * @param width - Optional width to resize the image to (e.g., 400, 800, 1200).
 * @returns The direct URL to the image.
 */
export const getImageUrl = (driveId: string, width?: number): string => {
  // Map placeholders to high-quality Unsplash images matching the descriptions
  const placeholderMap: Record<string, string> = {
    "PLACEHOLDER_ID_1": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80", // Modern Minimalist
    "PLACEHOLDER_ID_2": "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80", // Rustic Study
    "PLACEHOLDER_ID_3": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80", // Contemporary Gallery
    "PLACEHOLDER_ID_4": "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=1200&q=80", // Scandinavian
    "PLACEHOLDER_ID_5": "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1200&q=80", // Industrial Loft
    "PLACEHOLDER_ID_6": "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80", // Classic Foyer
    "PLACEHOLDER_ID_7": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80", // Bohemian
    "PLACEHOLDER_ID_8": "https://images.unsplash.com/photo-1599696847727-920005c52726?auto=format&fit=crop&w=1200&q=80", // Zen Japanese
    "PLACEHOLDER_ID_9": "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=1200&q=80", // Coastal
    "PLACEHOLDER_ID_10": "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=80", // Art Deco
    "PLACEHOLDER_ID_11": "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=1200&q=80", // Mid-Century
    "PLACEHOLDER_ID_12": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80", // Transitional
    "PLACEHOLDER_ID_13": "https://images.unsplash.com/photo-1617103996702-96ff29b1c467?auto=format&fit=crop&w=1200&q=80", // Urban
  };

  if (driveId && driveId.startsWith("PLACEHOLDER_ID_") && placeholderMap[driveId]) {
    return placeholderMap[driveId];
  }

  // Fallback for missing IDs to a placeholder
  if (!driveId) return "https://placehold.co/600x400?text=No+Image";

  const baseUrl = "https://lh3.googleusercontent.com/d/";

  if (width) {
    return `${baseUrl}${driveId}=w${width}`;
  }

  return `${baseUrl}${driveId}`;
};

/**
 * Extracts the File ID from a standard Google Drive sharing URL.
 * Useful if we ever need to parse full URLs from the JSON.
 * 
 * @param url - The full Google Drive URL.
 * @returns The File ID or null if not found.
 */
export const extractDriveId = (url: string): string | null => {
  const match = url.match(/\/d\/(.+?)\//);
  return match ? match[1] : null;
};
