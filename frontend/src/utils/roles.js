/**
 * Display names for the task booklet's role terminology. The internal
 * values (admin/manager/auditor) stay as-is everywhere else - JWT payload,
 * DB, RBAC rank comparisons - this is purely a label lookup for the UI.
 */
export const ROLE_LABELS = {
  admin: 'Charity Admin',
  manager: 'Volunteer',
  auditor: 'Auditor',
}
