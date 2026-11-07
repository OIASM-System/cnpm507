# Backup and Restore Strategy — POS PWA

**Project:** Omnichannel / Multi-Branch POS PWA  
**Database:** PostgreSQL  
**Architecture:** Shared Database + Shared Schema, Multi-Tenant (`tenant_id`)  
**Status:** Proposed implementation baseline — operational values must be approved before production.

## 1. Purpose and scope

This document defines the backup, restore, and recovery approach for the PostgreSQL database used by the POS PWA. It covers:

- Logical backups for portability and point-in-time snapshots.
- Physical backups and WAL archiving for disaster recovery.
- Restore validation and recovery testing.
- Tenant-aware data handling and the effect of offline POS clients.
- Backup security, retention, monitoring, and operational responsibilities.

The database stores tenant and branch configuration, users and RBAC, product catalog and pricing, inventory balances and movement history, purchasing/transfer/stocktake records, customers, orders, payments, and notifications.

## 2. Recovery objectives

The values below are **proposed starting targets**, not requirements confirmed by the supplied specifications. The product owner and operations team must approve them.

| Metric | Proposed target | Meaning |
|---|---:|---|
| RPO (Recovery Point Objective) | 15 minutes | Maximum target data-loss window when WAL archiving is healthy |
| RTO (Recovery Time Objective) | 4 hours | Target time to restore service after a database-level disaster |
| Logical backup frequency | Daily | Full logical snapshot for portability and selective recovery |
| WAL archive frequency | Continuous | Enables point-in-time recovery (PITR) |
| Restore drill | Quarterly | Verify that backups can actually be restored |

A backup job reporting success is not proof of recoverability. Only a successful restore and validation test establishes that.

## 3. Backup strategy

### 3.1 Logical backup

Use PostgreSQL `pg_dump` in custom format for a consistent database backup. Store the dump outside the database host.

Example:

```bash
# Run with a protected .pgpass file or another secret-management mechanism.
pg_dump \
  --host="$PGHOST" \
  --port="${PGPORT:-5432}" \
  --username="$PGUSER" \
  --format=custom \
  --no-owner \
  --file="pos_pwa_$(date -u +%Y%m%dT%H%M%SZ).dump" \
  "$PGDATABASE"
```

Capture global objects separately when required (for example, roles and tablespaces):

```bash
pg_dumpall --host="$PGHOST" --username="$PGUSER" --globals-only \
  > "postgres_globals_$(date -u +%Y%m%dT%H%M%SZ).sql"
```

Global exports can contain sensitive role information. Restrict access and do not store passwords in plain-text scripts or logs.

### 3.2 Physical backup and point-in-time recovery

For production deployments requiring a short RPO, use a PostgreSQL-supported physical backup process (for example, `pg_basebackup` or a backup manager) together with continuous WAL archiving.

Illustrative `postgresql.conf` settings (paths and values depend on the deployment):

```conf
wal_level = replica
archive_mode = on
archive_command = 'test ! -f /secure/wal_archive/%f && cp %p /secure/wal_archive/%f'
```

The example `archive_command` is illustrative only. For production, use a durable archive destination, safe handling of retries, monitoring for failed archives, and preferably a managed backup tool/object-storage integration. Do not treat a local directory on the same disk as disaster recovery.

A recoverable PITR chain requires:
1. A valid base backup.
2. Every required WAL segment from the base backup through the recovery target.
3. The PostgreSQL configuration and any required tablespace information.
4. A tested restore procedure.

### 3.3 Backup schedule and retention

Proposed baseline:

| Backup artifact | Frequency | Retention |
|---|---|---|
| Logical custom-format dump | Daily | 14 daily copies |
| Weekly logical snapshot | Weekly | 8 weekly copies |
| Monthly archive | Monthly | 12 monthly copies |
| Physical base backup | Weekly, or per backup-manager policy | At least 4 successful generations |
| WAL archive | Continuous | At least 14 days, subject to storage and compliance requirements |

Apply a 3-2-1 pattern where practical: at least 3 copies, on 2 different storage types, with 1 copy off-site or in a separate failure domain. Retention periods are proposals and must be aligned with legal, privacy, and business requirements.

## 4. Backup security

- Encrypt backups in transit and at rest. Use managed keys or a controlled key-management process.
- Store database credentials in a secret manager or protected service account; never commit them to Git.
- Restrict backup read/write/delete permissions to designated service identities and administrators.
- Separate production backup access from ordinary application credentials.
- Record backup start/end time, database identity, backup type, file size, checksum, and job result.
- Do not include customer/payment data in debug logs. Apply the same access controls to backups as to production data.
- Test key recovery as part of restore drills; encrypted backups are unusable if their keys are lost.

## 5. Restore procedures

### 5.1 Restore a logical dump into a new database

Prefer restoring to a new database first, validating it, and only then switching application traffic.

```bash
createdb --host="$PGHOST" --username="$PGUSER" pos_pwa_restore_test

pg_restore \
  --host="$PGHOST" \
  --username="$PGUSER" \
  --dbname=pos_pwa_restore_test \
  --no-owner \
  --verbose \
  "pos_pwa_YYYYMMDDTHHMMSSZ.dump"
```

If database roles or extensions are required, provision them using the approved infrastructure procedure before restore. Review ownership and grants before exposing the restored database to the application.

### 5.2 Restore from a SQL export

```bash
createdb --host="$PGHOST" --username="$PGUSER" pos_pwa_restore_test

psql \
  --host="$PGHOST" \
  --username="$PGUSER" \
  --dbname=pos_pwa_restore_test \
  --set=ON_ERROR_STOP=on \
  --file="backup.sql"
```

### 5.3 Point-in-time recovery (PITR)

High-level procedure; exact commands depend on PostgreSQL version and backup tooling:

1. Stop application writes and isolate the failed database instance.
2. Provision a clean PostgreSQL host with a compatible major version.
3. Restore the latest valid physical base backup.
4. Configure WAL retrieval from the secure archive.
5. Set the recovery target (time, transaction, or named restore point) in the recovery configuration supported by the installed PostgreSQL version.
6. Start PostgreSQL and verify that recovery completed at the intended target.
7. Validate database integrity and application-level invariants.
8. Point the application to the recovered instance only after approval.
9. Preserve the failed instance and logs for investigation.

Do not overwrite the only known-good backup or recovery chain during an incident.

## 6. Post-restore validation checklist

- [ ] PostgreSQL starts successfully and reports no recovery errors.
- [ ] Expected schemas, tables, sequences, indexes, constraints, and extensions exist.
- [ ] Primary-key and foreign-key constraints are valid.
- [ ] Tenant and branch records are present.
- [ ] Tenant-scoped queries return only the authenticated tenant's data.
- [ ] Branch-scoped users cannot read or modify unauthorized branch data.
- [ ] SKU codes and non-null barcodes remain unique.
- [ ] Inventory balances reconcile with inventory transaction history according to the application's reconciliation rules.
- [ ] Order totals reconcile with order items and payment records.
- [ ] Recent orders, payments, goods receipts, transfers, and stocktakes are present up to the selected recovery point.
- [ ] Application login, RBAC checks, product lookup, barcode lookup, checkout, and inventory operations pass smoke tests.
- [ ] A test transaction can be committed and rolled back safely.
- [ ] The restored database has correct ownership, grants, and connection settings.

The supplied specifications establish the intended entities and some business rules, but do not define formal reconciliation SQL or all status transitions. Those checks must be completed alongside application implementation.

## 7. Multi-tenant and branch considerations

The system uses a shared database and shared schema. A database-wide backup therefore contains data for **all tenants**; `pg_dump` is not a tenant-isolated backup.

- Never provide a full database backup to an individual tenant.
- If tenant-level export or recovery is required, design and test a separate tenant-scoped export/import workflow. It must include dependent rows and preserve referential integrity.
- Keep `tenant_id` filters in application queries and enforce branch authorization independently.
- Validate tenant isolation after every restore.
- Avoid restoring one tenant's rows directly over production without a reviewed, transaction-safe recovery plan.

## 8. Offline-first POS and synchronization

The PWA may continue to hold locally queued operations while the server database is being restored. A database restore does not automatically restore client-side queues or guarantee that they have synchronized.

- Keep client-side operation identifiers stable and use idempotency keys for synchronization requests.
- After recovery, reconcile queued orders and stock operations against server acknowledgements before allowing blind replay.
- Reject or flag duplicate submissions; do not assume that a client timeout means the server transaction failed.
- For transactions created after the selected PITR target, use application synchronization logs or operational records to determine whether replay is safe.
- Do not replay inventory or payment mutations without idempotency and duplicate detection.

The above synchronization controls are recommended operational requirements; the supplied database files do not specify a complete offline queue schema.

## 9. Monitoring and alerting

Alert the responsible operator when:

- A scheduled backup fails or exceeds its expected duration.
- Backup size changes unexpectedly or a checksum/verification step fails.
- WAL archiving is failing or the archive backlog exceeds the approved threshold.
- Free storage approaches the operational limit.
- The most recent successful backup is older than the approved RPO window.
- A restore drill fails or is overdue.

Maintain an auditable record of backup and restore operations, including who initiated a manual restore and who approved production cutover.

## 10. Responsibilities and change control

- **Database/DevOps owner:** backup jobs, encryption, retention, monitoring, restore execution.
- **Application owner:** tenant/branch validation, business reconciliation, offline queue handling, smoke tests.
- **Business owner:** approve RPO/RTO, retention, recovery point, and production cutover.

Review this document whenever the PostgreSQL major version, hosting topology, schema, data-retention obligations, or offline synchronization design changes.
