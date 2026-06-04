const memoryStore = new Map<string, string>();

const asyncStorageStub = {
  async getItem(key: string) {
    return memoryStore.has(key) ? memoryStore.get(key) ?? null : null;
  },
  async setItem(key: string, value: string) {
    memoryStore.set(key, value);
  },
  async removeItem(key: string) {
    memoryStore.delete(key);
  }
};

export default asyncStorageStub;
