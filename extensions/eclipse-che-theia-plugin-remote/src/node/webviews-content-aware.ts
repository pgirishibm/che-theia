/**********************************************************************
 * Copyright (c) 2020 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ***********************************************************************/

import * as theia from '@theia/plugin';

import { WebviewImpl, WebviewsExtImpl } from '@theia/plugin-ext/lib/plugin/webviews';

import { Plugin } from '@theia/plugin-ext/src/common/plugin-api-rpc';
import { Uri } from '@theia/plugin';
import { overrideUri } from './che-content-aware-utils';

export class RemoteWebview extends WebviewImpl {}

export class WebviewsContentAware {
  static makeWebviewsContentAware(webviewExt: WebviewsExtImpl): void {
    const webviewsContentAware = new WebviewsContentAware();
    console.log('>>>>>>>>>>>>>>>> WebviewsContentAware create');
    webviewsContentAware.overrideCreateWebview(webviewExt);
  }

  overrideCreateWebview(webviewExt: WebviewsExtImpl): void {
    console.log('>>>>>>>>>>>>>>>> overrideCreateWebview call');
    const originalCreateWebview = webviewExt.createWebview.bind(webviewExt);
    // const createWebview = (
    //   viewType: string,
    //   title: string,
    //   showOptions: theia.ViewColumn | theia.WebviewPanelShowOptions,
    //   options: theia.WebviewPanelOptions & theia.WebviewOptions,
    //   plugin: Plugin
    // ) =>
    //   originalCreateWebview(viewType, title, showOptions, WebviewsContentAware.modifyWebviewOptions(options), plugin);
    const createWebview = (
      viewType: string,
      title: string,
      showOptions: theia.ViewColumn | theia.WebviewPanelShowOptions,
      options: theia.WebviewPanelOptions & theia.WebviewOptions,
      plugin: Plugin
    ) => {
      const webviewPanel: theia.WebviewPanel = originalCreateWebview(
        viewType,
        title,
        showOptions,
        WebviewsContentAware.modifyWebviewOptions(options),
        plugin
      );
      const originalAsWebviewUri = webviewPanel.webview.asWebviewUri.bind(webviewPanel);
      const asWebviewUri = (localResource: Uri) => {
        console.log('>>>>>>>>> modify method asWebviewUri');
        return originalAsWebviewUri(overrideUri(localResource));
      };

      webviewPanel.webview.asWebviewUri = asWebviewUri;

      return webviewPanel;
    };
    webviewExt.createWebview = createWebview;
  }

  private static modifyWebviewOptions(
    options: theia.WebviewPanelOptions & theia.WebviewOptions
  ): theia.WebviewPanelOptions & theia.WebviewOptions {
    console.log('>>>>>>>>>>>>>>>> modifyWebviewOptions call with options: ' + JSON.stringify(options));
    const localResourceRoots: readonly theia.Uri[] | undefined = options.localResourceRoots;

    if (localResourceRoots === undefined) {
      return options;
    }

    return {
      enableFindWidget: options.enableFindWidget,
      retainContextWhenHidden: options.retainContextWhenHidden,
      enableScripts: options.enableScripts,
      enableCommandUris: options.enableCommandUris,
      localResourceRoots: WebviewsContentAware.overrideLocalResourceRoots(localResourceRoots),
      portMapping: options.portMapping,
    } as theia.WebviewPanelOptions & theia.WebviewOptions;
  }

  private static overrideLocalResourceRoots(roots: readonly theia.Uri[]): theia.Uri[] {
    console.log('>>>>>>>>>>>>>>>> overrideLocalResourceRoots call');
    const modifiedLocalResourceRoots: theia.Uri[] = [];
    for (let i = 0; i < roots.length; i++) {
      modifiedLocalResourceRoots.push(overrideUri(roots[i]));
    }
    console.log('>>>>>>>>>>>>>>>> overrideLocalResourceRoots new opts: ' + JSON.stringify(modifiedLocalResourceRoots));
    return modifiedLocalResourceRoots;
  }
}
