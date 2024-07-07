import { getRequestHeaders, main_api } from '../../../../script.js';
import { POPUP_RESULT, POPUP_TYPE, Popup } from '../../../popup.js';
import { executeSlashCommandsWithOptions } from '../../../slash-commands.js';
import { SlashCommand } from '../../../slash-commands/SlashCommand.js';
import { ARGUMENT_TYPE, SlashCommandArgument } from '../../../slash-commands/SlashCommandArgument.js';
import { SlashCommandEnumValue } from '../../../slash-commands/SlashCommandEnumValue.js';
import { SlashCommandParser } from '../../../slash-commands/SlashCommandParser.js';
import { quickReplyApi } from '../../quick-reply/index.js';
import { FileExplorer } from '../SillyTavern-FileExplorer/src/FileExplorer.js';
import { FilesApi } from './lib/FilesApi.js';
import { BgContentItem } from './src/BgContentItem.js';
import { CharContentItem } from './src/CharContentItem.js';
import { ContentItem } from './src/ContentItem.js';
import { Package } from './src/Package.js';
import { PackageEditor } from './src/PackageEditor.js';

const packageList = [];
const updatePackageList = async()=>{
    while (packageList.pop());
    const items = await FilesApi.list('~/user/packages', { extensions:['json'] });
    for (const item of items) {
        if (item.type == 'file') {
            const name = item.path.replace(/(\.stpkg)?\.json$/, '');
            if (!packageList.includes(name)) {
                packageList.push(name);
            }
        }
    }
};
await updatePackageList();

SlashCommandParser.addCommandObject(SlashCommand.fromProps({ name: 'package-export',
    callback: async()=>{
        const editor = new PackageEditor();
        const SAVE_ONLY = 100;
        const dlg = new Popup(await editor.render(), POPUP_TYPE.CONFIRM, null, {
            okButton:'Create Package',
            cancelButton:'Cancel',
            wider: true,
            large: true,
            allowVerticalScrolling: true,
            customButtons: [
                {
                    text: 'Save Only',
                    result: SAVE_ONLY,
                },
            ],
        });
        const prom = dlg.show();
        await prom;
        if (dlg.result == POPUP_RESULT.AFFIRMATIVE) {
            await editor.save();
        } else if (dlg.result == SAVE_ONLY) {
            await editor.save(false);
        }
        await updatePackageList();
        return '';
    },
    helpString: 'Create and export a new package (keeps a local copy of the manifest for later editing).',
}));

SlashCommandParser.addCommandObject(SlashCommand.fromProps({ name: 'package-edit',
    callback: async(args, value)=>{
        let path = `~/user/packages/${value}.json`;
        if (!await FilesApi.exists(path)) {
            path = `~/user/packages/${value}.stpkg.json`;
            if (!await FilesApi.exists(path)) {
                throw new Error(`Package "${value}" not found.`);
            }
        }
        const manifest = await FilesApi.getJson(path);
        const pkg = new Package(manifest);
        await pkg.load();
        console.log(pkg);
        const SAVE_ONLY = 100;
        const dlg = new Popup(await pkg.editor.render(), POPUP_TYPE.CONFIRM, null, {
            okButton:'Create Package',
            cancelButton:'Cancel',
            wider: true,
            large: true,
            allowVerticalScrolling: true,
            customButtons: [
                {
                    text: 'Save Only',
                    result: SAVE_ONLY,
                },
            ],
        });
        const prom = dlg.show();
        await prom;
        if (dlg.result == POPUP_RESULT.AFFIRMATIVE) {
            await pkg.editor.save();
        } else if (dlg.result == SAVE_ONLY) {
            await pkg.editor.save(false);
        }
        await updatePackageList();
        return '';
    },
    unnamedArgumentList: [
        SlashCommandArgument.fromProps({ description: 'package name',
            typeList: [ARGUMENT_TYPE.STRING],
            isRequired: true,
            enumProvider: ()=>packageList.map(it=>new SlashCommandEnumValue(it)),
        }),
    ],
    helpString: 'Edit previously exported package (based on local package manifest).',
}));

SlashCommandParser.addCommandObject(SlashCommand.fromProps({ name: 'package-load',
    callback: async(args, value)=>{
        {
            const response = await fetch('api/plugins/files/exists', {
                method: 'POST',
                headers: getRequestHeaders(),
                body: JSON.stringify({
                    path: '~/user/packages',
                }),
            });
            const exists = await response.json();
            if (!exists) {
                await fetch('api/plugins/files/put', {
                    method: 'POST',
                    headers: getRequestHeaders(),
                    body: JSON.stringify({
                        path: '~/user/packages/touch',
                        file: 'data:text/plain;base64,Lg==', // text file with one "."
                    }),
                });
                await fetch('api/plugins/files/delete', {
                    method: 'POST',
                    headers: getRequestHeaders(),
                    body: JSON.stringify({
                        path: '~/user/packages/touch',
                    }),
                });
            }
        }
        const fe = new FileExplorer('~/user/packages');
        fe.isFixedPath = true;
        fe.isFixedRoot = true;
        fe.isPicker = true;
        fe.isSingleSelect = true;
        fe.extensionList = ['stpkg'];
        await fe.show();
        if (fe.selection) {
            const response = await fetch('api/plugins/files/get', {
                method: 'POST',
                headers: getRequestHeaders(),
                body: JSON.stringify({
                    path: `~${fe.selection}`,
                }),
            });
            const blob = await response.blob();
            const pkg = new Package(blob);
            await pkg.load();
            console.log(pkg);
            //TODO show package load / import dialog
            //TODO list content, pick and choose what to import
            //TODO ask how to handle conflicts: overwrite / skip (/ rename?)
        }
        await updatePackageList();
        return '';
    },
    helpString: 'Load / import a package file.',
}));

SlashCommandParser.addCommandObject(SlashCommand.fromProps({ name: 'package-activate',
    callback: async(args, value)=>{
        let manifest;
        if (await FilesApi.exists(`~/user/packages/${value}.json`)) {
            // saved package (manifest only)
            manifest = await FilesApi.getJson(`~/user/packages/${value}.json`);
        } else if (await FilesApi.exists(`~/user/packages/${value}.stpkg.json`)) {
            // imported package (extracted manifest)
            manifest = await FilesApi.getJson(`~/user/packages/${value}.stpkg.json`);
        } else {
            throw new Error(`No package found named "${value}"`);
        }
        console.log(manifest);
        toastr.info(`${manifest.name}${manifest.version ? ` <small>v${manifest.version}</small>` : ''}${manifest.author ? `<br><small>by ${manifest.author}</small>` : ''}`, 'Activating Package', { escapeHtml:false });
        const contents = [];
        if (manifest.worldInfo?.length) {
            const cmd = [
                '/world silent=true',
                ...manifest.worldInfo.filter(it=>it.isActive).map(it=>`/world silent=true ${it.name}`),
            ].join(' | ');
            contents.push({ type:'World Info', items:manifest.worldInfo.filter(it=>it.isActive).map(it=>it.name) });
            await executeSlashCommandsWithOptions(cmd);
        }
        if (manifest.quickReplySets?.length) {
            for (const qrs of quickReplyApi.listGlobalSets()) {
                quickReplyApi.removeGlobalSet(qrs);
            }
            for (const qrs of manifest.quickReplySets.filter(it=>it.isActive)) {
                quickReplyApi.addGlobalSet(qrs.name);
            }
            contents.push({ type:'Quick Reply Sets', items:manifest.quickReplySets.filter(it=>it.isActive).map(it=>it.name) });
        }
        switch (main_api) {
            case 'openai': {
                if (manifest.chatCompletion?.length) {
                    const preset = manifest.chatCompletion.find(it=>it.isActive);
                    if (preset) {
                        await executeSlashCommandsWithOptions(`/preset ${preset.name}`);
                        contents.push({ type:'Preset', items:[preset.name] });
                    }
                }
                break;
            }
            case 'kobold': {
                if (manifest.koboldAi?.length) {
                    const preset = manifest.koboldAi.find(it=>it.isActive);
                    if (preset) {
                        await executeSlashCommandsWithOptions(`/preset ${preset.name}`);
                        contents.push({ type:'Preset', items:[preset.name] });
                    }
                }
                break;
            }
            case 'novel': {
                if (manifest.nai?.length) {
                    const preset = manifest.nai.find(it=>it.isActive);
                    if (preset) {
                        await executeSlashCommandsWithOptions(`/preset ${preset.name}`);
                        contents.push({ type:'Preset', items:[preset.name] });
                    }
                }
                break;
            }
            case 'textgenerationwebui': {
                if (manifest.textGen?.length) {
                    const preset = manifest.textGen.find(it=>it.isActive);
                    if (preset) {
                        await executeSlashCommandsWithOptions(`/preset ${preset.name}`);
                        contents.push({ type:'Preset', items:[preset.name] });
                    }
                }
                break;
            }
        }
        if (manifest.context?.length) {
            const preset = manifest.context.find(it=>it.isActive);
            if (preset) {
                await executeSlashCommandsWithOptions(`/context ${preset.name}`);
                contents.push({ type:'Context', items:[preset.name] });
            }
        }
        if (manifest.instruct?.length) {
            const preset = manifest.instruct.find(it=>it.isActive);
            if (preset) {
                await executeSlashCommandsWithOptions(`/instruct ${preset.name}`);
                contents.push({ type:'Instruct', items:[preset.name] });
            }
        }
        const toast = [
            `${manifest.name}${manifest.version ? ` <small>v${manifest.version}</small>` : ''}${manifest.author ? `<br><small>by ${manifest.author}</small>` : ''}`,
            '<hr>',
            '<ul>',
            ...contents.map(it=>[
                `<li>${it.type}<ul>`,
                ...it.items.map(item=>`<li>${item}</li>`),
                '</ul></li>',
            ]).flat(),
        ].join('');
        toastr.success(toast, 'Activated Package', { escapeHtml:false });
        //TODO warn about missing content? ask to re-import?
        return '';
    },
    unnamedArgumentList: [
        SlashCommandArgument.fromProps({ description: 'package name',
            typeList: [ARGUMENT_TYPE.STRING],
            isRequired: true,
            enumProvider: ()=>packageList.map(it=>new SlashCommandEnumValue(it)),
        }),
    ],
    helpString: 'Activate a previously imported or saved package (QRs, WI, presets, ...).',
}));
