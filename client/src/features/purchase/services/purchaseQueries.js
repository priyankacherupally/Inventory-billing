import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { purchaseService } from './purchaseService.js';

export const usePurchases = (filters) =>
  useQuery({
    queryKey: ['purchases', filters],
    queryFn: () => purchaseService.list(filters),
  });

export const useCreatePurchase = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: purchaseService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases'] });
      // Stock changed → refresh suppliers (totals) and catalogue stock views.
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      qc.invalidateQueries({ queryKey: ['catalogue'] });
    },
  });
};