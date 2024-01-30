"use strict";
// This file should be committed to your repository! It wraps Nx and ensures
// that your local installation matches nx.json.
// See: https://nx.dev/more-concepts/encapsulated-nx-and-the-wrapper for more info.




Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const installationPath = path.join(__dirname, 'installation', 'package.json');
function matchesCurrentNxInstall(nxJsonInstallation) {
    try {
        const currentInstallation = require(installationPath);
        if (currentInstallation.devDependencies['nx'] !==
            nxJsonInstallation.version ||
            require(path.join(path.dirname(installationPath), 'node_modules', 'nx', 'package.json')).version !== nxJsonInstallation.version) {
            return false;
        }
        for (const [plugin, desiredVersion] of Object.entries(nxJsonInstallation.plugins || {})) {
            if (currentInstallation.devDependencies[plugin] !== desiredVersion) {
                return false;
            }
        }
        return true;
    }
    catch (_a) {
        return false;
    }
}
function ensureDir(p) {
    if (!fs.existsSync(p)) {
        fs.mkdirSync(p, { recursive: true });
    }
}
function ensureUpToDateInstallation() {
    const nxJsonPath = path.join(__dirname, '..', 'nx.json');
    let nxJson;
    try {
        nxJson = require(nxJsonPath);
    }
    catch (_a) {
        console.error('[NX]: nx.json is required when running in encapsulated mode. Run `npx nx init --encapsulated` to restore it.');
        process.exit(1);
    }
    try {
        ensureDir(path.join(__dirname, 'installation'));
        if (!matchesCurrentNxInstall(nxJson.installation)) {
            fs.writeFileSync(installationPath, JSON.stringify({
                name: 'nx-installation',
                devDependencies: Object.assign({ nx: nxJson.installation.version }, nxJson.installation.plugins),
            }));
            cp.execSync('npm i --legacy-peer-deps', {
                cwd: path.dirname(installationPath),
                stdio: 'inherit',
            });
        }
    }
    catch (e) {
        console.error('[NX]: Nx wrapper failed to synchronize installation.');
        console.error(e.stack);
        process.exit(1);
    }
}
if (require.main === module) {
    ensureUpToDateInstallation();
    require('./installation/node_modules/nx/bin/nx');
}
