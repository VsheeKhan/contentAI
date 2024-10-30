import { OpenAI } from 'openai';
import DigitalPersona from '../models/digitalPersona';
import Token from '@/models/tokens';
// import tiktoken from 'tiktoken';
import { getPrompt } from "./promptService";

// Initialize OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is stored in environment variables
});

function getUpdatedPrompt(prompt: string, variables: Record<string, string>): string {
  return prompt.replace(/\$\{(\w+)\}/g, (_, variable: string) => {
    return variables[variable] || '';
  });
}

export async function generateDigitalPersona(queryPrompt: any[]) {
  try {
	const formattedPrompt = queryPrompt.map(item => {
		return `${item["question"]}: ${item["answer"]}\n`;
	}).join("\n");
	  const generatePersonaSystemPrompt:any = await getPrompt("generate-persona", "system");
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: generatePersonaSystemPrompt?.prompt,
        },
        {
          role: 'user',
          content: formattedPrompt,
        },
      ],
      max_tokens: 4096,
    });

    return response.choices[0].message?.content;
  } catch (error: any) {
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

export async function generatePost(userId:string, topic: string, industry: string, tone: string, platform: string, style: string, noOfPosts: number) {
	try {
		const persona: any = await DigitalPersona.findOne({ userId });
	  let userQuery: string;
		if (industry != "" && tone != "" && platform != "") {
			const generatePersonaSystemPrompt: any = await getPrompt("generate-posts-on-custom-topics", "user");
			const prompt = generatePersonaSystemPrompt.prompt;
			const variables: Record<string, string> = { topic, industry, tone, platform, style, noOfPosts: String(noOfPosts) };
			userQuery = await getUpdatedPrompt(prompt, variables)
		} else {
			const generatePersonaSystemPrompt: any = await getPrompt("generate-posts-on-generated-topics", "user");
			const prompt = generatePersonaSystemPrompt.prompt;
			const variables: Record<string, string> = { topic, platform, noOfPosts: String(noOfPosts) };
			userQuery = await getUpdatedPrompt(prompt, variables)
		}
	  const response = await openai.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: [
		  {
			role: 'system',
			content: persona.personaData,
		  },
		  {
			role: 'user',
			content: userQuery,
		  },
		],
		max_tokens: 4096,
		temperature: 0.65
	  });
	//   const text: any = response.choices[0].message?.content;
	  const total_tokens = response.usage?.total_tokens;
		const prompt_token:any = response.usage?.prompt_tokens;
		const completion_tokens: any = response.usage?.completion_tokens;
		const input_token_cost:any = process.env.COST_PER_MILLION_INPUT_TOKEN;
		const output_token_cost:any = process.env.COST_PER_MILLION_OUTPUT_TOKEN;
		const cost = ((prompt_token / 1000000) * parseFloat(input_token_cost)) + ((completion_tokens / 1000000) * parseFloat(output_token_cost));
	  const saveToken = new Token({tokens: total_tokens, cost});
	  await saveToken.save();
	  return response.choices[0].message?.content;
	} catch (error: any) {
	  throw new Error(`OpenAI API error: ${error.message}`);
	}
  }

export async function generatePostTopics(userId: string) {
	const persona: any = await DigitalPersona.findOne({ userId });
	//Create system prompt
	const generatePersonaSystemPrompt: any = await getPrompt("generate-topics", "system");
	const variables: Record<string, string> = { digitalPersona: persona.personaData };
	const systemQuery = await getUpdatedPrompt(generatePersonaSystemPrompt.prompt, variables);
	//Create user prompt
	const generatePersonaUserPrompt: any = await getPrompt("generate-topics", "user");
	const noOfTopics:any = process.env.GENERATE_NO_TOPICS;
	const user_prompt_variables: Record<string, string> = { noOfTopics };
	const userQuery = await getUpdatedPrompt(generatePersonaUserPrompt.prompt, user_prompt_variables);

	const response = await openai.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: [
		  {
			role: 'system',
			content: systemQuery
		  },
		  {
			role: 'user',
			content: userQuery
		  },
		],
		max_tokens: 4096,
		temperature: 0.7
	});
	return response.choices[0].message?.content;
}
