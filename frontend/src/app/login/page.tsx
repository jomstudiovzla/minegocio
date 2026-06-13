"use client";
import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const login = useStore(state => state.login);
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [redirectPath, setRedirectPath] = useState('/account');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const red = params.get('redirect');
      if (red) {
        setRedirectPath(red);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Simulamos auth y nivel en el club Ananas
      login({
        id: Math.random().toString(),
        name: name || email.split('@')[0],
        email: email,
        clubPoints: 350, // Puntos simulados
        clubLevel: 'Bronce'
      });
      router.push(redirectPath);
    }
  };

  return (
    <div className="max-w-md mx-auto py-20 px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <h1 className="text-3xl font-black text-gray-800 mb-2 text-center">
          {isRegistering ? 'Únete a Ananas' : 'Inicia Sesión'}
        </h1>
        <p className="text-center text-gray-500 mb-8 font-medium">
          {isRegistering ? 'Disfruta de envíos rápidos y ofertas exclusivas del Club.' : 'Qué bueno verte de nuevo.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegistering && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nombre completo</label>
              <input 
                required 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ananas-green transition"
                placeholder="Juan Pérez"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Correo electrónico</label>
            <input 
              required 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ananas-green transition"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña</label>
            <input 
              required 
              type="password" 
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ananas-green transition"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="w-full bg-ananas-green text-white font-bold text-lg py-4 rounded-xl hover:bg-ananas-dark transition shadow-lg shadow-ananas-green/20">
            {isRegistering ? 'Crear Cuenta' : 'Entrar'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-gray-500 hover:text-ananas-green font-bold transition"
          >
            {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
          </button>
        </div>
      </div>
    </div>
  );
}
