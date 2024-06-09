import {GenerateContentResult, GoogleGenerativeAI, FunctionDeclarationSchemaType} from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const gemini_api_key = process.env.API_KEY;
const googleAI = new GoogleGenerativeAI(gemini_api_key);

const functions = {
    convertCtoF: ({ value }) => {
        const num = typeof value === "string" ? parseFloat(value) : value;
        if (!Number.isFinite(num)) {
            throw new Error("Value should finite number");
        }
        return (num * 9) / 5 + 32;
    },
};
const tools = [
    {
        functionDeclarations: [
            {
                name: "convertCtoF",
                description: "Convert temperature from Celsius to Fahrenheit",
                parameters: {
                    type: FunctionDeclarationSchemaType.OBJECT,
                    properties: {
                        value: { type: FunctionDeclarationSchemaType.NUMBER },
                    },
                    required: ["value"],
                },
            },
        ],
    },
];



class GeminiService {
    static geminiModel = googleAI.getGenerativeModel(
        {model: "gemini-pro", tools: tools},
        { apiVersion: "v1beta" },);

    static queryModel = async (
        prompt: string
    ) => {
        try {
            const prompt = {
                role: "user",
                parts: [
                    {
                        text: "Convert 15 Celsius to Fahrenheit",
                    },
                ],
            };

            const result = await this.geminiModel.generateContent({
                contents: [prompt],
            });
            const response = result.response;
            console.dir(response, { depth: null });

            if (response.candidates.length === 0) {
                throw new Error("No candidates");
            }

            const content = result.response.candidates[0].content;
            if (content.parts.length === 0) {
                throw new Error("No parts");
            }
            const fc = content.parts[0].functionCall;
            const text = content.parts.map(({ text }) => text).join("");
            if (fc) {
                const {name, args} = fc;
                const fn = functions[name];
                if (!fn) {
                    throw new Error(`Unknown function "${name}"`);
                }
                const fr = {
                    role: "function",
                    parts: [
                        {
                            functionResponse: {
                                name,
                                response: {
                                    name,
                                    content: functions[name](args),
                                },
                            },
                        },
                    ],
                };
                const request2 = {
                    contents: [prompt, content, fr],
                };
                const response2 = await this.geminiModel.generateContent(request2);
                const result2 = response2.response;
                console.log(result2.text());
            }
        } catch (error) {
            console.log('response error', error);
        }
    };
}


export default GeminiService;