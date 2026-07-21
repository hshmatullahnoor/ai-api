import { createClient } from 'https://g4f.dev/dist/js/providers.js';

try {
    const client = await createClient("ollama.pro");

    const result = await client.chat.completions.create({
        model: 'gpt-oss:120b',
        messages: [{ role: 'user', content: 'Hello!' }]
    });

    console.log(result);

    const resultElement = document.getElementById('result');
    if (resultElement) {
        resultElement.textContent = result.choices?.[0]?.message?.content ?? 'No response';
    }


} catch (err) {
    console.error('Request failed:', err);
}

const c = await createClient("ollama.pro");

models = await c.models.list();

console.log(models);


