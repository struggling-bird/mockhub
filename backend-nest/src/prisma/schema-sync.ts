import mariadb from 'mariadb';

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

async function addColumnIfMissing(conn: mariadb.Connection, sql: string) {
  try {
    await conn.query(sql);
  } catch (error: any) {
    if (error?.code !== 'ER_DUP_FIELDNAME') {
      throw error;
    }
  }
}

export async function ensureDatabaseSchema(config: DatabaseConfig) {
  const conn = await mariadb.createConnection(config);

  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         VARCHAR(50)  NOT NULL PRIMARY KEY,
        email      VARCHAR(255) NOT NULL UNIQUE,
        password   VARCHAR(255) NOT NULL,
        username   VARCHAR(255) NULL,
        company    VARCHAR(255) NULL,
        created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await addColumnIfMissing(
      conn,
      'ALTER TABLE users ADD COLUMN username VARCHAR(255) NULL',
    );
    await addColumnIfMissing(
      conn,
      'ALTER TABLE users ADD COLUMN company VARCHAR(255) NULL',
    );
    await addColumnIfMissing(
      conn,
      'ALTER TABLE users ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    );

    await conn.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id          VARCHAR(50)  NOT NULL PRIMARY KEY,
        name        VARCHAR(255) NOT NULL,
        description TEXT         NULL,
        owner_id    VARCHAR(50)  NOT NULL,
        logo_url    VARCHAR(512) NULL,
        proxy_url   VARCHAR(512) NULL,
        mock_key    VARCHAR(64)  NULL UNIQUE,
        default_mock_mode VARCHAR(50) NULL,
        created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_projects_owner
          FOREIGN KEY (owner_id) REFERENCES users(id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await addColumnIfMissing(
      conn,
      'ALTER TABLE projects ADD COLUMN logo_url VARCHAR(512) NULL',
    );
    await addColumnIfMissing(
      conn,
      'ALTER TABLE projects ADD COLUMN proxy_url VARCHAR(512) NULL',
    );
    await addColumnIfMissing(
      conn,
      'ALTER TABLE projects ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    );
    await addColumnIfMissing(
      conn,
      'ALTER TABLE projects ADD COLUMN mock_key VARCHAR(64) NULL UNIQUE',
    );
    await addColumnIfMissing(
      conn,
      'ALTER TABLE projects ADD COLUMN default_mock_mode VARCHAR(50) NULL',
    );

    await conn.query(`
      CREATE TABLE IF NOT EXISTS project_apis (
        id          VARCHAR(50)  NOT NULL PRIMARY KEY,
        project_id  VARCHAR(50)  NOT NULL,
        name        VARCHAR(255) NOT NULL,
        path        VARCHAR(512) NOT NULL,
        method      VARCHAR(20)  NOT NULL,
        status      VARCHAR(50)  NOT NULL DEFAULT 'New',
        request_headers   MEDIUMTEXT NULL,
        request_params    MEDIUMTEXT NULL,
        response_headers  MEDIUMTEXT NULL,
        response_schema   MEDIUMTEXT NULL,
        mock_static_body  MEDIUMTEXT NULL,
        mock_script       MEDIUMTEXT NULL,
        mock_mode         VARCHAR(50) NULL,
        mock_proxy_url    VARCHAR(512) NULL,
        created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_project_apis_project
          FOREIGN KEY (project_id) REFERENCES projects(id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await addColumnIfMissing(
      conn,
      'ALTER TABLE project_apis ADD COLUMN request_headers MEDIUMTEXT NULL',
    );
    await addColumnIfMissing(
      conn,
      'ALTER TABLE project_apis ADD COLUMN request_params MEDIUMTEXT NULL',
    );
    await addColumnIfMissing(
      conn,
      'ALTER TABLE project_apis ADD COLUMN response_headers MEDIUMTEXT NULL',
    );
    await addColumnIfMissing(
      conn,
      'ALTER TABLE project_apis ADD COLUMN response_schema MEDIUMTEXT NULL',
    );
    await addColumnIfMissing(
      conn,
      'ALTER TABLE project_apis ADD COLUMN mock_static_body MEDIUMTEXT NULL',
    );
    await addColumnIfMissing(
      conn,
      'ALTER TABLE project_apis ADD COLUMN mock_script MEDIUMTEXT NULL',
    );
    await addColumnIfMissing(
      conn,
      'ALTER TABLE project_apis ADD COLUMN mock_mode VARCHAR(50) NULL',
    );
    await addColumnIfMissing(
      conn,
      'ALTER TABLE project_apis ADD COLUMN mock_proxy_url VARCHAR(512) NULL',
    );
  } finally {
    await conn.end();
  }
}

