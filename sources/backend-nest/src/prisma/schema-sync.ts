import mariadb from 'mariadb';

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  allowPublicKeyRetrieval?: boolean;
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
        auto_capture TINYINT(1) NULL,
        cookie_rewrite_mode VARCHAR(50) NULL,
        cookie_rewrite_domain VARCHAR(255) NULL,
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
    await addColumnIfMissing(
      conn,
      'ALTER TABLE projects ADD COLUMN auto_capture TINYINT(1) NULL',
    );
    await addColumnIfMissing(
      conn,
      'ALTER TABLE projects ADD COLUMN cookie_rewrite_mode VARCHAR(50) NULL',
    );
    await addColumnIfMissing(
      conn,
      'ALTER TABLE projects ADD COLUMN cookie_rewrite_domain VARCHAR(255) NULL',
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

    await conn.query(`
      CREATE TABLE IF NOT EXISTS request_logs (
        id            VARCHAR(50)  NOT NULL PRIMARY KEY,
        project_id    VARCHAR(50)  NOT NULL,
        api_id        VARCHAR(50)  NULL,
        method        VARCHAR(20)  NOT NULL,
        path          VARCHAR(512) NOT NULL,
        mode          VARCHAR(50)  NULL,
        status_code   INT          NOT NULL,
        duration_ms   INT          NOT NULL,
        error_message TEXT         NULL,
        created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_request_logs_project_created_at (project_id, created_at),
        INDEX idx_request_logs_api_id (api_id),
        CONSTRAINT fk_request_logs_project
          FOREIGN KEY (project_id) REFERENCES projects(id)
          ON DELETE CASCADE,
        CONSTRAINT fk_request_logs_api
          FOREIGN KEY (api_id) REFERENCES project_apis(id)
          ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS proxy_groups (
        id           VARCHAR(50)  NOT NULL PRIMARY KEY,
        project_id   VARCHAR(50)  NOT NULL,
        name         VARCHAR(255) NOT NULL,
        regex        VARCHAR(512) NOT NULL,
        mode         VARCHAR(50)  NOT NULL,
        target_url   VARCHAR(512) NULL,
        priority     INT          NOT NULL DEFAULT 100,
        enabled      TINYINT(1)   NOT NULL DEFAULT 1,
        auto_capture TINYINT(1)   NOT NULL DEFAULT 0,
        created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_proxy_groups_project_id (project_id),
        INDEX idx_proxy_groups_project_enabled_priority (project_id, enabled, priority),
        CONSTRAINT fk_proxy_groups_project
          FOREIGN KEY (project_id) REFERENCES projects(id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS project_roles (
        id          VARCHAR(50)  NOT NULL PRIMARY KEY,
        project_id  VARCHAR(50)  NOT NULL,
        role_key    VARCHAR(50)  NOT NULL,
        name        VARCHAR(100) NOT NULL,
        description VARCHAR(255) NULL,
        system_role TINYINT(1)   NOT NULL DEFAULT 0,
        locked      TINYINT(1)   NOT NULL DEFAULT 0,
        sort_order  INT          NOT NULL DEFAULT 0,
        created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_project_roles_project_key (project_id, role_key),
        INDEX idx_project_roles_project_id (project_id),
        CONSTRAINT fk_project_roles_project
          FOREIGN KEY (project_id) REFERENCES projects(id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS project_role_permissions (
        id             VARCHAR(50)  NOT NULL PRIMARY KEY,
        project_id     VARCHAR(50)  NOT NULL,
        role           VARCHAR(50)  NOT NULL,
        permission_key VARCHAR(100) NOT NULL,
        enabled        TINYINT(1)   NOT NULL DEFAULT 1,
        created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_project_role_permissions (project_id, role, permission_key),
        INDEX idx_project_role_permissions_project_id (project_id),
        CONSTRAINT fk_project_role_permissions_project
          FOREIGN KEY (project_id) REFERENCES projects(id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS project_members (
        id          VARCHAR(50)  NOT NULL PRIMARY KEY,
        project_id  VARCHAR(50)  NOT NULL,
        user_id     VARCHAR(50)  NOT NULL,
        role        VARCHAR(50)  NOT NULL,
        status      VARCHAR(50)  NOT NULL DEFAULT 'Active',
        created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_project_members_project_user (project_id, user_id),
        INDEX idx_project_members_user_id (user_id),
        INDEX idx_project_members_project_id (project_id),
        CONSTRAINT fk_project_members_project
          FOREIGN KEY (project_id) REFERENCES projects(id)
          ON DELETE CASCADE,
        CONSTRAINT fk_project_members_user
          FOREIGN KEY (user_id) REFERENCES users(id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS project_invitations (
        id            VARCHAR(50)  NOT NULL PRIMARY KEY,
        project_id    VARCHAR(50)  NOT NULL,
        email         VARCHAR(255) NOT NULL,
        role          VARCHAR(50)  NOT NULL,
        token         VARCHAR(128) NOT NULL UNIQUE,
        status        VARCHAR(50)  NOT NULL DEFAULT 'Pending',
        invited_by_id VARCHAR(50)  NOT NULL,
        expires_at    TIMESTAMP    NOT NULL,
        accepted_at   TIMESTAMP    NULL,
        created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_project_invitations_project_id (project_id),
        INDEX idx_project_invitations_email (email),
        INDEX idx_project_invitations_status (status),
        CONSTRAINT fk_project_invitations_project
          FOREIGN KEY (project_id) REFERENCES projects(id)
          ON DELETE CASCADE,
        CONSTRAINT fk_project_invitations_invited_by
          FOREIGN KEY (invited_by_id) REFERENCES users(id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS public_assets (
        id          VARCHAR(50)  NOT NULL PRIMARY KEY,
        project_id  VARCHAR(50)  NOT NULL,
        name        VARCHAR(255) NOT NULL,
        value       TEXT         NOT NULL,
        type        VARCHAR(50)  NOT NULL,
        category    VARCHAR(255) NOT NULL,
        created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_public_assets_project_id (project_id),
        CONSTRAINT fk_public_assets_project
          FOREIGN KEY (project_id) REFERENCES projects(id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } finally {
    await conn.end();
  }
}
