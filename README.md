# Documentation Monitor

This project monitors documentation for changes and sends updates to a specified Discord channel. It utilizes the OpenAI API to summarize key changes and deprecation warnings from various documentation sources.

## Features

- Fetches documentation updates from specified URLs.
- Summarizes changes using OpenAI's GPT model.
- Sends summarized updates to a Discord channel via webhook.

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies: 
   ```bash
   npm install
   ```

3. Set environment variables for AWS region, OpenAI API key, and Discord webhook URL: 
   ```bash
   AWS_REGION=<your-aws-region>
   OPENAI_API_KEY=<your-openai-api-key>
   DISCORD_WEBHOOK_URL=<your-discord-webhook-url>
   ```

   OR

   Rename example.env.json to .env.json and fill in the values, useful for jest and sam cli.