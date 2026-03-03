import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { Search, ShoppingCart, Plus, Star, Package } from 'lucide-react';
import { useCanteen } from '../store/canteenContext';
import { toast } from 'sonner';

export default function MenuPage() {
  const { menuItems, categories, addToCart, getCartCount, currentUser } = useCanteen();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  const cartCount = getCartCount();

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchCat = selectedCategory === 'all' || item.categoryId === selectedCategory;
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch && item.available;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  const handleAddToCart = (itemId: string, itemName: string) => {
    addToCart(itemId);
    toast.success(`${itemName} added to cart!`, {
      position: 'bottom-right',
      duration: 2000,
    });
    setAddedItems(prev => new Set([...prev, itemId]));
    setAnimatingId(itemId);
    setTimeout(() => {
      setAddedItems(prev => { const next = new Set(prev); next.delete(itemId); return next; });
      setAnimatingId(null);
    }, 1000);
  };

  return (
    <div>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-primary to-orange-400 rounded-3xl p-8 mb-8 text-white shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hello, {currentUser?.name.split(' ')[0]}! 👋</h1>
            <p className="text-white/80 text-lg mt-2 font-medium">What's on your menu today?</p>
          </div>
          <Link
            to="/cart"
            className="flex items-center gap-3 bg-white text-primary font-bold px-6 py-3 rounded-2xl hover:bg-white/90 transition-all shadow-lg active:scale-95"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>My Basket</span>
            {cartCount > 0 && (
              <span className="bg-primary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search for your favorite food or drinks..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-border rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm hover:border-primary/50 transition-all placeholder:text-gray-400"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 active:scale-95 ${
            selectedCategory === 'all'
              ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
              : 'bg-white text-gray-600 hover:bg-primary/5 border border-border'
          }`}
        >
          🍴 All Items
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 active:scale-95 ${
              selectedCategory === cat.id
                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                : 'bg-white text-gray-600 hover:bg-primary/5 border border-border'
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Results Count */}
      {searchQuery && (
        <p className="text-sm text-gray-500 mb-4">
          {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} for "<strong>{searchQuery}</strong>"
        </p>
      )}

      {/* Menu Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No items found</p>
          <p className="text-gray-400 text-sm mt-1">Try a different category or search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map(item => {
            const cat = categories.find(c => c.id === item.categoryId);
            const isAdded = addedItems.has(item.id);
            return (
              <div
                key={item.id}
                className="bg-white rounded-[2rem] shadow-sm border border-border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group flex flex-col h-full"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-primary/5">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {item.popular && (
                    <div className="absolute top-3 left-3 bg-primary text-white text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                      <Star className="w-3 h-3 fill-white" />
                      Popular
                    </div>
                  )}
                  {item.stock <= 5 && item.stock > 0 && (
                    <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] uppercase font-black px-3 py-1 rounded-full shadow-lg">
                      Low Stock
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    {cat && (
                      <span className={`text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded-lg ${cat.color} bg-opacity-10`}>
                        {cat.name}
                      </span>
                    )}
                    <span className="font-black text-primary text-lg">₱{item.price}</span>
                  </div>
                  <h3 className="font-bold text-gray-800 text-base mb-1 group-hover:text-primary transition-colors line-clamp-1">{item.name}</h3>
                  <p className="text-gray-400 text-xs line-clamp-2 mb-4 leading-relaxed">{item.description}</p>

                  <div className="mt-auto pt-4 flex gap-2 relative"> {/* Added relative for absolute positioning of heart */}
                    {animatingId === item.id && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-bounce pointer-events-none">
                        <span className="text-2xl text-primary">❤️</span> {/* Heart emoji with primary color */}
                      </div>
                    )}
                    <button
                      onClick={() => handleAddToCart(item.id, item.name)}
                      disabled={isAdded || item.stock === 0}
                      className={`flex-grow flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 ${
                        isAdded
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                          : item.stock === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:bg-orange-600'
                      }`}
                    >
                      <Plus className="w-4 h-4 stroke-[3px]" />
                      {isAdded ? 'Success' : item.stock === 0 ? 'Sold Out' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
