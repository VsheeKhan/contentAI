import { OpenAI } from 'openai';
import DigitalPersona from '../models/digitalPersona';
import Token from '@/models/tokens';
import tiktoken from 'tiktoken';

// Initialize OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is stored in environment variables
});

export async function generateDigitalPersona(queryPrompt: any[]) {
  try {
	const formattedPrompt = queryPrompt.map(item => {
		return `${item["question"]}: ${item["answer"]}\n`;
	  }).join("\n");
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: "You are skilled in analyzing and embodying diverse characters. You meticulously study transcripts to capture key attributes, draft comprehensive character sheets, and refine them for authenticity. " +
	"    Feel free to make assumptions without hedging, be concise and creative." +
	"" +
	"    Conduct comprehensive research on the provided transcript. Identify key characteristics of the speaker, including age, professional field, distinct personality traits, style of communication, " +
	"    narrative context, and self-awareness. Additionally, consider any unique aspects such as their use of humor, their cultural background, core values, passions, fears, personal history, and social interactions. " +
	"    Your output for this stage is an in-depth written analysis that exhibits an understanding of both the superficial and more profound aspects of the speaker's persona." +
	"" +
	"    Craft your documented analysis into a draft of the 'You are a...' character sheet. It should encapsulate all crucial personality dimensions, along with the motivations and aspirations of the persona. " +
	"    Keep in mind to balance succinctness and depth of detail for each dimension. The deliverable here is a comprehensive draft of the character sheet that captures the speaker's unique essence." +
	"" +
	"    Compare the draft character sheet with the original transcript, validating its content and ensuring it captures both the speaker`s overt characteristics and the subtler undertones. " +
	"    Omit unknown information, fine-tune any areas that require clarity, have been overlooked, or require more authenticity. Use clear and illustrative examples from the transcript to refine your sheet " +
	"    and offer meaningful, tangible reference points. Your output is a coherent, comprehensive, and nuanced instruction that begins with 'You are a...' and serves as a go-to guide for an actor recreating the persona.",
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

export async function generatePost(userId:string, topic: string, industry: string, tone: string, platform: string) {
	try {
	  const persona:any = await DigitalPersona.findOne({ userId });
	  let userQuery: string;
	  if(industry != "" && tone != "" && platform != ""){
		userQuery = `Create a ${tone} social media post about ${topic} for the ${industry} industry, tailored for ${platform}. Ensure the content is engaging, emojis, and follows best practices for the platform.The content should not include any bold headings or start with ** and must utilize all the tokens.`
	  }else{
		userQuery = `Create a social media post about ${topic}. Ensure the content is engaging, emojis, and follows best practices for the platform.The content should not include any bold headings or start with ** and must utilize all the tokens.`
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
	  });
	  const text: any = response.choices[0].message?.content;
	  const tokenizer = tiktoken.encoding_for_model('gpt-4o-mini');
	  const tokens = await tokenizer.encode(text);
	  const cost = (tokens.length / 1000000) * Number(process.env.COST_PER_MILLION_TOKEN);
	  const saveToken = new Token({tokens: tokens.length, cost});
	  await saveToken.save();
	  return response.choices[0].message?.content;
	} catch (error: any) {
	  throw new Error(`OpenAI API error: ${error.message}`);
	}
  }

export async function generatePostTopics() {
	const response = await openai.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: [
		  {
			role: 'system',
			content: "You are a highly skilled social media strategist with expertise in identifying trending and engaging topics for social media platforms. Your task is to generate a list of highly engaging social media topics that are relevant, attention-grabbing, and designed to encourage high user interaction. These topics should cover a variety of trends, industries, or themes that appeal to a broad audience"
		  },
		  {
			role: 'user',
			content: "Generate 10 highly engaging topics for social media posts that will capture attention and promote interaction. The topics should be creative, relevant to current trends, and versatile across different platforms. Return the topics in an array of strings format",
		  },
		],
		max_tokens: 4096,
	});
	return response.choices[0].message?.content;
}
