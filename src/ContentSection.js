import { AutoComplete } from '../../../../autocomplete/AutoComplete.js';
import { AutoCompleteNameResult } from '../../../../autocomplete/AutoCompleteNameResult.js';
import { FileExplorer } from '../../SillyTavern-FileExplorer/src/FileExplorer.js';
import { ContentAutoCompleteOption } from './autocomplete/ContentAutoCompleteOption.js';
import { ContentItem } from './ContentItem.js';

export class ContentSection {
    /**@type {string} */ title;
    /**@type {string} */ key;
    /**@type {(text:string, index:number)=>AutoCompleteNameResult} */ autoCompleteProvider;
    /**@type {boolean} */ isSearchable = true;
    /**@type {boolean} */ isBrowsable = false;
    /**@type {boolean} */ isBrowseFixed = false;
    /**@type {string} */ browseRoot = '~';
    /**@type {string[]} */ browseTypeList;
    /**@type {(path)=>ContentItem} */ browseResolver;

    /**@type {ContentItem[]} */ contentList = [];

    /**@type {(ContentItem)=>void} */ onItemAdded;

    /**@type {HTMLElement} */ dom;
    /**@type {HTMLElement} */ grid;




    constructor(title, key, autoCompleteProvider) {
        this.title = title;
        this.key = key;
        this.autoCompleteProvider = autoCompleteProvider;
    }

    render() {
        if (!this.dom) {
            const section = document.createElement('div'); {
                this.dom = section;
                section.classList.add('stpkg--section');
                section.classList.add(`stpkg--${this.key}`);
                const h = document.createElement('h4'); {
                    h.textContent = this.title;
                    h.addEventListener('click', ()=>content.classList.toggle('stpkg--hidden'));
                    section.append(h);
                }
                const content = document.createElement('div'); {
                    content.classList.add('stpkg--content');
                    const query = document.createElement('label'); {
                        query.classList.add('stpkg--input');
                        query.classList.add('stpkg--query');
                        if (this.isSearchable) {
                            query.textContent = 'Search: ';
                            const inp = document.createElement('input'); {
                                inp.classList.add('text_pole');
                                inp.placeholder = `Search ${this.title}`;
                                inp.title = inp.placeholder;
                                const ac = new AutoComplete(
                                    inp,
                                    ()=>true,
                                    this.autoCompleteProvider,
                                    true,
                                );
                                /**
                                 * @param {ContentAutoCompleteOption} item
                                 */
                                ac.onSelect = (item)=>{
                                    inp.value = '';
                                    inp.dispatchEvent(new Event('input', { bubbles:true }));
                                    this.addContent(item.content);
                                };
                                query.append(inp);
                            }
                        }
                        if (this.isBrowsable) {
                            const browse = document.createElement('div'); {
                                browse.classList.add('menu_button');
                                browse.classList.add('fa-solid');
                                browse.classList.add('fa-folder-open');
                                browse.title = 'Browse';
                                browse.addEventListener('click', async()=>{
                                    const fe = new FileExplorer(this.browseRoot);
                                    fe.isFixedRoot = true;
                                    fe.isFixedPath = this.isBrowseFixed;
                                    fe.isPicker = true;
                                    fe.extensionList = this.browseTypeList;
                                    fe.allowUnmapped = this.isBrowseFixed;
                                    fe.isSingleSelect = false;
                                    await fe.show();
                                    if (fe.selection?.length) {
                                        for (const sel of fe.selection) {
                                            const file = `~${sel}`.slice(this.browseRoot.length).replace(/^\//, '');
                                            console.log(file);
                                            this.addContent(this.browseResolver(file));
                                        }
                                    }
                                });
                                query.append(browse);
                            }
                        }
                        content.append(query);
                        const grid = document.createElement('div'); {
                            this.grid = grid;
                            grid.classList.add('stpkg--grid');
                            content.append(grid);
                        }
                    }
                    section.append(content);
                }
            }
        }
        return this.dom;
    }


    /**
     * @param {ContentItem} content
     */
    addContent(content) {
        if (!this.contentList.find(it=>it.id == content.id)) {
            this.contentList.push(content);
            this.grid.append(content.render());
            content.onRemove = ()=>{
                content.onRemove = null;
                content.dom?.remove();
                this.contentList.splice(this.contentList.indexOf(content), 1);
                this.dom?.setAttribute('data-count', (this.contentList.length || '').toString());
            };
            this.onItemAdded?.(content);
            this.dom?.setAttribute('data-count', (this.contentList.length || '').toString());
        }
    }
}
