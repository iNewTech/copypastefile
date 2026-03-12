# Copy Paste File

A powerful Visual Studio Code extension for file operations — duplicate files & folders, copy content to clipboard, gather files for AI context, and move/copy files across your workspace.

## Features

### Duplicate File / Folder

Creates a copy of the selected file or folder in the same directory. Automatically suggests a smart name with a `_copy` suffix (e.g., `app_copy.ts`) and increments if copies already exist. For folders, the entire directory tree is duplicated recursively.

### Copy File Content

Copies the entire content of a selected file to the clipboard with one click.

### Copy Files for AI Context

Select one or more files or folders and copy them to the clipboard in AI-friendly markdown format — perfect for pasting into ChatGPT, Claude, or any LLM. Includes:

- A file tree overview of the selected items
- Full file contents wrapped in language-specific code blocks
- Smart filtering: skips binary files and files larger than 512 KB
- **Append mode**: if your clipboard already contains an AI context block, new files are appended instead of replacing it

### Copy Open Editors for AI Context

Copies all currently open editor tabs to the clipboard in the same AI-friendly markdown format. Great for quickly sharing your working context with an AI assistant.

### Move File To... / Copy File To...

Move or copy files and folders to any location in your workspace:

- Browse all workspace folders with a quick-pick list
- Recently used destinations appear at the top for fast access
- Create new folders on the fly without leaving VS Code
- Smart conflict handling — overwrite, auto-rename, or cancel

## Usage

### Context Menu (Explorer)

Right-click any file or folder in the Explorer sidebar to access all commands.

### Context Menu (Editor)

Right-click inside an open editor for Duplicate File, Copy File Content, Move File To, and Copy File To.

### Editor Tab Context Menu

Right-click an editor tab to access **Copy Open Editors for AI Context**.

### Command Palette

Open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) and search for any command by name.

## Release Notes

### 3.1.0

- **Copy Files for AI Context**: append-to-clipboard support — selecting more files adds to the existing AI context instead of replacing it
- Improved file tree rendering and summary messages

### 3.0.0

- **New**: Copy Files for AI Context — select files/folders to copy in AI-ready markdown format
- **New**: Copy Open Editors for AI Context — copy all open tabs for AI context
- **New**: Move File To... — move files/folders to any workspace location
- **New**: Copy File To... — copy files/folders to any workspace location
- **New**: Duplicate Folder — recursively duplicate entire folders
- Recent destination tracking for Move/Copy File To

### 2.0.0

- Added `Duplicate File` command
- Added `Copy File Content` command

### 1.0.0

- Initial release
