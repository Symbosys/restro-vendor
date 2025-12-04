export interface ProductImage {
  id: string;
  image: {
    url: string;
    public_id: string;
  };
}

export interface Category {
  id: string;
  name: string;
  image: {
    url: string;
    public_id: string;
  };
  description?: string | null;
  isSelected?: boolean;
}

export interface SubCategory {
  id: string;
  name: string;
  image: {
    secure_url: string;
    public_id: string;
  };
  description?: string | null;
  categoryId: string;
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
  subCategoryId: string;
  createdAt: string;
  updatedAt: string;
  category: Category;
  subCategory: SubCategory;
  images: ProductImage[];
  cartQuantity: number;
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
  data: Category[]
}

export interface GetAllProductsParams {
  categoryId?: string;
  subCategoryId?: string;
  maxPrice?: number;
  isActive?: boolean;
  isMandatory?: boolean;
  search?: string;

  vendorPrice?: number | null;
}