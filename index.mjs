import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as nt from 'node-smb-server/lib/ntlm.js';
import SMBServer from 'node-smb-server/lib/smbserver.js';

const defaults = {
  allowAnonymous: false,
  smb2Support: false,
  extendedSecurity: true,
};

const manager = {
  configPath: join(process.cwd(), 'config.json'),

  start() {
    const config = manager.loadConfig();
    return new Promise((resolve, reject) => {
      if (manager.server) {
        manager.stop();
      }

      const port = config.port || 445;
      const host = config.host || '0.0.0.0';
      const server = new SMBServer(config, null);

      server.start(port, host, () => resolve());
      server.on('error', reject);

      manager.server = server;
    });
  },

  stop() {
    if (manager.server) {
      manager.server.stop();
      manager.server = null;
    }
  },

  loadConfigFile() {
    const config = JSON.parse(readFileSync(this.configPath).toString('utf-8'));
    config.shares = config.shares || {};
    config.users = config.users || {};
    return { ...config, ...defaults };
  },

  loadConfig() {
    const config = this.loadConfigFile();

    Object.keys(config.shares).forEach((name) => {
      const share = config.shares[name];
      share.path = join(process.cwd(), share.path);
    });

    return config;
  },

  saveConfig(config) {
    return writeFileSync(this.configPath, JSON.stringify(config, null, 2));
  },

  addUser({ name, password }) {
    const user = {
      [name]: this.createHash({ password }),
    };

    const config = this.loadConfigFile();
    Object.assign(config.users, user);
    this.saveConfig(config);
  },

  removeUser({ name }) {
    const config = this.loadConfigFile();
    delete config.users[name];
    this.saveConfig(config);
  },

  addShare({ name, path }) {
    const share = {
      [name]: {
        backend: 'fs',
        description: 'folder',
        path,
      },
    };

    const config = this.loadConfigFile();
    Object.assign(config.shares, share);
    this.saveConfig(config);
  },

  removeShare({ name }) {
    const config = this.loadConfigFile();
    delete config.shares[name];
    this.saveConfig(config);
  },

  configure({ host, port, domainName = 'USERS' }) {
    const config = this.loadConfigFile();
    Object.assign(config, { host, port, domainName });
    this.saveConfig(config);
  },

  createHash({ password }) {
    return {
      lmHash: nt.lm.createHash(password).toString('hex'),
      ntlmHash: nt.ntlm.createHash(password).toString('hex'),
    };
  },
};

export default {
  start() {
    return manager.start();
  },

  stop() {
    return manager.stop();
  },

  reload() {
    this.stop();
    return this.start();
  },

  createHash(args) {
    return manager.createHash(args);
  },

  addUser(args) {
    return manager.addUser(args);
  },

  removeUser(args) {
    return manager.removeUser(args);
  },

  addShare(args) {
    return manager.addShare(args);
  },

  removeShare(args) {
    return manager.removeShare(args);
  },

  configure(args) {
    return manager.configure(args);
  },
};
