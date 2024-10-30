
# Application Installer

This installer script simplifies the process of checking for and installing essential applications like Java, Node.js, Docker, and more. 

---

## Requirements

- **Operating System**: Windows with PowerShell enabled.
- **Privileges**: Elevated privileges are required to run certain installation commands.

---

## Usage

### 1. Run the Installer

- **Double-click** `RunInstallScript.bat` to initiate the installation process.  

### 2. Select Applications

- The script automatically checks for installed applications and prompts you to install any that are missing. 
- Use the interactive prompts to choose which applications to install.

### 3. Installation Log

- An installation log file (`install_log.txt`) will be generated in the `logs/` folder. This log records installation progress and any errors encountered.  

---

## Adding Applications

To customize or expand the list of applications:

1. **Edit the `applications.json` file**.
2. Include the following fields for each application:
   - `name`: The name of the application.
   - `version`: The required version of the application.
   - `installCommand`: The command to install the application.
   - `checkCommand`: The command to check if the application is already installed.

**Example:**
```json
{
    "name": "Java",
    "version": "11",
    "installCommand": "choco install jdk11",
    "checkCommand": "java -version"
}
```

---

## Troubleshooting

- **If the Script Doesn’t Run**:
   - Ensure PowerShell scripts are allowed by executing the following command in PowerShell:
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process
   ```

- **Check the Log File**:
   - Review the `install_log.txt` file in the `logs/` folder for detailed error messages.

---

## FAQs

**Q: What if I want to install an application that isn’t listed?**  
**A:** You can add the application details to the `applications.json` file as described above.

**Q: Can I run this installer without administrative privileges?**  
**A:** Some applications may require administrative privileges for installation. Ensure you run the script with elevated privileges.

---

## Feedback and Contributions

If you have suggestions or encounter issues, please [open an issue](https://github.com/krishnapilato/portfolio/issues) in this repository.
