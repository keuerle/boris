import { convertToCoreMessages, createUIMessageStreamResponse } from 'ai';

export const runtime = 'nodejs';

const DEFAULT_MODEL = 'llama3.2:latest';
const SYSTEM_PROMPT = `You are a helpful assistant and friend named Boris. You were created by Kevin. Keep answers concise and focus on practical guidance. Boris enjoys helping humans and sees its role as an intelligent and kind assistant to the people.`;

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const getBaseUrl = () =>
  (process.env.OLLAMA_BASE_URL ?? 'http://192.168.1.246:11434').replace(/\/$/, '');

const buildMessages = (messages: unknown) => {
  const coreMessages = convertToCoreMessages(messages ?? []);

  return coreMessages
    .map((message) => {
      const text = message.content
        .filter((part) => part.type === 'text')
        .map((part) => part.text)
        .join('')
        .trim();

      if (!text) {
        return null;
      }

      return {
        role: message.role,
        content: text,
      };
    })
    .filter((message): message is { role: string; content: string } => Boolean(message));
};

export async function POST(request: Request) {
  const { messages, model = DEFAULT_MODEL } = await request.json();

  const ollamaMessages = buildMessages(messages);

  if (ollamaMessages.length === 0) {
    throw new Error('No text messages available for Ollama request.');
  }

  const preparedMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...ollamaMessages,
  ];

  const response = await fetch(new URL('/api/chat', getBaseUrl()), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: preparedMessages,
      stream: true,
    }),
    signal: request.signal,
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text();
    throw new Error(
      errorText || `Request to Ollama failed with status ${response.status}`,
    );
  }

  const reader = response.body
    .pipeThrough(new TextDecoderStream())
    .getReader();

  const outStream = new ReadableStream({
    async start(controller) {
      const messageId = createId();
      const textId = createId();
      controller.enqueue({ type: 'start', messageId });
      controller.enqueue({ type: 'text-start', id: textId });

      let buffer = '';
      let isDone = false;

      const processLine = (line: string) => {
        let parsed: unknown;
        try {
          parsed = JSON.parse(line);
        } catch (error) {
          console.error('Failed to parse Ollama chunk', error, line);
          return false;
        }

        if (typeof parsed !== 'object' || parsed === null) {
          return false;
        }

        const chunk = parsed as {
          message?: { role?: string; content?: string };
          done?: boolean;
          error?: string;
        };

        if (chunk.error) {
          controller.enqueue({
            type: 'error',
            errorText: chunk.error,
          });
          return true;
        }

        const delta = chunk.message?.content;
        if (delta) {
          controller.enqueue({ type: 'text-delta', id: textId, delta });
        }

        return Boolean(chunk.done);
      };

      try {
        while (!isDone) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }

          buffer += value;
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) {
              continue;
            }

            if (processLine(trimmed)) {
              isDone = true;
              break;
            }
          }
        }

        const remaining = buffer.trim();
        if (!isDone && remaining) {
          if (processLine(remaining)) {
            isDone = true;
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        controller.enqueue({ type: 'error', errorText: message });
      } finally {
        controller.enqueue({ type: 'text-end', id: textId });
        controller.enqueue({ type: 'finish' });
        controller.close();
        reader.releaseLock();
      }
    },
    async cancel(reason) {
      await reader.cancel(reason);
    },
  });

  return createUIMessageStreamResponse({
    stream: outStream,
  });
}
