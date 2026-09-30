import { create } from 'zustand';

import type { CompanySummary } from '@/types/company';
import type { Id } from '@/types/common';

/**
 * UI state for the company the user is currently working in.
 *
 * `availableCompanies` comes from the backend (companies the user may access).
 * Selecting a company here only changes what the UI shows and which company id
 * is sent as context; the backend validates that the user may act in it.
 */
interface CompanyState {
  availableCompanies: CompanySummary[];
  currentCompanyId: Id | null;

  setAvailableCompanies: (companies: CompanySummary[], preferredId?: Id) => void;
  selectCompany: (companyId: Id) => boolean;
  clear: () => void;
}

export const useCompanyStore = create<CompanyState>()((set, get) => ({
  availableCompanies: [],
  currentCompanyId: null,

  setAvailableCompanies: (companies, preferredId) => {
    const preferred = companies.find((c) => c.id === preferredId);
    const current = companies.find((c) => c.id === get().currentCompanyId);
    set({
      availableCompanies: companies,
      currentCompanyId: (preferred ?? current ?? companies[0])?.id ?? null,
    });
  },

  selectCompany: (companyId) => {
    const exists = get().availableCompanies.some((c) => c.id === companyId);
    if (!exists) {
      return false;
    }
    set({ currentCompanyId: companyId });
    return true;
  },

  clear: () => set({ availableCompanies: [], currentCompanyId: null }),
}));

/** Selector: the full summary of the selected company, if any. */
export function selectCurrentCompany(state: CompanyState): CompanySummary | null {
  return state.availableCompanies.find((c) => c.id === state.currentCompanyId) ?? null;
}
