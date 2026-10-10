export async function fetcher(url) {
  const response = await fetch(url);

  if (!response.ok) {
    let message = `Failed to fetch data (HTTP ${response.status})`;
    try {
      const data = await response.json();
      if (data && typeof data.error === 'string') {
        message = data.error;
      } else if (data && typeof data.message === 'string') {
        message = data.message;
      }
    } catch {
      // Ignore JSON parse error on non-OK responses
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return response.json();
}