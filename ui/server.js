const express = require('express')
const fs = require('fs').promises
const fsSync = require('fs')
const path = require('path')
const cors = require('cors')
const os = require('os');
const { execSync, execFileSync, exec } = require('child_process')

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

function escapePowerShellSingleQuotes(value) {
    return value.replace(/'/g, "''")
}

function createStartupShortcut(shortcutPath, targetFile) {
    const startupFolder = path.dirname(shortcutPath)
    fsSync.mkdirSync(startupFolder, { recursive: true })

    const script = [
        '$WshShell = New-Object -ComObject WScript.Shell',
        `$Shortcut = $WshShell.CreateShortcut('${escapePowerShellSingleQuotes(shortcutPath)}')`,
        `$Shortcut.TargetPath = '${escapePowerShellSingleQuotes(targetFile)}'`,
        `$Shortcut.WorkingDirectory = '${escapePowerShellSingleQuotes(path.dirname(targetFile))}'`,
        '$Shortcut.Save()'
    ].join('; ')

    execFileSync('powershell.exe', [
        '-NoProfile',
        '-NonInteractive',
        '-ExecutionPolicy',
        'Bypass',
        '-Command',
        script
    ], { stdio: 'pipe' })
}

app.post('/api/open-startup', (req, res) => {
    console.log("/api/open-startup");

    const startupFolder = path.join(os.homedir(), 'AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup');

    // The 'start' command in Windows opens a folder in File Explorer
    exec(`start "" "${startupFolder}"`, (error) => {
        if (error) {
            console.error('Error opening startup folder:', error);
            return res.status(500).json({ message: 'Failed to open startup folder.', error: error.message });
        }
        res.json({ message: 'Startup folder opened successfully.' });
    });
});

app.get('/api/detect-startup', (req, res) => {

    const shortcutName = 'Articles Media PowerToys.lnk';
    const startupFolder = path.join(os.homedir(), 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup');

    const shortcutPath = path.join(startupFolder, shortcutName);

    // Check if the shortcut exists
    const isEnabled = fsSync.existsSync(shortcutPath);

    res.json({
        enabled: isEnabled,
        message: isEnabled ? 'Startup is currently enabled.' : 'Startup is currently disabled.'
    });

});

app.post('/api/toggle-startup', async (req, res) => {

    console.log("/api/toggle-startup");

    const targetFile = path.resolve(__dirname, '..', '_install.bat'); // Path to your target file
    const shortcutName = 'Articles Media PowerToys.lnk';
    const startupFolder = path.join(os.homedir(), 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup');
    const shortcutPath = path.join(startupFolder, shortcutName);

    try {
        if (fsSync.existsSync(shortcutPath)) {
            fsSync.unlinkSync(shortcutPath);
            res.json({ message: 'Startup disabled (shortcut removed).', enabled: false });
        } else {
            createStartupShortcut(shortcutPath, targetFile);

            if (!fsSync.existsSync(shortcutPath)) {
                throw new Error(`Shortcut was not created at ${shortcutPath}`);
            }

            res.json({ message: 'Startup enabled (shortcut created).', enabled: true });
        }
    } catch (error) {
        console.error('Error toggling startup:', error);
        res.status(500).json({ message: 'Failed to toggle startup.', error: error.message });
    }

})

app.post('/api/install-context-menu', async (req, res) => {

    // console.log(
    //     "install-context-menu",
    //     `${contextMenuPath}`
    // )

    // console.log("req.body", req.body)

    const {
        enabledExtensions,
        extensions
    } = req.body;

    console.log("API level enabledExtensions", enabledExtensions)
    console.log("API level extensions", extensions)

    // execSync(`node install.js --enabledExtensions=${JSON.stringify(enabledExtensions)}`, {
    //     cwd: contextMenuPath,
    //     stdio: 'inherit'
    // });

    execSync(`node install.js`, {
        cwd: contextMenuPath,
        stdio: 'inherit',
        env: {
            ...process.env,
            ENABLED_EXTENSIONS: JSON.stringify(enabledExtensions),
            EXTENSIONS: JSON.stringify(extensions)
        }
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

            result.push({
                name: ent.name,
                config: cfg,
                extensionPath: extDir,
                image,
                imageUrl,
                imageDataUrl
            })
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
