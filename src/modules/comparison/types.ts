/** Serializable comparison table, built on the server and rendered by client components. */
export interface ComparisonCell {
  display: string;
  best: boolean;
  /** Present for boolean rows so the UI can render a check / cross icon. */
  bool?: boolean;
}

export interface ComparisonRowData {
  key: string;
  label: string;
  cells: ComparisonCell[];
  differs: boolean;
}

export interface ComparisonSection {
  id: string;
  title: string;
  rows: ComparisonRowData[];
}

export interface ComparisonColumn {
  slug: string;
  modelId: string;
  modelSlug: string;
  makeName: string;
  modelName: string;
  variantName: string;
  modelYear: number;
  price: number;
  title: string;
  imageUrl: string | null;
}

export interface ComparisonTable {
  columns: ComparisonColumn[];
  sections: ComparisonSection[];
}

export interface CompareTrayItem {
  slug: string;
  title: string;
}
