import Question, { QuestionType, questionStatus } from '../models/question';

interface QuestionInput {
  questionType: QuestionType;
  question: string;
  options?: Record<string, any>;  // JSON object for options
  status: questionStatus.active | questionStatus.inactive;
}

export async function createQuestion(data: QuestionInput) {
  const newQuestion = new Question(data);
  return await newQuestion.save();
}

export async function getQuestions() {
  return await Question.find();
}

export async function getQuestionById(id: string) {
  return await Question.findById(id);
}

export async function updateQuestion(id: string, data: Partial<QuestionInput>) {
  return await Question.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export async function deleteQuestion(id: string) {
  return await Question.findByIdAndDelete(id);
}
