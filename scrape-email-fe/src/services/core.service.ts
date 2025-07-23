// utils/fetchWithTimeout.ts

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = 6000 // default: 6 seconds
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}
