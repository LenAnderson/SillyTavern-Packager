import { AutoComplete } from '../../../../autocomplete/AutoComplete.js';
import { AutoCompleteNameResult } from '../../../../autocomplete/AutoCompleteNameResult.js';
import { ContentAutoCompleteOption } from './autocomplete/ContentAutoCompleteOption.js';

export class ContentItem {
    /**@type {object} */ content;
    /**@type {string} */ nameField;
    /**@type {string} */ idField;
    /**@type {string} */ key;
    /**@type {boolean} */ canBeActive = false;
    /**@type {boolean} */ isRadio = false;
    get isActive() {
        return this.isActiveDom?.checked ?? false;
    }

    /**@type {(item:ContentItem)=>void} */ onRemove;

    /**@type {HTMLElement} */ dom;
    /**@type {HTMLInputElement} */ isActiveDom;


    get name() {
        return this.content[this.nameField];
    }
    get id() {
        return this.content[this.idField];
    }




    constructor(content, nameField, idField, key, canBeActive = false, isRadio = false) {
        this.content = content;
        this.nameField = nameField;
        this.idField = idField;
        this.key = key;
        this.canBeActive = canBeActive;
        this.isRadio = isRadio;
    }

    render() {
        if (!this.dom) {
            const c = document.createElement('div'); {
                this.dom = c;
                c.classList.add('stpkg--item');
                c.classList.add(`stpkg--${this.key}`);
                const name = document.createElement('div'); {
                    name.classList.add('stpkg--name');
                    name.textContent = this.name;
                    c.append(name);
                }
                const actions = document.createElement('div'); {
                    actions.classList.add('stpkg--actions');
                    if (this.canBeActive) {
                        const active = document.createElement('label'); {
                            active.title = 'Activate on package load';
                            const cb = document.createElement('input'); {
                                this.isActiveDom = cb;
                                cb.type = this.isRadio ? 'radio' : 'checkbox';
                                if (this.isRadio) cb.name = `stpkg--${this.key}-isActive`;
                                cb.checked = !this.isRadio;
                                let wasActive;
                                active.addEventListener('pointerdown', ()=>{
                                    wasActive = cb.checked;
                                });
                                cb.addEventListener('click', ()=>{
                                    if (this.isRadio && wasActive) {
                                        cb.checked = false;
                                    }
                                });
                                active.append(cb);
                            }
                            active.append('Active');
                            actions.append(active);
                        }
                    }
                    const del = document.createElement('div'); {
                        del.classList.add('menu_button');
                        del.classList.add('menu_button_icon');
                        del.classList.add('redWarningBG');
                        del.addEventListener('click', ()=>{
                            this.onRemove?.(this);
                        });
                        const i = document.createElement('i'); {
                            i.classList.add('fa-solid');
                            i.classList.add('fa-trash-can');
                            del.append(i);
                        }
                        const txt = document.createElement('span'); {
                            txt.textContent = 'Remove';
                            del.append(txt);
                        }
                        actions.append(del);
                    }
                    c.append(actions);
                }
            }
        }
        return this.dom;
    }
}
