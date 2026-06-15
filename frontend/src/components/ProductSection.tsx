"use client";
import { useRef, useState } from 'react';
import { Plus, Minus, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore, convertAndFormatPrice } from '@/store/useStore';
import { Product } from '@/data/mockDb';
import ProductModal from './ProductModal';
import CartToast from './CartToast';

export default function ProductSection({ title, products }: { title: string, categoryId: string, products: Product[] }) {
  const { addToCart, removeFromCart, updateQuantity, cart, currency, rates, user, toggleFavorite } = useStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; name: string; image: string }>({ visible: false, name: '', image: '' });
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleAddToCart = (p: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({ id: p.id, name: p.name, price: p.price, category: p.category, image: p.image, unit: p.unit || '1 Unidad' });
    setToast({ visible: true, name: p.name, image: p.image });
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  return (
    <section className="max-w-[1600px] w-[96%] mx-auto py-12 px-0 sm:px-4">
      <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4 px-4 sm:px-0">
        <h2 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-4 group">
          {title}
        </h2>
        <div className="flex gap-3 hidden md:flex">
          <button onClick={() => scroll('left')} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-ananas-green hover:border-ananas-green hover:text-white transition shadow-sm"><ChevronLeft size={20} /></button>
          <button onClick={() => scroll('right')} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-ananas-green hover:border-ananas-green hover:text-white transition shadow-sm"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div ref={scrollRef} className="flex overflow-x-auto gap-4 sm:gap-6 pb-8 px-4 sm:px-0 hide-scrollbar snap-x">
        {products.map((p, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="w-[85vw] min-w-[85vw] sm:w-auto sm:min-w-[260px] bg-white rounded-[1.5rem] p-5 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 relative group snap-center sm:snap-start flex flex-col"
          >
            {/* Badge stock bajo */}
            {p.stock !== undefined && p.stock <= 5 && p.stock > 0 && (
              <span className="absolute top-4 left-4 bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-1 rounded-lg z-20 uppercase tracking-wide">
                ¡Solo {p.stock}!
              </span>
            )}
            {p.stock === 0 && (
              <span className="absolute top-4 left-4 bg-red-100 text-red-600 text-[10px] font-black px-2 py-1 rounded-lg z-20 uppercase tracking-wide">
                Agotado
              </span>
            )}
            {(() => {
              const cartItem = cart.find(item => item.id === p.id);
              if (cartItem) {
                return (
                  <div 
                    className="absolute top-5 right-5 h-10 bg-ananas-green text-white rounded-full shadow-md flex items-center justify-between px-2 z-20 w-24"
                    onClick={(e) => e.preventDefault()}
                  >
                    <button 
                      onClick={(e) => {
                         e.preventDefault();
                         if (cartItem.quantity > 1) {
                           updateQuantity(p.id, cartItem.quantity - 1);
                         } else {
                           removeFromCart(p.id);
                         }
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                    >
                      <Minus size={16} strokeWidth={2.5} />
                    </button>
                    <span className="font-bold text-sm select-none">{cartItem.quantity}</span>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart({ id: p.id, name: p.name, price: p.price, category: p.category, image: p.image, unit: p.unit || '1 Unidad' });
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                    >
                      <Plus size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                );
              }
              return null;
            })()}
            
            <div onClick={() => setSelectedProduct(p)} className="block flex-1 flex flex-col cursor-pointer">
              <div className="h-48 flex items-center justify-center mb-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 overflow-hidden relative">
                <div className="absolute inset-0 mix-blend-overlay bg-black/5 rounded-2xl"></div>
                <motion.img 
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  src={p.image} 
                  alt={p.name} 
                  className="w-full h-auto object-cover rounded-lg mix-blend-multiply drop-shadow-sm z-10" 
                />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (user) {
                      toggleFavorite(p.id);
                    } else {
                      setToast({ visible: true, name: 'Inicia sesión para guardar favoritos', image: p.image });
                    }
                  }}
                  className={`absolute right-3 z-20 w-8 h-8 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white transition-all shadow-sm ${cart.some(item => item.id === p.id) ? 'top-16' : 'top-3'}`}
                >
                  <Heart 
                    size={16} 
                    className={user?.favorites?.includes(p.id) ? 'text-red-500 fill-red-500' : ''} 
                  />
                </button>
              </div>
              
              <div className="mt-auto">
                <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase leading-snug line-clamp-2 min-h-[40px] group-hover:text-ananas-dark transition">{p.name}</h3>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-2xl font-black text-gray-800">{convertAndFormatPrice(p.price, currency, rates)}</p>
                  <span className="text-xs font-bold text-ananas-dark bg-ananas-green/10 px-2 py-1 rounded-lg border border-ananas-green/20">{p.unit || '1 Kg'}</span>
                </div>
                
                <div className="text-[10px] font-medium text-gray-400 border-b border-gray-100 pb-3 mb-3 text-center">
                  {p.category === 'refrigerados-congelados' ? '❄️ Cadena de frío garantizada' :
                   p.category === 'frutas-vegetales' ? '🌱 Seleccionado el mismo día' : 
                   '📦 Stock actualizado diario'}
                </div>

                {!cart.find(item => item.id === p.id) && (
                  <button 
                    disabled={p.stock === 0}
                    onClick={(e) => handleAddToCart(p, e)}
                    className="w-full bg-ananas-green disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl hover:bg-ananas-dark transition shadow-md shadow-ananas-green/20 flex items-center justify-center gap-2"
                  >
                    <Plus size={16} strokeWidth={2.5} /> {p.stock === 0 ? 'Sin stock' : 'Agregar'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      <CartToast 
        visible={toast.visible} 
        message={toast.name} 
        image={toast.image}
        onDismiss={() => setToast(t => ({ ...t, visible: false }))} 
      />
    </section>
  );
}
