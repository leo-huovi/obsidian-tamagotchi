import esbuild from "esbuild";
import fs from 'fs';
import path from 'path';



// Build process
const build = async () => {
    await esbuild.build({
        entryPoints: ['main.ts'],
        bundle: true,
        external: ['obsidian'],
        format: 'cjs',
        target: 'es2016',
        logLevel: "info",
        sourcemap: 'inline',
        treeShaking: true,
        outfile: 'main.js'
    });

};

build().catch(() => process.exit(1));
