import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { billingService } from './billingService.js';

export const useActiveDesigns = () =>
  useQuery({
    queryKey: ['designs', 'active-flat'],
    queryFn: billingService.listActiveDesigns,
  });

export const useBills = (filters) =>
  useQuery({
    queryKey: ['bills', filters],
    queryFn: () => billingService.list(filters),
  });

export const useCreateBill = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: billingService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bills'] });
      // Stock changed → refresh design lists / catalogue.
      qc.invalidateQueries({ queryKey: ['designs'] });
      qc.invalidateQueries({ queryKey: ['catalogue'] });
    },
  });
};