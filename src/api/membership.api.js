import axiosInstance from './axiosInstance';

// Upgrade Membership page ke 3 columns (Pro / Pro Max / Pro Supreme) + durations
export async function getPlans() {
  const { data } = await axiosInstance.get('/membership/plans');
  return data.data;
}

// Navbar / Upgrade page pe current status (kaunsa plan, kab expire hoga)
export async function getMembershipStatus() {
  const { data } = await axiosInstance.get('/membership/status');
  return data.data.membership;
}

// "Get <plan> now" click - Razorpay order banata hai
export async function createMembershipOrder(planId, duration) {
  const { data } = await axiosInstance.post('/membership/create-order', { planId, duration });
  return data.data.order;
}

// Razorpay checkout success ke baad signature verify karke membership activate karta hai
export async function verifyMembershipPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const { data } = await axiosInstance.post('/membership/verify', {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  });
  return data.data.membership;
}
