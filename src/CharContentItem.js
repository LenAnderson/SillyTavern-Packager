import { ContentItem } from './ContentItem.js';

export class CharContentItem extends ContentItem {
    /**@type {import('../../../../char-data.js').v1CharData} */ content = null;
    /**@type {boolean} */ includeSprites = true;




    constructor(character) {
        super(character, 'name', 'avatar', 'char');
        this.content = character;
    }


    render() {
        if (!this.dom) {
            const c = document.createElement('div'); {
                this.dom = c;
                c.classList.add('stpkg--item');
                c.classList.add('stpkg--char');
                const img = document.createElement('img'); {
                    img.classList.add('stpkg--avatar');
                    img.src = `/thumbnail?type=avatar&file=${this.content.avatar}`;
                    c.append(img);
                }
                const name = document.createElement('div'); {
                    name.classList.add('stpkg--name');
                    name.textContent = this.content.name;
                    c.append(name);
                }
                const actions = document.createElement('div'); {
                    actions.classList.add('stpkg--actions');
                    const sprites = document.createElement('label'); {
                        sprites.title = 'Include sprites / emotes';
                        const cb = document.createElement('input'); {
                            cb.type = 'checkbox';
                            cb.checked = this.includeSprites;
                            cb.addEventListener('click', ()=>{
                                this.includeSprites = cb.checked;
                            });
                            sprites.append(cb);
                        }
                        sprites.append('Sprites');
                        actions.append(sprites);
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
