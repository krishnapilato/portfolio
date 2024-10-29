# Application Installer

This installer script allows you to check for and install specific applications, such as Java, Node.js, Docker, etc.

## Requirements

- Windows OS with PowerShell enabled.
- The script requires elevated privileges to run certain installation commands.

## Usage

1. **Run the Installer**:
   - Double-click `RunInstallScript.bat` to start the installation process.
2. **Select Applications**:
   - The script will automatically check if applications are installed and prompt you to install any missing applications.
3. **Installation Log**:
   - A log file (`install_log.txt`) will be generated in the `logs/` folder to record installation progress and errors.

## Adding Applications

To add or update applications, edit the `applications.json` file and include the `name`, `version`, `installCommand`, and `checkCommand`.

## Troubleshooting

- **Script Doesn’t Run**: Ensure PowerShell scripts are allowed by running:
  ```powershell
  Set-ExecutionPolicy Bypass -Scope Process
  ```
- **Check Log File**: Review `log.txt` in the `logs/` folder for detailed error messages.