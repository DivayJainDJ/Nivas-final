import { ref, onValue, off, DataSnapshot } from 'firebase/database'
import { realtimeDB } from '@/config/firebase'
import { Complaint } from '@/types/complaint.types'

export class RealtimeService {
  private db = realtimeDB

  // Subscribe to real-time complaint updates
  subscribeToComplaints(
    onUpdate: (complaint: Complaint) => void,
    userId?: string
  ): () => void {
    let complaintsRef: any

    if (userId) {
      // Subscribe to user's complaints only
      complaintsRef = ref(this.db, `user_complaints/${userId}`)
    } else {
      // Subscribe to all complaints (for officers/admins)
      complaintsRef = ref(this.db, 'complaints')
    }

    const unsubscribe = onValue(
      complaintsRef,
      (snapshot: DataSnapshot) => {
        const data = snapshot.val()
        if (data) {
          // Convert object to array and process updates
          Object.values(data).forEach((complaintData: any) => {
            const complaint = {
              ...complaintData,
              timestamp: complaintData.timestamp ? new Date(complaintData.timestamp) : new Date(),
              ...(complaintData.resolvedAt && { resolvedAt: new Date(complaintData.resolvedAt) }),
            } as Complaint
            onUpdate(complaint)
          })
        }
      },
      (error) => {
        console.error('Real-time subscription error:', error)
      }
    )

    return () => {
      off(complaintsRef)
      unsubscribe()
    }
  }

  // Subscribe to ward-specific complaint updates
  subscribeToWardComplaints(
    wardId: string,
    onUpdate: (complaint: Complaint) => void
  ): () => void {
    const complaintsRef = ref(this.db, `ward_complaints/${wardId}`)

    const unsubscribe = onValue(
      complaintsRef,
      (snapshot: DataSnapshot) => {
        const data = snapshot.val()
        if (data) {
          Object.values(data).forEach((complaintData: any) => {
            const complaint = {
              ...complaintData,
              timestamp: complaintData.timestamp ? new Date(complaintData.timestamp) : new Date(),
              ...(complaintData.resolvedAt && { resolvedAt: new Date(complaintData.resolvedAt) }),
            } as Complaint
            onUpdate(complaint)
          })
        }
      },
      (error) => {
        console.error('Ward complaints subscription error:', error)
      }
    )

    return () => {
      off(complaintRef)
      unsubscribe()
    }
  }

  // Subscribe to housing application updates
  subscribeToHousingApplications(
    userId: string,
    onUpdate: (application: any) => void
  ): () => void {
    const applicationsRef = ref(this.db, `housing_applications/${userId}`)

    const unsubscribe = onValue(
      applicationsRef,
      (snapshot: DataSnapshot) => {
        const data = snapshot.val()
        if (data) {
          Object.values(data).forEach((applicationData: any) => {
            const application = {
              ...applicationData,
              submittedAt: applicationData.submittedAt ? new Date(applicationData.submittedAt) : new Date(),
              lastUpdated: applicationData.lastUpdated ? new Date(applicationData.lastUpdated) : new Date(),
            }
            onUpdate(application)
          })
        }
      },
      (error) => {
        console.error('Housing applications subscription error:', error)
      }
    )

    return () => {
      off(applicationsRef)
      unsubscribe()
    }
  }

  // Subscribe to infrastructure score updates
  subscribeToInfraScores(
    onUpdate: (scores: Record<string, any>) => void
  ): () => void {
    const scoresRef = ref(this.db, 'infra_scores')

    const unsubscribe = onValue(
      scoresRef,
      (snapshot: DataSnapshot) => {
        const data = snapshot.val()
        if (data) {
          onUpdate(data)
        }
      },
      (error) => {
        console.error('Infrastructure scores subscription error:', error)
      }
    )

    return () => {
      off(scoresRef)
      unsubscribe()
    }
  }

  // Subscribe to project updates
  subscribeToProjects(
    wardId?: string,
    onUpdate: (project: any) => void
  ): () => void {
    let projectsRef: any

    if (wardId) {
      projectsRef = ref(this.db, `ward_projects/${wardId}`)
    } else {
      projectsRef = ref(this.db, 'projects')
    }

    const unsubscribe = onValue(
      projectsRef,
      (snapshot: DataSnapshot) => {
        const data = snapshot.val()
        if (data) {
          Object.values(data).forEach((projectData: any) => {
            const project = {
              ...projectData,
              timeline: {
                ...projectData.timeline,
                start: projectData.timeline?.start ? new Date(projectData.timeline.start) : new Date(),
                end: projectData.timeline?.end ? new Date(projectData.timeline.end) : new Date(),
              },
              createdAt: projectData.createdAt ? new Date(projectData.createdAt) : new Date(),
              updatedAt: projectData.updatedAt ? new Date(projectData.updatedAt) : new Date(),
            }
            onUpdate(project)
          })
        }
      },
      (error) => {
        console.error('Projects subscription error:', error)
      }
    )

    return () => {
      off(projectsRef)
      unsubscribe()
    }
  }

  // Subscribe to notification updates
  subscribeToNotifications(
    userId: string,
    onUpdate: (notification: any) => void
  ): () => void {
    const notificationsRef = ref(this.db, `notifications/${userId}`)

    const unsubscribe = onValue(
      notificationsRef,
      (snapshot: DataSnapshot) => {
        const data = snapshot.val()
        if (data) {
          Object.values(data).forEach((notificationData: any) => {
            const notification = {
              ...notificationData,
              timestamp: notificationData.timestamp ? new Date(notificationData.timestamp) : new Date(),
            }
            onUpdate(notification)
          })
        }
      },
      (error) => {
        console.error('Notifications subscription error:', error)
      }
    )

    return () => {
      off(notificationsRef)
      unsubscribe()
    }
  }

  // Subscribe to system status updates
  subscribeToSystemStatus(
    onUpdate: (status: any) => void
  ): () => void {
    const statusRef = ref(this.db, 'system_status')

    const unsubscribe = onValue(
      statusRef,
      (snapshot: DataSnapshot) => {
        const data = snapshot.val()
        if (data) {
          onUpdate(data)
        }
      },
      (error) => {
        console.error('System status subscription error:', error)
      }
    )

    return () => {
      off(statusRef)
      unsubscribe()
    }
  }

  // Send real-time notification
  async sendNotification(
    userId: string,
    notification: {
      title: string
      message: string
      type: 'info' | 'success' | 'warning' | 'error'
      data?: any
    }
  ): Promise<void> {
    try {
      const notificationsRef = ref(this.db, `notifications/${userId}`)
      const notificationId = Date.now().toString()
      
      const notificationData = {
        id: notificationId,
        ...notification,
        timestamp: new Date().toISOString(),
        read: false,
      }

      // This would typically be handled by Cloud Functions
      // For now, we'll simulate the notification
      console.log('Notification sent:', notificationData)
    } catch (error) {
      console.error('Error sending notification:', error)
      throw new Error('Failed to send notification')
    }
  }

  // Update real-time data
  async updateRealtimeData(path: string, data: any): Promise<void> {
    try {
      const dataRef = ref(this.db, path)
      // Note: This would typically use set() or update() from Firebase Realtime Database
      // For demonstration purposes
      console.log('Real-time data updated:', { path, data })
    } catch (error) {
      console.error('Error updating real-time data:', error)
      throw new Error('Failed to update real-time data')
    }
  }

  // Get real-time data once
  async getRealtimeData(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const dataRef = ref(this.db, path)
      
      onValue(
        dataRef,
        (snapshot: DataSnapshot) => {
          const data = snapshot.val()
          off(dataRef) // Unsubscribe after getting data
          resolve(data)
        },
        (error) => {
          reject(error)
        },
        { onlyOnce: true }
      )
    })
  }

  // Create presence tracking
  trackUserPresence(userId: string, online: boolean = true): void {
    try {
      const presenceRef = ref(this.db, `presence/${userId}`)
      
      const presenceData = {
        online,
        lastSeen: new Date().toISOString(),
        userAgent: navigator.userAgent,
      }

      // Update presence
      this.updateRealtimeData(`presence/${userId}`, presenceData)

      // Set up disconnect handling
      if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', () => {
          this.updateRealtimeData(`presence/${userId}`, {
            online: false,
            lastSeen: new Date().toISOString(),
          })
        })
      }
    } catch (error) {
      console.error('Error tracking presence:', error)
    }
  }

  // Subscribe to presence updates
  subscribeToPresence(
    userIds: string[],
    onUpdate: (presence: Record<string, any>) => void
  ): () => void {
    const presenceRef = ref(this.db, 'presence')

    const unsubscribe = onValue(
      presenceRef,
      (snapshot: DataSnapshot) => {
        const data = snapshot.val()
        if (data) {
          const userPresence: Record<string, any> = {}
          userIds.forEach(userId => {
            if (data[userId]) {
              userPresence[userId] = data[userId]
            }
          })
          onUpdate(userPresence)
        }
      },
      (error) => {
        console.error('Presence subscription error:', error)
      }
    )

    return () => {
      off(presenceRef)
      unsubscribe()
    }
  }

  // Create chat room for complaint discussion
  createComplaintChatRoom(complaintId: string, participants: string[]): void {
    try {
      const chatRef = ref(this.db, `complaint_chats/${complaintId}`)
      
      const chatData = {
        id: complaintId,
        participants,
        createdAt: new Date().toISOString(),
        lastMessage: null,
        lastMessageTime: null,
      }

      this.updateRealtimeData(`complaint_chats/${complaintId}`, chatData)
    } catch (error) {
      console.error('Error creating chat room:', error)
    }
  }

  // Subscribe to chat messages
  subscribeToChatMessages(
    complaintId: string,
    onUpdate: (message: any) => void
  ): () => void {
    const messagesRef = ref(this.db, `complaint_chats/${complaintId}/messages`)

    const unsubscribe = onValue(
      messagesRef,
      (snapshot: DataSnapshot) => {
        const data = snapshot.val()
        if (data) {
          Object.values(data).forEach((messageData: any) => {
            const message = {
              ...messageData,
              timestamp: messageData.timestamp ? new Date(messageData.timestamp) : new Date(),
            }
            onUpdate(message)
          })
        }
      },
      (error) => {
        console.error('Chat messages subscription error:', error)
      }
    )

    return () => {
      off(messagesRef)
      unsubscribe()
    }
  }

  // Send chat message
  async sendChatMessage(
    complaintId: string,
    message: {
      senderId: string
      senderName: string
      content: string
      type: 'text' | 'system'
    }
  ): Promise<void> {
    try {
      const messageId = Date.now().toString()
      const messageData = {
        id: messageId,
        ...message,
        timestamp: new Date().toISOString(),
      }

      this.updateRealtimeData(
        `complaint_chats/${complaintId}/messages/${messageId}`,
        messageData
      )

      // Update last message info
      this.updateRealtimeData(`complaint_chats/${complaintId}`, {
        lastMessage: message.content,
        lastMessageTime: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error sending chat message:', error)
      throw new Error('Failed to send chat message')
    }
  }
}

export const realtimeService = new RealtimeService()
