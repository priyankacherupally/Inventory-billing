import { useMutation } from '@tanstack/react-query';
import { loginService } from './loginService.js';

export const useLoginMutation = () =>
  useMutation({
    mutationFn: loginService.login,
  });
