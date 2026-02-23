# Security Policy

## Responsible Disclosure

If you discover a security vulnerability in StarAlive, please do **not** open a public GitHub Issue. Instead, contact us directly at [forcecreativeai.com](https://forcecreativeai.com) with:

- A description of the vulnerability
- Steps to reproduce it
- Potential impact

We will respond within 5 business days and work with you to resolve it before any public disclosure.

## API Keys

- All API keys are stored as environment variables — never in source code
- The `.env` file is excluded from version control via `.gitignore`
- Production keys are managed through Vercel's encrypted environment variable system
- The OpenAI API is called server-side only via a Vercel serverless function — keys are never exposed to the browser

## User Data

- Uploaded photos are sent directly to OpenAI's API for image generation and are not stored by StarAlive
- No user accounts, passwords, or personal data are collected in the current MVP
- Audio recorded in the Studio stage is processed in-browser via Web Audio API and is not transmitted or stored
