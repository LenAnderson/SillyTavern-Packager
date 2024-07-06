import { AutoCompleteOption } from '../../../../../autocomplete/AutoCompleteOption.js';
import { enumIcons } from '../../../../../slash-commands/SlashCommandCommonEnumsProvider.js';
import { enumTypes } from '../../../../../slash-commands/SlashCommandEnumValue.js';
import { ContentItem } from '../ContentItem.js';

export class ContentAutoCompleteOption extends AutoCompleteOption {
    /**@type {ContentItem} */ content;



    /**
     * @param {ContentItem} content
     */
    constructor(content, icon = enumIcons.default, type = enumTypes.enum) {
        super(content.name, icon, type);
        this.content = content;
    }
}
