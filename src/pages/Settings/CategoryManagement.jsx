import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  FolderOpen,
} from "lucide-react";
import Swal from "sweetalert2";
import useAxiosSecure from "../../hooks/UseAxiosSecure";

const CategoryManagement = () => {
  const axiosSecure = useAxiosSecure();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    icon: "",
    description: "",
    subCategories: [],
  });

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

  // Load all categories
  const loadCategories = async () => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.get("/api/categories");
      setCategories(normalizeCategories(data));
    } catch (err) {
      console.error("Error loading categories:", err);
      Swal.fire({
        icon: "error",
        title: "লোডিং ব্যর্থ",
        text: "ক্যাটাগরি লোড করতে সমস্যা হয়েছে",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Add new
  const handleAddCategory = () => {
    setFormData({
      id: "",
      name: "",
      icon: "",
      description: "",
      subCategories: [],
    });
    setEditingCategory(null);
    setShowAddForm(true);
  };

  // Edit
  const handleEditCategory = (category) => {
    setFormData({ ...category });
    setEditingCategory(category);
    setShowAddForm(true);
  };

  // Delete category
  const handleDeleteCategory = async (categoryId) => {
    const confirm = await Swal.fire({
      title: "নিশ্চিত?",
      text: "আপনি কি এই ক্যাটাগরি মুছে ফেলতে চান?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "হ্যাঁ, মুছুন",
      cancelButtonText: "বাতিল",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axiosSecure.delete(`/api/categories/${categoryId}`);
      await loadCategories();
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "ক্যাটাগরি মুছে ফেলা হয়েছে",
        showConfirmButton: false,
        timer: 1200,
      });
    } catch (err) {
      console.error("Delete failed:", err);
      Swal.fire({
        icon: "error",
        title: "মুছতে ব্যর্থ",
        text: "ক্যাটাগরি মুছতে সমস্যা হয়েছে",
      });
    }
  };

  // Delete subcategory
  const handleDeleteSubCategory = async (categoryId, subCategoryId) => {
    const confirm = await Swal.fire({
      title: "নিশ্চিত?",
      text: "আপনি কি এই সাব-ক্যাটাগরি মুছে ফেলতে চান?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "হ্যাঁ, মুছুন",
      cancelButtonText: "বাতিল",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axiosSecure.delete(
        `/api/categories/${categoryId}/subcategories/${subCategoryId}`
      );
      await loadCategories();
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "সাব-ক্যাটাগরি মুছে ফেলা হয়েছে",
        showConfirmButton: false,
        timer: 1200,
      });
    } catch (err) {
      console.error("Subcategory delete failed:", err);
      Swal.fire({
        icon: "error",
        title: "মুছতে ব্যর্থ",
        text: "সাব-ক্যাটাগরি মুছতে সমস্যা হয়েছে",
      });
    }
  };

  // Submit add/edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, icon, description, subCategories } = formData;

    if (!name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "ভুল ইনপুট",
        text: "ক্যাটাগরি নাম দিন",
      });
      return;
    }

    const payload = {
      name: name.trim(),
      icon: icon || "",
      description: description?.trim() || "",
      subCategories: subCategories || [],
    };

    try {
      if (editingCategory?.id) {
        await axiosSecure.put(`/api/categories/${editingCategory.id}`, payload);
      } else {
        await axiosSecure.post("/api/categories", payload);
      }

      await loadCategories();
      setShowAddForm(false);
      setEditingCategory(null);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: editingCategory?.id
          ? "ক্যাটাগরি আপডেট হয়েছে"
          : "ক্যাটাগরি যোগ হয়েছে",
        showConfirmButton: false,
        timer: 1200,
      });
    } catch (err) {
      console.error("Save failed:", err);
      Swal.fire({
        icon: "error",
        title: "সংরক্ষণ ব্যর্থ",
        text: "ক্যাটাগরি সংরক্ষণে সমস্যা হয়েছে",
      });
    }
  };

  // Expand/collapse
  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) newSet.delete(categoryId);
      else newSet.add(categoryId);
      return newSet;
    });
  };

  // Add subcategory
  const addSubCategory = async (categoryId) => {
    const newSub = {
      name: "নতুন সাব-ক্যাটাগরি",
      icon: "📁",
      description: "সাব-ক্যাটাগরি বর্ণনা",
      categoryId,
    };
    try {
      await axiosSecure.post(`/api/categories/${categoryId}/subcategories`, newSub);
      await loadCategories();
      setExpandedCategories((prev) => new Set([...prev, categoryId]));
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "সাব-ক্যাটাগরি যোগ হয়েছে",
        showConfirmButton: false,
        timer: 1200,
      });
    } catch (err) {
      console.error("Add subcategory error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "সাব-ক্যাটাগরি যোগ করতে সমস্যা হয়েছে";
      Swal.fire({
        icon: "error",
        title: "যোগ করা ব্যর্থ",
        text: msg,
      });
    }
  };

  // Update subcategory inline
  const updateSubCategory = async (categoryId, subCategoryId, field, value) => {
    try {
      await axiosSecure.patch(
        `/api/categories/${categoryId}/subcategories/${subCategoryId}`,
        { [field]: value }
      );
      await loadCategories();
    } catch (err) {
      console.error("Update subcategory error:", err);
      Swal.fire({
        icon: "error",
        title: "আপডেট ব্যর্থ",
        text: "সাব-ক্যাটাগরি আপডেটে সমস্যা হয়েছে",
      });
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          ক্যাটাগরি ব্যবস্থাপনা
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          লেনদেনের জন্য ক্যাটাগরি এবং সাব-ক্যাটাগরি যোগ, সম্পাদনা এবং মুছে ফেলুন
        </p>
      </div>

      {/* Add Category Button */}
      <div className="mb-4">
        <button
          onClick={handleAddCategory}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          নতুন ক্যাটাগরি যোগ করুন
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-md shadow-md p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingCategory ? "ক্যাটাগরি সম্পাদনা করুন" : "নতুন ক্যাটাগরি যোগ করুন"}
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ক্যাটাগরি নাম *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="ক্যাটাগরি নাম দিন"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  আইকন
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="আইকন (emoji)"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                বর্ণনা
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="ক্যাটাগরি বর্ণনা দিন"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-md flex items-center gap-1.5 text-sm transition-colors"
              >
                <Save className="w-3 h-3" />
                {editingCategory ? "আপডেট করুন" : "সংরক্ষণ করুন"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1.5 rounded-md text-sm transition-colors"
              >
                বাতিল
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-3">
        {loading && (
          <div className="text-sm text-gray-600 dark:text-gray-400">লোড হচ্ছে...</div>
        )}

        {!loading &&
          categories.map((category) => (
            <div
              key={category.id}
              className="bg-white dark:bg-gray-800 rounded-md shadow-sm"
            >
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {expandedCategories.has(category.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <span className="text-lg">{category.icon}</span>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {category.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => addSubCategory(category.id)}
                      className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-400 p-1.5 rounded-md transition-colors"
                      title="সাব-ক্যাটাগরি যোগ করুন"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200 p-1.5 rounded-md hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                      title="সম্পাদনা করুন"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Sub Categories */}
              {expandedCategories.has(category.id) && (
                <div className="p-3">
                  {category.subCategories && category.subCategories.length > 0 ? (
                    <div className="space-y-2">
                      {category.subCategories.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{sub.icon}</span>
                            <div>
                              <input
                                type="text"
                                value={sub.name}
                                onChange={(e) =>
                                  updateSubCategory(
                                    category.id,
                                    sub.id,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="font-medium text-sm text-gray-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 py-0.5"
                              />
                              <input
                                type="text"
                                value={sub.description}
                                onChange={(e) =>
                                  updateSubCategory(
                                    category.id,
                                    sub.id,
                                    "description",
                                    e.target.value
                                  )
                                }
                                className="block text-xs text-gray-600 dark:text-gray-400 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 py-0.5 mt-0.5 w-full"
                                placeholder="বর্ণনা দিন"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={sub.icon}
                              onChange={(e) =>
                                updateSubCategory(
                                  category.id,
                                  sub.id,
                                  "icon",
                                  e.target.value
                                )
                              }
                              className="w-12 text-center bg-transparent border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                              placeholder="আইকন"
                            />
                            <button
                              onClick={() =>
                                handleDeleteSubCategory(category.id, sub.id)
                              }
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 p-1 rounded-md"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      কোন সাব-ক্যাটাগরি নেই
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default CategoryManagement;
