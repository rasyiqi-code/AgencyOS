# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-02-01

### Added
- **Payment Automation**:
    - Webhook handlers for Midtrans and Creem to auto-settle orders.
    - Redirect status checks (`/api/payment/status`) to confirm payment immediately after user return, ensuring "Paid" status even on localhost.
    - Automatic activation of Projects (Status: `queue`) and Estimates (Status: `paid`) upon successful payment.
- **Admin UI**:
    - "Via Midtrans" and "Via Creem" labels in Finance Order table (replacing raw technical codes).
    - Unpaid Button to revert status if needed.
- **Documentation**:
    - Updated `README.md` with new payment features and `bun` commands.

### Changed
- **Project Structure**:
    - Excluded `.agent` directory from repository to keep it clean.
    - Standardized package manager commands to `bun`.
- **Database Seeding**:
    - Removed sensitive system settings (API keys) and demo data from `prisma/seed.ts` to prevent leaks and unwanted resets.

### Fixed
- **Dashboard**:
    - Fixed "Missions" tab incorrectly filtering out pending payments.
- **Security**:
    - Removed hardcoded Midtrans/Creem keys from codebase history.
