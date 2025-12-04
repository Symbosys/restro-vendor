import api from '../api/api';
import { GetAllCategoriesResponse } from '../types/product.type';
import { ErrorMessage } from '../utils/utils';
import { AxiosError } from 'axios';

const fetchCategories = async (): Promise<GetAllCategoriesResponse> => {
  try {
    const res = await api.get('/vendor/inventory/categories');
    return res.data;
  } catch (error) {
      ErrorMessage(error as AxiosError | Error)
    throw error;
  }
};

export default fetchCategories; 
