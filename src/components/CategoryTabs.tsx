import { categories } from '@/data/menu';
import { cn } from '@/lib/utils';

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md py-3 border-b">
      <div className="container">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
                activeCategory === category.id
                  ? "gradient-primary text-primary-foreground shadow-food"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              )}
            >
              <span>{category.emoji}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
