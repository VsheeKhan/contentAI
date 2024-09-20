import Plan from '../models/plan';

interface PlanInput {
  name: string;
  description: string;
  amount: number;
  duration: string;
  status: 'active' | 'inactive';
}

export async function createPlan(data: PlanInput) {
  const newPlan = new Plan(data);
  return await newPlan.save();
}

export async function getPlans() {
  return await Plan.find();
}

export async function getPlanById(id: string) {
  return await Plan.findById(id);
}

export async function updatePlan(id: string, data: Partial<PlanInput>) {
  return await Plan.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export async function deletePlan(id: string) {
  return await Plan.findByIdAndDelete(id);
}
