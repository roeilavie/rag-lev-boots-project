import type { LoadedSource } from './pdfLoader';

const BASE_URL = 'https://lev-boots-slack-api.jona-581.workers.dev/';
const CHANNELS = ['lab-notes', 'engineering', 'offtopic'];
const MAX_RETRIES = 5;
const BACKOFF_MS = 2000;

type SlackMessage = { id: string; user: string; role: string; ts: string; text: string };
type SlackPage = { items: SlackMessage[] };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchPage = async (channel: string, page: number): Promise<SlackPage> => {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(`${BASE_URL}?channel=${channel}&page=${page}`);

    if (response.ok) return (await response.json()) as SlackPage;

    if (response.status !== 429 || attempt === MAX_RETRIES) {
      throw new Error(
        `Failed to fetch Slack ${channel} page ${page}: ${response.status} ${response.statusText}`
      );
    }

    const retryAfter = Number(response.headers.get('Retry-After'));
    const waitMs = retryAfter > 0 ? retryAfter * 1000 : BACKOFF_MS * 2 ** attempt;
    console.log(`Slack rate limited, retrying ${channel} page ${page} in ${waitMs}ms`);
    await sleep(waitMs);
  }

  throw new Error(`Failed to fetch Slack ${channel} page ${page}`);
};

const loadChannel = async (channel: string): Promise<LoadedSource> => {
  const messages = new Map<string, SlackMessage>();

  for (let page = 1; ; page++) {
    const { items } = await fetchPage(channel, page);
    if (items.length === 0) break;
    items.forEach((message) => messages.set(message.id, message));
  }

  const text = [...messages.values()]
    .sort((a, b) => a.ts.localeCompare(b.ts))
    .map(({ ts, user, role, text }) => `[${ts}] ${user} (${role}): ${text}`)
    .join('\n');

  return { source: 'slack', sourceId: `slack-${channel}`, text };
};

export const loadSlackChannels = async (): Promise<LoadedSource[]> => {
  const sources: LoadedSource[] = [];

  for (const channel of CHANNELS) {
    sources.push(await loadChannel(channel));
  }

  return sources;
};
