// Centralized AI Key & Request Helper for Egg Thief Master English
export const STORAGE_CUSTOM_API_KEY = 'egg_thief_custom_gemini_api_key';

export function getCustomApiKey(): string {
  try {
    const key = localStorage.getItem(STORAGE_CUSTOM_API_KEY);
    return key ? key.trim() : '';
  } catch {
    return '';
  }
}

export function setCustomApiKey(apiKey: string): void {
  try {
    const trimmed = (apiKey || '').trim();
    if (trimmed) {
      localStorage.setItem(STORAGE_CUSTOM_API_KEY, trimmed);
    } else {
      localStorage.removeItem(STORAGE_CUSTOM_API_KEY);
    }
    // Dispatch event so all components react immediately
    window.dispatchEvent(new CustomEvent('egg_thief_api_key_updated', { detail: { hasKey: !!trimmed } }));
  } catch (e) {
    console.warn('Unable to persist API key to localStorage', e);
  }
}

export function hasCustomApiKey(): boolean {
  return !!getCustomApiKey();
}

export function getAiHeaders(customHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders || {}),
  };

  const key = getCustomApiKey();
  if (key) {
    headers['x-gemini-api-key'] = key;
  }

  return headers;
}

export async function fetchWithAiKey(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const key = getCustomApiKey();
  const options: RequestInit = { ...(init || {}) };

  const existingHeaders = (options.headers as Record<string, string>) || {};
  options.headers = {
    ...existingHeaders,
    ...(key ? { 'x-gemini-api-key': key } : {}),
  };

  return fetch(input, options);
}

export async function validateApiKey(customKey?: string): Promise<{ valid: boolean; message: string; source?: string }> {
  try {
    const keyToTest = (customKey !== undefined ? customKey : getCustomApiKey()).trim();
    const res = await fetch('/api/ai-validate-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(keyToTest ? { 'x-gemini-api-key': keyToTest } : {}),
      },
      body: JSON.stringify({ customApiKey: keyToTest }),
    });

    const data = await res.json();
    return {
      valid: !!data.valid,
      message: data.message || (data.valid ? 'Kết nối thành công!' : 'Kết nối thất bại'),
      source: data.source,
    };
  } catch (err: any) {
    return {
      valid: false,
      message: 'Không thể kết nối đến máy chủ: ' + (err?.message || 'Lỗi mạng'),
    };
  }
}
