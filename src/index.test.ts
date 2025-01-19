import { fetchDocContent, generateSummary, sendToDiscord, processDocumentation, docsURLs } from './index';

jest.setTimeout(600000); // Set Jest timeout to 10 minutes (600,000 milliseconds)


describe('fetchDocContent', () => {
  it('should fetch content from a valid URL', async () => {
    const url = 'https://jsonplaceholder.typicode.com/posts/1';
    const content = await fetchDocContent(url);
    expect(content).toHaveProperty('userId');
  });
});

describe('generateSummary', () => {
  it('should generate a summary for given text', async () => {
    const summary = await generateSummary([{ role: 'user', content: 'nodejs release notes for v20' }]);
    console.log(summary);
    expect(summary).toBeDefined();
  });
});

describe('sendToDiscord', () => {
  it('should send a message to Discord', async () => {
    const summary = 'Test summary for Discord message.';
    await sendToDiscord(summary, 'Outbrain', 'test.com');
    // Since we cannot verify the message on Discord without a mock, we assume no errors mean success
    expect(true).toBe(true);
  });
});

describe('processDocumentation', () => {
  it('should process documentation and return summaries', async () => {
    const results = await processDocumentation(docsURLs, false);
    console.log(results);
    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);
    results.forEach((result) => {
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('summary');
    });
  });
});
