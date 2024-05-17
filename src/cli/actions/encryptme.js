const fs = require('fs')
const logger = require('./../../shared/logger')

const main = require('./../../lib/main')

const ENCODING = 'utf8'

async function encryptme () {
  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  try {
    const {
      processedEnvFiles,
      changedFilepaths,
      unchangedFilepaths
    } = main.encryptme(options.envFile)

    for (const processedEnvFile of processedEnvFiles) {
      logger.verbose(`encrypting ${processedEnvFile.envFilepath} (${processedEnvFile.filepath})`)
      if (processedEnvFile.error) {
        if (processedEnvFile.error.code === 'MISSING_ENV_FILE') {
          logger.warn(processedEnvFile.error)
          logger.help(`? add one with [echo "HELLO=World" > ${processedEnvFile.envFilepath}] and re-run [dotenvx encryptme]`)
        } else {
          logger.warn(processedEnvFile.error)
        }
      } else if (processedEnvFile.changed) {
        fs.writeFileSync(processedEnvFile.filepath, processedEnvFile.envSrc, ENCODING)

        logger.verbose(`encrypted ${processedEnvFile.envFilepath} (${processedEnvFile.filepath})`)
      } else {
        logger.verbose(`no changes ${processedEnvFile.envFilepath} (${processedEnvFile.filepath})`)
      }
    }

    if (changedFilepaths.length > 0) {
      logger.success(`✔ encrypted (${changedFilepaths.join(', ')})`)
      // logger.help2(`ℹ add .env.keys to .gitignore: [echo ".env.keys" >> .gitignore]`) // TODO: tell user it is save to now commit this file to code. it's encrypted.
      logger.help2(`ℹ commit ${changedFilepaths.join(',')}: [git commit -am "encrypt ${changedFilepaths.join(',')}"]`)
    } else if (unchangedFilepaths.length > 0) {
      logger.info(`no changes (${unchangedFilepaths})`)
    } else {
      // do nothing - scenario when no .env files found
    }

    for (const processedEnvFile of processedEnvFiles) {
      if (processedEnvFile.privateKeyAdded) {
        logger.success(`✔ key added to .env.keys (${processedEnvFile.privateKeyName})`)
        logger.help2('ℹ add .env.keys to .gitignore: [echo ".env.keys" >> .gitignore]') // TODO: make smart if they have already ignored it
        logger.help2(`ℹ run [${processedEnvFile.privateKeyName}='${processedEnvFile.privateKey}' dotenvx run -- yourcommand] to test decryption locally`)
      }
    }
  } catch (error) {
    logger.error(error.message)
    if (error.help) {
      logger.help(error.help)
    }
    if (error.debug) {
      logger.debug(error.debug)
    }
    if (error.code) {
      logger.debug(`ERROR_CODE: ${error.code}`)
    }
    process.exit(1)
  }
}

module.exports = encryptme
