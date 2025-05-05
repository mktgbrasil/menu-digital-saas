// /src/app/admin/page.tsx
"use client"; // Diretiva adicionada

import React from 'react'; // Removido useEffect e useRouter daqui, pois não estavam sendo usados diretamente no return
import Link from 'next/link';
import { Button } from '../../components/ui/button'; // Caminho corrigido
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card'; // Caminho corrigido
import { Package, ShoppingCart, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // Caminho corrigido

const AdminDashboardPage = () => {
  const { currentUser } = useAuth(); // Hook useAuth precisa de "use client"

  // Idealmente, adicionar lógica de redirecionamento se não estiver logado
  // if (!currentUser) { router.push('/login'); return null; } 

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Painel Administrativo</h1>
      {currentUser && <p className="text-lg mb-8">Bem-vindo, {currentUser.email}!</p>} 

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card de Gerenciamento de Produtos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Adicione, edite ou remova produtos e categorias do seu cardápio.
            </CardDescription>
            <Link href="/admin/products" passHref>
              <Button>Gerenciar Produtos</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Card de Gerenciamento de Pedidos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Visualize e gerencie os pedidos recebidos dos clientes.
            </CardDescription>
            <Link href="/admin/orders" passHref>
              <Button>Ver Pedidos</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Card de Configurações (Exemplo) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Configurações</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Ajuste informações do restaurante, horários, etc. (Funcionalidade futura)
            </CardDescription>
            <Button disabled>Configurações</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
