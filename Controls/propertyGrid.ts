/**
 * Библиотека контролов, которые реализуют propertyGrid и набор стандартных редакторов типов.
 * @library Controls/propertyGrid
 * @author Герасимов А.М.
 */

/*
 * PropertyGrid library
 * @library Controls/propertyGrid
 * @author Герасимов А.М.
 */

import {default as PropertyGrid} from 'Controls/_propertyGrid/PropertyGrid';
import BooleanEditor = require("Controls/_propertyGrid/defaultEditors/Boolean");
import StringEditor = require("Controls/_propertyGrid/defaultEditors/String");
import TextEditor = require("Controls/_propertyGrid/defaultEditors/Text");
import EnumEditor = require("Controls/_propertyGrid/defaultEditors/Enum");
import NumberEditor = require("Controls/_propertyGrid/defaultEditors/Number");
import BooleanGroupEditor = require("Controls/_propertyGrid/extendedEditors/BooleanGroup");
import FlatEnumEditor = require("Controls/_propertyGrid/extendedEditors/FlatEnum");

import IPropertyGrid = require("Controls/_propertyGrid/IPropertyGrid");
import IEditor = require("Controls/_propertyGrid/IEditor");
import {default as IProperty} from 'Controls/_propertyGrid/IProperty';
import GroupTemplate = require("wml!Controls/_propertyGrid/Render/resources/groupTemplate");

export {
    PropertyGrid,
    BooleanEditor,
    StringEditor,
    TextEditor,
    EnumEditor,
    NumberEditor,
    BooleanGroupEditor,
    FlatEnumEditor,
    IPropertyGrid,
    IEditor,
    IProperty,
    GroupTemplate
};
