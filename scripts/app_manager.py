import os
import platform
import subprocess
import json
from datetime import datetime
import tkinter as tk
from tkinter import messagebox, ttk
from tkinter.ttk import Progressbar

# Paths for JSON and log files
script_dir = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(script_dir, "applications.json")
log_dir = os.path.join(script_dir, "logs")
log_path = os.path.join(log_dir, "install_log.txt")

# Ensure the logs directory exists
os.makedirs(log_dir, exist_ok=True)

# Logging function
def log_message(message):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"{timestamp} - {message}\n"
    with open(log_path, "a", encoding="utf-8") as log_file:
        log_file.write(log_entry)

# Cross-platform command execution
def run_command(command):
    try:
        result = subprocess.run(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return result.returncode == 0, result.stdout.strip(), result.stderr.strip()
    except Exception as e:
        return False, "", str(e)

# Check if a package manager is installed
def check_package_manager(package_manager):
    command = {
        "windows": "choco -v",
        "macos": "brew --version",
        "linux": "apt --version",
    }.get(package_manager, "")
    success, _, _ = run_command(command)
    return success

# Install missing package manager
def install_package_manager(os_name):
    if os_name == "windows":
        log_message("Chocolatey is not installed. Installing Chocolatey...")
        choco_install_cmd = (
            'powershell -NoProfile -InputFormat None -ExecutionPolicy Bypass '
            '-Command "Set-ExecutionPolicy Bypass -Scope Process -Force; '
            '[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12; '
            'iex ((New-Object System.Net.WebClient).DownloadString(\'https://chocolatey.org/install.ps1\'))"'
        )
        run_command(choco_install_cmd)
    elif os_name == "macos":
        log_message("Homebrew is not installed. Installing Homebrew...")
        brew_install_cmd = (
            '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
        )
        run_command(brew_install_cmd)
    else:
        log_message("Package manager not supported for automatic installation on Linux.")
        messagebox.showerror("Error", "Package manager installation is only automated for Windows and macOS.")

# Check if an application is installed
def check_application_installed(check_command):
    success, _, _ = run_command(check_command)
    return success

# Install an application
def install_application(app_name, install_command):
    log_message(f"Installing {app_name}...")
    success, stdout, stderr = run_command(install_command)
    if success:
        log_message(f"{app_name} installed successfully.")
        return f"{app_name} installed successfully."
    else:
        log_message(f"Error installing {app_name}: {stderr}")
        return f"Error installing {app_name}: {stderr}"

# Main GUI Application
class AppManagerGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Application Setup Manager")
        self.root.geometry("900x700")
        self.root.configure(bg="#F0F0F0")

        # Title
        ttk.Label(root, text="Application Setup Manager", font=("Helvetica", 18, "bold"), foreground="#4A90E2", background="#F0F0F0").pack(pady=20)

        # Operating System Info
        self.os_name = platform.system().lower()
        ttk.Label(root, text=f"Detected Operating System: {self.os_name.capitalize()}", font=("Helvetica", 12), background="#F0F0F0").pack(pady=10)

        # Check for package manager
        if self.os_name == "windows" and not check_package_manager("windows"):
            if messagebox.askyesno("Package Manager Missing", "Chocolatey is not installed. Install it now?"):
                install_package_manager("windows")
            else:
                messagebox.showerror("Error", "Chocolatey is required to proceed.")
                self.root.quit()
        elif self.os_name == "macos" and not check_package_manager("macos"):
            if messagebox.askyesno("Package Manager Missing", "Homebrew is not installed. Install it now?"):
                install_package_manager("macos")
            else:
                messagebox.showerror("Error", "Homebrew is required to proceed.")
                self.root.quit()

        # Frame for the application list
        self.app_frame = ttk.Frame(root, padding=10)
        self.app_frame.pack(fill="both", expand=True, padx=10, pady=10)

        # Scrollable Treeview for Applications
        self.tree = ttk.Treeview(self.app_frame, columns=("Name", "Status", "Description"), show="headings", height=15)
        self.tree.heading("Name", text="Application")
        self.tree.heading("Status", text="Status")
        self.tree.heading("Description", text="Description")
        self.tree.column("Name", width=200)
        self.tree.column("Status", width=120)
        self.tree.column("Description", width=400)
        self.tree.pack(fill="both", expand=True, side="left")

        # Scrollbar
        scrollbar = ttk.Scrollbar(self.app_frame, orient="vertical", command=self.tree.yview)
        scrollbar.pack(side="right", fill="y")
        self.tree.configure(yscrollcommand=scrollbar.set)

        # Load JSON and check applications
        self.load_applications()

        # Buttons
        button_frame = ttk.Frame(root, padding=10, background="#F0F0F0")
        button_frame.pack(pady=20)

        ttk.Button(button_frame, text="Install Selected", command=self.install_selected, width=20, style="Accent.TButton").pack(side="left", padx=10)
        ttk.Button(button_frame, text="Exit", command=root.quit, width=20, style="TButton").pack(side="left", padx=10)

        # Status bar
        self.status_label = ttk.Label(root, text="Ready", font=("Helvetica", 10), background="#F0F0F0", relief="sunken", anchor="w")
        self.status_label.pack(fill="x", side="bottom")

    def load_applications(self):
        if not os.path.exists(json_path):
            messagebox.showerror("Error", f"JSON file not found at {json_path}")
            log_message(f"Error: JSON file not found at {json_path}")
            return

        with open(json_path, "r", encoding="utf-8") as json_file:
            self.applications = json.load(json_file)["tools"]

        for app in self.applications:
            status = "Installed" if check_application_installed(app["checkCommand"]) else "Not Installed"
            self.tree.insert("", "end", values=(app["name"], status, app["description"]))
            log_message(f"Checked application: {app['name']} - Status: {status}")

    def install_selected(self):
        selected_items = self.tree.selection()
        if not selected_items:
            messagebox.showinfo("No Selection", "Please select applications to install.")
            return

        for item in selected_items:
            app_name = self.tree.item(item, "values")[0]
            for app in self.applications:
                if app["name"] == app_name:
                    install_command = app["installCommand"].get(self.os_name)
                    if install_command:
                        self.status_label.config(text=f"Installing {app_name}...")
                        self.root.update_idletasks()
                        message = install_application(app_name, install_command)
                        messagebox.showinfo("Installation Status", message)
                    else:
                        messagebox.showerror("Error", f"No install command available for {self.os_name.capitalize()}")
                        log_message(f"Error: No install command available for {self.os_name.capitalize()}")
                    break
        self.tree.delete(*self.tree.get_children())
        self.load_applications()
        self.status_label.config(text="Ready")

# Run the GUI application
if __name__ == "__main__":
    root = tk.Tk()

    # Custom styling
    style = ttk.Style(root)
    style.configure("TButton", font=("Helvetica", 12), padding=10)
    style.configure("Accent.TButton", font=("Helvetica", 12), background="#4A90E2", foreground="white", padding=10)
    style.map("Accent.TButton", background=[("active", "#357ABD")])

    app = AppManagerGUI(root)
    root.mainloop()