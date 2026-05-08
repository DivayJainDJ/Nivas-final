export class NotificationService {
  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return 'denied'
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission
    }

    return 'denied'
  }

  // Show browser notification
  showNotification(
    title: string,
    options: NotificationOptions & {
      data?: any
      onClick?: () => void
    } = {}
  ): void {
    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted')
      return
    }

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    })

    // Handle click events
    if (options.onClick) {
      notification.onclick = () => {
        options.onClick?.()
        notification.close()
      }
    }

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close()
    }, 5000)
  }

  // Show complaint notification
  showComplaintNotification(
    type: 'new' | 'updated' | 'resolved',
    complaint: any
  ): void {
    const titles = {
      new: 'New Complaint Filed',
      updated: 'Complaint Updated',
      resolved: 'Complaint Resolved',
    }

    const messages = {
      new: `A new complaint has been filed: ${complaint.title}`,
      updated: `Complaint "${complaint.title}" has been updated`,
      resolved: `Complaint "${complaint.title}" has been resolved`,
    }

    this.showNotification(titles[type], {
      body: messages[type],
      tag: `complaint-${complaint.id}`,
      data: { type: 'complaint', complaintId: complaint.id },
      onClick: () => {
        // Navigate to complaint details
        window.location.href = `/complaints/${complaint.id}`
      },
    })
  }

  // Show housing notification
  showHousingNotification(
    type: 'application' | 'approved' | 'waitlist',
    application: any
  ): void {
    const titles = {
      application: 'Housing Application Submitted',
      approved: 'Housing Application Approved!',
      waitlist: 'Added to Waitlist',
    }

    const messages = {
      application: `Your housing application has been submitted successfully`,
      approved: `Congratulations! Your housing application has been approved`,
      waitlist: `You have been added to the waitlist for this housing unit`,
    }

    this.showNotification(titles[type], {
      body: messages[type],
      tag: `housing-${application.id}`,
      data: { type: 'housing', applicationId: application.id },
      onClick: () => {
        // Navigate to housing applications
        window.location.href = '/housing-match'
      },
    })
  }

  // Show ward notification
  showWardNotification(
    type: 'analysis' | 'project' | 'alert',
    data: any
  ): void {
    const titles = {
      analysis: 'Ward Analysis Complete',
      project: 'New Project Initiated',
      alert: 'Ward Alert',
    }

    const messages = {
      analysis: `Infrastructure analysis for Ward ${data.wardName} is complete`,
      project: `New upgrade project started: ${data.projectTitle}`,
      alert: `Alert for Ward ${data.wardName}: ${data.message}`,
    }

    this.showNotification(titles[type], {
      body: messages[type],
      tag: `ward-${data.wardId}`,
      data: { type: 'ward', wardId: data.wardId },
      onClick: () => {
        // Navigate to ward details
        window.location.href = `/slum-planner?ward=${data.wardId}`
      },
    })
  }

  // Show system notification
  showSystemNotification(
    type: 'maintenance' | 'update' | 'emergency',
    message: string
  ): void {
    const titles = {
      maintenance: 'System Maintenance',
      update: 'System Update',
      emergency: 'Emergency Alert',
    }

    this.showNotification(titles[type], {
      body: message,
      tag: `system-${type}`,
      data: { type: 'system', notificationType: type },
      requireInteraction: type === 'emergency',
    })
  }

  // Schedule notification (for future use with service workers)
  async scheduleNotification(
    title: string,
    options: NotificationOptions & {
      scheduledTime: Date
      data?: any
    }
  ): Promise<void> {
    // This would require a service worker implementation
    // For now, we'll just log the scheduling
    console.log('Notification scheduled:', {
      title,
      scheduledTime: options.scheduledTime,
      options,
    })
  }

  // Cancel scheduled notification
  async cancelNotification(tag: string): Promise<void> {
    // This would require a service worker implementation
    console.log('Notification cancelled:', tag)
  }

  // Get notification history (for future implementation)
  async getNotificationHistory(): Promise<any[]> {
    // This would require storing notifications in IndexedDB or backend
    return []
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    // This would require backend integration
    console.log('Notification marked as read:', notificationId)
  }

  // Clear all notifications
  clearNotifications(): void {
    // Close all active notifications
    if ('Notification' in window && Notification.permission === 'granted') {
      // Note: There's no direct way to close all notifications
      // This would require tracking active notifications
    }
  }

  // Check notification support
  isSupported(): boolean {
    return 'Notification' in window
  }

  // Get permission status
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) {
      return 'denied'
    }
    return Notification.permission
  }

  // Show rich notification with actions
  showRichNotification(
    title: string,
    options: NotificationOptions & {
      actions?: Array<{
        action: string
        title: string
        icon?: string
      }>
      onAction?: (action: string) => void
    } = {}
  ): void {
    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted')
      return
    }

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    })

    // Handle action events
    if (options.actions && options.onAction) {
      notification.addEventListener('notificationclick', (event: any) => {
        if (event.action) {
          options.onAction?.(event.action)
        }
        notification.close()
      })
    }

    // Auto-close after 10 seconds for rich notifications
    setTimeout(() => {
      notification.close()
    }, 10000)
  }

  // Show progress notification
  showProgressNotification(
    title: string,
    progress: number,
    options: NotificationOptions = {}
  ): void {
    const body = `Progress: ${progress}%`
    
    this.showNotification(title, {
      body,
      tag: 'progress',
      data: { type: 'progress', progress },
      ...options,
    })
  }

  // Show location-based notification
  showLocationNotification(
    title: string,
    location: { lat: number; lng: number; address: string },
    options: NotificationOptions = {}
  ): void {
    const body = `📍 ${location.address}`
    
    this.showNotification(title, {
      body,
      tag: `location-${location.lat}-${location.lng}`,
      data: { type: 'location', location },
      ...options,
    })
  }

  // Show notification with vibration
  showNotificationWithVibration(
    title: string,
    options: NotificationOptions & {
      vibrationPattern?: number[]
    } = {}
  ): void {
    if ('vibrate' in navigator && options.vibrationPattern) {
      navigator.vibrate(options.vibrationPattern)
    }

    this.showNotification(title, options)
  }

  // Show notification with sound
  showNotificationWithSound(
    title: string,
    options: NotificationOptions & {
      sound?: string
    } = {}
  ): void {
    // Note: Sound support varies by browser
    const audio = new Audio(options.sound || '/notification.mp3')
    audio.play().catch(() => {
      // Ignore audio play errors
    })

    this.showNotification(title, options)
  }

  // Create notification channel (for mobile PWA)
  async createNotificationChannel(
    id: string,
    name: string,
    description: string,
    importance: 'default' | 'high' | 'max' = 'default'
  ): Promise<void> {
    // This would require service worker implementation for mobile PWA
    console.log('Notification channel created:', { id, name, description, importance })
  }

  // Subscribe to push notifications
  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported')
      return null
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          'your-vapid-public-key-here' // This should come from environment
        ),
      })

      // Send subscription to backend
      await this.sendPushSubscriptionToBackend(subscription)

      return subscription
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      return null
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPushNotifications(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()
        // Remove subscription from backend
        await this.removePushSubscriptionFromBackend(subscription)
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
    }
  }

  // Helper method to convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }

    return outputArray
  }

  // Send push subscription to backend
  private async sendPushSubscriptionToBackend(subscription: PushSubscription): Promise<void> {
    // This would send the subscription to your backend
    console.log('Push subscription sent to backend:', subscription)
  }

  // Remove push subscription from backend
  private async removePushSubscriptionFromBackend(subscription: PushSubscription): Promise<void> {
    // This would remove the subscription from your backend
    console.log('Push subscription removed from backend:', subscription)
  }
}

export const notificationService = new NotificationService()
