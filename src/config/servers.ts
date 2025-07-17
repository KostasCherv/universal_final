import { ServerConfig } from '../types';
import { serverConfig } from './index';

export const servers: ServerConfig[] = [
  {
    name: 'server1',
    port: serverConfig.server1.port,
    apiKey: serverConfig.server1.apiKey,
    url: serverConfig.server1.url
  },
  {
    name: 'server2',
    port: serverConfig.server2.port,
    apiKey: serverConfig.server2.apiKey,
    url: serverConfig.server2.url
  },
];

export const getServerConfig = (serverName: string): ServerConfig | undefined => {
  return servers.find(server => server.name === serverName);
};