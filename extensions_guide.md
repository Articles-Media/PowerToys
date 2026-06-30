# Extensions Guide - 0.0.1

This guide explains how to set up your own extensions.

## Required Files

Make sure your extension folder includes the following files:

- [ ] icon.ico
- [ ] config.json

---

## Required fields in config.json

The following fields are required in your configuration file:

- **name**: The full name of your extension. For community or user-created extensions, use a clear name such as "John's Blender Tool Pack" rather than just "Blender Tool Pack".
- **description**: A short description that appears in the UI and extension browser.
- **version**: The version of your extension.
- **extension_version**: The PowerToys version your extension was built for.
- **author**: Your name or organization.
- **commands**: A list of commands for the extension.

## Command schema details

Each command should include:

- **title**: Title of the command in the context-menu
- **command**: What command in the scripts folder is the click going to run
- **file_extensions**: What file types should this command be made available to

You can reference the included extensions to see working examples.