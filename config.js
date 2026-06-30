const config = {
    "base": {
        "enabled": true,
        "commands": [
            {
                type: "Default",
                name: "About Script",
            },
            {
                type: "Default",
                name: "Open UI",
                run_as: "node",
                command: ""
            },
        ]
    },
    "sharp": {
        "enabled": true,
    },
    "gltfjsx": {
        "enabled": true,
    },
    "blender": {
        "enabled": true,
        "blenderPath": "C:/Program Files/Blender Foundation/Blender 5.0/blender.exe",
        "commands": [
            {
                type: "Default",
                name: "Create Thumbnail",
            }
        ]
    },
    "articles-media": {
        "enabled": true,
    },
    "custom": {
        "enabled": false,
        "commands": [
            {
                type: "Custom",
                name: "My Custom Command",
                run_as: "node",
                command: "console.log(123)",
            }
        ]
    }
}

export default config;