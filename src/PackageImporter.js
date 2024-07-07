import { groups } from '../../../../group-chats.js';
import { commonEnumProviders } from '../../../../slash-commands/SlashCommandCommonEnumsProvider.js';
import { quickReplyApi } from '../../../quick-reply/index.js';
import { getRegexScripts } from '../../../regex/index.js';
import { FilesApi } from '../lib/FilesApi.js';

export class PackageImporter {
    /**@type {Blob} */ blob;
    /**@type {Blob} */ zip;

    /**@type {object} */ manifest;

    /**@type {string} */ name;
    /**@type {string} */ author;
    /**@type {string} */ version;

    /**@type {HTMLElement} */ dom;




    constructor(blob) {
        this.blob = blob;
    }


    async load() {
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
        this.zip = zip;
        await zip.loadAsync(this.blob);
        const manifest = JSON.parse(await zip.file('manifest.json').async('string'));
        console.log(manifest);
        this.manifest = manifest;
        this.name = manifest.name ?? 'Package';
        this.author = manifest.author;
        this.version = manifest.version;
    }


    async render() {
        if (!this.dom) {
            const dom = document.createElement('div'); {
                this.dom = dom;
                dom.classList.add('stpkg--import');
                const head = document.createElement('h3'); {
                    head.textContent = 'Package Importer';
                    dom.append(head);
                }
                const body = document.createElement('div'); {
                    body.classList.add('stpkg--body');
                    { // info
                        const section = document.createElement('div'); {
                            section.classList.add('stpkg--section');
                            section.classList.add('stpkg--info');
                            const name = document.createElement('div'); {
                                name.classList.add('stpkg--name');
                                name.textContent = this.name;
                                if (this.version) {
                                    const version = document.createElement('small'); {
                                        version.classList.add('stpkg--version');
                                        version.textContent = this.version;
                                        name.append(version);
                                    }
                                }
                                section.append(name);
                            }
                            if (this.author) {
                                const author = document.createElement('small'); {
                                    author.classList.add('stpkg--author');
                                    author.textContent = this.author;
                                    section.append(author);
                                }
                            }
                            body.append(section);
                        }
                    }
                    { // content
                        if (this.manifest.characters?.length) {
                            const section = document.createElement('div'); {
                                section.classList.add('stpkg--section');
                                section.classList.add('stpkg--characters');
                                const h = document.createElement('h4'); {
                                    h.textContent = 'Characters';
                                    section.append(h);
                                }
                                const grid = document.createElement('div'); {
                                    grid.classList.add('stpkg--grid');
                                    for (const content of this.manifest.characters) {
                                        const isDupe = await FilesApi.exists(`~/characters/${content.avatar}`);
                                        /**@type {Blob} */
                                        const blob = await this.zip.file(`characters/${content.avatar}`).async('blob');
                                        const url = URL.createObjectURL(blob);
                                        const item = document.createElement('div'); {
                                            item.classList.add('stpkg--item');
                                            if (!isDupe) item.classList.add('stpkg--isIncluded');
                                            const ava = document.createElement('img'); {
                                                ava.classList.add('stpkg--avatar');
                                                ava.src = url;
                                                item.append(ava);
                                            }
                                            const name = document.createElement('div'); {
                                                name.classList.add('stpkg--name');
                                                name.textContent = content.name;
                                                item.append(name);
                                            }
                                            const actions = document.createElement('div'); {
                                                actions.classList.add('stpkg--actions');
                                                if (!isDupe) {
                                                    const inc = document.createElement('div'); {
                                                        inc.classList.add('stpkg--toggle');
                                                        inc.classList.add('stpkg--include');
                                                        const pos = document.createElement('div'); {
                                                            pos.classList.add('stpkg--pos');
                                                            pos.classList.add('stpkg--isSelected');
                                                            pos.textContent = 'Import';
                                                            pos.addEventListener('click', ()=>{
                                                                pos.classList.add('stpkg--isSelected');
                                                                neg.classList.remove('stpkg--isSelected');
                                                                item.classList.add('stpkg--isIncluded');
                                                            });
                                                            inc.append(pos);
                                                        }
                                                        const neg = document.createElement('div'); {
                                                            neg.classList.add('stpkg--neg');
                                                            neg.textContent = 'Skip';
                                                            neg.addEventListener('click', ()=>{
                                                                pos.classList.remove('stpkg--isSelected');
                                                                neg.classList.add('stpkg--isSelected');
                                                                item.classList.remove('stpkg--isIncluded');
                                                            });
                                                            inc.append(neg);
                                                        }
                                                        actions.append(inc);
                                                    }
                                                } else {
                                                    const overwriteWarn = document.createElement('div'); {
                                                        overwriteWarn.classList.add('stpkg--warning');
                                                        overwriteWarn.classList.add('fa-solid');
                                                        overwriteWarn.classList.add('fa-circle-exclamation');
                                                        actions.append(overwriteWarn);
                                                    }
                                                    const overwrite = document.createElement('div'); {
                                                        overwrite.classList.add('stpkg--toggle');
                                                        overwrite.classList.add('stpkg--overwrite');
                                                        const pos = document.createElement('div'); {
                                                            pos.classList.add('stpkg--pos');
                                                            pos.textContent = 'Overwrite';
                                                            pos.addEventListener('click', ()=>{
                                                                pos.classList.add('stpkg--isSelected');
                                                                neg.classList.remove('stpkg--isSelected');
                                                                item.classList.add('stpkg--isIncluded');
                                                            });
                                                            overwrite.append(pos);
                                                        }
                                                        const neg = document.createElement('div'); {
                                                            neg.classList.add('stpkg--neg');
                                                            neg.classList.add('stpkg--isSelected');
                                                            neg.textContent = 'Skip';
                                                            neg.addEventListener('click', ()=>{
                                                                pos.classList.remove('stpkg--isSelected');
                                                                neg.classList.add('stpkg--isSelected');
                                                                item.classList.remove('stpkg--isIncluded');
                                                            });
                                                            overwrite.append(neg);
                                                        }
                                                        actions.append(overwrite);
                                                    }
                                                }
                                                item.append(actions);
                                            }
                                            grid.append(item);
                                        }
                                    }
                                    section.append(grid);
                                }
                                body.append(section);
                            }
                        }
                        const generic = [
                            { key:'groups', title:'Groups', dupe:async(content)=>groups.find(it=>it.name.toLowerCase() == content.name.toLowerCase()) },
                            { key:'worldInfo', title:'World Info', dupe:async(content)=>commonEnumProviders.worlds().find(it=>it.value.toLowerCase() == content.name.toLowerCase()) },
                            { key:'quickReplySets', title:'Quick Reply Sets', dupe:async(content)=>quickReplyApi.listSets().find(it=>it.toLowerCase() == content.name.toLowerCase()) },
                            { key:'regex', title:'Regex', dupe:async(content)=>getRegexScripts().find(it=>it.scriptName.toLowerCase() == content.name.toLowerCase()) },
                            { key:'backgrounds', title:'Backgrounds', dupe:async(content)=>[...document.querySelectorAll('.bg_example')].map(it=>it.getAttribute('bgfile')).filter(it=>it).find(it=>it.toLowerCase() == content.name.toLowerCase()) },
                            { key:'assets', title:'Assets', dupe:async(content)=>FilesApi.exists(`~/user/${content.name}`) },
                            { key:'chatCompletion', title:'Chat Completion Presets', dupe:async(content)=>FilesApi.exists(`~/OpenAI Settings/${content.name}`) },
                            { key:'koboldAi', title:'KoboldAI Presets', dupe:async(content)=>FilesApi.exists(`~/KoboldAI Settings/${content.name}`) },
                            { key:'nai', title:'NovelAI Presets', dupe:async(content)=>FilesApi.exists(`~/NovelAI Settings/${content.name}`) },
                            { key:'textGen', title:'TextGen Presets', dupe:async(content)=>FilesApi.exists(`~/TextGen Settings/${content.name}`) },
                            { key:'context', title:'Context Templates', dupe:async(content)=>FilesApi.exists(`~/context/${content.name}`) },
                            { key:'instruct', title:'Instruct Presets', dupe:async(content)=>FilesApi.exists(`~/instruct/${content.name}`) },
                            { key:'extensions', title:'Extensions', dupe:async(content)=>false },
                            { key:'plugins', title:'Server Plugins', dupe:async(content)=>false },
                        ];
                        for (const gi of generic) {
                            if (this.manifest[gi.key]?.length) {
                                const section = document.createElement('div'); {
                                    section.classList.add('stpkg--section');
                                    section.classList.add(`stpkg--${gi.key}`);
                                    const h = document.createElement('h4'); {
                                        h.textContent = gi.title;
                                        section.append(h);
                                    }
                                    const grid = document.createElement('div'); {
                                        grid.classList.add('stpkg--grid');
                                        for (const content of this.manifest[gi.key]) {
                                            const isDupe = await gi.dupe(content);
                                            const item = document.createElement('div'); {
                                                item.classList.add('stpkg--item');
                                                if (!isDupe) item.classList.add('stpkg--isIncluded');
                                                const name = document.createElement('div'); {
                                                    name.classList.add('stpkg--name');
                                                    name.textContent = content.name;
                                                    item.append(name);
                                                }
                                                const actions = document.createElement('div'); {
                                                    actions.classList.add('stpkg--actions');
                                                    if (!isDupe) {
                                                        const inc = document.createElement('div'); {
                                                            inc.classList.add('stpkg--toggle');
                                                            inc.classList.add('stpkg--include');
                                                            const pos = document.createElement('div'); {
                                                                pos.classList.add('stpkg--pos');
                                                                pos.classList.add('stpkg--isSelected');
                                                                pos.textContent = 'Import';
                                                                pos.addEventListener('click', ()=>{
                                                                    pos.classList.add('stpkg--isSelected');
                                                                    neg.classList.remove('stpkg--isSelected');
                                                                    item.classList.add('stpkg--isIncluded');
                                                                });
                                                                inc.append(pos);
                                                            }
                                                            const neg = document.createElement('div'); {
                                                                neg.classList.add('stpkg--neg');
                                                                neg.textContent = 'Skip';
                                                                neg.addEventListener('click', ()=>{
                                                                    pos.classList.remove('stpkg--isSelected');
                                                                    neg.classList.add('stpkg--isSelected');
                                                                    item.classList.remove('stpkg--isIncluded');
                                                                });
                                                                inc.append(neg);
                                                            }
                                                            actions.append(inc);
                                                        }
                                                    } else {
                                                        const overwriteWarn = document.createElement('div'); {
                                                            overwriteWarn.classList.add('stpkg--warning');
                                                            overwriteWarn.classList.add('fa-solid');
                                                            overwriteWarn.classList.add('fa-circle-exclamation');
                                                            actions.append(overwriteWarn);
                                                        }
                                                        const overwrite = document.createElement('div'); {
                                                            overwrite.classList.add('stpkg--toggle');
                                                            overwrite.classList.add('stpkg--overwrite');
                                                            const pos = document.createElement('div'); {
                                                                pos.classList.add('stpkg--pos');
                                                                pos.textContent = 'Overwrite';
                                                                pos.addEventListener('click', ()=>{
                                                                    pos.classList.add('stpkg--isSelected');
                                                                    neg.classList.remove('stpkg--isSelected');
                                                                    item.classList.add('stpkg--isIncluded');
                                                                });
                                                                overwrite.append(pos);
                                                            }
                                                            const neg = document.createElement('div'); {
                                                                neg.classList.add('stpkg--neg');
                                                                neg.classList.add('stpkg--isSelected');
                                                                neg.textContent = 'Skip';
                                                                neg.addEventListener('click', ()=>{
                                                                    pos.classList.remove('stpkg--isSelected');
                                                                    neg.classList.add('stpkg--isSelected');
                                                                    item.classList.remove('stpkg--isIncluded');
                                                                });
                                                                overwrite.append(neg);
                                                            }
                                                            actions.append(overwrite);
                                                        }
                                                    }
                                                    item.append(actions);
                                                }
                                                grid.append(item);
                                            }
                                        }
                                        section.append(grid);
                                    }
                                    body.append(section);
                                }
                            }
                        }
                    }
                    dom.append(body);
                }
            }
        }
        return this.dom;
    }
}
