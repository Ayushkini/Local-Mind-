# Security Policy

Local Mind is a project for local-place discovery. Please avoid publishing sensitive information in public issues.

## Reporting a vulnerability

For a serious security concern, contact the repository owner privately through a contact method listed on their GitHub profile. Do not include exploit details, credentials, API keys, or personal data in a public issue.

## Security checklist for maintainers

- Keep API keys and credentials out of source control.
- Provide `.env.example` with placeholder values only.
- Validate and sanitize untrusted input.
- Avoid logging precise location or other sensitive user data unnecessarily.
- Review permissions and data-sharing behavior for any location or places API.
- Keep dependencies updated and remove unused packages.
