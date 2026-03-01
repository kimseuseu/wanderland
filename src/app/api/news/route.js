import { NextResponse } from 'next/server';

const STEAM_APP_ID = 2139460;
const API_URL = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${STEAM_APP_ID}&count=20&maxlength=300`;
const RSS_URL = `https://store.steampowered.com/feeds/news/app/${STEAM_APP_ID}`;

let cache = { data: null, ts: 0 };
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Translation cache persists across requests (keyed by item id)
const translationCache = new Map();

function parseRssImages(xml) {
  const images = {};
  const items = xml.split('<item>').slice(1);
  for (const item of items) {
    const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/);
    const encMatch = item.match(/<enclosure\s+url="([^"]+)"/);
    const title = titleMatch?.[1] || titleMatch?.[2];
    if (title && encMatch) {
      images[title.trim()] = encMatch[1];
    }
  }
  return images;
}

async function translateText(text) {
  if (!text) return '';
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const data = await res.json();
    return data[0]?.map((s) => s[0]).join('') || text;
  } catch {
    return text;
  }
}

async function translateItem(item) {
  if (translationCache.has(item.id)) {
    return translationCache.get(item.id);
  }
  const [titleKo, contentsKo] = await Promise.all([
    translateText(item.title),
    translateText(item.contents),
  ]);
  const result = { titleKo, contentsKo };
  translationCache.set(item.id, result);
  return result;
}

export async function GET() {
  try {
    if (cache.data && Date.now() - cache.ts < CACHE_TTL) {
      return NextResponse.json(cache.data);
    }

    const [apiRes, rssRes] = await Promise.all([
      fetch(API_URL, { next: { revalidate: 300 } }),
      fetch(RSS_URL, { next: { revalidate: 300 } }).catch(() => null),
    ]);

    if (!apiRes.ok) throw new Error('Steam API error');

    const json = await apiRes.json();
    const rssImages = rssRes?.ok
      ? parseRssImages(await rssRes.text())
      : {};

    const rawItems = (json.appnews?.newsitems || []).map((item) => ({
      id: item.gid,
      title: item.title,
      url: item.url,
      author: item.author,
      contents: item.contents,
      image: rssImages[item.title] || null,
      date: item.date,
      feedLabel: item.feedlabel,
      tags: item.tags || [],
    }));

    // Translate all items in parallel
    const translations = await Promise.all(rawItems.map(translateItem));
    const items = rawItems.map((item, i) => ({
      ...item,
      titleKo: translations[i].titleKo,
      contentsKo: translations[i].contentsKo,
    }));

    cache = { data: items, ts: Date.now() };
    return NextResponse.json(items);
  } catch (error) {
    console.error('GET /api/news error:', error);
    if (cache.data) return NextResponse.json(cache.data);
    return NextResponse.json([], { status: 500 });
  }
}
