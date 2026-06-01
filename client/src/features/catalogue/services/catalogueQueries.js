import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { catalogueService } from './catalogueService.js';

const keys = {
  variants: ['catalogue', 'variants'],
  categories: (variantId) => ['catalogue', 'categories', variantId],
  subcategories: (categoryId) => ['catalogue', 'subcategories', categoryId],
  designs: (subcategoryId) => ['catalogue', 'designs', subcategoryId],
};

// ---- Queries (enabled only when the parent is selected) ----
export const useVariants = () =>
  useQuery({ queryKey: keys.variants, queryFn: catalogueService.listVariants });

export const useCategories = (variantId) =>
  useQuery({
    queryKey: keys.categories(variantId),
    queryFn: () => catalogueService.listCategories(variantId),
    enabled: !!variantId,
  });

export const useSubcategories = (categoryId) =>
  useQuery({
    queryKey: keys.subcategories(categoryId),
    queryFn: () => catalogueService.listSubcategories(categoryId),
    enabled: !!categoryId,
  });

export const useDesigns = (subcategoryId) =>
  useQuery({
    queryKey: keys.designs(subcategoryId),
    queryFn: () => catalogueService.listDesigns(subcategoryId),
    enabled: !!subcategoryId,
  });

// ---- Mutations (invalidate the relevant list on success) ----
const useCatalogueMutation = (mutationFn, getKey) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: getKey(vars) }),
  });
};

export const useCreateVariant = () =>
  useCatalogueMutation(catalogueService.createVariant, () => keys.variants);
export const useUpdateVariant = () =>
  useCatalogueMutation(catalogueService.updateVariant, () => keys.variants);

export const useCreateCategory = () =>
  useCatalogueMutation(catalogueService.createCategory, (v) =>
    keys.categories(v.variantId),
  );
export const useUpdateCategory = () =>
  useCatalogueMutation(catalogueService.updateCategory, (v) =>
    keys.categories(v.variantId),
  );

export const useCreateSubcategory = () =>
  useCatalogueMutation(catalogueService.createSubcategory, (v) =>
    keys.subcategories(v.categoryId),
  );
export const useUpdateSubcategory = () =>
  useCatalogueMutation(catalogueService.updateSubcategory, (v) =>
    keys.subcategories(v.categoryId),
  );

export const useCreateDesign = () =>
  useCatalogueMutation(catalogueService.createDesign, (v) =>
    keys.designs(v.subcategoryId),
  );
export const useUpdateDesign = () =>
  useCatalogueMutation(catalogueService.updateDesign, (v) =>
    keys.designs(v.subcategoryId),
  );