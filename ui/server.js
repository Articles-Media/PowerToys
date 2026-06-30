const express = require('express')
const fs = require('fs').promises
const path = require('path')
const cors = require('cors')
const { execSync } = require('child_process')

const app = express()
app.use(cors())
app.use(express.json())


const rootPath = path.join(__dirname, '..')
const configPath = path.join(__dirname, '..', 'config.js')
const contextMenuPath = path.join(__dirname, '..', 'context-menu')

// Serve extension static files (icons etc.) when requested via URL.
// For extensions outside this folder, icon data URLs are returned directly in the API response.
app.use('/extensions', express.static(path.join(rootPath, 'extensions')))

const mimeTypes = {
    '.ico': 'image/x-icon',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp'
}

function fileToDataUrl(filePath, buffer) {
    const ext = path.extname(filePath).toLowerCase()
    const mime = mimeTypes[ext] || 'application/octet-stream'
    return `data:${mime};base64,${buffer.toString('base64')}`
}

app.get('/api/install-context-menu', async (req, res) => {

    // console.log(
    //     "install-context-menu",
    //     `${contextMenuPath}`
    // )

    execSync(`node install.js`, {
        cwd: contextMenuPath,
        stdio: 'inherit'
    });

    res.json({
        message: 'Context menu installed successfully.',
        path: contextMenuPath
    })

})

app.get('/api/uninstall-context-menu', async (req, res) => {

    // console.log(
    //     "install-context-menu",
    //     `${contextMenuPath}`
    // )

    execSync(`node uninstall.js`, {
        cwd: contextMenuPath,
        stdio: 'inherit'
    });

    res.json({
        message: 'Context menu uninstalled successfully.',
        path: contextMenuPath
    })

})

app.get('/api/extensions', async (req, res) => {
    try {
        const extensionsDir = path.join(rootPath, 'extensions')
        const entries = await fs.readdir(extensionsDir, { withFileTypes: true })
        const result = []

        console.log('Found entries:', entries)

        for (const ent of entries) {
            if (!ent.isDirectory()) continue
            const extDir = path.join(extensionsDir, ent.name)
            const cfgPath = path.join(extDir, 'config.json')
            try {
                await fs.access(cfgPath)
            } catch (e) {
                continue
            }
            let cfg = null
            try {
                const raw = await fs.readFile(cfgPath, 'utf8')
                cfg = JSON.parse(raw)
            } catch (e) {
                cfg = null
            }

            const iconPath = path.join(extDir, 'icon.ico')
            let image = null
            let imageUrl = null
            let imageDataUrl = null
            try {
                await fs.access(iconPath)
                image = iconPath
                imageUrl = `/extensions/${encodeURIComponent(ent.name)}/icon.ico`
                const buffer = await fs.readFile(iconPath)
                imageDataUrl = fileToDataUrl(iconPath, buffer)
            } catch (e) {
                image = null
                imageUrl = null
                imageDataUrl = null
            }

            result.push({ name: ent.name, config: cfg, image, imageUrl, imageDataUrl })
        }

        res.json({ extensions: result })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }

})

app.get('/api/detect-context-menu', async (req, res) => {
    try {
        // Use PowerShell to search registry for any key that ends with \"\\shell\\ArticlesMedia\"
        const ps = 'powershell -NoProfile -Command "Get-ChildItem Registry::HKCU\\Software\\Classes -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.Name -match \'\\\\shell\\\\ArticlesMedia$\' } | Select-Object -First 1 | ForEach-Object { $_.Name }"'
        const out = execSync(ps, { encoding: 'utf8' })
        const installed = !!out && out.trim().length > 0
        res.json({ installed })
    } catch (err) {
        // If command fails or nothing found, return installed: false
        res.json({ installed: false })
    }
})

app.get('/api/config', async (req, res) => {
    try {
        const content = await fs.readFile(configPath, 'utf8')
        res.json({
            content,
            obj: configPath ? require(configPath).default : null
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

app.post('/api/config', async (req, res) => {
    try {
        const { content } = req.body
        if (typeof content !== 'string') return res.status(400).json({ error: 'Invalid content' })
        await fs.writeFile(configPath, content, 'utf8')
        res.json({ ok: true })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

if (process.env.NODE_ENV === 'production') {
    const dist = path.join(__dirname, 'dist')
    app.use(express.static(dist))
    app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')))
}

const port = process.env.PORT || 3062
app.listen(port, () => console.log(`API server running on http://localhost:${port}`))
