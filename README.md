# Makitso plugin

Manage your 2FA VPN connections with Tunnelblick or Viscosity

A tool to make it just a little easier to connect to a VPN which requires that
the pasword be a concatination of a static password and a 2FA token.

## Provides Commands

Command                     | Description
----------------------------|---------------------------------
`vpn connect <name> <token>`| Connect to VPN
`vpn disconnect <name>`     | Disconnect from VPN
`vpn status`                | List connections and their state

```bash
yarn add makitso-vpn-plugin
```
```js
"use strict";
const Makitso = require("makitso");
const VPN = require("makitso-vpn-plugin");

// const vpn = VPN.plugin({ client: "tunnelblick" });
const vpn = VPN.plugin({ client: "viscosity" });

Makitso({ plugins: [Makitso.Plugins(), vpn] }).catch(console.error);
```

