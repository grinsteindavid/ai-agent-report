// import { Context } from 'aws-lambda';
import * as os from 'os';
import axios from 'axios';
import cheerio from 'cheerio';
import 'openai/shims/node'; // VERY IMPORTANT: Add this line at the top
import { OpenAI } from 'openai';
import Logger from '@simplyhexagonal/logger';
import { setLogger } from './logger';
const { name, devDependencies } = require('../package.json');

const { AWS_REGION, OPENAI_API_KEY, DISCORD_WEBHOOK_URL } = process.env;

console.log({ AWS_REGION, OPENAI_API_KEY, DISCORD_WEBHOOK_URL });

const logger = new Logger({
  catchTransportErrors: true,
  appIdentifiers: {
    region: AWS_REGION || 'UNKNOWN',
    clusterType: 'LAMBDA',
    hostname: os.hostname(),
    app: name,
  },
});
setLogger(logger as any);

// Set up OpenAI API client
const client = new OpenAI({
  apiKey: OPENAI_API_KEY, // Set your OpenAI API Key here
});

export const genericPrompt = (title: string, text: string): OpenAI.Chat.Completions.ChatCompletionMessageParam[] => {
  return [
    {
      role: 'system',
      content: `Check todays date (${new Date().toISOString()}) and focus only on last 6 months of deprecation warnings, issues, current and future changes so dev team can be aware and plan ahead. Warn us about incoming versions sunset dates.`,
    },
    {
      role: 'user',
      content: `Be brief and summarize the key changes on ${title} in the following: \n\n${text.substring(0, 127000)}`,
    },
  ];
};

type DocEntry = {
  url: string;
  prompt: (trafficSourceName: string, text: string) => OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  fetchHtml: boolean;
};

// List of documentation URLs to monitor for changes
// getMgid;
export const docsURLs = {
  'Jest - Issues': {
    url: 'https://github.com/jestjs/jest/issues',
    prompt: genericPrompt,
    fetchHtml: true,
  },
  [`Jest CHANGELOG (Our current version is ${devDependencies.jest})`]: {
    url: `https://github.com/jestjs/jest/blob/main/CHANGELOG.md`,
    prompt: genericPrompt,
    fetchHtml: true,
  },
};

export const generateSummary = async (messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]) => {
  try {
    const chatCompletion = await client.chat.completions.create({
      model: 'gpt-4o', // Updated to use GPT-4o model
      messages,
      // max_tokens: 2000,
      // temperature: 0.7,
    });

    const messageContent = chatCompletion.choices?.[0]?.message.content;
    return messageContent ? messageContent : 'No summary available';
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'Error generating summary';
  }
};

export const sendToDiscord = async (summary: string, title: string, url: string) => {
  const header = `**[${title}][${url}] Updates Summary`;
  const maxBatchSize = 1500;
  const batches = [];

  // Split the summary into batches of maxBatchSize characters
  for (let i = 0; i < summary.length; i += maxBatchSize) {
    batches.push(summary.slice(i, i + maxBatchSize));
  }

  for (let index = 0; index < batches.length; index++) {
    const message = {
      content: `${header} [${index + 1}/${batches.length}] **\n\n ${batches[index]}`,
    };

    for (let attempt = 0; attempt < 6; attempt++) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
        // Send each batch as a message to Discord using the webhook
        const response = await axios.post(DISCORD_WEBHOOK_URL!, message);
        console.log('Message sent to Discord:', response.status);
        break; 
      } catch (error) {
        console.error(`Error sending message to Discord (Attempt ${attempt + 1}):`, error);
        if (attempt < 5) {
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds before retrying
        }
      }
    }
  }
};

export const fetchDocContent = async (url: string) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching content from ${url}:`, error);
    return null;
  }
};

export const processDocumentation = async (docsURLs: Record<string, DocEntry>, toDiscord = true) => {
  const results = [];

  for (const [title, docEntry] of Object.entries(docsURLs)) {
    let summary = '';
    if (docEntry.fetchHtml) {
      const docContent = await fetchDocContent(docEntry.url);
      if (docContent) {
        // If you need to extract specific content, use cheerio to parse HTML
        const content =
          typeof docContent === 'object'
            ? JSON.stringify(docContent)
            : cheerio
                .load(docContent)('body')
                .text()
                .replace(/\s+/g, ' ') // Replace multiple spaces, newlines, or tabs with a single space
                .trim(); // You can refine this selector to get specific sections
        summary = await generateSummary(docEntry.prompt(title, content));
        results.push({ url: docEntry.url, summary });

        // Send the summary to Discord
      }
    } else {
      summary = await generateSummary(docEntry.prompt(title, docEntry.url));
      results.push({ url: docEntry.url, summary });
    }

    toDiscord && (await sendToDiscord(summary as string, title, docEntry.url));
  }

  return results;
};

// Lambda Handler
export const handler = async () => {
  try {
    const summaries = await processDocumentation(docsURLs);

    console.log('Summaries:', summaries);

    return {
      statusCode: 200,
      body: JSON.stringify(summaries),
    };
  } catch (error) {
    console.error('Error in Lambda execution:', error);
    return {
      statusCode: 500,
      body: 'Internal Server Error',
    };
  }
};
