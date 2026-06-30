export default function ConfigEditor({
    content,
    setContent,
    save,
    saving,
    message
}) {

    return (
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
    )

}