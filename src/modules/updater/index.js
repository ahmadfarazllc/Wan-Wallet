import { app, ipcMain as ipc } from 'electron'
import { autoUpdater } from 'electron-updater'
import Logger from '~/src/utils/Logger'
import Windows from '~/src/modules/windows'

class WalletUpdater {
    constructor() {
        this.updater = autoUpdater
        
        this._logger = Logger.getLogger('updater')
        this.updater.logger = this._logger

        // config updater
        this.updater.fullChangelog = true
        this.updater.autoInstallOnAppQuit = false
        this.updater.autoDownload = false
        this.updater.allowDowngrade = false
    }

    start() {
        if (process.env.NODE_ENV === 'development') {
            return
        }

        let updateModal

        ipc.on('upgrade', (event, actionUni, payload) => {
            let ret, err
            const [action, id] = actionUni.split('#')
        
            switch(action) {
              case 'start': 
        
                let choice = parseInt(payload.choice)
                this._logger.info(`user update choice ${choice}`)

                if (choice === 1) {
                      this.updater
                        .downloadUpdate()
                        .catch(err => this._logger.error(err.message || err.stack))
                } else if (choice === 0) {
                  try {
                    updateModal.close()
                  } catch (e) {
                    this._logger.error(`error inside updater: ${err.stack}`)
                  }
                }
        
                break
            }
        })

        this.updater.on('checking-for-update', () => {
            this._logger.info('checking for updates...')
        })

        this.updater.on('update-available', (info) => {
            updateModal = Windows.createModal('systemUpdate', {
              width: 1024 + 208, 
              height: 720, 
              alwaysOnTop: true
            })    

            const releaseNote = info.releaseNotes[0].note.split('<table>')[0]

            const updateInfo = {
              currVersion: app.getVersion(),
              releaseVersion: info.version,
              releaseDate: new Date(info.releaseDate),
              releaseNotes: releaseNote,
              releasePlatform: process.platform
            }
        
            updateModal.on('ready', () => {
              updateModal.webContents.send('updateInfo', 'versionInfo', JSON.stringify(updateInfo))
            })
        })

        this.updater.on('error', (err) => {
            this._logger.error(`updater error: ${err.stack}`)
        })

        if (process.platform === 'darwin') {
          this.updater.on('download-progress', (progressObj) => {
            let logMsg = 'Download speed: ' + Math.ceil(progressObj.bytesPerSecond / 1024) + ' kbps'
            logMsg = logMsg + ' - Download ' + parseFloat(progressObj.percent).toFixed(2) + '%'
            logMsg = logMsg + ' (' + progressObj.transferred + "/" + progressObj.total + ')'
            this._logger.info(`download progress: ${logMsg}`)
        
            updateModal.webContents.send('updateInfo', 'downloadPercentage', JSON.stringify(progressObj))
          })
        }

        this.updater.on('update-downloaded', (info) => {
          if (process.platform !== 'darwin') updateModal.webContents.send('updateInfo', 'upgradeProgress', 'done')
          setTimeout(() => {
            this.updater.quitAndInstall()
          }, 3 * 1000)
        })

        this.updater.checkForUpdates()
          .catch(err => this._logger.error(err.message || err.stack))
    }
}

export default new WalletUpdater()