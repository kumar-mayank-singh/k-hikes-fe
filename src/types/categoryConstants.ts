export interface CategoryEditForm {
  name: string;
  description: string;
  sort_order: number;
}

export interface Category {
  category_id: string;
  name: string;
  slug: string;
  sort_order: number;
  description?: string;
  created_by?: string;
  created_on?: string;
  updated_by?: string;
  updated_on?: string;
}

export interface CategoryCardProps {
    category: Category;
    isEditing: boolean;
    editForm: CategoryEditForm;
    onEditFormChange: (form: CategoryEditForm) => void;
    onSave: () => void;
    onCancel: () => void;
    onStartEdit: () => void;
    onRequestDelete: () => void;
    isUpdating: boolean;
  }
  
  export interface CategoriesResponse {
    items: Category[];
    total_count: number;
  }
  
  export interface CreateCategoryPayload {
    name: string;
    description?: string | null;
    sort_order?: number;
  }

  export interface UpdateCategoryPayload {
    name?: string | null;
    description?: string | null;
    sort_order?: number | null;
  }
  
  export interface CategoriesEmptyStateProps {
    hasCategories: boolean;
    onCreateCategory: () => void;
  }
  
  export interface CategoriesHeaderProps {
    onNewCategory: () => void;
  }
  
  export interface CategoriesListProps {
    categories: Category[];
    isLoading: boolean;
    error: Error | null;
    editingId: string | null;
    editForm: CategoryEditForm;
    onEditFormChange: (form: CategoryEditForm) => void;
    onStartEdit: (category: Category) => void;
    onCancelEdit: () => void;
    onUpdate: (categoryId: string) => void;
    onRequestDelete: (category: Category) => void;
    isUpdating: boolean;
  }