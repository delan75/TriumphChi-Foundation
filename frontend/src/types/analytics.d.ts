interface Window {
  gtag?: (command: 'event', event: string, parameters: Record<string, unknown>) => void;
}
