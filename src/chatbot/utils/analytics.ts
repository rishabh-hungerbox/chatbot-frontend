/* eslint-disable @typescript-eslint/no-explicit-any */
export function track(eventName: string, props?: any): void {
  try {
    const w: any = window as any;
    if (w?.mixpanel?.track) {
      const payload = props && typeof props === 'object' ? props : {};
      if (!payload.timestamp) payload.timestamp = new Date().toISOString();
      w.mixpanel.track(eventName, payload);
    }
  } catch {
    // ignore
  }
}

