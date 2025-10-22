

export type SchedulerEvent = {
  time: number,
  execFunc: SchedulerExecFunc,
}


export type SchedulerExecFunc = () => void




export class Scheduler {


  interval: number;
  queue: SchedulerEvent[] = [];
  currentEvent: SchedulerEvent = null;


  constructor(intervalTime = 50) {
    this.interval = window.setInterval(() => {
      this.#tick()
    }, intervalTime)
    this.#tick()
  }

  
  addToQueue(execFunc: SchedulerExecFunc, delay: number) {
    let time = 0
    if (this.queue.length === 0) {
      time = performance.now() + delay
    } else {
      time = this.queue[this.queue.length - 1].time + delay
    }
    performance.now()
    this.queue.push({
      execFunc,
      time,
    })
  }


  flushQueue() {
    this.queue = []
  }


  #tick() {
    if (this.queue.length === 0 && !this.currentEvent) {
      return
    }

    if (!this.currentEvent) {
      this.currentEvent = this.queue.shift()
    }

    if (performance.now() >= this.currentEvent.time) {
      this.#execEvent(this.currentEvent)
      this.currentEvent = null
    }
    
  }


  #execEvent(ev: SchedulerEvent) {
    ev.execFunc()
  }


}

