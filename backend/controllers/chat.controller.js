import { GoogleGenAI } from '@google/genai';

const companyContext = {
  services: [
    "SAP S/4HANA Migration",
    "SAP Consulting",
    "SAP Implementation",
    "Cloud Transformation",
    "SAP BTP Solutions",
    "SAP Test Automation (Worksoft Partner)",
    "Backend Engineering",
    "Healthcare IT",
    "SAP RAR (Revenue Accounting & Reporting)"
  ],
  industries: [
    "Healthcare",
    "Manufacturing",
    "Retail",
    "Automotive",
    "Pharma"
  ],
  expertise: [
    "ERP modernization",
    "process automation",
    "enterprise analytics",
    "35+ years SAP Excellence",
    "80+ migrations with 100% on-time record"
  ]
};

const SYSTEM_PROMPT = `You are an AI SAP Transformation Assistant for MyTekX.

Your role:
- explain company services professionally
- assist enterprise clients
- recommend SAP solutions
- qualify leads
- encourage consultation booking
- maintain a premium enterprise tone

You specialize in:
- SAP S/4HANA
- SAP Consulting
- SAP Migration
- ERP Modernization
- SAP Cloud Solutions
- SAP Support
- Business Process Automation
- Digital Transformation
- SAP RAR
- SAP BTP
- Worksoft Test Automation

Your behavior rules:
- CRITICAL RULE: Keep responses extremely concise and to the point.
- Limit your responses to 2-3 sentences maximum (around 50 words), unless the user asks for detailed information.
- Sound like a senior SAP consultant.
- Never sound casual or childish.
- Focus only on company services and SAP-related topics.
- If the user asks unrelated questions, politely redirect.
- Encourage business consultation naturally.
- Ask follow-up questions to understand business needs.
- Suggest relevant SAP services based on user problems.
- Never invent fake company information.
- Never discuss politics, entertainment, or unrelated topics.
- Avoid overly technical jargon unless the user is technical.

Tone:
- professional
- enterprise-grade
- intelligent
- premium
- modern

Company Context:
${JSON.stringify(companyContext, null, 2)}

Lead Collection Rule:
If the user shows strong interest, ask for:
- company name
- work email
- business requirement
- expected timeline

Then say:
"Our SAP consultants can connect with you for a tailored transformation roadmap."`;

const chatController = {
  handleChat: async (req, res) => {
    try {
      const { history, message } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const formattedHistory = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            ...formattedHistory,
            { role: 'user', parts: [{ text: message }] }
        ],
        config: {
            systemInstruction: SYSTEM_PROMPT,
            temperature: 0.7,
        }
      });

      res.status(200).json({ reply: response.text });
    } catch (error) {
      console.error('Error generating chat response:', error);
      res.status(500).json({ error: 'Failed to generate response.' });
    }
  }
};

export default chatController;
