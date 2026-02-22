import { CronJob } from 'cron'
import { consoleLogUUID } from './jobs/consoleLogUUID.js'
import { consoleLog } from '../logger/logger.js'

const testJob = new CronJob('* * * * * *', consoleLogUUID, null, false, 'Europe/Warsaw')

const runCron = () => {
  consoleLog('Test Cron job scheduled to run every 10 seconds')
  testJob.start()

  // here you can add more jobs
}

export default runCron
