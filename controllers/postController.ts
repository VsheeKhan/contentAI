import { NextApiRequest, NextApiResponse } from 'next';
import { generatePost } from '../services/openAIService';
import { createPost, getAllPostsByUserId, updatePost, deletePost } from '../services/postService';
import { getDigitalPersonaByUserId } from '../services/digitalPersonaService';
import connectToDatabase from '../lib/mongodb'; // If you need to use the database

// Handler to generate digital persona
export async function generatePostHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      connectToDatabase();
      const { userId } = req.user as { userId: string };
  
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized, no userId found in token' });
      }
      const { topic, industry, tone, platform } = req.body;
      if (!topic || !industry || !tone || !platform) {
        return res.status(400).json({ message: 'topic, industry, tone, platform are required' });
      }
      const post = await generatePost(userId, topic, industry, tone, platform);
      res.status(200).json({ post });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

// Handler to create a new post
export async function createPostHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      await connectToDatabase();
      const { userId } = req.user as { userId: string };
  
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized, no userId found in token' });
      }
      const { topic, industry, tone, platform, generatedPost } = req.body;

      if (!topic || !industry || !tone || !platform || !generatedPost) {
        return res.status(400).json({ message: 'generatedPost, topic, industry, tone, and platform are required' });
      }
      const post = await createPost(userId, topic, industry, tone, platform, generatedPost);
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

export async function getPostsHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      await connectToDatabase();

      const { userId } = req.user as { userId: string };
  
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized, no userId found in token' });
      }

      const posts = await getAllPostsByUserId(userId as string);

      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

export async function updatePostHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    try {
      await connectToDatabase();

      const { postId } = req.query;
      const updatedData = req.body;

      const post = await updatePost(postId as string, updatedData);

      res.status(200).json(post);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

export async function deletePostHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    try {
      await connectToDatabase();

      const { postId } = req.query;

      const post = await deletePost(postId as string);

      res.status(200).json({ message: 'Post deleted successfully', post });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

