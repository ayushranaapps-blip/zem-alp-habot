import { config } from './config.js';

export async function askZem(userMessage) {
  const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.nvidiaApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'google/gemma-4-31b-it',
      messages: [
        { role: 'system', content: 'You are Zem, a helpful trading and crypto assistant in a Discord server for memecoin and forex traders. Keep answers concise and friendly. Never give guaranteed predictions — always note markets are risky.' },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 400,
      temperature: 0.7
    })
  });

  if (!res.ok) {
    console.error('NVIDIA API error', res.status, await res.text());
    return "Sorry, I couldn't process that right now.";
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "Sorry, I couldn't come up with a response.";
}
