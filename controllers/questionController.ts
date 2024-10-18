import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../lib/mongodb';
import { createQuestion, getQuestions, getQuestionById, updateQuestion, deleteQuestion } from '../services/questionService';

export async function createQuestionHandler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === 'POST') {
    try {
      const { questionType, question, options, status } = req.body;
      const example = req.body.example || "";
      if (questionType === "text" && example === "") {
        return res.status(400).json({ message: "Example required for question type 'input'" });
      }
      const newQuestion = await createQuestion({ questionType, question, options, example, status });

      res.status(201).json(newQuestion);
    } catch (error) {
      res.status(400).json({ message: 'Error creating question', error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

export async function getQuestionsHandler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === 'GET') {
    try {
      const questions = await getQuestions();
      res.status(200).json(questions);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving questions', error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

export async function getQuestionByIdHandler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === 'GET') {
    const { id } = req.query;

    try {
      const question = await getQuestionById(id as string);

      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }

      res.status(200).json(question);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving question', error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

export async function updateQuestionHandler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === 'PUT') {
    const { id } = req.query;
    const { questionType, question, options, status } = req.body;
    const example = req.body.example || "";
      if (questionType === "text" && example === "") {
        return res.status(400).json({ message: "Example required for question type 'input'" });
      }
    try {
      const updatedQuestion = await updateQuestion(id as string, { questionType, question, options, example, status });

      if (!updatedQuestion) {
        return res.status(404).json({ message: 'Question not found' });
      }

      res.status(200).json(updatedQuestion);
    } catch (error) {
      res.status(400).json({ message: 'Error updating question', error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

export async function deleteQuestionHandler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === 'DELETE') {
    const { id } = req.query;

    try {
      const deletedQuestion = await deleteQuestion(id as string);

      if (!deletedQuestion) {
        return res.status(404).json({ message: 'Question not found' });
      }

      res.status(200).json({ message: 'Question deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting question', error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
