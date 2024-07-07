import { characters } from '../../../../../script.js';
import { groups } from '../../../../group-chats.js';
import { getRegexScripts } from '../../../regex/index.js';
import { BgContentItem } from './BgContentItem.js';
import { CharContentItem } from './CharContentItem.js';
import { ContentItem } from './ContentItem.js';
import { GroupContentItem } from './GroupContentItem.js';
import { PackageEditor } from './PackageEditor.js';

export class Package {
    /**@type {string} */ name;
    /**@type {string} */ author;
    /**@type {string} */ version;

    /**@type {CharContentItem[]} */ characters = [];
    /**@type {GroupContentItem[]} */ groups = [];
    /**@type {ContentItem[]} */ worldInfo = [];
    /**@type {ContentItem[]} */ quickReplySets = [];
    /**@type {ContentItem[]} */ regex = [];
    /**@type {BgContentItem[]} */ backgrounds = [];
    /**@type {ContentItem[]} */ assets = [];
    /**@type {ContentItem[]} */ chatCompletion = [];
    /**@type {ContentItem[]} */ koboldAi = [];
    /**@type {ContentItem[]} */ nai = [];
    /**@type {ContentItem[]} */ textGen = [];
    /**@type {ContentItem[]} */ context = [];
    /**@type {ContentItem[]} */ instruct = [];
    /**@type {ContentItem[]} */ extensions = [];
    /**@type {ContentItem[]} */ plugins = [];

    /**@type {PackageEditor} */ editor;
    /**@type {Blob} */ blob;
    /**@type {object} */ manifest;




    /**
     *
     * @param {object|Blob} manifestOrPkg
     */
    constructor(manifestOrPkg = null) {
        if (manifestOrPkg) {
            if (manifestOrPkg instanceof Blob) {
                this.blob = manifestOrPkg;
            } else {
                this.manifest = manifestOrPkg;
            }
        }
        this.editor = new PackageEditor(this);
    }


    async load() {
        if (this.blob) {
            await this.loadPackageFile();
        } else if (this.manifest) {
            await this.loadManifest();
        } else {
            throw new Error('No package file (blob) or manifest provided.');
        }
    }
    async loadManifest() {
        const manifest = this.manifest;
        console.log(manifest);
        this.name = manifest.name;
        this.author = manifest.author;
        this.version = manifest.version;
        for (const item of manifest.characters ?? []) {
            const ci = new CharContentItem(characters.find(it=>it.avatar == item.avatar));
            ci.includeSprites = item.includeSprites;
            this.characters.push(ci);
        }
        for (const item of manifest.groups ?? []) {
            this.groups.push(new GroupContentItem(groups.find(it=>it.name == item.name)));
        }
        for (const item of manifest.backgrounds ?? []) {
            this.backgrounds.push(new BgContentItem(item.name));
        }
        for (const item of manifest.regex ?? []) {
            const regexScript = getRegexScripts().find(it=>it.id == item.id);
            this.regex.push(new ContentItem(regexScript, 'scriptName', 'scriptName', 'regex'));
        }

        const generic = [
            'assets',
        ];
        for (const key of generic) {
            if (!manifest[key] || !Array.isArray(manifest[key])) continue;
            for (const item of manifest[key]) {
                this[key].push(new ContentItem(item, 'name', 'name', key));
            }
        }
        const genericCheckbox = [
            'worldInfo',
            'quickReplySets',
        ];
        for (const key of genericCheckbox) {
            if (!manifest[key] || !Array.isArray(manifest[key])) continue;
            for (const item of manifest[key]) {
                const ci = new ContentItem(item, 'name', 'name', key, true);
                ci.isStartingActive = item.isActive;
                this[key].push(ci);
            }
        }
        const genericRadio = [
            'chatCompletion',
            'koboldAi',
            'nai',
            'textGen',
            'context',
            'instruct',
            'extensions',
            'plugins',
        ];
        for (const key of genericRadio) {
            if (!manifest[key] || !Array.isArray(manifest[key])) continue;
            for (const item of manifest[key]) {
                const ci = new ContentItem(item, 'name', 'name', key, true, true);
                ci.isStartingActive = item.isActive;
                this[key].push(ci);
            }
        }
    }
    async loadPackageFile() {
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
        await zip.loadAsync(this.blob);
        const manifest = JSON.parse(await zip.file('manifest.json').async('string'));
        console.log(manifest);
        this.name = manifest.name;
        this.author = manifest.author;
        this.version = manifest.version;
        for (const item of manifest.characters ?? []) {
            //TODO get content from zip
            const ci = new CharContentItem(characters.find(it=>it.avatar == item.avatar));
            ci.includeSprites = item.includeSprites;
            this.characters.push(ci);
        }
        for (const item of manifest.groups ?? []) {
            //TODO get content from zip
            this.groups.push(new GroupContentItem(groups.find(it=>it.name == item.name)));
        }
        for (const item of manifest.backgrounds ?? []) {
            //TODO get content from zip
            this.backgrounds.push(new BgContentItem(item.name));
        }
        for (const item of manifest.regex ?? []) {
            //TODO get content from zip
            const regexScript = getRegexScripts().find(it=>it.scriptName == item.name);
            new ContentItem(regexScript, 'scriptName', 'scriptName', 'regex');
        }

        const generic = [
            'assets',
        ];
        for (const key of generic) {
            if (!manifest[key] || !Array.isArray(manifest[key])) continue;
            for (const item of manifest[key]) {
                //TODO get content from zip
                this[key].push(new ContentItem(item, 'name', 'name', key));
            }
        }
        const genericCheckbox = [
            'worldInfo',
            'quickReplySets',
        ];
        for (const key of genericCheckbox) {
            if (!manifest[key] || !Array.isArray(manifest[key])) continue;
            for (const item of manifest[key]) {
                //TODO get content from zip
                const ci = new ContentItem(item, 'name', 'name', key, true);
                ci.isStartingActive = item.isActive;
                this[key].push(ci);
            }
        }
        const genericRadio = [
            'chatCompletion',
            'koboldAi',
            'nai',
            'textGen',
            'context',
            'instruct',
            'extensions',
            'plugins',
        ];
        for (const key of genericRadio) {
            if (!manifest[key] || !Array.isArray(manifest[key])) continue;
            for (const item of manifest[key]) {
                //TODO get content from zip
                const ci = new ContentItem(item, 'name', 'name', key, true, true);
                ci.isStartingActive = item.isActive;
                this[key].push(ci);
            }
        }
    }
}
