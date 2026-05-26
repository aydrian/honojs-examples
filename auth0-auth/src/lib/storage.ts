export type Signature = {
  sub: string;
  name: string;
  picture?: string;
  message: string;
  createdAt: number;
};

const KEY = "signatures";
const MAX_STORED = 100;

export async function listRecent(
  kv: KVNamespace,
  limit = 20,
): Promise<Signature[]> {
  const all = await kv.get<Signature[]>(KEY, "json");
  return (all ?? []).slice(0, limit);
}

export async function addSignature(
  kv: KVNamespace,
  signature: Signature,
): Promise<void> {
  const existing = (await kv.get<Signature[]>(KEY, "json")) ?? [];
  const next = [signature, ...existing].slice(0, MAX_STORED);
  await kv.put(KEY, JSON.stringify(next));
}
