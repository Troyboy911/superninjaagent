class TaskManager {
  constructor() {
    this.tasks = new Map()
  }

  createTask(id, taskData) {
    this.tasks.set(id, taskData)
  }

  getTask(id) {
    return this.tasks.get(id)
  }

  updateTask(id, updates) {
    const task = this.tasks.get(id)
    if (task) {
      this.tasks.set(id, { ...task, ...updates })
    }
  }

  listTasks() {
    return Array.from(this.tasks.values())
  }

  cleanup() {
    // Clean up old completed tasks (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    for (const [id, task] of this.tasks.entries()) {
      if (task.completedAt && task.completedAt < oneHourAgo) {
        this.tasks.delete(id)
      }
    }
  }
}

const taskManager = new TaskManager()

// Clean up every 10 minutes
setInterval(() => {
  taskManager.cleanup()
}, 10 * 60 * 1000)

module.exports = taskManager