/**********************************************************************
 * Copyright (c) 2020 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ***********************************************************************/

import { CheSideCarFileSystem, CheSideCarFileSystemMain, PLUGIN_RPC_CONTEXT } from '../common/che-protocol';
import { Disposable, Emitter, Event } from '@theia/core/lib/common';
import {
  FileChange,
  FileDeleteOptions,
  FileOverwriteOptions,
  FileSystemProviderCapabilities,
  FileSystemProviderWithFileReadWriteCapability,
  FileType,
  FileWriteOptions,
} from '@theia/filesystem/lib/common/files';
import { Stat, WatchOptions } from '@theia/filesystem/lib/common/files';

import { FileService } from '@theia/filesystem/lib/browser/file-service';
import { RPCProtocol } from '@theia/plugin-ext/lib/common/rpc-protocol';
import URI from '@theia/core/lib/common/uri';
import { interfaces } from 'inversify';

export class CheSideCarFileSystemMainImpl implements CheSideCarFileSystemMain {
  private readonly registrations = new Map<string, Disposable>();
  private readonly delegate: CheSideCarFileSystem;
  private readonly fileService: FileService;

  constructor(container: interfaces.Container, rpc: RPCProtocol) {
    this.delegate = rpc.getProxy(PLUGIN_RPC_CONTEXT.CHE_SIDECAR_FILE_SYSTEM);
    this.fileService = container.get(FileService);
    // this.registry = container.get(CheSideCarContentReaderRegistry);
  }

  $disposeFileSystemProvider(scheme: string): Promise<void> {
    const disposable = this.registrations.get(scheme);
    if (disposable !== undefined) {
      disposable.dispose();
      this.registrations.delete(scheme);
    }
    return Promise.resolve(undefined);
  }

  $registerFileSystemProvider(scheme: string): Promise<void> {
    const provider = new CheSideCarFileSystemProvider(this.delegate, FileSystemProviderCapabilities.FileReadWrite);
    const disposable = this.fileService.registerProvider(scheme, provider);
    this.registrations.set(scheme, disposable);
    return Promise.resolve(undefined);
  }
}

type IDisposable = Disposable;

export class CheSideCarFileSystemProvider implements FileSystemProviderWithFileReadWriteCapability {
  private readonly _onDidChange = new Emitter<readonly FileChange[]>();
  // private readonly _registration: Disposable;
  private readonly delegate: CheSideCarFileSystem;

  readonly onDidChangeFile: Event<readonly FileChange[]> = this._onDidChange.event;
  readonly onFileWatchError: Event<void> = new Emitter<void>().event;

  readonly capabilities: FileSystemProviderCapabilities;
  readonly onDidChangeCapabilities: Event<void> = Event.None;

  constructor(delegate: CheSideCarFileSystem, capabilities: FileSystemProviderCapabilities) {
    this.capabilities = capabilities;
    this.delegate = delegate;
    // this._registration = fileService.registerProvider(scheme, this);
  }

  watch(resource: URI, opts: WatchOptions): IDisposable {
    throw new Error('Not implemented');
  }

  stat(resource: URI): Promise<Stat> {
    throw new Error('Not implemented');
  }

  async mkdir(resource: URI): Promise<void> {
    return await this.delegate.$mkdir(resource.toString());
  }

  async readdir(resource: URI): Promise<[string, FileType][]> {
    const rawResult = await this.delegate.$readdir(resource.toString());
    return rawResult.map(value => [][{} as FileType]); // Todo rework mapping
  }

  async delete(resource: URI, opts: FileDeleteOptions): Promise<void> {
    return await this.delegate.$delete(resource.toString(), { recursive: opts.recursive, useTrash: opts.useTrash });
  }

  async rename(from: URI, to: URI, opts: FileOverwriteOptions): Promise<void> {
    return await this.delegate.$rename(from.toString(), to.toString(), { overwrite: opts.overwrite });
  }

  async readFile(resource: URI): Promise<Uint8Array> {
    return await this.delegate.$readFile(resource.toString());
  }

  async writeFile(resource: URI, content: Uint8Array, opts: FileWriteOptions): Promise<void> {
    return await this.delegate.$writeFile(resource.toString(), content, {
      overwrite: opts.overwrite,
      create: opts.create,
    });
  }
}