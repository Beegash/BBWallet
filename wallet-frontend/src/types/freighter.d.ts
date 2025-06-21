declare global {
  interface Window {
    freighterApi?: {
      isConnected(): Promise<boolean>;
      getPublicKey(): Promise<string>;
      connect(options?: { accepted: boolean }): Promise<boolean>;
    };
  }
}

export {}; 