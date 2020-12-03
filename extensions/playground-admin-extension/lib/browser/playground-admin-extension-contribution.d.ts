import { CommandContribution, CommandRegistry, MenuContribution, MenuModelRegistry, MessageService } from "@theia/core/lib/common";
export declare const PlaygroundAdminExtensionCommand: {
    id: string;
    label: string;
};
export declare class PlaygroundAdminExtensionCommandContribution implements CommandContribution {
    private readonly messageService;
    constructor(messageService: MessageService);
    registerCommands(registry: CommandRegistry): void;
}
export declare class PlaygroundAdminExtensionMenuContribution implements MenuContribution {
    registerMenus(menus: MenuModelRegistry): void;
}
//# sourceMappingURL=playground-admin-extension-contribution.d.ts.map