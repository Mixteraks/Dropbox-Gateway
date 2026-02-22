import { v4 as uuidv4 } from 'uuid'
import { consoleLog } from '../../logger/logger.js'

export const consoleLogUUID = () => {
  consoleLog(`test cron task: ${uuidv4()} see utils/cron/runCron.js`)
}
