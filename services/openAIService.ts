import { OpenAI } from 'openai';
import DigitalPersona from '../models/digitalPersona';
import Token from '@/models/tokens';
import tiktoken from 'tiktoken';
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
		console.log(userId);
		const persona: any = await DigitalPersona.findOne({ userId });
		console.log(persona);
	  let userQuery: string;
		if (industry != "" && tone != "" && platform != "") {
			const generatePersonaSystemPrompt: any = await getPrompt("generate-custom-posts", "user");
			const prompt = generatePersonaSystemPrompt.prompt;
			const variables: Record<string, string> = { topic, industry, tone, platform, style, noOfPosts: String(noOfPosts) };
			userQuery = await getUpdatedPrompt(prompt, variables)
	  }else{
		  userQuery = `Generate ${noOfPosts} social media posts on the topic of ${topic} for the ${platform} platform. If no industry is provided, assume a general business context. The tone of the posts should default to informative, unless otherwise specified by the user. Each post should be written with a balanced style, and the word count should be appropriate for ${platform}, following its best practices.
		  For the ${platform} platform:
		  Facebook: Write engaging posts with a medium word count, suited for interaction and discussion.
		  Instagram: Keep the content concise and visually appealing, with an emphasis on catchy, attention-grabbing text.
		  LinkedIn: Use a professional and informative tone, offering insights that would resonate with a general business audience.
		  Twitter: Create short, impactful posts that deliver essential information within the character limit.
		  Ensure the posts are engaging, add relevant emojis where appropriate, and follow the best practices for ${platform}. The content should not include any bold headings or start with "**". Use the full token count where possible.
		  Return the posts in a JSON array of objects, where each object represents one post, following this format:
		  [
		  	{"post": "Generated post content here..."},
			{"post": "Generated post content here..."},
		  ]
		`
		}
		console.log("User Query : ", userQuery);
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
	  const text: any = response.choices[0].message?.content;
	  const tokenizer = tiktoken.encoding_for_model('gpt-4o-mini');
	  const tokens = await tokenizer.encode(text);
		const cost = Number((tokens.length / 1000000) * Number(process.env.COST_PER_MILLION_TOKEN));
		console.log(cost);
	  const saveToken = new Token({tokens: tokens.length, cost});
	  await saveToken.save();
		  return response.choices[0].message?.content;
		return;
	} catch (error: any) {
	  throw new Error(`OpenAI API error: ${error.message}`);
	}
  }

export async function generatePostTopics(userId: string) {
	const persona:any = await DigitalPersona.findOne({ userId });
	const response = await openai.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: [
		  {
			role: 'system',
			content: `
                You are an expert content strategist who deeply understands the digital persona provided by the user. 
                The digital persona represents their personal brand, values, tone, industry expertise, and goals. 
                Your job is to generate the most relevant and trending topics that align with this persona's voice and objectives, 
                ensuring each topic is current and likely to engage the target audience.

                The digital persona:
                ${persona.personaData}

                Focus on generating topics that:
                - Are currently trending or highly relevant within the user's industry
                - Reflect the user's voice and tone
                - Align with the user's goals and the expectations of their audience
                `
		  },
		  {
			role: 'user',
			content: `
                Using my digital persona described in the system prompt, generate ${process.env.GENERATE_NO_TOPICS} trending content topics that are relevant to my industry, audience, and current trends. 
                Ensure the topics are engaging, forward-thinking, and likely to resonate with my audience's current interests and needs.
				Return the topics in an array of strings format.
                `,
		  },
		],
		max_tokens: 4096,
		temperature: 0.7
	});
	return response.choices[0].message?.content;
}
