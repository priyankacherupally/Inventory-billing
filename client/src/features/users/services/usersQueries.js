import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { usersService } from './usersService.js';

const USERS_KEY = ['users'];

export const useUsersQuery = () =>
  useQuery({
    queryKey: USERS_KEY,
    queryFn: usersService.list,
  });

export const useCreateUserMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
};

export const useUpdateUserMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersService.update,
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
};

export const useDeactivateUserMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersService.deactivate,
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
};