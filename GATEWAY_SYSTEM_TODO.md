# Payment Gateway Control System Todo

This project should function as a central payment gateway configuration and control system.

The user connects their preferred gateways here, and then uses this one system to:

- manage gateway credentials and configuration
- choose the exact gateway to use for a payment action
- create and track payments through that selected gateway
- pull and sync transactions from configured gateways
- view unified reporting across all connected gateways

Important product rule:

- If the user selects `Paystack`, the system must use `Paystack`
- If the user selects `Flutterwave`, the system must use `Flutterwave`
- No automatic fallback or rerouting unless explicitly added later

## Product Direction

The system is not primarily a public API router.

It is primarily:

1. a gateway configuration hub
2. a unified transaction monitor
3. a transaction sync and import system
4. a single surface for operating multiple gateways

## Core Functional Requirements

### 1. Gateway Configuration

- [x] Allow user to add multiple payment gateways
- [ ] Allow user to store gateway-specific credentials securely
- [x] Allow user to enable and disable a configured gateway
- [ ] Allow user to edit and update gateway credentials
- [x] Validate credentials when requested
- [ ] Show connection health and status for each gateway
- [ ] Add provider-specific fields where needed

### 2. Gateway Adapter Architecture

- [x] Create a base gateway adapter interface
- [x] Add adapter method for create payment
- [x] Add adapter method for verify payment
- [ ] Add adapter method for refund payment
- [x] Add adapter method for fetch transactions
- [ ] Add adapter method for fetch transaction by id or reference
- [x] Add adapter method for validate credentials and config
- [x] Add a provider adapter registry service
- [x] Resolve adapters by configured provider type

### 3. First Provider Implementation

- [x] Implement Paystack adapter first
- [x] Add Paystack transaction fetch and sync
- [x] Add Paystack payment verification
- [ ] Add Paystack refund support if feasible
- [x] Normalize Paystack responses into internal transaction shape

### 4. Selected Gateway Execution

- [x] Ensure payment requests require a selected `gatewayId`
- [x] Resolve the configured gateway from the database
- [x] Call only the adapter for that selected gateway
- [x] Reject unsupported operations cleanly
- [x] Never auto-switch to another provider

### 5. Unified Transaction Model

- [x] Normalize all gateway transactions into the internal transaction schema
- [x] Preserve source gateway and provider metadata
- [x] Preserve original provider reference and id
- [x] Map provider statuses into internal statuses
- [x] Store raw provider payload where useful for auditing

### 6. Transaction Pull and Sync

- [x] Add manual sync per gateway
- [x] Add bulk fetch from provider transactions API
- [x] Add date-range sync support in the UI
- [x] Prevent duplicate imports
- [x] Match provider transactions to local transactions by reference or provider id
- [x] Save imported transactions into unified store
- [x] Show last sync time per gateway
- [x] Show sync result summary

### 7. Background Sync

- [ ] Design scheduled sync job structure
- [ ] Add periodic sync capability
- [ ] Add per-gateway sync toggle
- [ ] Add safe retry for failed sync jobs
- [ ] Log sync errors clearly

### 8. Gateway-Specific Webhook Ingestion

- [ ] Add inbound webhook endpoints for each provider
- [ ] Verify provider webhook signatures
- [ ] Update internal transactions from webhook events
- [ ] Store webhook event history
- [ ] Reconcile webhook updates with pulled transaction syncs

### 9. Unified Dashboard and Reporting

- [x] Show all transactions from all configured gateways in one table
- [x] Filter by provider
- [x] Filter by configured gateway
- [x] Filter by status, date, and reference
- [x] Show transaction origin clearly
- [ ] Show gateway performance metrics
- [ ] Show sync status metrics

### 10. Operations UX

- [x] Add shimmer-style loading skeletons
- [x] Add Sync Now action on each gateway
- [ ] Add gateway detail page
- [ ] Show last pulled transactions per gateway
- [x] Show provider reference ids in transaction detail
- [x] Show raw provider payload in transaction detail
- [ ] Add logs and history view for sync runs
- [x] Add create payment flow with exact gateway selection
- [x] Add verify-with-gateway action from transaction detail

### 11. Security

- [ ] Encrypt gateway secret keys at rest
- [x] Never expose gateway secret keys back to the frontend
- [ ] Redact sensitive values in logs
- [ ] Add audit trail for gateway config changes
- [ ] Add secret rotation flow

### 12. API and Backend Structure

- [ ] Add gateway application service layer
- [ ] Add sync service layer
- [ ] Add provider payload normalizer utilities
- [ ] Add provider transaction mapper utilities
- [ ] Add reusable provider auth helpers
- [ ] Add request tracing and logging where useful

### 13. Public SDK and API

This is secondary to the core orchestration product, but still useful later.

- [ ] Keep SDK aligned with selected-gateway execution
- [ ] Ensure SDK requires explicit `gatewayId`
- [ ] Add SDK helpers for transaction fetch and verification
- [ ] Add docs for external system usage after the core gateway flow is stable

### 14. Testing

- [ ] Test selected-gateway execution end to end
- [ ] Test wrong-credential gateway failures
- [ ] Test sync duplicate prevention
- [ ] Test provider status normalization
- [ ] Test webhook and sync reconciliation
- [ ] Test dashboard filters against mixed-provider data

## Suggested Build Order

1. Gateway adapter interface
2. Paystack adapter
3. Strict selected-gateway payment execution
4. Manual transaction sync from configured gateway
5. Unified transaction normalization
6. Gateway sync UI
7. Provider webhook ingestion
8. Additional provider adapters

## Current Priority

Build the system so a user can:

1. configure Paystack
2. select that exact Paystack configuration
3. create and verify payments through it
4. pull Paystack transactions into the unified dashboard

That is the first real end-to-end milestone.
