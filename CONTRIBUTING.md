# Contributing to the Project (CONTRIBUTING.md)

Thank you for your interest in contributing to our project! To maintain code quality, consistency, and a smooth workflow, please follow these guidelines.

---

## 📌 Critical Repository Rules

1. **Never commit the `node_modules` folder!** 
   * Ensure your local `.gitignore` is working properly before pushing. If `node_modules` is accidentally tracked, untrack it immediately and update the gitignore settings.
2. **Do not delete critical configuration files.**
   * Files like `package.json` and `package-lock.json` are essential for the frontend ecosystem. Modifications to dependencies must only be done using the package manager (`npm install` / `npm uninstall`).
3. **Stay synchronized with Remote.**
   * Always run `git pull` from the main branch before starting new work and before opening a Pull Request to minimize complex merge conflicts.

---

## 💬 Git Commit Guidelines

This project strictly follows the **Conventional Commits** specification. Every commit message must follow a structured format to make the project history clear and scannable.

### Format:
`<type>(<scope>): <short description in English>`

### Allowed Types (`<type>`):
* `feat` – A new feature for the user.
* `fix` – A bug fix.
* `chore` – Maintenance tasks, updating configuration files (e.g., editing `.gitignore`, CI/CD setups).
* `init` – Reserved only for the initial project setup.

### Allowed Scopes (`<scope>`):
* `frontend` – Changes related to UI components, layout, and styles (e.g., `Sidebar`, `StatusBar`, `ProblemsPanel`, `EditorPane`, CSS).
* `backend` – Server-side logic, API endpoints, language servers, or search modules (e.g., `main.py`, LSP, terminal API).
* `root` – Repository-wide configurations (e.g., `LICENSE`, `.gitignore`).
* `all` – Large-scale updates affecting both frontend and backend simultaneously.

### Correct Commit Examples:
* `feat(frontend): add Sidebar component with lucide icons`
* `feat(backend): add search`
* `fix(root): delete node_modules`
* `chore: update main.py`

---

## 🛠️ Project Architecture Overview

The codebase is split into two main sections:
1. **Frontend**: The web-based IDE interface. It contains layout components (`Sidebar`, `StatusBar`) and core workspace modules (`ProblemsPanel`, `EditorPane`). Ensure that new UI elements align with the existing CSS/design layout.
2. **Backend**: Powered by Python (`main.py`). It manages core IDE features including the Language Server Protocol (`lsp`), code execution/search capabilities, and the backend `api terminal`.

---

## 🚀 Pull Request Process

1. Create a new branch from the main branch: `git checkout -b feat/your-feature-name`.
2. Implement your changes keeping the codebase clean and modular.
3. Test your changes locally to ensure both the frontend and backend function properly.
4. Commit your work in logical increments using the **Conventional Commits** format.
5. Push your branch and open a **Pull Request**. Provide a brief description of what your PR introduces or fixes.
