// /src/app/login/page.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebaseConfig';
import { useAuth } from '@/context/AuthContext'; // Import useAuth

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Sign Up
  const router = useRouter();
  const { currentUser } = useAuth(); // Get current user state

  // Redirect if already logged in
  if (currentUser) {
    router.push('/admin'); // Redirect to admin dashboard if logged in
    return null; // Render nothing while redirecting
  }

  const handleAuthAction = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null); // Clear previous errors

    try {
      if (isLogin) {
        // Sign in existing user
        await signInWithEmailAndPassword(auth, email, password);
        console.log('User signed in successfully');
        router.push('/admin'); // Redirect to admin dashboard after login
      } else {
        // Create new user
        await createUserWithEmailAndPassword(auth, email, password);
        console.log('User created successfully');
        // Optionally, create initial restaurant data in Firestore here
        router.push('/admin'); // Redirect to admin dashboard after sign up
      }
    } catch (err: any) {
      console.error("Authentication error:", err);
      setError(err.message || 'Falha na autenticação. Verifique suas credenciais.');
    }
  };

  return (
    <div>
      <h1>{isLogin ? 'Login do Restaurante' : 'Criar Conta de Restaurante'}</h1>
      <form onSubmit={handleAuthAction}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">{isLogin ? 'Entrar' : 'Criar Conta'}</button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Não tem conta? Crie uma agora' : 'Já tem conta? Faça login'}
      </button>
    </div>
  );
}

