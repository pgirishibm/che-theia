/**********************************************************************
 * Copyright (c) 2018-2020 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ***********************************************************************/
import { CheSideCarFileSystem, PLUGIN_RPC_CONTEXT } from '../common/che-protocol';

import { RPCProtocol } from '@theia/plugin-ext/lib/common/rpc-protocol';
import { URI } from 'vscode-uri';
import { promisify } from 'util';
import { readFile } from 'fs';

export enum FileSystemProviderErrorCode {
  FileExists = 'EntryExists',
  FileNotFound = 'EntryNotFound',
  FileNotADirectory = 'EntryNotADirectory',
  FileIsADirectory = 'EntryIsADirectory',
  FileExceedsMemoryLimit = 'EntryExceedsMemoryLimit',
  FileTooLarge = 'EntryTooLarge',
  NoPermissions = 'NoPermissions',
  Unavailable = 'Unavailable',
  Unknown = 'Unknown',
}

export class FileSystemProviderError extends Error {
  constructor(message: string, public readonly code: FileSystemProviderErrorCode) {
    super(message);
    Object.setPrototypeOf(this, FileSystemProviderError.prototype);
  }
}

export function markAsFileSystemProviderError(error: Error, code: FileSystemProviderErrorCode): Error {
  error.name = code ? `${code} (FileSystemError)` : 'FileSystemError';

  return error;
}

export function createFileSystemProviderError(
  error: Error | string,
  code: FileSystemProviderErrorCode
): FileSystemProviderError {
  const providerError = new FileSystemProviderError(error.toString(), code);
  markAsFileSystemProviderError(providerError, code);

  return providerError;
}

export class CheSideCarFileSystemImpl implements CheSideCarFileSystem {
  constructor(rpc: RPCProtocol) {
    const delegate = rpc.getProxy(PLUGIN_RPC_CONTEXT.CHE_SIDECAR_FILE_SYSTEM_MAIN);
    const machineName = process.env.CHE_MACHINE_NAME;
    if (machineName) {
      delegate.$registerFileSystemProvider(`file-sidecar-${machineName}`);
    }
  }

  $delete(resource: string, opts: { recursive: boolean; useTrash: boolean }): Promise<void> {
    return Promise.reject('Not implemented.');
  }

  $mkdir(resource: string): Promise<void> {
    return Promise.reject('Not implemented.');
  }

  async $readFile(resource: string): Promise<Uint8Array> {
    const _uri = URI.parse(resource);
    try {
      return await promisify(readFile)(_uri.fsPath);
    } catch (error) {
      return Promise.reject(this.toFileSystemProviderError(error));
    }
  }

  $readdir(resource: string): Promise<[string, string][]> {
    return Promise.reject('Not implemented.');
  }

  $rename(from: string, to: string, opts: { overwrite: boolean }): Promise<void> {
    return Promise.reject('Not implemented.');
  }

  $writeFile(resource: string, content: Uint8Array, opts: { overwrite: boolean; create: boolean }): Promise<void> {
    return Promise.reject('Not implemented.');
  }

  private toFileSystemProviderError(error: NodeJS.ErrnoException): FileSystemProviderError {
    if (error instanceof FileSystemProviderError) {
      return error; // avoid double conversion
    }

    let code: FileSystemProviderErrorCode;
    switch (error.code) {
      case 'ENOENT':
        code = FileSystemProviderErrorCode.FileNotFound;
        break;
      case 'EISDIR':
        code = FileSystemProviderErrorCode.FileIsADirectory;
        break;
      case 'ENOTDIR':
        code = FileSystemProviderErrorCode.FileNotADirectory;
        break;
      case 'EEXIST':
        code = FileSystemProviderErrorCode.FileExists;
        break;
      case 'EPERM':
      case 'EACCES':
        code = FileSystemProviderErrorCode.NoPermissions;
        break;
      default:
        code = FileSystemProviderErrorCode.Unknown;
    }

    return createFileSystemProviderError(error, code);
  }
}
