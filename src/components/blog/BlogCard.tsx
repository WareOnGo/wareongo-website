import { useId } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { BlogSummary } from '@/data/blogSummaries';
import thumbnailFallbacks from '@/data/blogThumbnailFallbacks.json';
import { blogDate, blogTopic } from '@/lib/blogPresentation';

export default function BlogCard({ blog, featured = false, eyebrow }: {
  blog: BlogSummary; featured?: boolean; eyebrow?: string;
}) {
  const id = useId();
  const Heading = featured ? 'h2' : 'h3';
  const thumbnail = blog.thumbnail ?? thumbnailFallbacks[0];
  const date = blogDate(blog.updated);
  return (
    <Link to={`/blogs/${blog.slug}`} aria-labelledby={id}
      className={`ui-card ui-card--action blog-card${featured ? ' blog-card--featured' : ''}`}>
      <div className="blog-card__media">
        <img src={thumbnail.url} alt={thumbnail.alt} width={thumbnail.width} height={thumbnail.height}
          loading={featured ? 'eager' : 'lazy'} decoding="async"
          onError={event => {
            const image = event.currentTarget;
            if (image.getAttribute('src') === thumbnailFallbacks[0].url) return;
            image.src = thumbnailFallbacks[0].url;
            image.alt = thumbnailFallbacks[0].alt;
          }} />
      </div>
      <div className="blog-card__body">
        <div className="blog-card__tags">
          <span className={eyebrow ? 'ui-label' : 'blog-tag'}>{eyebrow ?? blogTopic(blog.slug)}</span>
          {featured && <span className="blog-tag">Featured</span>}
        </div>
        <Heading id={id} className={featured ? 'ui-section-title' : 'ui-card-title'}>{blog.title}</Heading>
        {featured && <p className="blog-card__description">{blog.description}</p>}
        <div className="blog-card__meta">
          {date && <span>Updated <time dateTime={blog.updated}>{date}</time></span>}
          <span className="blog-card__read">Read the blog <ArrowRight size={16} aria-hidden="true" /></span>
        </div>
      </div>
    </Link>
  );
}
