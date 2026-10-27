export interface ProductImage {
  id: string;
  image: {
    url: string;
    public_id?: string;
    secure_url?: string;
  };
}

export interface Mode {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  image?: {
    public_id?: string;
    secure_url?: string;
    url?: string;
  } | string;
  icon?: {
    public_id?: string;
    secure_url?: string;
    url?: string;
  } | string | null;
  badge?: string | null;
  displayOrder?: number;
  isActive?: boolean;
  isSelected?: boolean;
  categoryCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  image: {
    url?: string;
    secure_url?: string;
    public_id?: string;
  } | string;
  description?: string | null;
  modeId?: string;
  mode?: Mode;
  isSelected?: boolean;
}

export interface SubCategory {
  id: string;
  name: string;
  image: {
    url?: string;
    secure_url?: string;
    public_id?: string;
  } | string;
  description?: string | null;
  categoryId: string;
  modeId?: string;
  category?: Category;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  marketPrice: number | null;
  sellingPrice: number;
  vendorPrice: number | null;
  weight: string;
  pieces: string;
  isActive: boolean;
  isMandatory: boolean;
  categoryId: string;
  subCategoryId?: string;
  modeId?: string;
  mode?: Mode;
  createdAt?: string;
  updatedAt?: string;
  category?: Category;
  subCategory?: SubCategory;
  images: ProductImage[];
  cartQuantity?: number;
  isAvailable: boolean;
}

export interface GetAllProductsResponse {
  success: boolean;
  message: string;
  data: {
    products: Product[];
    totalCount: number;
  };
}

export interface GetAllCategoriesResponse {
  success: boolean;
  message: string;
  data: Category[];
}

export interface GetAllModesResponse {
  success: boolean;
  message: string;
  data: Mode[];
}

export interface GetAllProductsParams {
  categoryId?: string;
  subCategoryId?: string;
  modeId?: string;
  maxPrice?: number;
  isActive?: boolean;
  isMandatory?: boolean;
  search?: string;
  vendorPrice?: number | null;
}
