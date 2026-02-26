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
    setTimeout(() => {
      setAddedItems(prev => { const next = new Set(prev); next.delete(itemId); return next; });
    }, 1000);
  };

  return (
    <div>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 mb-6 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-bold">Hello, {currentUser?.name.split(' ')[0]}! 👋</h1>
            <p className="text-orange-100 text-sm mt-0.5">What would you like to eat today?</p>
          </div>
          <Link
            to="/cart"
            className="flex items-center gap-2 bg-white text-orange-600 font-medium px-4 py-2 rounded-xl hover:bg-orange-50 transition-colors shadow-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            View Cart
            {cartCount > 0 && (
              <span className="bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
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
          placeholder="Search food or drinks..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent shadow-sm"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-orange-50 border border-gray-200'
          }`}
        >
          🍴 All Items
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-orange-50 border border-gray-200'
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
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden bg-orange-50">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.popular && (
                    <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" />
                      Popular
                    </div>
                  )}
                  {item.stock <= 5 && item.stock > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      Only {item.stock} left!
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  {cat && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.color}`}>
                      {cat.icon} {cat.name}
                    </span>
                  )}
                  <h3 className="font-semibold text-gray-800 mt-2 text-sm leading-snug">{item.name}</h3>
                  <p className="text-gray-500 text-xs mt-1 line-clamp-2">{item.description}</p>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-orange-600 font-bold">₱{item.price.toFixed(2)}</span>
                    <button
                      onClick={() => handleAddToCart(item.id, item.name)}
                      disabled={isAdded || item.stock === 0}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        isAdded
                          ? 'bg-green-500 text-white'
                          : item.stock === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-orange-500 text-white hover:bg-orange-600'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {isAdded ? 'Added!' : item.stock === 0 ? 'Sold Out' : 'Add'}
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
