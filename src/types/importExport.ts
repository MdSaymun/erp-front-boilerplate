export interface ImportTargetField {
  key: string;
  label: string;
  required?: boolean;
  /** Example value shown to the user. */
  example?: string;
}

/** Describes what a module accepts in a CSV import. */
export interface ImportTarget {
  key: string;
  title: string;
  fields: ImportTargetField[];
}

export interface ImportFieldMapping {
  sourceColumn: string;
  targetField: string | null;
}
