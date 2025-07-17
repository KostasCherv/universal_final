import { PoolConfig } from "pg";
import { databaseConfig } from "./index";

export const baseConfig1: Omit<PoolConfig, 'database'> = {
  host: databaseConfig.server1.host,
  port: databaseConfig.server1.port,
  user: databaseConfig.server1.user,
  password: databaseConfig.server1.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const baseConfig2: Omit<PoolConfig, 'database'> = {
  host: databaseConfig.server2.host,
  port: databaseConfig.server2.port,
  user: databaseConfig.server2.user,
  password: databaseConfig.server2.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};
