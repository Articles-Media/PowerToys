import { useEffect, useMemo } from "react"
import { usePowerToysStore } from "../hooks/usePowerToysStore"

export default function ContextMenuCommandsInstaller({
    contextMenuInstalled,
    setContextMenuInstalled,
    fetchDetectContextMenu
}) {

    useEffect(() => {
        fetchDetectContextMenu(setContextMenuInstalled)
    }, [])

    const extensions = usePowerToysStore((state) => state.extensions)
    const enabledExtensions = usePowerToysStore((state) => state.enabledExtensions)
    const contextMenuInstalledExtensionsString = usePowerToysStore((state) => state.contextMenuInstalledExtensionsString)
    const setContextMenuInstalledExtensionsString = usePowerToysStore((state) => state.setContextMenuInstalledExtensionsString)

    const contextMenuStale = useMemo(() => {

        if (contextMenuInstalledExtensionsString !== JSON.stringify(enabledExtensions)) {
            return true
        } else {
            return false
        }

    }, [contextMenuInstalledExtensionsString, enabledExtensions])

    function installContextMenu() {
        const fetchUrl = `/api/install-context-menu`

        // console.log("fetchUrl", fetchUrl)

        // return

        fetch(
            fetchUrl,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    extensions: extensions.map((ext) => {

                        let newExt = { ...ext }
                        delete newExt.imageDataUrl
                        return newExt

                    }),
                    enabledExtensions
                }),
            }
        )
            .then((r) => r.json())
            .then((data) => {
                console.log(data)
                fetchDetectContextMenu(setContextMenuInstalled)
                setContextMenuInstalledExtensionsString(
                    JSON.stringify(enabledExtensions)
                )
            })
            .catch((e) => {
                alert('Installation failed: ' + e.message)
            })
    }

    function uninstallContextMenu(options) {
        fetch('/api/uninstall-context-menu', { method: 'GET' })
            .then((r) => r.json())
            .then((data) => {
                console.log(data)
                fetchDetectContextMenu(setContextMenuInstalled)
                setContextMenuInstalledExtensionsString(
                    JSON.stringify([])
                )

                if (options?.installAfter) {
                    console.log("installAfter")
                    installContextMenu()
                }
            })
            .catch((e) => {
                alert('Uninstallation failed: ' + e.message)
            })
    }

    return (
        <div
            className="card"
            style={{
                marginBottom: 12,
            }}
        >
            <h2>Context Menu Commands Installer</h2>
            <p>
                This will install the context menu commands for the enabled extensions. You may need to run this as Administrator.
            </p>
            <p
                onClick={() => fetchDetectContextMenu(setContextMenuInstalled)}
            >
                {contextMenuInstalled ?
                    <strong>Detected Installation!</strong>
                    :
                    <strong>Missing Installation!</strong>
                }

            </p>

            {!contextMenuInstalled && <button
                onClick={() => {
                    installContextMenu()
                }}
            >
                Install Context Menu Commands
            </button>}

            {contextMenuInstalled && <button
                onClick={() => {
                    uninstallContextMenu()
                }}
            >
                Uninstall Context Menu Commands
            </button>}

            {contextMenuStale && <button
                onClick={() => {
                    uninstallContextMenu({
                        installAfter: true
                    })
                }}
            >
                Sync Context Menu!
            </button>}

        </div>
    )
}