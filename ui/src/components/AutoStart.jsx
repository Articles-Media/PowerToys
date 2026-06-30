import { useEffect, useMemo, useRef, useState } from "react"
import { usePowerToysStore } from "../hooks/usePowerToysStore"

export default function AutoStart({

}) {

    function toggleStartup() {
        fetch('/api/toggle-startup', { method: 'POST' })
            .then((r) => r.json())
            .then((data) => {

                console.log(data)

                checkStartup()

            })
            .catch((e) => {
                alert('Uninstallation failed: ' + e.message)
            })
    }

    function checkStartup(startup) {

        if (startup && enabledCheck.current) {
            return
        }

        enabledCheck.current = true

        fetch('/api/detect-startup', { method: 'GET' })
            .then((r) => r.json())
            .then((data) => {
                console.log(data)

                if (data.enabled) {
                    setEnabled(true)
                } else {
                    setEnabled(false)
                }

            })
            .catch((e) => {
                alert('Uninstallation failed: ' + e.message)
            })

    }

    const enabledCheck = useRef()
    const [enabled, setEnabled] = useState(false)

    useEffect(() => {
        checkStartup(true)
    }, [])

    return (
        <div
            className="card"
            style={{
                marginBottom: 12,
            }}
        >
            <h2>Auto Start Manager</h2>
            <p>
                Do you want the UI to auto start on system startup?
            </p>

            <p
                onClick={() => {

                }}
            >
                {enabled ?
                    <strong>Detected Installation!</strong>
                    :
                    <strong>Missing Installation!</strong>
                }

            </p>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >

                <div>
                    {!enabled && <button
                        onClick={() => {
                            toggleStartup()
                        }}
                    >
                        Enable
                    </button>}

                    {enabled && <button
                        onClick={() => {
                            toggleStartup()
                        }}
                    >
                        Disable
                    </button>}
                </div>

                <button
                    onClick={() => {
                        checkStartup()
                    }}
                >
                    Check
                </button>

            </div>

        </div>
    )
}