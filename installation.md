# Installation Details

Either method is fine! Both methods assume that Node.js and NPM are installed. Please use Node 22 or above.

## Automatic Installation

Run the _install.bat in the top level.

## Manual Installation

Install the dependencies in the top level folder
```bash
npm i
```

Next, change directory into the ui folder and install the dependencies their as well.

```bash
cd ui
```

```bash
npm i
```

Now you should be able to start the dev server in the ui folder to interact with the GUI and install extensions.

```bash
npm run dev
```

Articles Blender Extension Note: Make sure your config.json points to correct blender path. Make sure bpy is installed, see https://pypi.org/project/bpy/. Eventually setup will be automated.