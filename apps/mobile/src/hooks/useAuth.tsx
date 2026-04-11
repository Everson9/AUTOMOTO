import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Recuperar sessão persistida
    const fetchSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Erro ao obter sessão:', error);
          setSession(null);
          setUser(null);
        } else {
          // Verificar se a sessão é válida comparando com o tempo atual
          const isValid = session && session.expires_at && session.expires_at > Date.now() / 1000;

          if (isValid) {
            setSession(session);
            setUser(session.user ?? null);
          } else {
            // Sessão expirada ou inválida, limpar
            setSession(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Erro inesperado ao obter sessão:', err);
        setSession(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();

    // Ouvir mudanças de autenticação (login, logout, refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Verificar se a nova sessão é válida
        const isValid = session && session.expires_at && session.expires_at > Date.now() / 1000;

        if (isValid) {
          setSession(session);
          setUser(session.user ?? null);
        } else {
          // Sessão expirada ou inválida, limpar
          setSession(null);
          setUser(null);
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // isAutenticado é verdadeiro somente se houver uma sessão válida e não expirada
  const isAutenticado = !!session && session.expires_at && session.expires_at > Date.now() / 1000;

  return { session, user, isLoading, isAutenticado }
}