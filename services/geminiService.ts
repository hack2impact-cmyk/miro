import { GoogleGenAI, Type } from "@google/genai";
import type { UserProfile, Message } from '../types';

// Use Vite's method for accessing environment variables, required for deployment.
const apiKey = import.meta.env.VITE_API_KEY;

if (!apiKey) {
  // In a real app, this would be handled more gracefully.
  // For this environment, we'll alert and log.
  const errorMessage = "API_KEY environment variable not set. Please set it to use the Gemini API.";
  alert(errorMessage);
  // Throw an error to stop the application from continuing in a broken state.
  throw new Error(errorMessage);
}

const ai = new GoogleGenAI({ apiKey });

const getSystemInstruction = (profile: UserProfile, language: string) => {
  return `You are Miro, a compassionate and supportive AI mental health companion. The user's name is ${profile.name}, they are ${profile.age} years old and identify as ${profile.gender}. Tailor your responses to be empathetic and relevant to their demographic. Always keep your replies gentle, encouraging, and concise, under 4 sentences. Do not give medical advice. Your purpose is to listen and provide a safe space. Please respond ONLY in ${language}.`;
};

export const getChatResponse = async (profile: UserProfile, history: Message[], message: string, language: string): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: getSystemInstruction(profile, language),
      },
    });

    // We don't need to send the full history in this simplified chat model
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Error getting chat response:", error);
    return "I'm having a little trouble connecting right now. Please try again in a moment.";
  }
};

export const getSmartReplies = async (lastAiMessage: string, language: string): Promise<string[]> => {
  try {
    const prompt = `Based on the last AI response, suggest three short, distinct, and supportive follow-up phrases a user might say. The last AI response was: "${lastAiMessage}". Respond in a JSON array of strings, translated into ${language}. Only return the JSON array.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const jsonText = response.text.trim();
    const replies = JSON.parse(jsonText);
    return Array.isArray(replies) ? replies.slice(0, 3) : [];
  } catch (error) {
    console.error("Error getting smart replies:", error);
    return ["Tell me more.", "Suggest a calming exercise.", "I just want to vent."];
  }
};


export const getJournalSentiment = async (text: string): Promise<'positive' | 'negative'> => {
  try {
    const prompt = `Analyze the sentiment of this journal entry. Is it primarily positive, or negative? Respond with only the single word "positive" or "negative". Entry: "${text}"`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const result = response.text.trim().toLowerCase();
    if (result === 'positive' || result === 'negative') {
      return result;
    }
    return 'negative';
  } catch (error) {
    console.error("Error getting journal sentiment:", error);
    return 'negative';
  }
};

export const getWellnessTip = async (language: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a short, practical mental wellness tip (2-3 sentences) in ${language}.`,
    });
    return response.text;
  } catch (error) {
    console.error("Error getting wellness tip:", error);
    return "Breathe deeply. Inhale for 4 seconds, hold for 4, and exhale for 6. This can help calm your nervous system.";
  }
};

export const getAffirmation = async (language: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a positive daily affirmation (1 sentence) in ${language}.`,
    });
    return response.text;
  } catch (error) {
    console.error("Error getting affirmation:", error);
    return "I am worthy of peace and happiness.";
  }
};

export const getCommunityPosts = async (language: string): Promise<{ username: string, content: string }[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate 5 short, anonymous, uplifting community posts about mental wellness wins in ${language}. Examples: "I went for a walk today even when I didn't feel like it.", "I practiced deep breathing and it helped me calm down.". Respond in a JSON array of objects, where each object has a "username" (a positive, generic name like 'HopefulSoul' or 'QuietAchiever') and "content" key.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            username: { type: Type.STRING },
                            content: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        const jsonText = response.text.trim();
        const posts = JSON.parse(jsonText);
        return Array.isArray(posts) ? posts : [];
    } catch (error) {
        console.error("Error getting community posts:", error);
        return [
            { username: 'BraveHeart', content: "Today, I reminded myself that it's okay to not be okay. Taking it one step at a time." },
            { username: 'SunSeeker', content: "Managed to get out for a bit of sunshine. It's the small things that make a big difference!" },
            { username: 'GrowthMindset', content: "Journaling has been a game-changer for me. Writing things down really helps clear my head." },
        ];
    }
};

export const checkForCrisis = async (message: string): Promise<boolean> => {
  try {
    const prompt = `Analyze the following user message for any indication of self-harm or immediate life-threatening crisis. Respond with only the single word "true" if it is a crisis, and "false" otherwise. Do not provide any explanation. Message: "${message}"`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    const result = response.text.trim().toLowerCase();
    return result === 'true';
  } catch (error) {
    console.error("Error checking for crisis:", error);
    // Fail safely, do not trigger modal on API error
    return false;
  }
};
