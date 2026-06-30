import React, { useEffect, useState } from 'react'

export default function App() {
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [configObj, setConfigObj] = useState(null)

    const [contextMenuInstalled, setContextMenuInstalled] = useState(false)

    const [extensions, setExtensions] = useState([])

    useEffect(() => {

        fetch('/api/config')
            .then((r) => r.json())
            .then((data) => {
                setContent(data.content || '')
                setConfigObj(data.obj || null)
                setLoading(false)
            })
            .catch((e) => {
                setMessage('Failed to load: ' + e.message)
                setLoading(false)
            })

        fetchExtensions()

    }, [])

    async function fetchExtensions() {
        fetch('/api/extensions')
            .then((r) => r.json())
            .then((d) => {
                setExtensions(d.extensions)
            })
    }

    async function fetchDetectContextMenu(setInstalled) {
        fetch('/api/detect-context-menu')
            .then((r) => r.json())
            .then((data) => {
                console.log('Context menu detection result:', data)
                setInstalled(data.installed)
            })
            .catch((e) => {
                console.error('Context menu detection failed:', e)
            })
    }

    async function save() {
        setSaving(true)
        setMessage('')
        try {
            const res = await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            })
            const data = await res.json()
            if (res.ok) setMessage('Saved.')
            else setMessage('Error: ' + (data.error || res.statusText))
        } catch (e) {
            setMessage('Save failed: ' + e.message)
        }
        setSaving(false)
    }

    async function toggleKey(key, value) {
        setMessage('')
        try {
            const res = await fetch('/api/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, enabled: value })
            })
            const data = await res.json()
            if (res.ok) {
                // update local state
                setConfigObj((prev) => {
                    if (!prev) return prev
                    return { ...prev, [key]: { ...prev[key], enabled: value } }
                })
                // reload content
                const r = await fetch('/api/config')
                const d = await r.json()
                setContent(d.content || '')
                setMessage('Updated ' + key)
            } else {
                setMessage('Error: ' + (data.error || res.statusText))
            }
        } catch (e) {
            setMessage('Toggle failed: ' + e.message)
        }
    }

    return (
        <div className="app">
            <h1>Articles Media PowerToys UI</h1>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>

                    <ContextMenuCommandsInstaller
                        contextMenuInstalled={contextMenuInstalled}
                        setContextMenuInstalled={setContextMenuInstalled}
                        fetchDetectContextMenu={fetchDetectContextMenu}
                    />

                    <Extensions
                        configObj={configObj}
                        extensions={extensions}
                        fetchExtensions={fetchExtensions}
                    />

                    <div className="card">

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100%',
                                marginBottom: 8
                            }}
                        >
                            <h2
                                style={{ margin: 0 }}
                            >
                                Config Editor
                            </h2>
                            <div className="controls">
                                <button onClick={save} disabled={saving}>
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={() =>
                                        fetch('/api/config')
                                            .then((r) => r.json())
                                            .then((d) => setContent(d.content))
                                    }
                                >
                                    Reload
                                </button>
                                <span className="msg">{message}</span>
                            </div>
                        </div>

                        <textarea value={content} onChange={(e) => setContent(e.target.value)} />

                    </div>

                </>
            )}
        </div>
    )
}

function Extensions({
    configObj,
    extensions,
    fetchExtensions
}) {
    return (
        <>
            {configObj && (
                <div
                    className="card"
                    style={{
                        marginBottom: 12,
                        // display: 'flex',
                        // flexWrap: 'wrap',
                        // gap: 8
                    }}
                >

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            marginBottom: 8
                        }}
                    >
                        <h2 style={{ marginBottom: 0 }}>Extensions</h2>
                        <button
                            onClick={() =>
                                fetchExtensions()
                            }
                        >
                            Refresh
                        </button>
                    </div>

                    <div
                        className=""
                        style={{
                            border: '1px solid #ccc',
                            padding: 8,
                        }}
                    >

                        {/* {Object.keys(configObj).map((k) => {
                            const v = configObj[k]
                            if (!v || typeof v.enabled !== 'boolean') return null
                            return (
                                <label
                                    key={k}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        // gap: 4,
                                        // marginRight: 5,
                                        // marginBottom: 5,
                                        // width: '33%',
                                        border: '1px solid #ccc',
                                        padding: '4px 8px',
                                        borderRadius: 4,
                                        backgroundColor: v.enabled ? '#e0ffe0' : '#ffe0e0'
                                    }}
                                >
                                    <strong style={{ minWidth: 120 }}>{k}</strong>
                                    <button onClick={() => toggleKey(k, !v.enabled)}>
                                        {v.enabled ? 'Disable' : 'Enable'}
                                    </button>
                                    <span style={{ marginLeft: 8 }}>{v.enabled ? 'Enabled' : 'Disabled'}</span>
                                </label>
                            )
                        })} */}

                        {extensions.map((extension) => {

                            // const v = configObj[extension.name]
                            // if (!v || typeof v.enabled !== 'boolean') return null

                            const enabled = false

                            return (
                                <div
                                    key={extension.name}
                                    style={{
                                        border: '1px solid #ccc',
                                        padding: '4px 8px',
                                        borderRadius: 4,
                                        backgroundColor: enabled ? '#e0ffe0' : '#ffe0e0'
                                    }}
                                >

                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                        >

                                            {(extension.imageDataUrl || extension.imageUrl || extension.image) &&
                                                <div
                                                    style={{
                                                        marginRight: 8,
                                                        borderRadius: 4,
                                                        border: '1px solid #ccc',
                                                        // padding: 10,
                                                        width: 32,
                                                        height: 32,
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <img
                                                        src={extension.imageDataUrl || extension.imageUrl || extension.image}
                                                        alt="extension icon"
                                                        style={{
                                                            objectFit: 'contain',
                                                        }}
                                                    />
                                                </div>
                                            }

                                            <div>
                                                <strong style={{ minWidth: 120 }}>
                                                    {extension?.config?.name}
                                                </strong>
                                                <div style={{ fontSize: 12, color: '#555' }}>
                                                    {extension?.config?.author} - {extension?.config?.version}
                                                </div>
                                            </div>

                                        </div>

                                        <div>
                                            <button onClick={() => toggleKey(extension.name, !enabled)}>
                                                {enabled ? 'Disable' : 'Enable'}
                                            </button>
                                            <span style={{ marginLeft: 8 }}>{enabled ? 'Enabled' : 'Disabled'}</span>
                                        </div>
                                    </div>

                                </div>
                            )
                        })}

                    </div>
                </div>
            )}
        </>
    )
}

function ContextMenuCommandsInstaller({
    contextMenuInstalled,
    setContextMenuInstalled,
    fetchDetectContextMenu
}) {

    useEffect(() => {
        fetchDetectContextMenu(setContextMenuInstalled)
    }, [])

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
                    fetch('/api/install-context-menu', { method: 'GET' })
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