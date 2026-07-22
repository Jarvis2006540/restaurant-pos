/**
 * Image Helper — 100% Client-Side & Turso DB Native
 * 
 * No Cloudinary or external backend server required!
 * Uploaded images are resized and compressed to Base64 Data URLs 
 * and stored directly in your Turso database TEXT columns.
 */

/**
 * Compress and convert an image File to a lightweight Base64 Data URL.
 * @param {File|string} file - The file or string image input
 * @returns {Promise<string>} Compressed Base64 Data URL or string
 */
export async function uploadImage(file) {
  if (!file) return null;
  if (typeof file === 'string') return file;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = Math.round(width);
        canvas.height = Math.round(height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Compress to JPEG with 80% quality (~20KB-40KB)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image file'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Generate a clean, offline SVG Data URL placeholder for menu items
 * @param {string} name - Item name
 * @returns {string} SVG Data URL
 */
export function getPlaceholderImage(name = 'Food') {
  const initials = (name || 'Food').trim().substring(0, 2).toUpperCase();
  const colors = ['#059669', '#2563eb', '#d97706', '#7c3aed', '#dc2626', '#0891b2'];
  // Pick deterministic color based on name
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const bgColor = colors[Math.abs(hash) % colors.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <rect width="400" height="300" fill="${bgColor}"/>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="800" fill="#ffffff" opacity="0.9">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
