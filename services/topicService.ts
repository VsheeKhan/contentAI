import Topic from '../models/customTopic';

export async function storeCustomTopics(userId: string, topics: string[]) {
  const existingTopics = await Topic.findOne({ userId });

  if (existingTopics) {
    existingTopics.topics = topics;
    await existingTopics.save();
    return existingTopics;
  } else {
    const newTopic = new Topic({
      userId,
      topics,
    });
    await newTopic.save();
    return newTopic;
  }
}

export async function getCustomTopics(userId: string) {
  const topics = await Topic.findOne({ userId });
  return topics ? topics.topics : [];
}
