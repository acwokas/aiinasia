import { Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ArticleCardProps {
  title: string;
  excerpt: string;
  category: string;
  author: string;
  readTime: string;
  image: string;
  slug: string;
  featured?: boolean;
}

const ArticleCard = ({ 
  title, 
  excerpt, 
  category, 
  author, 
  readTime, 
  image,
  slug,
  featured = false 
}: ArticleCardProps) => {
  return (
    <article className={`article-card ${featured ? 'md:col-span-2 md:row-span-2' : ''}`}>
      <a href={`/article/${slug}`} className="block">
        <div className="relative aspect-video overflow-hidden">
          <img 
            src={image} 
            alt={title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
          <Badge 
            variant="secondary" 
            className="absolute top-4 left-4 bg-primary text-primary-foreground"
          >
            {category}
          </Badge>
        </div>
        
        <div className="p-6">
          <h3 className={`headline mb-3 hover:text-primary transition-colors ${
            featured ? 'text-3xl md:text-4xl' : 'text-xl'
          }`}>
            {title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")}
          </h3>
          
          <p className={`text-muted-foreground mb-4 line-clamp-2 ${
            featured ? 'text-lg' : 'text-sm'
          }`}>
            {excerpt}
          </p>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-3 w-3" />
              <span>{author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{readTime}</span>
            </div>
          </div>
        </div>
      </a>
    </article>
  );
};

export default ArticleCard;
