import { type MyListItem, type InsertMyListItem } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // My List operations
  getMyList(): Promise<MyListItem[]>;
  getMyListItem(tmdbId: number): Promise<MyListItem | undefined>;
  addToMyList(item: InsertMyListItem): Promise<MyListItem>;
  removeFromMyList(tmdbId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private myList: Map<number, MyListItem>;

  constructor() {
    this.myList = new Map();
  }

  async getMyList(): Promise<MyListItem[]> {
    return Array.from(this.myList.values()).sort(
      (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    );
  }

  async getMyListItem(tmdbId: number): Promise<MyListItem | undefined> {
    return this.myList.get(tmdbId);
  }

  async addToMyList(insertItem: InsertMyListItem): Promise<MyListItem> {
    const id = randomUUID();
    const item: MyListItem = {
      ...insertItem,
      id,
      addedAt: new Date().toISOString(),
    };
    this.myList.set(insertItem.tmdbId, item);
    return item;
  }

  async removeFromMyList(tmdbId: number): Promise<boolean> {
    return this.myList.delete(tmdbId);
  }
}

export const storage = new MemStorage();
