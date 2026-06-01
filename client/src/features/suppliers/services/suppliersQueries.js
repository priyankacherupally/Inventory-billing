import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { suppliersService } from './suppliersService.js';

const KEY = ['suppliers'];
const auditKey = (id) => ['suppliers', id, 'audit'];

export const useSuppliers = () =>
  useQuery({ queryKey: KEY, queryFn: suppliersService.list });

export const useSupplierAuditLog = (id, enabled) =>
  useQuery({
    queryKey: auditKey(id),
    queryFn: () => suppliersService.auditLog(id),
    enabled: !!id && enabled,
  });

const useSupplierMutation = (mutationFn) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: KEY });
      if (vars?.id) qc.invalidateQueries({ queryKey: auditKey(vars.id) });
    },
  });
};

export const useCreateSupplier = () =>
  useSupplierMutation(suppliersService.create);
export const useUpdateSupplier = () =>
  useSupplierMutation(suppliersService.update);
export const useAddPurchaseVariant = () =>
  useSupplierMutation(suppliersService.addPurchaseVariant);
export const useUpdatePurchaseVariant = () =>
  useSupplierMutation(suppliersService.updatePurchaseVariant);