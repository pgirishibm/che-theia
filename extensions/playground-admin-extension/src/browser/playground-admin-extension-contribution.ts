import { injectable, inject } from "inversify";
import { CommandContribution, CommandRegistry, MenuContribution, MenuModelRegistry, MessageService } from "@theia/core/lib/common";
import { CommonMenus } from "@theia/core/lib/browser";

export const PlaygroundAdminExtensionCommand = {
    id: 'PlaygroundAdminExtension.command',
    label: "Say Hello"
};

@injectable()
export class PlaygroundAdminExtensionCommandContribution implements CommandContribution {

    constructor(
        @inject(MessageService) private readonly messageService: MessageService,
    ) { }

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(PlaygroundAdminExtensionCommand, {
            execute: () => this.messageService.info('Hello World!')
        });
    }
}

@injectable()
export class PlaygroundAdminExtensionMenuContribution implements MenuContribution {
    registerMenus(menus: MenuModelRegistry): void {
        menus.unregisterMenuAction(CommonMenus.HELP.slice(-1)[0]);
        menus.registerMenuAction(CommonMenus.EDIT_FIND, {
            commandId: PlaygroundAdminExtensionCommand.id,
            label: PlaygroundAdminExtensionCommand.label
        });
    }
}
