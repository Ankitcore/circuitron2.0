export const galleryFiles = [
  "IMG-20251024-WA0001.jpg",
  "IMG-20251024-WA0002.jpg",
  "IMG-20251024-WA0003.jpg",
  "IMG-20251024-WA0004.jpg",
  "IMG-20251024-WA0005.jpg",
  "IMG-20251024-WA0008.jpg",
];

export const galleryItems = galleryFiles.map((file, idx) => ({
  id: idx + 1,
  src: `/assets/gallery/${file}`,
  alt: file.replace(/[-_\.]/g, " "),
  title: file.replace(/[-_\.]/g, " "),
  category: "Gallery",
}));
