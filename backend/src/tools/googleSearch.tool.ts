import {FunctionDeclarationSchemaType} from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();
import axios from "axios";
import { JSDOM } from "jsdom";

const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
const cx = process.env.SEARCH_ENGINE_ID;


const searchFunctionSchema = {
    name: "searchGoogle",
    description: "Get content from the first recommendation From Google",
    parameters: {
        type: FunctionDeclarationSchemaType.OBJECT,
        properties: {
            value: { query: FunctionDeclarationSchemaType.STRING },
        },
        required: ["query"],
    },
}

async function getFirstPageContent (query: string)  {
    const url = `https://www.googleapis.com/customsearch/v1`;
    const params = {
        key: apiKey,
        cx: cx,
        q: query
    };

    try {
        const response = await axios.get(url, { params });
        const contentResponse = await axios.get(response.data.items[0].link);
        const dom = new JSDOM(contentResponse.data);
        const content = dom.window.document.body.textContent; // Extract text from the body tag
        return content.trim();
    } catch (error) {
        console.error('Error searching Google:', error);
        throw error;
    }
}

export { getFirstPageContent }