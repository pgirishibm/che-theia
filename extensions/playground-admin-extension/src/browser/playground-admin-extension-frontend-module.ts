/**
 * Generated using theia-extension-generator
 */
import { PlaygroundAdminExtensionCommandContribution, PlaygroundAdminExtensionMenuContribution } from './playground-admin-extension-contribution';
import {
    CommandContribution,
    MenuContribution
} from "@theia/core/lib/common";
import { ContainerModule } from "inversify";

export default new ContainerModule(bind => {
    // add your contribution bindings here
    bind(CommandContribution).to(PlaygroundAdminExtensionCommandContribution);
    bind(MenuContribution).to(PlaygroundAdminExtensionMenuContribution);
});
