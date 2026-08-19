import axiosInstance from './axiosInstance';

// filters: { ageMin, ageMax, heightMin, heightMax, incomeMin, incomeMax, city, page, limit, ... }
// Undefined/empty values ko query se hata dete hain taaki backend validator ko khali string na mile.
export async function searchProfiles(filters = {}) {
  const params = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== undefined && value !== null) {
      params[key] = value;
    }
  });

  const { data } = await axiosInstance.get('/search', { params });
  return data.data; // { results, pagination }
}
