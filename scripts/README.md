# Application Installer

![Windows](https://img.shields.io/badge/Windows-11-0078D4?logo=windows&logoColor=white)
![macOS](https://img.shields.io/badge/macOS-15-0078D4?logo=apple&logoColor=white)
![Linux](https://img.shields.io/badge/Linux-22-009639?logo=linux&logoColor=white)
![Python](https://img.shields.io/badge/language-Python-blue?logo=python&logoColor=white)
![Shell](https://img.shields.io/badge/shell-PowerShell-blue?logo=powershell&logoColor=white)
![JSON](https://img.shields.io/badge/format-JSON-lightgray?logo=json&logoColor=white)

The **Application Installer** simplifies the process of checking and installing essential software like Java, Node.js, Docker, and more. With an intuitive interface, it ensures your system is ready with the tools you need, all in just a few clicks.

**New features coming next week!**

## Requirements

- **Operating System**: 
  - Windows
  - macOS
  - Linux

- **Package Managers**:
  - **Windows**: Chocolatey
  - **macOS**: Homebrew
  - **Linux**: apt (or your system's default package manager)

- **Privileges**: Elevated privileges are required to run certain installation commands (e.g., installing software using package managers).

---

## Usage

### 1. Run the Installer

- **Run** the Python script `app_manager.py` by executing the following command in your terminal or command prompt:
  
  ```bash
  python app_manager.py

### 2. Select Applications

- The script automatically checks for installed applications and displays them in a user-friendly GUI.
- The **status** of each application will be shown as either **Installed** or **Not Installed**.
- Select the applications you wish to install, then click the **"Install Selected"** button to begin the installation process.

### 3. Package Manager Installation (If Missing)

- If the required package managers (Chocolatey for Windows or Homebrew for macOS) are missing, the script will prompt you to install them before proceeding.

### 4. Installation Log

- An installation log file (`install_log.txt`) will be created in the `logs/` folder.
- This log contains detailed information about the installation process, including:
  - Success messages
  - Any errors encountered during installation

## Adding Applications

To customize or expand the list of applications:

1. **Edit the `applications.json` file**.
2. Include the following fields for each application:
   - `name`: The name of the application.
   - `version`: The required version of the application.
   - `description`: A short description of the application.
   - `installCommand`: A dictionary with platform-specific commands to install the application.
   - `checkCommand`: The command to check if the application is already installed.
   - `platforms`: List the supported platforms (e.g., Windows, Linux, macOS).
   - `documentation`: A link to the application’s documentation.

**Example:**
```json
{
    "name": "Java",
    "version": "latest",
    "description": "Java Runtime Environment (JRE) and Java Development Kit (JDK) for running and developing Java applications.",
    "installCommand": {
        "windows": "choco install openjdk --version=latest",
        "macos": "brew install openjdk",
        "linux": "sudo apt install openjdk"
    },
    "checkCommand": "java -version",
    "platforms": ["Windows", "Linux", "macOS"],
    "documentation": "https://www.java.com"
}
```

---

## Troubleshooting

- **Script Doesn’t Run**:
   - Make sure Python is installed and added to the system’s PATH.

- **Check the Log File**:
   - Review `install_log.txt` in the `logs/` folder for detailed errors.

## FAQs

**Q: What if I want to install an application that isn’t listed?**  
**A:** You can add the application details to the `applications.json` file as described above.

**Q: Can I run this installer without administrative privileges?**  
**A:** Some applications may require administrative privileges for installation. Ensure you run the script with elevated privileges.

## Feedback and Contributions

If you have suggestions or encounter issues, please [open an issue](https://github.com/krishnapilato/portfolio/issues) in this repository.
