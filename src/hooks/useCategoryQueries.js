import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useSecureAxios from './UseAxiosSecure';

export const useCategoryQueries = () => {
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();

  // Normalize API data
  const normalizeCategories = (raw) => {
    const list = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.categories)
      ? raw.categories
      : Array.isArray(raw?.items)
      ? raw.items
      : [];

    return list.map((cat) => {
      const subs = Array.isArray(cat.subCategories)
        ? cat.subCategories
        : Array.isArray(cat.subcategories)
        ? cat.subcategories
        : [];

      return {
        id: cat.id || cat._id || String(cat.categoryId || ""),
        name: cat.name || "",
        icon: cat.icon || "",
        description: cat.description || "",
        subCategories: subs.map((s) => ({
          id: s.id || s._id || String(s.subCategoryId || ""),
          name: s.name || "",
          icon: s.icon || "",
          description: s.description || "",
        })),
      };
    });
  };

  // Get all categories
  const useCategories = () => {
    return useQuery({
      queryKey: ['categories'],
      queryFn: async () => {
        const { data } = await axiosSecure.get("/api/categories");
        return normalizeCategories(data);
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get single category
  const useCategory = (id) => {
    return useQuery({
      queryKey: ['category', id],
      queryFn: async () => {
        const { data } = await axiosSecure.get(`/api/categories/${id}`);
        return normalizeCategories([data])[0];
      },
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Create category mutation
  const useCreateCategory = () => {
    return useMutation({
      mutationFn: async (categoryData) => {
        const payload = {
          name: categoryData.name?.trim(),
          icon: categoryData.icon || "",
          description: categoryData.description?.trim() || "",
          subCategories: categoryData.subCategories || [],
        };

        const { data } = await axiosSecure.post("/api/categories", payload);
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['categories']);
      },
    });
  };

  // Update category mutation
  const useUpdateCategory = () => {
    return useMutation({
      mutationFn: async ({ id, ...categoryData }) => {
        const payload = {
          name: categoryData.name?.trim(),
          icon: categoryData.icon || "",
          description: categoryData.description?.trim() || "",
          subCategories: categoryData.subCategories || [],
        };

        const { data } = await axiosSecure.put(`/api/categories/${id}`, payload);
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['categories']);
        queryClient.invalidateQueries(['category']);
      },
    });
  };

  // Delete category mutation
  const useDeleteCategory = () => {
    return useMutation({
      mutationFn: async (categoryId) => {
        await axiosSecure.delete(`/api/categories/${categoryId}`);
        return categoryId;
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['categories']);
      },
    });
  };

  // Add subcategory mutation
  const useAddSubCategory = () => {
    return useMutation({
      mutationFn: async ({ categoryId, subCategoryData }) => {
        const newSub = {
          name: subCategoryData.name || "নতুন সাব-ক্যাটাগরি",
          icon: subCategoryData.icon || "📁",
          description: subCategoryData.description || "সাব-ক্যাটাগরি বর্ণনা",
          categoryId,
        };

        const { data } = await axiosSecure.post(`/api/categories/${categoryId}/subcategories`, newSub);
        return data;
      },
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['categories']);
        queryClient.invalidateQueries(['category', variables.categoryId]);
      },
    });
  };

  // Update subcategory mutation
  const useUpdateSubCategory = () => {
    return useMutation({
      mutationFn: async ({ categoryId, subCategoryId, field, value }) => {
        const { data } = await axiosSecure.patch(
          `/api/categories/${categoryId}/subcategories/${subCategoryId}`,
          { [field]: value }
        );
        return data;
      },
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['categories']);
        queryClient.invalidateQueries(['category', variables.categoryId]);
      },
    });
  };

  // Delete subcategory mutation
  const useDeleteSubCategory = () => {
    return useMutation({
      mutationFn: async ({ categoryId, subCategoryId }) => {
        await axiosSecure.delete(
          `/api/categories/${categoryId}/subcategories/${subCategoryId}`
        );
        return { categoryId, subCategoryId };
      },
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['categories']);
        queryClient.invalidateQueries(['category', variables.categoryId]);
      },
    });
  };

  return {
    useCategories,
    useCategory,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory,
    useAddSubCategory,
    useUpdateSubCategory,
    useDeleteSubCategory,
    normalizeCategories,
  };
};

export default useCategoryQueries;
