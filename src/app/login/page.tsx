// /src/app/login/page.tsx
"use client"; // Diretiva adicionada

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebaseConfig'; // Caminho corrigido
import { useAuth } from '../../context/AuthContext'; // Caminho corrigido
import { Button } from '../../components/ui/button'; // Caminho corrigido
import { Input } from '../../components/ui/input'; // Caminho corrigido
import { Label } from '../../components/ui/label'; // Caminho corrigido
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card'; // Caminho corrigido

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      router.push('/admin');
    }
  }, [currentUser, router]);

  if (currentUser) {
    return null; 
  }

  const handleAuthAction = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      // Redirection is handled by useEffect
    } catch (err: any) {
      console.error("Authentication error:", err);
      let friendlyMessage = 'Falha na autenticação. Verifique suas credenciais.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        friendlyMessage = 'E-mail ou senha inválidos.';
      } else if (err.code === 'auth/email-already-in-use') {
        friendlyMessage = 'Este e-mail já está em uso.';
      } else if (err.code === 'auth/weak-password') {
        friendlyMessage = 'A senha deve ter pelo menos 6 caracteres.';
      }
      setError(friendlyMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            {isLogin ? 'Login do Restaurante' : 'Criar Conta de Restaurante'}
          </CardTitle>
          <CardDescription>
            {isLogin ? 'Entre com seu e-mail e senha' : 'Preencha os dados para criar sua conta'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleAuthAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                type="password"
                id="password"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            <Button type="submit" className="w-full">
              {isLogin ? 'Entrar' : 'Criar Conta'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center">
          <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="w-full">
            {isLogin ? 'Não tem conta? Crie uma agora' : 'Já tem conta? Faça login'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
