import { create } from 'zustand'

export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  registeredToken: null,
  setNotifications: (notifications) => set({ notifications, unreadCount: notifications.filter((item) => !item.read).length }),
  addNotification: (notification) =>
    set((state) => {
      const notifications = [{ id: notification.id || `note-${Date.now()}`, read: false, ...notification }, ...state.notifications]
      return { notifications, unreadCount: notifications.filter((item) => !item.read).length }
    }),
  markRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((item) => (item.id === id ? { ...item, read: true } : item))
      return { notifications, unreadCount: notifications.filter((item) => !item.read).length }
    }),
  setRegisteredToken: (registeredToken) => set({ registeredToken }),
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}))

