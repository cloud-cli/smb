# smb

Minimal SMB Server using [node-smb-server](https://www.npmjs.com/package/node-smb-server) module.

## Usage

```js
import smb from '@cloud-cli/smb';

const user = 'john';
const passwrd = 'test';
const share = 'smb-name';
const path = 'smb-folder';

smb.addUser({ name, password });
smb.addShare({ name, path });
smb.removeUser({ name });
smb.removeShare({ name });
smb.configure({ host: '', port: 8445 });
smb.stop();
smb.start();
smb.reload(); // same as stop + start
```

## Known issues

While adding an user, this error can happen:
https://stackoverflow.com/questions/69692842/error-message-error0308010cdigital-envelope-routinesunsupported

Other errors are likely caused by an incomplete SMB implementation provided by `node-smb-server`
