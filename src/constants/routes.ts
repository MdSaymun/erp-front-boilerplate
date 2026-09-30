/** Central route path registry. Navigation, guards and tests reference these. */
export const ROUTES = {
  root: '/',
  login: '/login',
  dashboard: '/dashboard',
  products: '/products',
  inventory: '/inventory',
  warehouses: '/warehouses',
  purchasing: '/purchasing',
  sales: '/sales',
  crm: '/crm',
  accounting: '/accounting',
  pos: '/pos',
  manufacturing: '/manufacturing',
  hr: '/hr',
  payroll: '/payroll',
  expenses: '/expenses',
  projects: '/projects',
  assets: '/assets',
  helpdesk: '/helpdesk',
  reports: '/reports',
  settings: '/settings',
  administration: '/administration',
  unauthorized: '/unauthorized',
  forbidden: '/forbidden',
  serverError: '/server-error',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
