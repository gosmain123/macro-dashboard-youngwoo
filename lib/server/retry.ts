type RetryOptions = {
  attempts?: number;
  baseDelayMs?: number;
  factor?: number;
};

function sleep(delayMs: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  { attempts = 2, baseDelayMs = 250, factor = 2 }: RetryOptions = {}
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return {
        attemptsUsed: attempt,
        value: await operation()
      };
    } catch (error) {
      lastError = error;

      if (attempt === attempts) {
        break;
      }

      const delayMs = Math.round(baseDelayMs * factor ** (attempt - 1));
      await sleep(delayMs);
    }
  }

  throw lastError;
}
