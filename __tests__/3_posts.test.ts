import request from 'supertest';

const app = "http://localhost:3000";
let authToken: string;
let postId: string;
describe('POSTS', () => {
    beforeAll(async () => {
    const loginResponse = await request(app)
        .post('/api/login')
        .send({
        email: 'test@example.com',
        password: 'TestPassword123',
        });
        authToken = loginResponse.body.token;
    });

    it('should save created post', async () => {
    const res = await request(app)
      .post('/api/posts')
        .send({
            topic: "The impact of AI in the workplace",
            industry: "Medical",
            tone: "Professional",
            platform: "LinkedIn",
            scheduleDate: "2024-11-22",
            style: "Persuasive",
            generatedPost: "🌟 **The Impact of AI in the Workplace: Revolutionizing the Medical Industry** 🏥🤖\n\nAs artificial intelligence continues to advance, its influence on the medical sector is undeniable and transformative. Here’s how AI is reshaping our workplaces and patient care:\n\n1. **Enhanced Diagnostic Accuracy**: AI algorithms analyze medical data faster and more accurately than ever, reducing the potential for human error and leading to more precise diagnoses.\n\n2. **Streamlined Administrative Processes**: Automating routine tasks such as scheduling, billing, and patient documentation allows healthcare professionals to focus more on what truly matters—patient care.\n\n3. **Personalized Treatment Plans**: Machine learning models analyze patient histories and outcomes, enabling tailored treatment plans that are smarter and more effective.\n\n4. **Predictive Analytics for Patient Care**: AI tools can predict patient needs and potential health risks through analytics, shifting the focus from reactive to proactive care.\n\n5. **Improved Research Efficiency**: AI significantly accelerates drug discovery and clinical trials by analyzing vast datasets, which can lead to faster innovations and breakthroughs in treatment options.\n\nThe intersection of AI and healthcare is a powerful force that encourages new efficiencies, improved outcomes, and enhanced patient experiences. As we embrace these technologies, it’s critical to ensure we approach their implementation with a focus on ethics and patient data privacy.\n\n💡 **What role do you see AI playing in the future of healthcare? Share your thoughts below!** \n\n#HealthcareInnovation #AI #DigitalTransformation #MedicalTechnology #PatientCare #FutureOfWork"
      })
      .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(201);
      postId = res.body._id;
      expect(res.body).toHaveProperty('topic');
      expect(res.body).toHaveProperty('platform');
      expect(res.body).toHaveProperty('style');
    });
  
    it('should Get all available posts', async () => {
    const res = await request(app)
      .get('/api/posts')
        .send()
      .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
    });

    it('should Generate post topics', async () => {
    const res = await request(app)
      .get('/api/generate-post-topics')
        .send()
      .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
    });
  
    it('should return generated topics', async () => {
    const res = await request(app)
      .get('/api/get-custom-topics')
        .send()
      .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
    });
  
    it('should update post', async () => {
      const res = await request(app)
      .put(`/api/posts/${postId}`)
        .send({
          topic: "The impact of AI in the workplace - updated",
          industry: "Medical",
          tone: "Funny",
          platform: "LinkedIn",
          scheduleDate: "2024-11-21",
          style: "Creative",
          isCanceled: false,
          generatedPost: "🌟 **The Impact of AI in the Workplace: Revolutionizing the Medical Industry** 🏥🤖\n\nAs artificial intelligence continues to advance, its influence on the medical sector is undeniable and transformative. Here’s how AI is reshaping our workplaces and patient care:\n\n1. **Enhanced Diagnostic Accuracy**: AI algorithms analyze medical data faster and more accurately than ever, reducing the potential for human error and leading to more precise diagnoses.\n\n2. **Streamlined Administrative Processes**: Automating routine tasks such as scheduling, billing, and patient documentation allows healthcare professionals to focus more on what truly matters—patient care.\n\n3. **Personalized Treatment Plans**: Machine learning models analyze patient histories and outcomes, enabling tailored treatment plans that are smarter and more effective.\n\n4. **Predictive Analytics for Patient Care**: AI tools can predict patient needs and potential health risks through analytics, shifting the focus from reactive to proactive care.\n\n5. **Improved Research Efficiency**: AI significantly accelerates drug discovery and clinical trials by analyzing vast datasets, which can lead to faster innovations and breakthroughs in treatment options.\n\nThe intersection of AI and healthcare is a powerful force that encourages new efficiencies, improved outcomes, and enhanced patient experiences. As we embrace these technologies, it’s critical to ensure we approach their implementation with a focus on ethics and patient data privacy.\n\n💡 **What role do you see AI playing in the future of healthcare? Share your thoughts below!** \n\n#HealthcareInnovation #AI #DigitalTransformation #MedicalTechnology #PatientCare #FutureOfWork"
        })
      .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
    });
  
    it('should delete post', async () => {
      const res = await request(app)
      .delete(`/api/posts/${postId}`)
        .send()
      .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Post deleted successfully');
    });
});