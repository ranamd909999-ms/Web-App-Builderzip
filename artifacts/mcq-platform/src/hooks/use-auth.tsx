import { createContext, useContext, useState, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetMe, useLogin, useLogout, useRegister, getGetMeQueryKey } from "@workspace/api-client-react";
import type { User, LoginInput, RegisterInput } from "@workspace/api-client-react";
import { useLocation } from "wouter";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: user, isLoading: isUserLoading, refetch } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      enabled: !!token,
      retry: false,
      staleTime: 60_000,
    },
  });

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  const login = async (data: LoginInput) => {
    const res = await loginMutation.mutateAsync({ data });
    localStorage.setItem("token", res.token);
    setToken(res.token);
    await refetch();
    setLocation(res.user.role === "admin" ? "/admin" : "/dashboard");
  };

  const register = async (data: RegisterInput) => {
    const res = await registerMutation.mutateAsync({ data });
    localStorage.setItem("token", res.token);
    setToken(res.token);
    await refetch();
    setLocation("/dashboard");
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      queryClient.clear();
      setLocation("/login");
    }
  };

  const isAuthLoading = !!token && isUserLoading;
  const isLoading =
    isAuthLoading ||
    loginMutation.isPending ||
    registerMutation.isPending ||
    logoutMutation.isPending;
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{ user: user ?? null, isLoading, isAuthLoading, login, register, logout, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
