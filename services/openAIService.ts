import { OpenAI } from 'openai';
import DigitalPersona from '../models/digitalPersona';
// Initialize OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is stored in environment variables
});

export async function generateDigitalPersona(queryPrompt: string) {
  try {
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
          content: queryPrompt,
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
	  const response = await openai.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: [
		  {
			role: 'system',
			content: persona.personaData,
		  },
		  {
			role: 'user',
			content: `Create a ${tone} social media post about ${topic} for the ${industry} industry, tailored for ${platform}. Ensure the content is engaging, emojis, and follows best practices for the platform.The content should not include any bold headings or start with ** and must utilize all the tokens.`,
		  },
		],
		max_tokens: 4096,
	  });
  
	  return response.choices[0].message?.content;
	} catch (error: any) {
	  throw new Error(`OpenAI API error: ${error.message}`);
	}
  }
