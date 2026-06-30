import { usePowerToysStore } from "../hooks/usePowerToysStore"

export default function ExtensionsList({
    configObj,
    // extensions,
    fetchExtensions
}) {

    const extensions = usePowerToysStore((state) => state.extensions)
    const setExtensions = usePowerToysStore((state) => state.setExtensions)
    const enabledExtensions = usePowerToysStore((state) => state.enabledExtensions)

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
                        <div>
                            <button
                                onClick={() => {
                                    
                                }}
                            >
                                Add Custom
                            </button>
                            <button
                                onClick={() =>
                                    fetchExtensions()
                                }
                            >
                                Refresh
                            </button>
                        </div>
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

                            const extensionId = `${extension.config.author}:${extension.config.name}`
                            const enabled = enabledExtensions.find((ext) => ext.name === extensionId)?.enabled ?? false

                            return (
                                <div
                                    key={extensionId}
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
                                                alignItems: 'flex-start',
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
                                                <strong style={{
                                                    display: 'inline-block',
                                                    minWidth: 150,
                                                    // marginRight: 8,
                                                    marginBottom: 2,
                                                }}>
                                                    {extension?.config?.name}
                                                </strong>
                                                <div
                                                    style={{
                                                        fontSize: 10.5,
                                                    }}
                                                >
                                                    <div style={{ color: '#555' }}>
                                                        {extension?.config?.author} - {extension?.config?.version}
                                                    </div>
                                                    <div style={{ color: '#555' }}>
                                                        Extension Version - {extension?.config?.extension_version}
                                                    </div>
                                                    <div style={{ color: '#555' }}>
                                                        Registered Commands - {extension?.config?.commands?.length || 0}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ width: 200 }}>
                                                <div style={{ fontSize: 12, color: '#555' }}>
                                                    {extension?.config?.description}
                                                </div>
                                            </div>

                                        </div>

                                        <div>
                                            <button
                                                onClick={() =>
                                                    usePowerToysStore.getState().toggleExtensionEnabled(extension, extensionId)
                                                }
                                                style={{
                                                    minWidth: 80,
                                                    display: 'inline-block'
                                                }}
                                            >
                                                {enabled ? 'Disable' : 'Enable'}
                                            </button>
                                            <span
                                                style={{
                                                    marginLeft: 8,
                                                    minWidth: 70,
                                                    display: 'inline-block'
                                                }}
                                            >
                                                {enabled ? 'Enabled' : 'Disabled'}
                                            </span>
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