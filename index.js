import { characters, getRequestHeaders } from '../../../../script.js';
import { AutoComplete } from '../../../autocomplete/AutoComplete.js';
import { AutoCompleteNameResult } from '../../../autocomplete/AutoCompleteNameResult.js';
import { AutoCompleteOption } from '../../../autocomplete/AutoCompleteOption.js';
import { extensionNames } from '../../../extensions.js';
import { groups } from '../../../group-chats.js';
import { POPUP_RESULT, POPUP_TYPE, Popup } from '../../../popup.js';
import { SlashCommand } from '../../../slash-commands/SlashCommand.js';
import { commonEnumProviders, enumIcons } from '../../../slash-commands/SlashCommandCommonEnumsProvider.js';
import { enumTypes } from '../../../slash-commands/SlashCommandEnumValue.js';
import { SlashCommandParser } from '../../../slash-commands/SlashCommandParser.js';
import { quickReplyApi } from '../../quick-reply/index.js';
import { getRegexScripts } from '../../regex/index.js';
import { ContentAutoCompleteOption } from './src/autocomplete/ContentAutoCompleteOption.js';
import { BgContentItem } from './src/BgContentItem.js';
import { CharContentItem } from './src/CharContentItem.js';
import { ContentItem } from './src/ContentItem.js';
import { ContentSection } from './src/ContentSection.js';
import { GroupContentItem } from './src/GroupContentItem.js';

SlashCommandParser.addCommandObject(SlashCommand.fromProps({ name: 'package-export',
    callback: async()=>{
        let meta = {
            /**@type {HTMLInputElement} */
            name: null,
            /**@type {HTMLInputElement} */
            author: null,
            /**@type {HTMLInputElement} */
            version: null,
        };
        let sections = {
            /**@type {ContentSection} */
            characters: null,
            /**@type {ContentSection} */
            groups: null,
            /**@type {ContentSection} */
            worldInfo: null,
            /**@type {ContentSection} */
            quickReply: null,
            /**@type {ContentSection} */
            regex: null,
            /**@type {ContentSection} */
            background: null,
            /**@type {ContentSection} */
            asset: null,
            /**@type {ContentSection} */
            chatCompletion: null,
            /**@type {ContentSection} */
            koboldAi: null,
            /**@type {ContentSection} */
            nai: null,
            /**@type {ContentSection} */
            textGen: null,
            /**@type {ContentSection} */
            context: null,
            /**@type {ContentSection} */
            instruct: null,
        };
        const dom = document.createElement('div'); {
            dom.classList.add('stpkg--export');
            const head = document.createElement('h3'); {
                head.textContent = 'Package Exporter';
                dom.append(head);
            }
            const body = document.createElement('div'); {
                body.classList.add('stpkg--body');
                { // info
                    const section = document.createElement('div'); {
                        section.classList.add('stpkg--section');
                        section.classList.add('stpkg--info');
                        const content = document.createElement('div'); {
                            content.classList.add('stpkg--content');
                            const name = document.createElement('label'); {
                                name.classList.add('stpkg--input');
                                name.classList.add('stpkg--name');
                                name.textContent = 'Name: ';
                                const inp = document.createElement('input'); {
                                    meta.name = inp;
                                    inp.classList.add('text_pole');
                                    inp.placeholder = 'Package Name / File Name';
                                    inp.title = inp.placeholder;
                                    name.append(inp);
                                }
                                content.append(name);
                            }
                            const author = document.createElement('label'); {
                                author.classList.add('stpkg--input');
                                author.classList.add('stpkg--author');
                                author.textContent = 'Author: ';
                                const inp = document.createElement('input'); {
                                    meta.author = inp;
                                    inp.classList.add('text_pole');
                                    inp.placeholder = 'Package Author';
                                    inp.title = inp.placeholder;
                                    author.append(inp);
                                }
                                content.append(author);
                            }
                            const version = document.createElement('label'); {
                                version.classList.add('stpkg--input');
                                version.classList.add('stpkg--version');
                                version.textContent = 'Version: ';
                                const inp = document.createElement('input'); {
                                    meta.version = inp;
                                    inp.classList.add('text_pole');
                                    inp.placeholder = 'Package Version';
                                    inp.title = inp.placeholder;
                                    version.append(inp);
                                }
                                content.append(version);
                            }
                            section.append(content);
                        }
                        body.append(section);
                    }
                }
                { // characters, groups
                    const secGroup = document.createElement('div'); {
                        let charSection;
                        secGroup.classList.add('stpkg--sectionGroup');
                        { // characters
                            const section = new ContentSection('Characters', 'char', (text, index)=>{
                                return new AutoCompleteNameResult(
                                    text,
                                    0,
                                    characters.filter(char=>!section.contentList.find(con=>con.content == char)).map(it=>new ContentAutoCompleteOption(new CharContentItem(it), enumIcons.character)),
                                );
                            });
                            section.isBrowsable = true;
                            section.isBrowseFixed = true;
                            section.browseRoot = '~/characters';
                            section.browseTypeList = ['png'];
                            section.browseResolver = (path)=>new CharContentItem(characters.find(it=>it.avatar == path));
                            secGroup.append(section.render());
                            charSection = section;
                            sections.characters = section;
                        }
                        { // groups
                            const section = new ContentSection('Groups', 'group', (text, index)=>{
                                return new AutoCompleteNameResult(
                                    text,
                                    0,
                                    groups.map(it=>new ContentAutoCompleteOption(new GroupContentItem(it), enumIcons.group)),
                                );
                            });
                            secGroup.append(section.render());
                            /**
                             * @param {GroupContentItem} content
                             */
                            section.onItemAdded = (content)=>{
                                for (const c of content.content.members.map(m=>characters.find(it=>it.avatar == m))) {
                                    charSection.addContent(new CharContentItem(c));
                                }
                            };
                            sections.groups = section;
                        }
                        { // WI
                            const section = new ContentSection('World Info', 'wi', (text, index)=>{
                                return new AutoCompleteNameResult(
                                    text,
                                    0,
                                    commonEnumProviders.worlds().map(it=>new ContentAutoCompleteOption(new ContentItem({ name:it.value }, 'name', 'name', 'wi', true), enumIcons.world)),
                                );
                            });
                            section.isBrowsable = true;
                            section.browseRoot = '~/worlds';
                            section.isBrowseFixed = true;
                            section.browseResolver = (path)=>new ContentItem({ name:path.replace(/\.json$/, '') }, 'name', 'name', 'wi', true);
                            secGroup.append(section.render());
                            sections.worldInfo = section;
                        }
                        { // QRs
                            const section = new ContentSection('Quick Reply Sets', 'qr', (text, index)=>{
                                return new AutoCompleteNameResult(
                                    text,
                                    0,
                                    quickReplyApi.listSets().map(it=>new ContentAutoCompleteOption(new ContentItem({ name:it }, 'name', 'name', 'qr', true), enumIcons.qr, enumTypes.qr)),
                                );
                            });
                            section.isBrowsable = true;
                            section.browseRoot = '~/QuickReplies';
                            section.isBrowseFixed = true;
                            section.browseResolver = (path)=>new ContentItem({ name:path.replace(/\.json$/, '') }, 'name', 'name', 'qr', true);
                            secGroup.append(section.render());
                            sections.quickReply = section;
                        }
                        { // Regex
                            const section = new ContentSection('Regex', 'regex', (text, index)=>{
                                return new AutoCompleteNameResult(
                                    text,
                                    0,
                                    getRegexScripts().map(it=>new ContentAutoCompleteOption(new ContentItem(it, 'scriptName', 'scriptName', 'wi'))),
                                );
                            });
                            secGroup.append(section.render());
                            sections.regex = section;
                        }
                        { // Backgrounds
                            const section = new ContentSection('Backgrounds', 'bg', (text, index)=>{
                                return new AutoCompleteNameResult(
                                    text,
                                    0,
                                    [...document.querySelectorAll('.bg_example')].map(it=>it.getAttribute('bgfile')).filter(it=>it).map(it=>new ContentAutoCompleteOption(new BgContentItem(it))),
                                );
                            });
                            section.isBrowsable = true;
                            section.browseRoot = '~/backgrounds';
                            section.browseResolver = (path)=>new BgContentItem(path);
                            secGroup.append(section.render());
                            sections.background = section;
                        }
                        { // Assets
                            const section = new ContentSection('Assets', 'asset', (text, index)=>{
                                return new AutoCompleteNameResult(
                                    text,
                                    0,
                                    [].map(it=>new ContentAutoCompleteOption(new ContentItem({ name:it }, 'name', 'name', 'asset'))),
                                );
                            });
                            section.isSearchable = false;
                            section.isBrowsable = true;
                            section.browseRoot = '~/user';
                            section.browseResolver = (path)=>new ContentItem({ name:path }, 'name', 'name', 'asset' );
                            secGroup.append(section.render());
                            sections.asset = section;
                        }
                        { // Chat Completion Presets
                            const section = new ContentSection('Chat Completion Presets', 'chatCompletion', (text, index)=>{
                                return new AutoCompleteNameResult(
                                    text,
                                    0,
                                    [].map(it=>new ContentAutoCompleteOption(new ContentItem({ name:it }, 'name', 'name', 'chatCompletion', true, true))),
                                );
                            });
                            section.isBrowsable = true;
                            section.browseRoot = '~/OpenAI Settings';
                            section.isBrowseFixed = true;
                            section.browseResolver = (path)=>new ContentItem({ name:path }, 'name', 'name', 'chatCompletion', true, true);
                            secGroup.append(section.render());
                            sections.chatCompletion = section;
                        }
                        { // KoboldAI Presets
                            const section = new ContentSection('KoboldAI Presets', 'koboldAi', (text, index)=>{
                                return new AutoCompleteNameResult(
                                    text,
                                    0,
                                    [].map(it=>new ContentAutoCompleteOption(new ContentItem({ name:it }, 'name', 'name', 'koboldAi', true, true))),
                                );
                            });
                            section.isBrowsable = true;
                            section.browseRoot = '~/KoboldAI Settings';
                            section.isBrowseFixed = true;
                            section.browseResolver = (path)=>new ContentItem({ name:path }, 'name', 'name', 'koboldAi', true, true);
                            secGroup.append(section.render());
                            sections.koboldAi = section;
                        }
                        { // NovelAI Presets
                            const section = new ContentSection('NovelAI Presets', 'nai', (text, index)=>{
                                return new AutoCompleteNameResult(
                                    text,
                                    0,
                                    [].map(it=>new ContentAutoCompleteOption(new ContentItem({ name:it }, 'name', 'name', 'nai', true, true))),
                                );
                            });
                            section.isBrowsable = true;
                            section.browseRoot = '~/NovelAI Settings';
                            section.isBrowseFixed = true;
                            section.browseResolver = (path)=>new ContentItem({ name:path }, 'name', 'name', 'nai', true, true);
                            secGroup.append(section.render());
                            sections.nai = section;
                        }
                        { // TextGen Presets
                            const section = new ContentSection('TextGen Presets', 'textGen', (text, index)=>{
                                return new AutoCompleteNameResult(
                                    text,
                                    0,
                                    [].map(it=>new ContentAutoCompleteOption(new ContentItem({ name:it }, 'name', 'name', 'textGen', true, true))),
                                );
                            });
                            section.isBrowsable = true;
                            section.browseRoot = '~/TextGen Settings';
                            section.isBrowseFixed = true;
                            section.browseResolver = (path)=>new ContentItem({ name:path }, 'name', 'name', 'textGen', true, true);
                            secGroup.append(section.render());
                            sections.textGen = section;
                        }
                        { // Context Templates
                            const section = new ContentSection('Context Templates', 'context', (text, index)=>{
                                return new AutoCompleteNameResult(
                                    text,
                                    0,
                                    [].map(it=>new ContentAutoCompleteOption(new ContentItem({ name:it }, 'name', 'name', 'context', true, true))),
                                );
                            });
                            section.isBrowsable = true;
                            section.browseRoot = '~/context';
                            section.isBrowseFixed = true;
                            section.browseResolver = (path)=>new ContentItem({ name:path }, 'name', 'name', 'context', true, true);
                            secGroup.append(section.render());
                            sections.context = section;
                        }
                        { // Instruct Presets
                            const section = new ContentSection('Instruct Presets', 'instruct', (text, index)=>{
                                return new AutoCompleteNameResult(
                                    text,
                                    0,
                                    [].map(it=>new ContentAutoCompleteOption(new ContentItem({ name:it }, 'name', 'name', 'instruct', true, true))),
                                );
                            });
                            section.isBrowsable = true;
                            section.browseRoot = '~/instruct';
                            section.isBrowseFixed = true;
                            section.browseResolver = (path)=>new ContentItem({ name:path }, 'name', 'name', 'instruct', true, true);
                            secGroup.append(section.render());
                            sections.instruct = section;
                        }
                        { // Extensions
                            const extensionList = extensionNames
                                .filter(it=>it.startsWith('third-party/'))
                                .map(it=>it.split('/').pop())
                            ;
                            const section = new ContentSection('Extensions', 'extensions', (text, index)=>{
                                return new AutoCompleteNameResult(
                                    text,
                                    0,
                                    extensionList
                                        .filter(it=>!section.contentList.find(c=>c.name == it))
                                        .map(it=>new ContentAutoCompleteOption(new ContentItem({ name:it }, 'name', 'name', 'extensions'))),
                                );
                            });
                            secGroup.append(section.render());
                            sections.extensions = section;
                        }
                        { // Plugins
                            const response = await fetch('/api/plugins/files/list', {
                                method: 'POST',
                                headers: getRequestHeaders(),
                                body: JSON.stringify({
                                    path: '/plugins',
                                }),
                            });
                            if (!response.ok) {
                                console.error(response);
                                throw new Error('Something went wrong.');
                            }
                            const pluginList = await response.json();
                            const section = new ContentSection('Server Plugins', 'plugins', (text, index)=>{
                                return new AutoCompleteNameResult(
                                    text,
                                    0,
                                    pluginList
                                        .filter(it=>it.type == 'dir')
                                        .filter(it=>!section.contentList.find(c=>c.name == it.path))
                                        .map(it=>new ContentAutoCompleteOption(new ContentItem({ name:it.path }, 'name', 'name', 'plugins'))),
                                );
                            });
                            secGroup.append(section.render());
                            sections.plugins = section;
                        }
                        body.append(secGroup);
                    }
                }
                dom.append(body);
            }
        }
        const dlg = new Popup(dom, POPUP_TYPE.CONFIRM, null, { okButton:'Create Package', cancelButton:'Cancel', wider:true, large:true, allowVerticalScrolling:true });
        const prom = dlg.show();
        await prom;
        if (dlg.result == POPUP_RESULT.AFFIRMATIVE) {
            toastr.info('Collecting package contents...', 'ST Packager');
            const jszipScript = new Promise((resolve, reject) => {
                const jszipScript = document.createElement('script');
                jszipScript.async = true;
                jszipScript.src = 'lib/jszip.min.js';
                jszipScript.onload = resolve;
                jszipScript.onerror = reject;
                document.head.appendChild(jszipScript);
            });
            await jszipScript;
            const zip = new JSZip();
            const manifest = {
                name: meta.name.value,
                author: meta.author.value,
                version: meta.version.value,
                characters: [],
                groups: [],
                worldInfo: [],
                quickReplySets: [],
                regex: [],
                backgrounds: [],
                assets: [],
                chatCompletion: [],
                koboldAi: [],
                nai: [],
                textGen: [],
                context: [],
                instruct: [],
                extensions: [],
                plugins: [],
            };
            if (sections.characters.contentList.length) {
                const dir = zip.folder('characters');
                for (const item of /**@type {CharContentItem[]}*/(sections.characters.contentList)) {
                    const response = await fetch('/api/plugins/files/get', {
                        method: 'POST',
                        headers: getRequestHeaders(),
                        body: JSON.stringify({
                            path: `~/characters/${item.content.avatar}`,
                        }),
                    });
                    if (!response.ok) {
                        console.error(response);
                        continue;
                    }
                    const blob = await response.blob();
                    dir.file(item.content.avatar, blob);
                    const manifestItem = {
                        name: item.content.name,
                        avatar: item.content.avatar,
                        includeSprites: item.includeSprites,
                        sprites: [],
                    };
                    manifest.characters.push(manifestItem);
                    if (item.includeSprites) {
                        const hasEmotesResponse = await fetch('/api/plugins/files/exists', {
                            method: 'POST',
                            headers: getRequestHeaders(),
                            body: JSON.stringify({
                                path: `~/characters/${item.content.name}`,
                            }),
                        });
                        if (!hasEmotesResponse.ok) {
                            console.error(hasEmotesResponse);
                            continue;
                        }
                        const hasEmotes = await hasEmotesResponse.json();
                        if (hasEmotes) {
                            const fetchFileList = async(root)=>{
                                const response = await fetch('/api/plugins/files/list', {
                                    method: 'POST',
                                    headers: getRequestHeaders(),
                                    body: JSON.stringify({
                                        path: root,
                                    }),
                                });
                                if (!response.ok) {
                                    console.error(response);
                                    return [];
                                }
                                const items = await response.json();
                                const out = [];
                                for (const item of items) {
                                    if (item.type == 'file') {
                                        out.push(`${root}/${item.path}`);
                                    } else {
                                        out.push(...await fetchFileList(`${root}/${item.path}`));
                                    }
                                }
                                return out;
                            };
                            const baseDir = `~/characters/${item.content.name}`;
                            const fileList = await fetchFileList(baseDir);
                            const dirs = {};
                            dirs[baseDir] = zip.folder(`characters/${item.content.name}`);
                            for (const file of fileList) {
                                const response = await fetch('/api/plugins/files/get', {
                                    method: 'POST',
                                    headers: getRequestHeaders(),
                                    body: JSON.stringify({
                                        path: file,
                                    }),
                                });
                                if (!response.ok) {
                                    console.error(response);
                                    continue;
                                }
                                const blob = await response.blob();
                                const sub = file.split('/').slice(0, -1);
                                if (!dirs[sub]) {
                                    dirs[sub] = zip.folder(sub.splice('/').slice(1).join('/'));
                                }
                                dirs[sub].file(file.split('/').pop(), blob);
                                manifestItem.sprites.push(file);
                            }
                        }
                    }
                }
            }
            if (sections.groups.contentList.length) {
                const dir = zip.folder('groups');
                for (const item of /**@type {import('../../../../script.js').Group[]}*/(sections.groups.contentList)) {
                    const response = await fetch('/api/plugins/files/get', {
                        method: 'POST',
                        headers: getRequestHeaders(),
                        body: JSON.stringify({
                            path: `~/groups/${item.content.id}.json`,
                        }),
                    });
                    if (!response.ok) {
                        console.error(response);
                        continue;
                    }
                    const blob = await response.blob();
                    dir.file(`${item.content.name}.json`, blob);
                    manifest.groups.push({ name:item.content.name });
                }
            }
            if (sections.worldInfo.contentList.length) {
                const dir = zip.folder('worlds');
                for (const item of /**@type {ContentItem[]}*/(sections.worldInfo.contentList)) {
                    const response = await fetch('/api/plugins/files/get', {
                        method: 'POST',
                        headers: getRequestHeaders(),
                        body: JSON.stringify({
                            path: `~/worlds/${item.content.name}.json`,
                        }),
                    });
                    if (!response.ok) {
                        console.error(response);
                        continue;
                    }
                    const blob = await response.blob();
                    dir.file(`${item.content.name}.json`, blob);
                    manifest.worldInfo.push({
                        name: item.content.name,
                        isActive: item.isActive,
                    });
                }
            }
            if (sections.quickReply.contentList.length) {
                const dir = zip.folder('QuickReplies');
                for (const item of /**@type {ContentItem[]}*/(sections.quickReply.contentList)) {
                    const response = await fetch('/api/plugins/files/get', {
                        method: 'POST',
                        headers: getRequestHeaders(),
                        body: JSON.stringify({
                            path: `~/QuickReplies/${item.content.name}.json`,
                        }),
                    });
                    if (!response.ok) {
                        console.error(response);
                        continue;
                    }
                    const blob = await response.blob();
                    dir.file(`${item.content.name}.json`, blob);
                    manifest.quickReplySets.push({
                        name: item.content.name,
                        isActive: item.isActive,
                    });
                }
            }
            if (sections.regex.contentList.length) {
                const dir = zip.folder('regex');
                for (const item of /**@type {ContentItem[]}*/(sections.regex.contentList)) {
                    dir.file(`${item.content.scriptName}.json`, JSON.stringify(item.content));
                    manifest.regex.push({
                        name: item.content.scriptName,
                    });
                }
            }
            if (sections.background.contentList.length) {
                const dir = zip.folder('backgrounds');
                for (const item of /**@type {BgContentItem[]}*/(sections.background.contentList)) {
                    const response = await fetch('/api/plugins/files/get', {
                        method: 'POST',
                        headers: getRequestHeaders(),
                        body: JSON.stringify({
                            path: `~/backgrounds/${item.content.name}`,
                        }),
                    });
                    if (!response.ok) {
                        console.error(response);
                        continue;
                    }
                    const blob = await response.blob();
                    dir.file(`${item.content.name}`, blob);
                    manifest.backgrounds.push({
                        name: item.content.name,
                    });
                }
            }
            if (sections.asset.contentList.length) {
                for (const item of sections.asset.contentList) {
                    const response = await fetch('/api/plugins/files/get', {
                        method: 'POST',
                        headers: getRequestHeaders(),
                        body: JSON.stringify({
                            path: `~/user/${item.content.name}`,
                        }),
                    });
                    if (!response.ok) {
                        console.error(response);
                        continue;
                    }
                    const blob = await response.blob();
                    zip.file(`user/${item.content.name}`, blob);
                    manifest.assets.push({
                        name: item.content.name,
                    });
                }
            }
            const presets = [
                { key:'chatCompletion', dir: 'OpenAI Settings' },
                { key:'koboldAi', dir: 'KoboldAI Settings' },
                { key:'nai', dir: 'NovelAI Settings' },
                { key:'textGen', dir: 'TextGen Settings' },
                { key:'context', dir: 'context' },
                { key:'instruct', dir: 'instruct' },
            ];
            for (const preset of presets) {
                if (sections[preset.key].contentList.length) {
                    const dir = zip.folder(preset.dir);
                    for (const item of /**@type {ContentItem[]}*/(sections[preset.key].contentList)) {
                        const response = await fetch('/api/plugins/files/get', {
                            method: 'POST',
                            headers: getRequestHeaders(),
                            body: JSON.stringify({
                                path: `~/${preset.dir}/${item.content.name}`,
                            }),
                        });
                        if (!response.ok) {
                            console.error(response);
                            continue;
                        }
                        const blob = await response.blob();
                        dir.file(`${item.content.name}`, blob);
                        manifest[preset.key].push({
                            name: item.content.name,
                            isActive: item.isActive,
                        });
                    }
                }
            }
            zip.file('manifest.json', JSON.stringify(manifest, null, 4));
            /**@type {Blob} */
            const blob = await zip.generateAsync({ type:'blob' });
            const reader = new FileReader();
            const prom = new Promise(resolve=>reader.addEventListener('load', resolve));
            reader.readAsDataURL(blob);
            await prom;
            const dataUrl = reader.result;
            const response = await fetch('/api/plugins/files/put', {
                method: 'POST',
                headers: getRequestHeaders(),
                body: JSON.stringify({
                    path: `~/user/packages/${meta.name.value || 'Package'}.stpkg`,
                    file: dataUrl,
                }),
            });
            if (!response.ok) {
                alert('something went wrong');
                return { ok:false, name:null };
            }
            const data = await response.json();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${meta.name.value || 'Package'}.stpkg`;
            a.click();
            toastr.success(`Package created!<br><small>${data.name}</small>`, 'ST Packager', { escapeHtml:false });
        }
        return '';
    },
    helpString: 'Open Package Exporter',
}));
