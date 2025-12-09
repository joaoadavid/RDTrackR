import { useEffect, useState } from "react";

export function useSystemStatus() {
  const [status, setStatus] = useState<"up" | "down" | "degraded">("up");

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("https://api.rdtrackr.com.br/health");
        if (res.status === 200) setStatus("up");
        else setStatus("degraded");
      } catch {
        setStatus("down");
      }
    }
    check();
    const interval = setInterval(check, 30000); // atualiza a cada 30s
    return () => clearInterval(interval);
  }, []);

  return status;
}
