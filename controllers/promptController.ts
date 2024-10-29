import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../lib/mongodb";
import {
  createPrompt,
  getAllPrompt,
  updatePrompt,
} from "../services/promptService";

const requiredVariables: Record<string, string[]> = {
  "generate-custom-posts": [
    "noOfPosts",
    "topic",
    "industry",
    "tone",
    "platform",
    "style",
  ],
  "generate-posts": ["noOfPosts", "topic", "platform"],
  "generate-topics": ["digitalPersona", "noOfTopics"],
};

function checkVariablesInText(variables: string[], text: string): void {
  const missingVariables = variables.filter(
    (variable) => !text.includes(`\${${variable}}`)
  );
  if (missingVariables.length !== 0) {
    throw new Error(
      `Missing variables: ${missingVariables.join(", ")}. Contact Developer!`
    );
  }
}

function hasVariablesInText(text: string): boolean {
  const variablePattern = /\$\{[^}]+\}/;
  return variablePattern.test(text);
}

export async function createPromptHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToDatabase();

  if (req.method === "POST") {
    try {
      const { name, prompt } = JSON.parse(req.body);
      const type = req.body.type ? req.body.type : "user";
      if (!name || !prompt) {
        return res
          .status(400)
          .json({ message: "Prompt name and Prompt are required" });
      }
      const variables = requiredVariables?.[name];
      if (!variables) {
        if (hasVariablesInText(prompt)) {
          return res.status(400).json({
            message:
              "Variables are not allowed in this prompt. Remove any `${}` variables.",
          });
        }
      } else {
        checkVariablesInText(variables, prompt);
      }

      const newPrompt = await createPrompt({ name, prompt, type });
      res.status(201).json(newPrompt);
    } catch (error) {
      res.status(400).json({
        message: "Error creating prompt",
        error: (error as Error).message,
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

export async function getAllPromptHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToDatabase();
  if (req.method === "GET") {
    try {
      const prompts = await getAllPrompt();

      res.status(201).json(prompts);
    } catch (error) {
      res.status(400).json({
        message: "Error creating prompt",
        error: (error as Error).message,
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

export async function updatePromptHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToDatabase();

  if (req.method === "PUT") {
    try {
      const { name, prompt } = JSON.parse(req.body);
      const { id } = req.query;

      if (!id || !name || !prompt) {
        return res
          .status(400)
          .json({ message: "Prompt ID, Prompt name, and Prompt are required" });
      }
      const variables = requiredVariables?.[name];
      if (!variables) {
        if (hasVariablesInText(prompt)) {
          return res.status(400).json({
            message:
              "Variables are not allowed in this prompt. Remove any `${}` variables.",
          });
        }
      } else {
        checkVariablesInText(variables, prompt);
      }
      await updatePrompt(id as string, { prompt });
      res.status(200).json({ message: "Prompt updated successfully" });
    } catch (error) {
      res.status(400).json({
        message: "Error updating prompt",
        error: (error as Error).message,
      });
    }
  } else {
    res.setHeader("Allow", ["PUT"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
