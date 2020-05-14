import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Scroll/ContainerBase/Template');
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/Scroll/ContainerBase/Style';

export default class ContainerBaseDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;

    private _contentAdded: boolean = false;
    private _heightAdded: boolean = false;
    private _scrollTopChanged: boolean = false;
    private _eventStore: string[] = [];
    private _eventCounter: number = 0;
    private _state: object = null;

    scrollStateChangedHandler(event, state): void {
        this._eventStore.push('scrollStateChanged');
        this._eventCounter++;
        this._state = state.state;
    }

    _addContentHandler(): void {
        this._contentAdded = !this._contentAdded;
    }

    _changeHeightContentHandler(): void {
        this._heightAdded = !this._heightAdded;
    }

    _changeHeightAddContentHandler(): void {
        this._heightAdded = !this._heightAdded;
        this._contentAdded = !this._contentAdded;
        this._changeScrollTopHandler();
    }

    _changeScrollTopHandler(): void {
        if (!this._scrollTopChanged) {
            this._children.containerBase._container.scrollTop = 30;
        } else {
            this._children.containerBase._container.scrollTop = 0;
        }
        this._scrollTopChanged = !this._scrollTopChanged;
    }

    static _theme: string[] = ['Controls/Classes'];
}
