import DigitalPersona from '../models/digitalPersona';

// Function to add or update a user's digital persona
export async function addOrUpdateDigitalPersona(userId: string, personaData: string) {
  const existingPersona = await DigitalPersona.findOne({ userId });
  if (existingPersona) {
    existingPersona.personaData = personaData;
    await existingPersona.save();
  } else {
    const newPersona = new DigitalPersona({
      userId,
      personaData,
    });
    await newPersona.save();
  }

  return {
    message: 'Digital persona updated successfully',
    userId,
    personaData,
  };
}

export async function getDigitalPersonaByUserId(userId: string) {
    const digitalPersona = await DigitalPersona.findOne({ userId });
    if (!digitalPersona) {
      throw new Error(`Digital persona not found for user with ID ${userId}`);
    }
    return digitalPersona;
}