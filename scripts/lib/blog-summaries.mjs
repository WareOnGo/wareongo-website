import warehouseThumbnails from '../../src/data/blogThumbnailFallbacks.json' with { type: 'json' };

// Resolve card images at build time so the index never loads article bodies.
export function buildBlogSummaries(blogs, fallbacks = warehouseThumbnails) {
  const firstImage = (blog) =>
    blog.blocks.find((block) => block.kind === 'images' && block.images.length)?.images[0];
  // Temporary T1 warehouse photos provide variety until editors upload covers.
  // The fixed selection stays stable between visits and never changes CMS data.
  const sharedImage = blogs.map(firstImage).find(Boolean);

  return blogs.map((blog, index) => ({
    slug: blog.slug,
    title: blog.title,
    description: blog.description,
    updated: blog.updated,
    thumbnail: blog.thumbnail
      ?? (blog.slug === 'dabaspet-multimodal-logistics-park' ? firstImage(blog) : undefined)
      ?? fallbacks[index % fallbacks.length]
      ?? firstImage(blog)
      ?? sharedImage,
  }));
}
