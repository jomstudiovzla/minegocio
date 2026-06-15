"use client";
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { ShieldCheck, CreditCard, Banknote, Smartphone, Clock, Star, Package } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  const user = useStore(state => state.user);
  const products = useStore(state => state.products);
  const orders = useStore(state => state.orders);
  const router = useRouter();

  const handleComprarAhora = () => {
    if (!user) {
      router.push('/login?redirect=%2F%23categories');
    } else {
      const element = document.getElementById('categories');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        router.push('/#categories');
      }
    }
  };

  const handleVerOfertas = () => {
    router.push('/promociones');
  };

  return (
    <section className="relative overflow-hidden bg-yellow-50">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-ananas-dark/95 to-ananas-green/60 mix-blend-multiply"></div>
      </div>
      
      <div className="max-w-[1600px] w-[96%] mx-auto px-4 py-24 md:py-36 relative z-10 flex flex-col justify-center min-h-[500px]">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl text-white"
        >

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tighter" style={{ textShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
            ¡Te llevamos <br/><span className="text-yellow-400">TU MERCADO!</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-100 mb-2 max-w-xl font-medium leading-relaxed" style={{ textShadow: '0 2px 5px rgba(0,0,0,0.3)' }}>
            Frutas, vegetales y mercado completo a domicilio en Caracas Este.
          </p>
          <p className="text-md text-yellow-300 mb-8 max-w-lg font-bold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            Entrega el mismo día en San Luis, El Cafetal y zonas cercanas.
          </p>
          
          <div className="flex gap-4 mb-10">
            <button 
              onClick={handleComprarAhora}
              className="bg-white text-ananas-dark px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-black/20 hover:bg-gray-50 hover:scale-105 transition-all cursor-pointer"
            >
              Comprar Ahora
            </button>
            <button 
              onClick={handleVerOfertas}
              className="bg-black/30 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-black/40 transition-all cursor-pointer"
            >
              Ver Ofertas
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2 text-yellow-400 font-bold bg-black/20 px-3 py-1.5 rounded-lg">
                <ShieldCheck size={20} />
                <span>PAGOS 100% SEGUROS</span>
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-y-2 gap-x-4 text-white/90 text-sm md:text-base mt-2 sm:mt-0">
                <div className="flex items-center gap-1"><Smartphone size={16} /> Zelle / Pago Móvil</div>
                <div className="flex items-center gap-1"><Banknote size={16} /> Efectivo</div>
                <div className="flex items-center gap-1"><CreditCard size={16} /> PayPal / Tarjetas</div>
              </div>
            </div>
            <p className="text-xs text-white/70 mt-3 max-w-xl">
              No guardamos datos de tarjeta. Confirmación segura por WhatsApp o correo. <Link href="/delivery" className="underline hover:text-white">Entregamos en Caracas Este, de 9 a 7 pm. Ver zonas.</Link>
            </p>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10"
        >
          {[
            { icon: Package, label: 'Productos', value: `${products.length}+`, color: 'text-yellow-400' },
            { icon: Clock, label: 'Entrega', value: 'Mismo día', color: 'text-green-400' },
            { icon: Star, label: 'Satisfacción', value: '4.9 / 5', color: 'text-orange-400' },
            { icon: ShieldCheck, label: 'Pedidos', value: orders.length > 0 ? `${orders.length} hoy` : 'Seguro 100%', color: 'text-blue-300' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-3">
              <Icon size={20} className={color} />
              <div>
                <p className={`text-sm font-black ${color}`}>{value}</p>
                <p className="text-white/60 text-[11px] font-medium">{label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
