#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

// ── Colors ──────────────────────────────────────────────────────────────────

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

// ── Types ───────────────────────────────────────────────────────────────────

interface CliOptions {
  license: string;
  name: string;
  year: string;
  output: string;
  headers: string[];
  list: boolean;
  help: boolean;
  json: boolean;
  force: boolean;
}

// ── CLI Parsing ─────────────────────────────────────────────────────────────

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    license: "",
    name: "",
    year: new Date().getFullYear().toString(),
    output: "LICENSE",
    headers: [],
    list: false,
    help: false,
    json: false,
    force: false,
  };

  const args = argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case "--help":
      case "-h":
        opts.help = true;
        break;
      case "--json":
        opts.json = true;
        break;
      case "--list":
      case "-l":
        opts.list = true;
        break;
      case "--name":
      case "-n":
        opts.name = args[++i] || "";
        break;
      case "--year":
      case "-y":
        opts.year = args[++i] || new Date().getFullYear().toString();
        break;
      case "--output":
      case "-o":
        opts.output = args[++i] || "LICENSE";
        break;
      case "--headers":
        opts.headers = (args[++i] || "").split(",").filter(Boolean);
        break;
      case "--force":
      case "-f":
        opts.force = true;
        break;
      default:
        if (!arg.startsWith("-") && !opts.license) {
          opts.license = arg;
        }
        break;
    }
  }

  return opts;
}

// ── Help ────────────────────────────────────────────────────────────────────

function showHelp(): void {
  console.log(`
${c.bold}${c.cyan}license-gen${c.reset} - Generate LICENSE files for any OSI-approved license

${c.bold}USAGE${c.reset}
  ${c.green}license-gen${c.reset} <license-id> [options]

${c.bold}EXAMPLES${c.reset}
  ${c.dim}# Generate MIT license (auto-detects name from git config)${c.reset}
  license-gen mit

  ${c.dim}# Generate Apache 2.0 with specific name${c.reset}
  license-gen apache-2.0 --name "Jane Doe"

  ${c.dim}# Generate GPL-3.0 to a custom file${c.reset}
  license-gen gpl-3.0 --output COPYING

  ${c.dim}# Add SPDX headers to source files${c.reset}
  license-gen mit --headers "src/**/*.ts,src/**/*.js"

  ${c.dim}# List all available licenses${c.reset}
  license-gen --list

${c.bold}OPTIONS${c.reset}
  ${c.yellow}-h, --help${c.reset}               Show this help message
  ${c.yellow}-l, --list${c.reset}               List all available license IDs
  ${c.yellow}-n, --name <name>${c.reset}        Copyright holder name
  ${c.yellow}-y, --year <year>${c.reset}        Copyright year (default: current year)
  ${c.yellow}-o, --output <file>${c.reset}      Output filename (default: LICENSE)
  ${c.yellow}--headers <globs>${c.reset}        Add SPDX headers to source files (comma-separated globs)
  ${c.yellow}-f, --force${c.reset}              Overwrite existing LICENSE file
  ${c.yellow}--json${c.reset}                   Output license info as JSON

${c.bold}SUPPORTED LICENSES${c.reset}
  MIT, Apache-2.0, GPL-3.0, GPL-2.0, BSD-2-Clause, BSD-3-Clause,
  ISC, MPL-2.0, LGPL-3.0, AGPL-3.0, Unlicense, CC0-1.0, 0BSD
`);
}

// ── Auto-detect name ────────────────────────────────────────────────────────

function detectName(): string {
  // Try git config
  try {
    const name = execSync("git config user.name 2>/dev/null", {
      encoding: "utf-8",
    }).trim();
    if (name) return name;
  } catch {}

  // Try package.json
  try {
    const pkgPath = path.join(process.cwd(), "package.json");
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      if (typeof pkg.author === "string" && pkg.author) return pkg.author;
      if (pkg.author?.name) return pkg.author.name;
    }
  } catch {}

  return "Your Name";
}

// ── License Templates ───────────────────────────────────────────────────────

interface LicenseInfo {
  name: string;
  spdx: string;
  osiApproved: boolean;
  template: (name: string, year: string) => string;
}

const LICENSES: Record<string, LicenseInfo> = {
  mit: {
    name: "MIT License",
    spdx: "MIT",
    osiApproved: true,
    template: (name, year) => `MIT License

Copyright (c) ${year} ${name}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`,
  },
  "apache-2.0": {
    name: "Apache License 2.0",
    spdx: "Apache-2.0",
    osiApproved: true,
    template: (name, year) => `                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work.

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to the Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by the Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding any notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   Copyright ${year} ${name}

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
`,
  },
  "gpl-3.0": {
    name: "GNU General Public License v3.0",
    spdx: "GPL-3.0-only",
    osiApproved: true,
    template: (name, year) => `GNU GENERAL PUBLIC LICENSE
Version 3, 29 June 2007

Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
Everyone is permitted to copy and distribute verbatim copies
of this license document, but changing it is not allowed.

Copyright (c) ${year} ${name}

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
`,
  },
  "gpl-2.0": {
    name: "GNU General Public License v2.0",
    spdx: "GPL-2.0-only",
    osiApproved: true,
    template: (name, year) => `GNU GENERAL PUBLIC LICENSE
Version 2, June 1991

Copyright (C) 1989, 1991 Free Software Foundation, Inc.
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA

Copyright (c) ${year} ${name}

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along
with this program; if not, write to the Free Software Foundation, Inc.,
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
`,
  },
  "bsd-2-clause": {
    name: "BSD 2-Clause \"Simplified\" License",
    spdx: "BSD-2-Clause",
    osiApproved: true,
    template: (name, year) => `BSD 2-Clause License

Copyright (c) ${year}, ${name}
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
`,
  },
  "bsd-3-clause": {
    name: "BSD 3-Clause \"New\" or \"Revised\" License",
    spdx: "BSD-3-Clause",
    osiApproved: true,
    template: (name, year) => `BSD 3-Clause License

Copyright (c) ${year}, ${name}
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
`,
  },
  isc: {
    name: "ISC License",
    spdx: "ISC",
    osiApproved: true,
    template: (name, year) => `ISC License

Copyright (c) ${year} ${name}

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
`,
  },
  "mpl-2.0": {
    name: "Mozilla Public License 2.0",
    spdx: "MPL-2.0",
    osiApproved: true,
    template: (name, year) => `Mozilla Public License Version 2.0
==================================

Copyright (c) ${year} ${name}

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
`,
  },
  "lgpl-3.0": {
    name: "GNU Lesser General Public License v3.0",
    spdx: "LGPL-3.0-only",
    osiApproved: true,
    template: (name, year) => `GNU LESSER GENERAL PUBLIC LICENSE
Version 3, 29 June 2007

Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>

Copyright (c) ${year} ${name}

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
`,
  },
  "agpl-3.0": {
    name: "GNU Affero General Public License v3.0",
    spdx: "AGPL-3.0-only",
    osiApproved: true,
    template: (name, year) => `GNU AFFERO GENERAL PUBLIC LICENSE
Version 3, 19 November 2007

Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>

Copyright (c) ${year} ${name}

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
`,
  },
  unlicense: {
    name: "The Unlicense",
    spdx: "Unlicense",
    osiApproved: true,
    template: () => `This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <https://unlicense.org>
`,
  },
  "cc0-1.0": {
    name: "Creative Commons Zero v1.0 Universal",
    spdx: "CC0-1.0",
    osiApproved: false,
    template: (name, year) => `CC0 1.0 Universal

Statement of Purpose

Copyright (c) ${year} ${name}

The person who associated a work with this deed has dedicated the work to the
public domain by waiving all of his or her rights to the work worldwide under
copyright law, including all related and neighboring rights, to the extent
allowed by law.

You can copy, modify, distribute and perform the work, even for commercial
purposes, all without asking permission.

For more information, see <https://creativecommons.org/publicdomain/zero/1.0/>
`,
  },
  "0bsd": {
    name: "Zero-Clause BSD",
    spdx: "0BSD",
    osiApproved: true,
    template: (name, year) => `Zero-Clause BSD
=============

Copyright (c) ${year} ${name}

Permission to use, copy, modify, and/or distribute this software for
any purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL
WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES
OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE
FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY
DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN
AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT
OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
`,
  },
};

// ── SPDX Headers ────────────────────────────────────────────────────────────

function addSPDXHeaders(
  globs: string[],
  spdx: string,
  name: string,
  year: string
): number {
  let count = 0;
  const header = `// SPDX-License-Identifier: ${spdx}\n// Copyright (c) ${year} ${name}\n\n`;

  for (const glob of globs) {
    const files = simpleGlob(glob, process.cwd());
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, "utf-8");
        if (content.includes("SPDX-License-Identifier")) continue;

        // Handle shebang
        if (content.startsWith("#!")) {
          const newlineIdx = content.indexOf("\n");
          const shebang = content.substring(0, newlineIdx + 1);
          const rest = content.substring(newlineIdx + 1);
          fs.writeFileSync(file, shebang + "\n" + header + rest);
        } else {
          fs.writeFileSync(file, header + content);
        }
        count++;
      } catch {
        // Skip files we can't read
      }
    }
  }

  return count;
}

function simpleGlob(pattern: string, baseDir: string): string[] {
  const results: string[] = [];
  const parts = pattern.split("/");

  function walk(dir: string, depth: number): void {
    if (depth >= parts.length) return;

    const part = parts[depth];
    const isLast = depth === parts.length - 1;

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (part === "**") {
          if (entry.isDirectory()) {
            walk(path.join(dir, entry.name), depth);
            walk(path.join(dir, entry.name), depth + 1);
          } else if (isLast || depth + 1 === parts.length - 1) {
            const nextPart = parts[depth + 1] || part;
            if (matchWildcard(entry.name, nextPart)) {
              results.push(path.join(dir, entry.name));
            }
          }
        } else if (matchWildcard(entry.name, part)) {
          if (isLast && entry.isFile()) {
            results.push(path.join(dir, entry.name));
          } else if (entry.isDirectory()) {
            walk(path.join(dir, entry.name), depth + 1);
          }
        }
      }
    } catch {
      // Skip dirs we can't read
    }
  }

  walk(baseDir, 0);
  return results;
}

function matchWildcard(str: string, pattern: string): boolean {
  const regex = new RegExp(
    "^" +
      pattern
        .replace(/[.+^${}()|[\]\\]/g, "\\$&")
        .replace(/\*/g, ".*")
        .replace(/\?/g, ".") +
      "$"
  );
  return regex.test(str);
}

// ── List Licenses ───────────────────────────────────────────────────────────

function listLicenses(json: boolean): void {
  const licenses = Object.entries(LICENSES).map(([id, info]) => ({
    id,
    name: info.name,
    spdx: info.spdx,
    osiApproved: info.osiApproved,
  }));

  if (json) {
    console.log(JSON.stringify(licenses, null, 2));
    return;
  }

  console.log(
    `\n${c.bold}${c.magenta}📄 Available Licenses${c.reset}\n`
  );

  const idWidth = 16;
  const nameWidth = 45;

  console.log(
    `  ${c.bold}${pad("ID", idWidth)}  ${pad("NAME", nameWidth)}  OSI${c.reset}`
  );
  console.log(`  ${c.dim}${"─".repeat(idWidth + nameWidth + 8)}${c.reset}`);

  for (const lic of licenses) {
    const osi = lic.osiApproved ? `${c.green}Yes${c.reset}` : `${c.dim}No${c.reset}`;
    console.log(
      `  ${c.cyan}${pad(lic.id, idWidth)}${c.reset}  ${pad(lic.name, nameWidth)}  ${osi}`
    );
  }

  console.log("");
}

function pad(s: string, len: number): string {
  return s.length >= len ? s.substring(0, len) : s + " ".repeat(len - s.length);
}

// ── Main ────────────────────────────────────────────────────────────────────

function main(): void {
  const opts = parseArgs(process.argv);

  if (opts.help) {
    showHelp();
    process.exit(0);
  }

  if (opts.list) {
    listLicenses(opts.json);
    process.exit(0);
  }

  if (!opts.license) {
    showHelp();
    process.exit(1);
  }

  const licenseKey = opts.license.toLowerCase();
  const license = LICENSES[licenseKey];

  if (!license) {
    console.error(
      `\n${c.red}Unknown license: "${opts.license}"${c.reset}`
    );
    console.error(
      `${c.dim}Run ${c.cyan}license-gen --list${c.dim} to see available licenses.${c.reset}\n`
    );
    process.exit(1);
  }

  // Auto-detect name if not provided
  const authorName = opts.name || detectName();
  const text = license.template(authorName, opts.year);

  // Check if file exists
  const outputPath = path.resolve(opts.output);
  if (fs.existsSync(outputPath) && !opts.force) {
    console.error(
      `\n${c.yellow}${opts.output} already exists. Use --force to overwrite.${c.reset}\n`
    );
    process.exit(1);
  }

  if (opts.json) {
    console.log(
      JSON.stringify(
        {
          license: license.spdx,
          name: license.name,
          author: authorName,
          year: opts.year,
          file: opts.output,
          content: text,
        },
        null,
        2
      )
    );
    return;
  }

  // Write license file
  fs.writeFileSync(outputPath, text);
  console.log(
    `\n${c.green}${c.bold}✓${c.reset} Generated ${c.cyan}${opts.output}${c.reset} with ${c.bold}${license.name}${c.reset}`
  );
  console.log(
    `  ${c.dim}Copyright (c) ${opts.year} ${authorName}${c.reset}`
  );
  console.log(`  ${c.dim}SPDX: ${license.spdx}${c.reset}`);

  // Add SPDX headers if requested
  if (opts.headers.length > 0) {
    const count = addSPDXHeaders(opts.headers, license.spdx, authorName, opts.year);
    console.log(
      `  ${c.green}${c.bold}✓${c.reset} Added SPDX headers to ${c.bold}${count}${c.reset} file${count !== 1 ? "s" : ""}`
    );
  }

  console.log("");
}

main();
