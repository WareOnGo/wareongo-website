import replacements from '../../src/data/blogImageReplacements.json' with { type: 'json' };

// Replace only the identified legacy warehouse photos. Editorial graphics and
// later CMS uploads keep their own source, caption and position in the article.
export function resolveBlogImage(image) {
  return image && Object.prototype.hasOwnProperty.call(replacements, image.url)
    ? replacements[image.url] : image;
}

export function replaceBlogWarehousePhotos(blog) {
  return {
    ...blog,
    ...(blog.thumbnail ? { thumbnail: resolveBlogImage(blog.thumbnail) } : {}),
    blocks: blog.blocks.map(block => block.kind === 'images'
      ? { ...block, images: block.images.map(resolveBlogImage) } : block),
  };
}
