import * as vscode from 'vscode'

import {Extension} from '../main'

export class Logger {
    extension: Extension
    logPanel: vscode.OutputChannel
    compilerLogPanel: vscode.OutputChannel
    status: vscode.StatusBarItem
    status2: vscode.StatusBarItem

    constructor(extension: Extension) {
        this.extension = extension
        this.logPanel = vscode.window.createOutputChannel('LaTeX Workshop')
        this.compilerLogPanel = vscode.window.createOutputChannel('LaTeX Compiler')
        this.compilerLogPanel.append('Ready')
        this.addLogMessage('Initializing LaTeX Workshop.')
        this.status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, -10000)
        this.status2 = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, -10001)
        this.status.command = 'latex-workshop.actions'
        this.status2.command = 'latex-workshop.actions'
        this.status.show()
        this.status2.show()
        this.displayStatus('check', 'statusBar.foreground')
    }

    addLogMessage(message: string) {
        const configuration = vscode.workspace.getConfiguration('latex-workshop')
        if (configuration.get('message.log.show')) {
            this.logPanel.append(`[${new Date().toLocaleTimeString('en-US', {hour12: false})}] ${message}\n`)
        }
    }

    addCompilerMessage(message: string) {
        this.compilerLogPanel.append(message)
    }

    clearCompilerMessage() {
        this.compilerLogPanel.clear()
    }

    displayProgress(
        current: number,
        knownEndpoint?: number,
        tooltip: string = ''
      ) {
        if (current === 0) {
          if (knownEndpoint === 0) {
            this.status2.text = ''
            this.status2.tooltip = ''
            return
          } else {
            this.status2.text = 'Preamble'
            this.status2.tooltip = ''
            return
          }
        }

        const generateProgressBar = (proportion: number, length: number) => {
          const wholeCharacters = Math.trunc(length * proportion)
          const extraEights = Math.round(
            (length * proportion - wholeCharacters) * 8
          )
          const eights = {
            0: ' ',
            1: '▏',
            2: '▎',
            3: '▍',
            4: '▌',
            5: '▋',
            6: '▊',
            7: '▉',
            8: '█'
          }
          return (
            '█'.repeat(wholeCharacters) +
            (eights[extraEights] !== ' ' ? eights[extraEights] : '') +
            '░'.repeat(Math.max(0, length - wholeCharacters - 1))
          )
        }
        const padRight = (str: string, desiredMinLength: number) => {
          if (str.length < desiredMinLength) {
            str = str + '   '.repeat(desiredMinLength - str.length)
          }
          return str
        }

        const currentAsString = current.toString()
        const endpointAsString = knownEndpoint ? knownEndpoint.toString() : '?'
        const barAsString = knownEndpoint
          ? generateProgressBar(current / knownEndpoint, 15)
          : ''

        this.status2.text = `Page ${padRight(
          currentAsString + '/' + endpointAsString,
          5
        )} ${barAsString}`
        this.status2.tooltip = tooltip
      }

    displayStatus(icon: string, color: string, message: string | undefined = undefined, severity: string = 'info', build: string = '') {
        this.status.text = `$(${icon})${build}`
        this.status.tooltip = message
        this.status.color = new vscode.ThemeColor(color)
        if (message === undefined) {
            return
        }
        const configuration = vscode.workspace.getConfiguration('latex-workshop')
        switch (severity) {
            case 'info':
                if (configuration.get('message.information.show')) {
                    vscode.window.showInformationMessage(message)
                }
                break
            case 'warning':
                if (configuration.get('message.warning.show')) {
                    vscode.window.showWarningMessage(message)
                }
                break
            case 'error':
            default:
                if (configuration.get('message.error.show')) {
                    vscode.window.showErrorMessage(message)
                }
                break
        }
    }

    showErrorMessage(message: string, ...args) : Thenable<any> | undefined {
        const configuration = vscode.workspace.getConfiguration('latex-workshop')
        if (configuration.get('message.error.show')) {
            return vscode.window.showErrorMessage(message, ...args)
        } else {
            return undefined
        }
    }

    showLog() {
        this.logPanel.show()
    }

    showCompilerLog() {
        this.compilerLogPanel.show()
    }
}
