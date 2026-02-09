# @lxgicstudios/license-gen

[![npm version](https://img.shields.io/npm/v/@lxgicstudios/license-gen.svg)](https://www.npmjs.com/package/@lxgicstudios/license-gen)
[![license](https://img.shields.io/npm/l/@lxgicstudios/license-gen.svg)](https://github.com/lxgicstudios/license-gen/blob/main/LICENSE)
[![node](https://img.shields.io/node/v/@lxgicstudios/license-gen.svg)](https://nodejs.org)

Generate LICENSE files for any OSI-approved license right from your terminal. Supports MIT, Apache-2.0, GPL-3.0, BSD, ISC, and more. Auto-fills your name and year from git config.

Zero external dependencies.

## Install

```bash
npm install -g @lxgicstudios/license-gen
```

Or run it directly:

```bash
npx @lxgicstudios/license-gen mit
```

## Usage

```bash
# Generate MIT license (auto-detects name from git config)
license-gen mit

# Generate Apache 2.0 with a specific name
license-gen apache-2.0 --name "Jane Doe"

# Generate GPL-3.0 to a custom file
license-gen gpl-3.0 --output COPYING

# Add SPDX headers to source files
license-gen mit --headers "src/**/*.ts,src/**/*.js"

# List all available licenses
license-gen --list

# Overwrite existing LICENSE
license-gen bsd-3-clause --force

# JSON output
license-gen mit --json
```

## Features

- 13 built-in license templates (MIT, Apache-2.0, GPL-3.0, BSD, ISC, and more)
- Auto-detects author name from git config and package.json
- Auto-fills current year
- Add SPDX license headers to source files with `--headers`
- Custom output filename
- JSON output for scripting
- Lists all available licenses with `--list`
- Zero external dependencies

## Supported Licenses

| ID | Name | OSI |
|----|------|-----|
| `mit` | MIT License | Yes |
| `apache-2.0` | Apache License 2.0 | Yes |
| `gpl-3.0` | GNU General Public License v3.0 | Yes |
| `gpl-2.0` | GNU General Public License v2.0 | Yes |
| `bsd-2-clause` | BSD 2-Clause License | Yes |
| `bsd-3-clause` | BSD 3-Clause License | Yes |
| `isc` | ISC License | Yes |
| `mpl-2.0` | Mozilla Public License 2.0 | Yes |
| `lgpl-3.0` | GNU Lesser General Public License v3.0 | Yes |
| `agpl-3.0` | GNU Affero General Public License v3.0 | Yes |
| `unlicense` | The Unlicense | Yes |
| `cc0-1.0` | Creative Commons Zero v1.0 | No |
| `0bsd` | Zero-Clause BSD | Yes |

## Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--help` | `-h` | Show help message | |
| `--list` | `-l` | List all available licenses | |
| `--name <name>` | `-n` | Copyright holder name | auto-detect |
| `--year <year>` | `-y` | Copyright year | current year |
| `--output <file>` | `-o` | Output filename | `LICENSE` |
| `--headers <globs>` | | Add SPDX headers to files | |
| `--force` | `-f` | Overwrite existing LICENSE | `false` |
| `--json` | | Output as JSON | `false` |

## License

MIT - [LXGIC Studios](https://github.com/lxgicstudios)
