# GitHub Pages Branch

![Java Version](https://badgen.net/badge/Java/23/blue?icon=java)
![Spring Boot Version](https://img.shields.io/badge/Spring%20Boot-3.4.1-brightgreen?style=flat&logo=spring-boot)
![Angular Version](https://img.shields.io/badge/Angular-19.0.5-red?style=flat&logo=angular)
![MySQL](https://img.shields.io/badge/MySQL-9.1.0-blue?style=flat&logo=mysql)
![Version](https://img.shields.io/badge/Version-0.8.5-blue?style=flat)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)
![Repo Size](https://img.shields.io/github/repo-size/krishnapilato/portfolio?style=flat)
![Custom Workflow](https://img.shields.io/badge/Workflow-CI/CD-yellow?style=flat&logo=githubactions)

This branch is dedicated to hosting the live version of the portfolio using **GitHub Pages**. It contains the compiled output of the project (static files like HTML, CSS, and JavaScript) required for deployment.

## Why `gh-pages`?

The `gh-pages` branch is specifically created for the following reasons:

1. **GitHub Pages Hosting:** GitHub Pages uses this branch to serve the live website directly from the repository.  
2. **Separation of Concerns:** Keeps deployment files separate from the development branches (`main` or `dev`) to maintain a clean and organized workflow.  
3. **Automatic Updates:** Simplifies the deployment process when configured with tools like `angular-cli-ghpages` or similar frameworks.  

## Note

- Do not make manual changes to this branch. All updates should come from the build process in the development branch.  
- To deploy updates, build the project and push the updated output to this branch.  

---

**Live Website:** [portfolio](https://krishnapilato.github.io/portfolio)
