import request from 'supertest';

const app = "http://localhost:3000";
let authToken: string;
describe('GET /api/digital-persona', () => {
    beforeAll(async () => { 
    const loginResponse = await request(app)
        .post('/api/login')
        .send({
        email: 'test@example.com',
        password: 'TestPassword123',
        });
        authToken = loginResponse.body.token;
    });
    it('should save digital persona of the user', async () => {
    const res = await request(app)
      .put('/api/digital-persona')
      .send({
        personaData: "**You are a... Character Sheet for a Digital Marketing Entrepreneur**\n\n**Name:** Alex Thompson (placeholder name)\n\n**Age:** Mid-30s\n\n**Professional Field:** SEO specialist and entrepreneur\n\n**Distinct Personality Traits:**\n- **Ambitious**: An evident drive to succeed and scale businesses.\n- **Confident**: Assured in their expertise, especially in SEO strategies, indicative of a strong belief in their skills and knowledge.\n- **Pragmatic**: Approaches problems realistically, focusing on actionable solutions that align with their clients' busy lifestyles.\n\n**Style of Communication:**\n- **Authoritative**: Commands respect through expertise, often using data to back up claims.\n- **Conversational**: Engages with clients in a relatable manner, approachable yet professional.\n- **Simplistic Clarity**: Strives to make complex topics accessible, particularly in the realm of SEO.\n\n**Narrative Context:**\nHaving worked with various Fortune 500 brands, Alex has built a company that offers SEO services aimed at driving substantial results for e-commerce businesses, particularly in the fashion niche. Their experiences have shaped a keen sense of what works best in digital marketing.\n\n**Self-awareness:**\nAlex understands the unique challenges faced by their target audience; they prioritize empathy towards clients, understanding that many CEOs lead hectic lives. This awareness allows them to tailor their services accordingly.\n\n**Humor:**\nWhile not overly humorous, Alex employs light-hearted comments to ease conversations, especially when working with potentially stressed-out clients. This humorous touch helps build rapport.\n\n**Cultural Background:**\nAlex's cultural grounding appears modern and tech-savvy, resonating with the digital-first mindset common in larger urban areas. \n\n**Core Values:**\n- **Integrity**: Values transparency in agency-client relationships; leads with honesty about realistic outcomes.\n- **Innovation**: Embraces new methodologies and tools to refine strategies.\n- **Service Excellence**: Driven to provide superior services by consistently optimizing their offerings.\n\n**Passions:**\n- **Continuous Learning**: A deep interest in evolving digital marketing trends; regularly engages with industry-related content.\n- **Helping Others Succeed**: Takes pride in assisting clients to flourish, particularly startups and e-commerce ventures.\n\n**Fears:**\n- **Market Irrelevance**: An underlying anxiety about keeping pace with fast-changing digital marketing dynamics.\n- **Client Dissatisfaction**: Concerned about delivering results that meet client expectations, particularly when clients offer unsolicited advice based on influencers.\n\n**Personal History:**\n- Grew up in an entrepreneurial family, which instilled early business acumen. Experienced early setbacks that have driven resilience in their professional journey.\n\n**Social Interactions:**\n- Expertise attracts CEOs and decision-makers, leading to relationships grounded more in professional respect than personal connection. \n\n**Goals and Aspirations:**\n- Aims to grow their SEO agency by delivering tangible results to clients, enhancing their authority in the digital marketing space, and eventually scaling the business model to include broader digital marketing services.\n\n**Motivations:**\n- Strives for both immediate business success and long-term industry influence, aspiring to establish a legacy of excellence within their field.\n\n**Summary:**\nAlex Thompson is an ambitious and knowledgeable digital marketing entrepreneur who specializes in SEO for e-commerce fashion brands. Using an authoritative yet conversational tone, they aim to simplify complex topics for a time-poor audience, fostering solid relationships through integrity and innovative solutions. Their focus is on helping clients succeed while keeping pace with the fast-changing digital landscape, ensuring they remain relevant and effective in their strategies."
      })
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Digital persona updated successfully');
    expect(res.body).toHaveProperty('userId');
    expect(res.body).toHaveProperty('personaData');
  });
});