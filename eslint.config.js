import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import importX from 'eslint-plugin-import-x'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import security from 'eslint-plugin-security'
import sonarjs from 'eslint-plugin-sonarjs'
import unicorn from 'eslint-plugin-unicorn'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    { ignores: ['dist/**', 'node_modules/**', '.cache/**'] },
    js.configs.recommended,
    {
        files: ['**/*.js'],
        languageOptions: { globals: globals.node },
    },
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            ...tseslint.configs.strictTypeChecked,
            ...tseslint.configs.stylisticTypeChecked,
            importX.flatConfigs.recommended,
            importX.flatConfigs.typescript,
            jsxA11y.flatConfigs.strict,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
            security.configs.recommended,
            sonarjs.configs.recommended,
            unicorn.configs.recommended,
        ],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
            globals: { ...globals.browser, ...globals.node },
        },
        settings: {
            'import-x/resolver': { typescript: true },
        },
        rules: {
            'import-x/order': [
                'error',
                { 'newlines-between': 'always', alphabetize: { order: 'asc' } },
            ],
            '@typescript-eslint/consistent-type-imports': 'error',
        },
    },
    prettier,
)
