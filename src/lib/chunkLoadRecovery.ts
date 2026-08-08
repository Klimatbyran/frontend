const CHUNK_RELOAD_KEY = "klimatkollen:chunk-reload";

const CHUNK_LOAD_ERROR =
  /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk [\d]+ failed/i;

export function isChunkLoadError(message: string | undefined): boolean {
  if (!message) return false;
  return CHUNK_LOAD_ERROR.test(message);
}

export function reloadForStaleChunks(): void {
  if (sessionStorage.getItem(CHUNK_RELOAD_KEY) === "1") {
    return;
  }

  sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
  window.location.reload();
}

/** Recover from stale Vite chunks after deploys or mixed replica versions. */
export function registerChunkLoadRecovery(): void {
  window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();
    reloadForStaleChunks();
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const message =
      reason instanceof Error
        ? reason.message
        : typeof reason === "string"
          ? reason
          : undefined;

    if (!isChunkLoadError(message)) {
      return;
    }

    event.preventDefault();
    reloadForStaleChunks();
  });
}
