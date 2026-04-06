import { v4 as uuidv4 } from 'uuid'

export const consoleLogUUID = () => {
  console.log(`test cron task: ${uuidv4()} see utils/cron/runCron.js`)
}
