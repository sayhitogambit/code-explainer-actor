import { Actor } from 'apify';
import axios from 'axios';

await Actor.main(async () => {
    const input = await Actor.getInput();
    if (!input?.code) throw new Error('Code is required');
    if (!input?.openrouterApiKey) throw new Error('API key is required');

    const { code, language, detailLevel = 'detailed', includeExamples = false, model = 'openai/gpt-4o', openrouterApiKey } = input;

    const prompt = `Explain this ${language} code with ${detailLevel} explanation:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. Summary of what the code does
2. Line-by-line explanation of important parts
3. Key programming concepts used
4. Dependencies/libraries used
${includeExamples ? '5. Example usage scenarios' : ''}

Return JSON:
{
  "summary": "string",
  "explanation": "string",
  "lineByLine": [{"lineNumber": 1, "code": "string", "explanation": "string"}],
  "concepts": [],
  "dependencies": [],
  ${includeExamples ? '"examples": [],' : ''}
  "complexity": "string"
}`;

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model,
        messages: [{ role: 'system', content: 'You are an expert programmer and teacher.' }, { role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
    }, {
        headers: { 'Authorization': `Bearer ${openrouterApiKey}`, 'HTTP-Referer': 'https://apify.com' }
    });

    const result = JSON.parse(response.data.choices[0].message.content);
    await Actor.pushData({ code, language, ...result, cost: 0.01, chargePrice: 0.50, explainedAt: new Date().toISOString() });
    console.log('✓ Code explained successfully!');
});
