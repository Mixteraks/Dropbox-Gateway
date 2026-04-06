import { CronJob } from 'cron'
import { consoleLogUUID } from './jobs/consoleLogUUID.js'

const testJob = new CronJob('* * * * * *', consoleLogUUID, null, false, 'Europe/Warsaw')

const runCron = () => {
  testJob.start()

  // here you can add more jobs
}

export default runCron
