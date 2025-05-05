// /src/app/admin/page.tsx
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// TODO: Import components for dashboard overview, quick links, etc.

export default function AdminPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and there's no user, redirect to login
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loading, router]);

  // Don't render anything while loading or if redirecting
  if (loading || !currentUser) {
    return <div>Carregando...</div>; // Or a proper loading spinner
  }

  // Render admin dashboard content only if authenticated
  return (
    <div>
      <h1>Painel Administrativo</h1>
      <p>Bem-vindo ao painel do seu restaurante, {currentUser.email}.</p>
      {/* TODO: Add links to manage products, view orders, settings, etc. */}
      <p><a href="/admin/products">Gerenciar Produtos</a></p>
      {/* <p><a href="/admin/orders">Ver Pedidos</a></p> */}
      {/* TODO: Add Logout button */}
    </div>
  );
}

