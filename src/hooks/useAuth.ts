import { trpc } from '../lib/trpc.ts';

export function useAuth() {
  const utils = trpc.useUtils();
  const { data: user, isLoading, error } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data: any) => {
      if (data?.token && typeof window !== 'undefined') {
        localStorage.setItem('madar_auth_token', data.token);
      }
      utils.auth.me.invalidate();
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data: any) => {
      if (data?.token && typeof window !== 'undefined') {
        localStorage.setItem('madar_auth_token', data.token);
      }
      utils.auth.me.invalidate();
    },
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('madar_auth_token');
      }
      utils.auth.me.setData(undefined, null);
      utils.invalidate();
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isOwner: user?.role === 'owner',
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
    error,
  };
}
