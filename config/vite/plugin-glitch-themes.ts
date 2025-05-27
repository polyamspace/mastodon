/* This plugins handles glitch-soc's specific theming system
 */

import fs from 'node:fs/promises';
import path from 'node:path';

import glob from 'fast-glob';
import yaml from 'js-yaml';
import type { Plugin } from 'vite';

interface Flavour {
  pack_directory: string;
}

export function GlitchThemes(): Plugin {
  return {
    name: 'glitch-themes',
    async config(userConfig) {
      const entrypoints: Record<string, string> = {};

      if (!userConfig.root || !userConfig.envDir) {
        throw new Error('Unknown project directory');
      }

      const glitchFlavourFiles = glob.sync(
        path.resolve(userConfig.root, 'flavours/*/theme.yml'),
      );

      const disabled_skins = (process.env.DISABLED_SKINS ?? '')
        .split(/\s*,\s*/)
        .filter((s) => !['application', 'mastodon-light'].includes(s));

      for (const flavourFile of glitchFlavourFiles) {
        const flavourName = path.basename(path.dirname(flavourFile));

        // Polyam: Skip vanilla unless enabled
        if (flavourName === 'vanilla' && process.env.ENABLE_VANILLA !== 'true') {
          continue;
        }

        const flavourString = await fs.readFile(flavourFile, 'utf8');
        const flavourDef = yaml.load(flavourString, {
          filename: 'theme.yml',
          schema: yaml.FAILSAFE_SCHEMA,
        }) as Flavour;

        const flavourEntrypoints = glob.sync(
          `${flavourDef.pack_directory}/*.{ts,tsx,js,jsx}`,
        );
        for (const entrypoint of flavourEntrypoints) {
          const name = `${flavourName}/${path.basename(entrypoint)}`;
          entrypoints[name] = path.resolve(userConfig.envDir, entrypoint);
        }

        // Skins
        // TODO: handle variants such as `skin/common.scss`
        const skinFiles = glob.sync(
          `app/javascript/skins/${flavourName}/*.scss`,
        );
        for (const entrypoint of skinFiles) {
          // Polyam: Skip disabled skins
          if (disabled_skins.includes(path.basename(entrypoint, '.scss'))) {
            continue;
          }

          const name = `skins/${flavourName}/${path.basename(entrypoint)}`;
          entrypoints[name] = path.resolve(userConfig.envDir, entrypoint);
        }
      }

      return {
        build: {
          rollupOptions: {
            input: entrypoints,
          },
        },
      };
    },
  };
}
