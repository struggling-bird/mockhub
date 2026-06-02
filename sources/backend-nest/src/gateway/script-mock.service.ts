import { BadRequestException, Injectable } from '@nestjs/common';
import { Script, createContext, type RunningScriptOptions } from 'node:vm';

export interface ScriptMockRequest {
  method: string;
  path: string;
  url: string;
  headers: Record<string, any>;
  query: Record<string, string | string[]>;
  body: any;
  bodyText: string | null;
}

export interface ScriptMockResult {
  status: number;
  headers: Record<string, string>;
  body: Buffer;
}

interface ResponseState {
  status: number;
  headers: Record<string, string>;
  body: any;
  delayMs: number;
}

@Injectable()
export class ScriptMockService {
  private readonly timeoutMs = 500;
  private readonly maxDelayMs = 5000;

  async execute(scriptCode: string | null | undefined, request: ScriptMockRequest): Promise<ScriptMockResult> {
    const code = (scriptCode || '').trim();
    if (!code) {
      throw new BadRequestException('Script mock code is empty');
    }

    const state: ResponseState = {
      status: 200,
      headers: {},
      body: null,
      delayMs: 0,
    };

    const response = this.createResponseHelper(state);
    const returned = this.runScript(code, {
      request,
      response,
      req: request,
      res: response,
      utils: this.createUtils(),
    });
    if (returned !== undefined) {
      state.body = returned;
    }

    if (state.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, state.delayMs));
    }

    return this.toResult(state);
  }

  private runScript(code: string, sandboxValues: Record<string, any>) {
    const normalizedCode = this.normalizeCode(code);
    const sandbox = {
      ...sandboxValues,
      module: { exports: undefined as any },
      exports: undefined as any,
    };
    sandbox.exports = sandbox.module.exports;

    try {
      const context = createContext(sandbox, {
        codeGeneration: {
          strings: false,
          wasm: false,
        },
      });
      return new Script(
        `${normalizedCode}\n` +
          `if (typeof module.exports !== 'function') { throw new Error('Script mock must export a function'); }\n` +
          `module.exports(request, response);`,
      ).runInContext(context, {
          timeout: this.timeoutMs,
          microtaskMode: 'afterEvaluate',
        } as RunningScriptOptions & { microtaskMode: 'afterEvaluate' });
    } catch (error) {
      throw new BadRequestException(this.formatError('Script mock execution failed', error));
    }
  }

  private normalizeCode(code: string) {
    const trimmed = code.trim();
    if (/export\s+default\s+function/.test(trimmed)) {
      return trimmed.replace(/export\s+default\s+function/, 'module.exports = function');
    }
    if (/export\s+default\s+/.test(trimmed)) {
      return trimmed.replace(/export\s+default\s+/, 'module.exports = ');
    }
    if (/module\.exports\s*=/.test(trimmed)) {
      return trimmed;
    }
    return `module.exports = function(request, response) {\n${trimmed}\n}`;
  }

  private createResponseHelper(state: ResponseState) {
    const helper = {
      status: (statusCode: number) => {
        if (!Number.isInteger(statusCode) || statusCode < 100 || statusCode > 599) {
          throw new Error('Response status must be an HTTP status code');
        }
        state.status = statusCode;
        return helper;
      },
      setHeader: (key: string, value: any) => {
        if (!key || typeof key !== 'string') {
          throw new Error('Response header key is required');
        }
        state.headers[key] = String(value ?? '');
        return helper;
      },
      header: (key: string, value: any) => helper.setHeader(key, value),
      json: (body: any) => {
        state.headers['content-type'] = state.headers['content-type'] || 'application/json; charset=utf-8';
        state.body = body;
        return body;
      },
      text: (body: any) => {
        state.headers['content-type'] = state.headers['content-type'] || 'text/plain; charset=utf-8';
        state.body = body === undefined || body === null ? '' : String(body);
        return state.body;
      },
      body: (body: any) => {
        state.body = body;
        return body;
      },
      delay: (delayMs: number) => {
        const nextDelay = Number(delayMs);
        if (!Number.isFinite(nextDelay) || nextDelay < 0) {
          throw new Error('Response delay must be a positive number');
        }
        state.delayMs = Math.min(Math.round(nextDelay), this.maxDelayMs);
        return helper;
      },
    };

    return helper;
  }

  private createUtils() {
    return Object.freeze({
      randomInt: (min: number, max: number) => {
        const low = Math.ceil(Number(min));
        const high = Math.floor(Number(max));
        if (!Number.isFinite(low) || !Number.isFinite(high) || low > high) {
          throw new Error('randomInt requires min <= max');
        }
        return Math.floor(Math.random() * (high - low + 1)) + low;
      },
      now: () => Date.now(),
    });
  }

  private toResult(state: ResponseState): ScriptMockResult {
    const body = state.body === undefined || state.body === null ? {} : state.body;
    const hasJsonHeader = Object.keys(state.headers).some((key) => key.toLowerCase() === 'content-type');
    if (Buffer.isBuffer(body)) {
      return {
        status: state.status,
        headers: state.headers,
        body,
      };
    }

    if (typeof body === 'string') {
      return {
        status: state.status,
        headers: hasJsonHeader ? state.headers : { 'content-type': 'text/plain; charset=utf-8', ...state.headers },
        body: Buffer.from(body, 'utf8'),
      };
    }

    return {
      status: state.status,
      headers: hasJsonHeader ? state.headers : { 'content-type': 'application/json; charset=utf-8', ...state.headers },
      body: Buffer.from(JSON.stringify(body), 'utf8'),
    };
  }

  private formatError(message: string, error: unknown) {
    if (error instanceof Error && error.message) {
      return `${message}: ${error.message}`;
    }
    return message;
  }
}
