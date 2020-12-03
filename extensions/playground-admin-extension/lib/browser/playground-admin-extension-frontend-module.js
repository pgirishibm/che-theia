"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Generated using theia-extension-generator
 */
var playground_admin_extension_contribution_1 = require("./playground-admin-extension-contribution");
var common_1 = require("@theia/core/lib/common");
var inversify_1 = require("inversify");
exports.default = new inversify_1.ContainerModule(function (bind) {
    // add your contribution bindings here
    bind(common_1.CommandContribution).to(playground_admin_extension_contribution_1.PlaygroundAdminExtensionCommandContribution);
    bind(common_1.MenuContribution).to(playground_admin_extension_contribution_1.PlaygroundAdminExtensionMenuContribution);
});
//# sourceMappingURL=playground-admin-extension-frontend-module.js.map