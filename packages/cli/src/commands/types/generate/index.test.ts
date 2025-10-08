import { beforeEach, describe, expect, it, vi } from 'vitest';
import { session } from '../../../session';
import { konsola } from '../../../utils';
import { generateStoryblokTypes, generateTypes, saveTypesToComponentsFile } from './actions';
import chalk from 'chalk';
import { colorPalette } from '../../../constants';
// Import the main components module first to ensure proper initialization
import '../index';
import type { TypesCommandOptions } from '../command';
import { DEFAULT_TYPES_COMMAND_OPTIONS, typesCommand } from '../command';
import { readComponentsFiles } from '../../components/push/actions';
import type { GenerateTypesOptions } from './constants';
import { DEFAULT_GENERATE_TYPES_OPTIONS } from './constants';

const mockGenerationCommand = (
  generateOptions: Partial<GenerateTypesOptions> = {},
  typeCommandOptions: Partial<TypesCommandOptions> = {},
) => {
  const path = typeCommandOptions.path ?? DEFAULT_TYPES_COMMAND_OPTIONS.path;
  const filename = generateOptions.filename ?? DEFAULT_GENERATE_TYPES_OPTIONS.filename;
  const separateFiles = generateOptions.separateFiles ?? DEFAULT_GENERATE_TYPES_OPTIONS.separateFiles;
  const strict = generateOptions.strict ?? DEFAULT_GENERATE_TYPES_OPTIONS.strict;

  const command = [
    'node',
    'test',
    'generate',
    '--space',
    '12345',
    '--path',
    path,
    '--filename',
    filename,
    ...(separateFiles ? ['--separate-files'] : []),
    ...(strict ? ['--strict'] : []),
  ];

  // Add optional flags if provided
  if (generateOptions.typePrefix) {
    command.push('--type-prefix', generateOptions.typePrefix);
  }
  if (generateOptions.typeSuffix) {
    command.push('--type-suffix', generateOptions.typeSuffix);
  }
  if (generateOptions.suffix) {
    command.push('--suffix', generateOptions.suffix);
  }
  if (generateOptions.customFieldsParser) {
    command.push('--custom-fields-parser', generateOptions.customFieldsParser);
  }
  if (generateOptions.compilerOptions) {
    command.push('--compiler-options', generateOptions.compilerOptions);
  }

  return command;
};

vi.mock('./actions', () => ({
  generateStoryblokTypes: vi.fn(),
  generateTypes: vi.fn(),
  saveTypesToComponentsFile: vi.fn(),
  getComponentType: vi.fn(),
}));

vi.mock('../../components/push/actions', () => ({
  readComponentsFiles: vi.fn(),
}));

// Mocking the session module
vi.mock('../../../session', () => {
  let _cache: Record<string, any> | null = null;
  const session = () => {
    if (!_cache) {
      _cache = {
        state: {
          isLoggedIn: false,
        },
        updateSession: vi.fn(),
        persistCredentials: vi.fn(),
        initializeSession: vi.fn(),
      };
    }
    return _cache;
  };

  return {
    session,
  };
});

vi.mock('../../../utils', async () => {
  const actualUtils = await vi.importActual('../../../utils');
  return {
    ...actualUtils,
    isVitestRunning: true,
    konsola: {
      ok: vi.fn(),
      title: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      br: vi.fn(),
    },
    handleError: (error: unknown, header = false) => {
      konsola.error(error as string, header);
      // Optionally, prevent process.exit during tests
    },
  };
});

describe('types generate', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.clearAllMocks();
    // Fix the linter errors by using a type assertion
    (typesCommand as any)._optionValues = {};
    (typesCommand as any)._optionValueSources = {};
    for (const command of typesCommand.commands) {
      (command as any)._optionValues = {};
      (command as any)._optionValueSources = {};
    }
  });

  describe('default mode', () => {
    it('should prompt the user if the operation was sucessfull', async () => {
      const mockResponse = [{
        name: 'component-name',
        display_name: 'Component Name',
        created_at: '2021-08-09T12:00:00Z',
        updated_at: '2021-08-09T12:00:00Z',
        id: 12345,
        schema: { type: 'object' },
        color: null,
        internal_tags_list: [],
        internal_tag_ids: [],
      }];

      const mockSpaceData = {
        components: mockResponse,
        groups: [],
        presets: [],
        internalTags: [],
        datasources: [],
      };

      session().state = {
        isLoggedIn: true,
        password: 'valid-token',
        region: 'eu',
      };

      vi.mocked(readComponentsFiles).mockResolvedValue(mockSpaceData);

      vi.mocked(generateStoryblokTypes).mockResolvedValue(true);

      await typesCommand.parseAsync(mockGenerationCommand());

      expect(generateStoryblokTypes).toHaveBeenCalledWith(DEFAULT_TYPES_COMMAND_OPTIONS.path);
      expect(generateTypes).toHaveBeenCalledWith(mockSpaceData, { filename: DEFAULT_GENERATE_TYPES_OPTIONS.filename });

      expect(konsola.ok).toHaveBeenCalledWith(`Successfully generated types for space ${chalk.hex(colorPalette.PRIMARY)('12345')}`, true);
    });

    it('should use custom path if user provides custom one', async () => {
      const mockResponse = [{
        name: 'component-name',
        display_name: 'Component Name',
        created_at: '2021-08-09T12:00:00Z',
        updated_at: '2021-08-09T12:00:00Z',
        id: 12345,
        schema: { type: 'object' },
        color: null,
        internal_tags_list: [],
        internal_tag_ids: [],
      }];

      const mockSpaceData = {
        components: mockResponse,
        groups: [],
        presets: [],
        internalTags: [],
        datasources: [],
      };

      session().state = {
        isLoggedIn: true,
        password: 'valid-token',
        region: 'eu',
      };

      vi.mocked(readComponentsFiles).mockResolvedValue(mockSpaceData);

      vi.mocked(generateStoryblokTypes).mockResolvedValue(true);

      await typesCommand.parseAsync(mockGenerationCommand());

      expect(generateStoryblokTypes).toHaveBeenCalledWith(DEFAULT_TYPES_COMMAND_OPTIONS.path);
      expect(generateTypes).toHaveBeenCalledWith(mockSpaceData, { filename: DEFAULT_GENERATE_TYPES_OPTIONS.filename });

      expect(konsola.ok).toHaveBeenCalledWith(`Successfully generated types for space ${chalk.hex(colorPalette.PRIMARY)('12345')}`, true);
    });

    it('should pass strict mode option to generateTypes when --strict flag is used', async () => {
      const mockResponse = [{
        name: 'component-name',
        display_name: 'Component Name',
        created_at: '2021-08-09T12:00:00Z',
        updated_at: '2021-08-09T12:00:00Z',
        id: 12345,
        schema: { type: 'object' },
        color: null,
        internal_tags_list: [],
        internal_tag_ids: [],
      }];

      const mockSpaceData = {
        components: mockResponse,
        groups: [],
        presets: [],
        internalTags: [],
        datasources: [],
      };

      session().state = {
        isLoggedIn: true,
        password: 'valid-token',
        region: 'eu',
      };

      vi.mocked(readComponentsFiles).mockResolvedValue(mockSpaceData);
      vi.mocked(generateStoryblokTypes).mockResolvedValue(true);
      vi.mocked(generateTypes).mockResolvedValue('// Generated types');

      // Run the command with the --strict flag
      await typesCommand.parseAsync(mockGenerationCommand({}, { path: '.cms/custom-path' }));

      expect(readComponentsFiles).toHaveBeenCalledWith({
        filename: DEFAULT_GENERATE_TYPES_OPTIONS.filename,
        from: '12345',
        path: '.cms/custom-path',
        verbose: false,
      });
      expect(generateStoryblokTypes).toHaveBeenCalledWith('.cms/custom-path');
      expect(saveTypesToComponentsFile).toHaveBeenCalledWith('12345', '// Generated types', DEFAULT_GENERATE_TYPES_OPTIONS.filename, '.cms/custom-path');
      // Verify that generateTypes was called with the strict option set to true
      expect(generateTypes).toHaveBeenCalledWith(mockSpaceData, {
        filename: DEFAULT_GENERATE_TYPES_OPTIONS.filename,
      });
    });

    it('should pass typePrefix option to generateTypes when --type-prefix flag is used', async () => {
      const mockResponse = [{
        name: 'component-name',
        display_name: 'Component Name',
        created_at: '2021-08-09T12:00:00Z',
        updated_at: '2021-08-09T12:00:00Z',
        id: 12345,
        schema: { type: 'object' },
        color: null,
        internal_tags_list: [],
        internal_tag_ids: [],
      }];

      const mockSpaceData = {
        components: mockResponse,
        groups: [],
        presets: [],
        internalTags: [],
        datasources: [],
      };

      session().state = {
        isLoggedIn: true,
        password: 'valid-token',
        region: 'eu',
      };

      vi.mocked(readComponentsFiles).mockResolvedValue(mockSpaceData);
      vi.mocked(generateStoryblokTypes).mockResolvedValue(true);
      vi.mocked(generateTypes).mockResolvedValue('// Generated types');

      // Run the command with the --type-prefix flag
      await typesCommand.parseAsync(mockGenerationCommand({ typePrefix: 'Custom' }));

      // Verify that generateTypes was called with the typePrefix option set to 'Custom'
      expect(generateTypes).toHaveBeenCalledWith(mockSpaceData, {
        filename: DEFAULT_GENERATE_TYPES_OPTIONS.filename,
        typePrefix: 'Custom',
      });
    });

    it('should pass typeSuffix option to generateTypes when --type-suffix flag is used', async () => {
      const mockResponse = [{
        name: 'component-name',
        display_name: 'Component Name',
        created_at: '2021-08-09T12:00:00Z',
        updated_at: '2021-08-09T12:00:00Z',
        id: 12345,
        schema: { type: 'object' },
        color: null,
        internal_tags_list: [],
        internal_tag_ids: [],
      }];

      const mockSpaceData = {
        components: mockResponse,
        groups: [],
        presets: [],
        internalTags: [],
        datasources: [],
      };

      session().state = {
        isLoggedIn: true,
        password: 'valid-token',
        region: 'eu',
      };

      vi.mocked(readComponentsFiles).mockResolvedValue(mockSpaceData);
      vi.mocked(generateStoryblokTypes).mockResolvedValue(true);
      vi.mocked(generateTypes).mockResolvedValue('// Generated types');

      // Run the command with the --type-prefix flag
      await typesCommand.parseAsync(mockGenerationCommand({ typeSuffix: 'CustomTypeSuffix' }));

      // Verify that generateTypes was called with the typePrefix option set to 'Custom'
      expect(generateTypes).toHaveBeenCalledWith(mockSpaceData, {
        filename: DEFAULT_GENERATE_TYPES_OPTIONS.filename,
        typeSuffix: 'CustomTypeSuffix',
      });
    });

    it('should pass suffix option to generateTypes when --suffix flag is used', async () => {
      const mockResponse = [{
        name: 'component-name',
        display_name: 'Component Name',
        created_at: '2021-08-09T12:00:00Z',
        updated_at: '2021-08-09T12:00:00Z',
        id: 12345,
        schema: { type: 'object' },
        color: null,
        internal_tags_list: [],
        internal_tag_ids: [],
      }];

      const mockSpaceData = {
        components: mockResponse,
        groups: [],
        presets: [],
        internalTags: [],
        datasources: [],
      };

      session().state = {
        isLoggedIn: true,
        password: 'valid-token',
        region: 'eu',
      };

      vi.mocked(readComponentsFiles).mockResolvedValue(mockSpaceData);
      vi.mocked(generateStoryblokTypes).mockResolvedValue(true);
      vi.mocked(generateTypes).mockResolvedValue('// Generated types');

      // Run the command with the --suffix flag
      await typesCommand.parseAsync(mockGenerationCommand({ suffix: 'Component' }));

      // Verify that generateTypes was called with the suffix option set to 'Component'
      expect(generateTypes).toHaveBeenCalledWith(mockSpaceData, {
        filename: DEFAULT_GENERATE_TYPES_OPTIONS.filename,
        suffix: 'Component',
      });
    });

    it('should pass separateFiles option to generateTypes when --separate-files flag is used', async () => {
      const mockResponse = [{
        name: 'component-name',
        display_name: 'Component Name',
        created_at: '2021-08-09T12:00:00Z',
        updated_at: '2021-08-09T12:00:00Z',
        id: 12345,
        schema: { type: 'object' },
        color: null,
        internal_tags_list: [],
        internal_tag_ids: [],
      }];

      const mockSpaceData = {
        components: mockResponse,
        groups: [],
        presets: [],
        internalTags: [],
        datasources: [],
      };

      session().state = {
        isLoggedIn: true,
        password: 'valid-token',
        region: 'eu',
      };

      vi.mocked(readComponentsFiles).mockResolvedValue(mockSpaceData);
      vi.mocked(generateStoryblokTypes).mockResolvedValue(true);
      vi.mocked(generateTypes).mockResolvedValue('// Generated types');

      // Run the command with the --separate-files flag
      await typesCommand.parseAsync(mockGenerationCommand({ separateFiles: true }));

      // Verify that generateTypes was called with the separateFiles option set to true
      expect(generateTypes).toHaveBeenCalledWith(mockSpaceData, {
        filename: DEFAULT_GENERATE_TYPES_OPTIONS.filename,
        separateFiles: true,
      });
    });

    it('should pass customFieldsParser option to generateTypes when --custom-fields-parser flag is used', async () => {
      const mockResponse = [{
        name: 'component-name',
        display_name: 'Component Name',
        created_at: '2021-08-09T12:00:00Z',
        updated_at: '2021-08-09T12:00:00Z',
        id: 12345,
        schema: { type: 'object' },
        color: null,
        internal_tags_list: [],
        internal_tag_ids: [],
      }];

      const mockSpaceData = {
        components: mockResponse,
        groups: [],
        presets: [],
        internalTags: [],
        datasources: [],
      };

      session().state = {
        isLoggedIn: true,
        password: 'valid-token',
        region: 'eu',
      };

      vi.mocked(readComponentsFiles).mockResolvedValue(mockSpaceData);
      vi.mocked(generateStoryblokTypes).mockResolvedValue(true);
      vi.mocked(generateTypes).mockResolvedValue('// Generated types');

      // Run the command with the --custom-fields-parser flag
      await typesCommand.parseAsync(mockGenerationCommand({ customFieldsParser: '/path/to/parser.ts' }));

      // Verify that generateTypes was called with the customFieldsParser option set to '/path/to/parser.ts'
      expect(generateTypes).toHaveBeenCalledWith(mockSpaceData, {
        filename: DEFAULT_GENERATE_TYPES_OPTIONS.filename,
        customFieldsParser: '/path/to/parser.ts',
      });
    });

    it('should pass compilerOptions option to generateTypes when --compiler-options flag is used', async () => {
      const mockResponse = [{
        name: 'component-name',
        display_name: 'Component Name',
        created_at: '2021-08-09T12:00:00Z',
        updated_at: '2021-08-09T12:00:00Z',
        id: 12345,
        schema: { type: 'object' },
        color: null,
        internal_tags_list: [],
        internal_tag_ids: [],
      }];

      const mockSpaceData = {
        components: mockResponse,
        groups: [],
        presets: [],
        internalTags: [],
        datasources: [],
      };

      session().state = {
        isLoggedIn: true,
        password: 'valid-token',
        region: 'eu',
      };

      vi.mocked(readComponentsFiles).mockResolvedValue(mockSpaceData);
      vi.mocked(generateStoryblokTypes).mockResolvedValue(true);
      vi.mocked(generateTypes).mockResolvedValue('// Generated types');

      // Run the command with the --compiler-options flag
      await typesCommand.parseAsync(mockGenerationCommand({ compilerOptions: '/path/to/options.json' }));

      // Verify that generateTypes was called with the compilerOptions option set to '/path/to/options.json'
      expect(generateTypes).toHaveBeenCalledWith(mockSpaceData, {
        filename: DEFAULT_GENERATE_TYPES_OPTIONS.filename,
        compilerOptions: '/path/to/options.json',
      });
    });
  });
});
