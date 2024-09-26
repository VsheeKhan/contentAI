import { OpenAI } from 'openai';

// Initialize OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is stored in environment variables
});

export async function generateDigitalPersona(systemPrompt: string, queryPrompt: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // You can use 'gpt-4' if available
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
          content: 
            "Question	Multiple Choice Options	Example" +
	"What is your #1 main goal for your content?	(A) Drive sales of my product / service, (B) Build authority with a particular target audience, (C) Drive more traffic to other forms of content I produce (eg a podcast), (D) Simply to grow a large audience that I can sell things to forever	" +
	"Describe you product of service in 1 sentence.	N/A	" +
	"Why is your product or service better that your competitors?	N/A	" +
	"Tell us a bit about who you are in the context of your career.	N/A	I work with Fortune 500 brands to do xyz job / I've spent 20 years working with x to achieve y / I just launched a new business that helps x" +
	"What are your biggest career accomplisments / brags? (List as many as you can think of)	N/A	I helped x company achieve y result / I sold a company for $10m at 25 years old " +
	"Which of the following best describes what you want your tone of voice to be on social?	(A) Authoritative, (B) Contrarian, (C) Funny, (D) Inspirational, (E) Thought Leader, (F) Conversational, (G) Witty, (H) Thought-provoking, (I) Controversial, (J) Optimistic, (K) Humble, (L) Educational, (M) Troll / Shitposter	" +
	"Which would be your second choice?	(A) Authoritative, (B) Contrarian, (C) Funny, (D) Inspirational, (E) Thought Leader, (F) Conversational, (G) Witty, (H) Thought-provoking, (I) Controversial, (J) Optimistic, (K) Humble, (L) Educational, (M) Troll / Shitposter	" +
	"Describe your target audience & customer base in as much detail as possible.	N/A	My target audience is potential clients for my SEO agency. They are CEOs of 8 figure DTC brands, mostly in the fashion niche, between the ages of 25 & 50 in big cities." +
	"What does that target audience wake up wanting most every day? What is their #1 goal? What is their biggest pain point?	N/A	These e-commerce store owners want to generate more customers without being as heavily relient on paid ads / My target audience of time poor, health conscious CEO's want simple nutrition and workout plans that don't get affected by their busy lives." +
	"What is 1 thing they can do to get closer to that #1 goal of theris?	N/A	If these e-commerce store owners learnt how to optimise their social media content for search they would be closer to their goals" +
	"In 2 or more sentences, what do you want your content to cover? Are there any specific angles or sub-niches to these broader topics?	N/A	As my target are audience are potential clients of my SEO agency I would like to share industy updates, hop tips and \"how to's\". I would also like to cover case studies of other big businesses that are crushing it using SEO and digital marketing techniques." +
	"Are there any tools that you use in your day to day that you can't live without? If so, why? (List as many as you can, even if there is no 'why')	N/A	I can't live with SEM Rush to do key word research and planning for my SEO campaigns because it allows me to do xyz. " +
	"What are some topics you want to avoid? Is there something we may think is safe that you may not want to be associated with?	N/A	I don't want to be seen talking about politics or religion / We are exclusively an SEO agency so don't talk about other forms of digital marketing" +
	"Are you an Entreprener / Founder?	(A) Yes, (B) No	" +
	"Can you share any personal or professional experiences that have shaped your perspective of your industry?	N/A	Maybe a story of a first job? A bad boss? An internship you did? A particular client or supplier story? Having to fire a friend or a star employee?" +
	"What are you most proud of in your business / life / career? (You can answer more than 1 area)	N/A	" +
	"What pisses you off on a call with a customer or potential client?	N/A	When a client tells me how to do my job even though they have no experience but they just quote a post from their favourite influencer" +
	"What is the #1 indicator that someone will be a good client?	N/A	They are a startup business with no experience in marketing / They are already doing $1m in revenue and are hungry to scale to $10m" +
	"What are the 3 most common questions you get on a call with a potential new client?	N/A	",
        },
      ],
      max_tokens: 4096,
    });

    return response.choices[0].message?.content;
  } catch (error: any) {
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}
