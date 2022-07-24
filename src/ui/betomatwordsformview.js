import {View} from '@ckeditor/ckeditor5-ui'
import {SwitchButtonView} from "@ckeditor/ckeditor5-ui";

import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import '../theme/scss/betomatwordsformview.scss';

export default class BetomatWordsFormView extends View {

	/**
	 * @type {BetomatState}
	 */
	_state;

	/**
	 * @type {View}
	 */
	_mainFieldset;

	/**
	 * @type {View}
	 */
	_wordsFieldset;

	/**
	 * @type {SetShowShadowHighlightsCommand}
	 */
	_setShowShadowHiglightsCommand;

	/**
	 * @type {UpdateWordGroupSettingCommand}
	 */
	_updateWordGroupSettingCommand;

	/**
	 * @param locale
	 * @param {BetomatState} state
	 * @param {SetShowShadowHighlightsCommand} setShowShadowHiglightsCommand
	 * @param {UpdateWordGroupSettingCommand} updateWordGroupSettingCommand
	 */
	constructor(locale, state, setShowShadowHiglightsCommand, updateWordGroupSettingCommand) {
		super(locale);

		this._state = state;
		this._setShowShadowHiglightsCommand = setShowShadowHiglightsCommand;
		this._updateWordGroupSettingCommand = updateWordGroupSettingCommand;

		this._mainFieldset = this._createMainFieldset();
		this._wordsFieldset = this._createWordsFieldset();

		this.setTemplate( {
			tag: 'form',
			attributes: {
				class: [
					'ck',
					'ck-betomat-form',
					'ck-reset_all-excluded'
				],

				tabindex: '-1'
			},
			children: [
				this._mainFieldset,
				this._wordsFieldset,
			]
		} );
	}

	_createMainFieldset() {
		const locale = this.locale;
		const t = locale.t;
		const fieldsetView = new View( locale );

		fieldsetView.setTemplate( {
			tag: 'fieldset',
			attributes: {
				class: [
					'ck',
					'ck-betomat-form__main',
				]
			},
			children: [
				this._createShowShadowHighlightsSwitchField(t('Show shadows')),
			],
		} );


		return fieldsetView;
	}


	_createWordsFieldset() {
		const locale = this.locale;
		const t = locale.t;
		const fieldsetView = new View( locale );

		const switches = [];

		for (/** @type {WordGroup} */const wordGroup of this._state.getWordGroups()) {
			switches.push(
				this._createWordGroupHighlightSwitchField(
					wordGroup,
					(e) => {
						this._updateWordGroupSettingCommand.execute(wordGroup.type, 'isHighlighted', !e.source.isOn);
					},
				)
			);

		}

		const legendView = new View(locale);
		legendView.setTemplate({
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-betomat-form__word-groups-label',
				],
			},
			children: [
				t('Highlight groups'),
			],
		});

		fieldsetView.setTemplate( {
			tag: 'fieldset',
			attributes: {
				class: [ 'ck', 'ck-betomat-form__word-groups' ]
			},
			children: [
				legendView,
				...switches,
			],
		} );

		return fieldsetView;
	}

	_createShowShadowHighlightsSwitchField(label) {
		const view = new SwitchButtonView(this.locale);
		view.bind('isOn').to(this._state, 'showShadowHighlights');

		view.set({
			withText: true,
			label: label,
		});

		view.on('execute', (e) => {
			this._setShowShadowHiglightsCommand.execute(!e.source.isOn);
		})

		return view;
	}

	_createWordGroupHighlightSwitchField(wordGroup, executeCallback) {
		const view = new SwitchButtonView(this.locale);
		view.bind('isOn').to(wordGroup, 'isHighlighted');

		view.set({
			withText: true,
			label: wordGroup.label,
		});

		view.extendTemplate({
			attributes: {
				class: `ck-betomat-form__word-group ck-betomat-form__word-group--${wordGroup.type}`
			}
		});

		view.on('execute', executeCallback)

		return view;
	}

}
