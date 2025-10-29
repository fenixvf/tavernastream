import { type MyListItem, type InsertMyListItem, type Notification, type InsertNotification } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // My List operations
  getMyList(): Promise<MyListItem[]>;
  getMyListItem(tmdbId: number): Promise<MyListItem | undefined>;
  addToMyList(item: InsertMyListItem): Promise<MyListItem>;
  removeFromMyList(tmdbId: number): Promise<boolean>;
  
  // Notification operations
  getNotifications(): Promise<Notification[]>;
  getUnreadNotifications(): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<boolean>;
  markAllNotificationsAsRead(): Promise<boolean>;
  deleteNotification(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private myList: Map<number, MyListItem>;
  private notifications: Map<string, Notification>;

  constructor() {
    this.myList = new Map();
    this.notifications = new Map();
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

  async getNotifications(): Promise<Notification[]> {
    return Array.from(this.notifications.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    const all = await this.getNotifications();
    return all.filter(n => !n.read);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      ...insertNotification,
      id,
      createdAt: new Date().toISOString(),
      read: false,
      type: insertNotification.type || 'manual',
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) return false;
    notification.read = true;
    this.notifications.set(id, notification);
    return true;
  }

  async markAllNotificationsAsRead(): Promise<boolean> {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    return true;
  }

  async deleteNotification(id: string): Promise<boolean> {
    return this.notifications.delete(id);
  }
}

export const storage = new MemStorage();
