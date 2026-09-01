import axiosInstance from '../axiosInstance';

export async function listPlans() {
  const { data } = await axiosInstance.get('/admin/plans');
  return data.data.plans;
}

export async function createPlan(payload) {
  const { data } = await axiosInstance.post('/admin/plans', payload);
  return data.data.plan;
}

export async function updatePlan(id, payload) {
  const { data } = await axiosInstance.put(`/admin/plans/${id}`, payload);
  return data.data.plan;
}

export async function togglePlanActive(id) {
  const { data } = await axiosInstance.put(`/admin/plans/${id}/toggle`);
  return data.data.plan;
}

export async function deletePlan(id) {
  const { data } = await axiosInstance.delete(`/admin/plans/${id}`);
  return data.data.plan;
}

export async function seedDefaultPlans() {
  const { data } = await axiosInstance.post('/admin/plans/seed-defaults');
  return data.data.plans;
}
