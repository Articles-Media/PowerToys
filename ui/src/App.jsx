import React, { useEffect, useState } from 'react'
import ExtensionsList from './components/ExtensionsList'
import ContextMenuCommandsInstaller from './components/ContextMenuCommandsInstaller'
import ConfigEditor from './components/ConfigEditor'
import { usePowerToysStore } from './hooks/usePowerToysStore'

export default function App() {
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [configObj, setConfigObj] = useState(null)

    const [contextMenuInstalled, setContextMenuInstalled] = useState(false)

    // const [extensions, setExtensions] = useState([])
    const extensions = usePowerToysStore((state) => state.extensions)
    const setExtensions = usePowerToysStore((state) => state.setExtensions)
    const setContextMenuInstalledExtensionsKey = usePowerToysStore((state) => state.setContextMenuInstalledExtensionsKey)

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

                // setContextMenuInstalledExtensionsKey(

                // )

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

                    <ExtensionsList
                        configObj={configObj}
                        // extensions={extensions}
                        fetchExtensions={fetchExtensions}
                    />

                    <ConfigEditor
                        content={content}
                        setContent={setContent}
                        save={save}
                        saving={saving}
                        message={message}
                    />

                </>
            )}
        </div>
    )
}

