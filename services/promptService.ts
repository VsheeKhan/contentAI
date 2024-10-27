import Prompt, { PromptType } from '../models/prompt';

interface PromptInput {
    type: PromptType;
    name: string;
    prompt?: string;
}

export async function createPrompt(data: PromptInput) {
  const newQuestion = new Prompt(data);
  return await newQuestion.save();
}

export async function getAllPrompt() { 
    return await Prompt.find();
}

export async function getPrompt(name: string, type: string) {
    return await Prompt.findOne({ name, type });
}

export async function updatePrompt(id: string, data: Partial<PromptInput>) {
  return await Prompt.findByIdAndUpdate(id, data, { new: true });
}