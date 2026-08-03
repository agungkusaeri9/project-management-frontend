import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../../../store/auth.store';
import { LoginFormData } from '../schemas/login.schema';
import { useRouter } from 'next/navigation';

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginFormData) => authService.login(data),
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.token.access_token);
      router.push('/dashboard'); // assuming /dashboard exists
    },
  });
};
