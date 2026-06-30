import { useEffect } from "react"
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
                        })
                        .catch((e) => {
                            alert('Installation failed: ' + e.message)
                        })
                }}
            >
                Install Context Menu Commands
            </button>}

            {contextMenuInstalled && <button
                onClick={() => {
                    fetch('/api/uninstall-context-menu', { method: 'GET' })
                        .then((r) => r.json())
                        .then((data) => {
                            console.log(data)
                            fetchDetectContextMenu(setContextMenuInstalled)
                        })
                        .catch((e) => {
                            alert('Uninstallation failed: ' + e.message)
                        })
                }}
            >
                Uninstall Context Menu Commands
            </button>}

        </div>
    )
}