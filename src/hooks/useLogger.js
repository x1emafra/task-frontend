import { useState, useCallback } from "react";

export function useLogger() {
  const [debugLogs, setDebugLogs] = useState([]);
  const [lastError, setLastError] = useState(null);

  const addLog = useCallback((msg, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const entry = `[${timestamp}] ${msg}${data ? ": " + JSON.stringify(data).substring(0, 100) : ""}`;
    console.log(entry);
    setDebugLogs((prev) => [entry, ...prev].slice(0, 20));
  }, []);

  const reportError = useCallback((op, error) => {
    addLog(`❌ ${op} error`, error);
    setLastError({ op, error });
  }, [addLog]);

  const clearError = useCallback(() => setLastError(null), []);
  const clearLogs = useCallback(() => setDebugLogs([]), []);

  return {
    debugLogs,
    lastError,
    addLog,
    reportError,
    clearError,
    clearLogs,
  };
}
