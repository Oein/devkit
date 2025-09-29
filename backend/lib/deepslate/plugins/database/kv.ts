import type Deepslate from "#/deepslate";
import type { DeepslatePlugin } from "#/deepslate/types";
import { prisma } from "#";

export default class DeepslateKVDB implements DeepslatePlugin {
  name = "KVDB";
  version = "1.0.0";
  author = "<Oein me@oein.kr>";
  description = "Key-Value database plugin using Prisma ORM.";

  async init(deepslate: Deepslate) {}
  async get(key: string): Promise<string | null> {
    const record = await prisma.kV.findUnique({ where: { key } });
    return record ? record.value : null;
  }

  async set(key: string, value: string): Promise<void> {
    await prisma.kV.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async delete(key: string): Promise<void> {
    await prisma.kV.delete({ where: { key } });
  }

  async has(key: string): Promise<boolean> {
    const record = await prisma.kV.findUnique({ where: { key } });
    return !!record;
  }

  async clear(): Promise<void> {
    await prisma.kV.deleteMany({});
  }
}
