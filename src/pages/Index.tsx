import { useState } from 'react';
import { Header } from '@/components/Header';
import { CategoryTabs } from '@/components/CategoryTabs';
import { MenuItemCard } from '@/components/MenuItemCard';
import { FloatingCart } from '@/components/FloatingCart';
import { menuItems, categories } from '@/data/menu';
import { Flame } from 'lucide-react';

const Index = () => {
  const [activeCategory, setActiveCategory] = useState('burgers');

  const filteredItems = menuItems.filter(
    (item) => item.category === activeCategory
  );

  const popularItems = menuItems.filter((item) => item.popular);

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="gradient-primary py-8 px-4">
          <div className="container">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-secondary" />
              <span className="text-primary-foreground/90 text-sm font-medium">
                Smash Burgers Artesanais
              </span>
            </div>
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-primary-foreground mb-2">
              Peça agora e receba<br />em até 35 minutos
            </h2>
            <p className="text-primary-foreground/80 text-sm">
              Pagamento rápido com Pix • Drive-thru disponível
            </p>
          </div>
        </div>
      </section>

      {/* Popular Section */}
      <section className="py-6">
        <div className="container">
          <h3 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            Mais Pedidos
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {popularItems.map((item) => (
              <div key={item.id} className="min-w-[260px] max-w-[260px]">
                <MenuItemCard item={item} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Menu Grid */}
      <section className="py-6">
        <div className="container">
          <h3 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">
              {categories.find((c) => c.id === activeCategory)?.emoji}
            </span>
            {categories.find((c) => c.id === activeCategory)?.name}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      <FloatingCart />
    </div>
  );
};

export default Index;
