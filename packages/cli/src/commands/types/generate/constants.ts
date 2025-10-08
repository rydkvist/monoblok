export interface GenerateTypesOptions {
  separateFiles: boolean;
  strict: boolean;
  typePrefix?: string;
  typeSuffix?: string;
  filename: string & {} | `${typeof DEFAULT_GENERATE_TYPES_OPTIONS.filename}`;
  suffix?: string;
  customFieldsParser?: string;
  compilerOptions?: string;
}

export const DEFAULT_GENERATE_TYPES_OPTIONS = {
  filename: 'storyblok-components',
  strict: false,
  separateFiles: false,
} as const;
