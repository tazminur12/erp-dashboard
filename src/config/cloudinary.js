// Cloudinary Configuration
export const CLOUDINARY_CONFIG = {
  // Required Configuration
  CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  API_KEY: import.meta.env.VITE_CLOUDINARY_API_KEY,
  API_SECRET: import.meta.env.VITE_CLOUDINARY_API_SECRET,
  UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  
  // Optional Settings
  FOLDER: import.meta.env.VITE_CLOUDINARY_FOLDER || 'customers',
  TRANSFORMATION: import.meta.env.VITE_CLOUDINARY_TRANSFORMATION || 'c_thumb,w_200,h_200',
  QUALITY: import.meta.env.VITE_CLOUDINARY_QUALITY || 'auto',
  FORMAT: import.meta.env.VITE_CLOUDINARY_FORMAT || 'auto',
  
  // Upload URL
  UPLOAD_URL: `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
  
  // Default Transformations
  DEFAULT_TRANSFORMATIONS: {
    thumbnail: 'c_thumb,w_200,h_200',
    medium: 'c_scale,w_500,h_500',
    large: 'c_scale,w_800,h_800',
    quality: 'q_auto',
    format: 'f_auto'
  }
};

// Validate Cloudinary configuration
export const validateCloudinaryConfig = () => {
  const requiredFields = ['CLOUD_NAME', 'UPLOAD_PRESET'];
  const missingFields = requiredFields.filter(field => !CLOUDINARY_CONFIG[field]);
  
  if (missingFields.length > 0) {
    console.error('Missing Cloudinary configuration:', missingFields);
    console.error('Please check your .env.local file for the following variables:');
    missingFields.forEach(field => {
      console.error(`- VITE_CLOUDINARY_${field}`);
    });
    return false;
  }
  
  return true;
};

// Helper function to get Cloudinary URL with transformations
export const getCloudinaryUrl = (publicId, transformation = '') => {
  if (!CLOUDINARY_CONFIG.CLOUD_NAME) {
    console.error('Cloudinary cloud name not configured');
    return '';
  }
  
  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.CLOUD_NAME}/image/upload`;
  if (transformation) {
    return `${baseUrl}/${transformation}/${publicId}`;
  }
  return `${baseUrl}/${publicId}`;
};

// Helper function to get thumbnail URL
export const getThumbnailUrl = (publicId) => {
  return getCloudinaryUrl(publicId, CLOUDINARY_CONFIG.DEFAULT_TRANSFORMATIONS.thumbnail);
};

// Helper function to get optimized URL
export const getOptimizedUrl = (publicId) => {
  const transformations = [
    CLOUDINARY_CONFIG.DEFAULT_TRANSFORMATIONS.quality,
    CLOUDINARY_CONFIG.DEFAULT_TRANSFORMATIONS.format
  ].join(',');
  return getCloudinaryUrl(publicId, transformations);
};

export default CLOUDINARY_CONFIG;
