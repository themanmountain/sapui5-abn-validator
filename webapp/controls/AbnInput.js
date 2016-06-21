sap.ui.define([
	"sap/m/Input",
	"jquery/sap/resources"
], function(Input) {
	"use strict";

	return Input.extend("mmd.abnValidator.controls.AbnInput", {

			metadata : {
				properties : {
					mandatory : {type : "boolean", defaultValue : false}
				}
			},

		  /* List of errors that can be raised by the validation */
			_errKey: {
				notNumeric: "inputNotNumeric",
				notEnoughChars: "notEnoughChars",
				tooManyChars: "tooManyChars",
				invalidCheckDigit: "invalidCheckDigit",
				leadingZero: "leadingZero",
				mandatoryInput: "mandatoryInput"
			},

			/* Resource bundle for the error messages */
			_oBundle : {},

			/* Weighting Factors for the checksum calculation */
			_weightingFactors: [
				10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19
			],

			/* Mandatory Setting */
			_bMandatory: false,

			init: function() {
				sap.m.Input.prototype.init.apply(this, arguments);

			  /* Instantiate the resource bundle for the controls */
				this._oBundle = jQuery.sap.resources({
						url: "18n/i18n.properties",
						locale: sap.ui.getCore().getConfiguration().getLanguage()
				});

				/* Attach the ABN Change event */
				this.attachLiveChange(this.onAbnChange);
			},

			renderer: function(oRenderManager, oControl) {
				sap.m.InputRenderer.render(oRenderManager, oControl);
			},

			setMandatory: function(bVal) {
				this._bMandatory = bVal;
			},

			onAbnChange: function(oEvent) {

				var sValue = oEvent.getParameters().value.replace(/\s+/g, "");

				if (!sValue) {
					this.setValueState(sap.ui.core.ValueState.None)
					    .setValueStateText("");
					return sValue;
				}
				var oResult = this._isAbnValid(sValue);

				if (oResult.valid) {
					this.setValueState(sap.ui.core.ValueState.Success);
				} else {
					this.setValueState(sap.ui.core.ValueState.Error)
					    .setValueStateText(oResult.errKey);
				}

				this.getView();
			},

			_isAbnValid: function(value) {

				var oResult = {
					valid: false,
					errKey: "",
					errMsg: "",
				};

				/* Ignore if no value passed */
				if (!(value)) {
					if (this._bMandatory) {
						oResult.errKey = this._errKey.mandatoryInput
					} else {
						return oResult;
					}
				}

				/* Check that the value is numeric */
				if (!(/^\d+$/.test(value)) && !oResult.errKey) {
					oResult.errKey = this._errKey.notNumeric;
				}

				/* Check that the value has enough characters */
				if ((value.length < 11) && !oResult.errKey) {
					oResult.errKey = this._errKey.notEnoughChars;
				}

				/* Check that the value has not too many characters */
				if ((value.length > 11) && !oResult.errKey) {
					oResult.errKey = this._errKey.tooManyChars;
				}

				/* Check that the first character is not a zero */
				if ((value.charAt(0) === "0") && !oResult.errKey) {
					oResult.errKey = this._errKey.leadingZero;
				}

				/* Calculate the check digit */
				if ((!this._calcCheckDigit(value)) && !oResult.errKey ) {
					oResult.errKey = this._errKey.invalidCheckDigit;
				}

				/* All tests passed */
				if (!oResult.errKey) {
					oResult.valid = true;
				}
				return _setErrText(oResult);

			},

			_calcCheckDigit: function(value) {

				/* Step 1: Subtract 1 from the first digit */
				var sValue = (value[0] - 1) + value.substring(1);

				/* Step 2: Multiply each digit by the weighting factor and Sum the result*/
				var iSum = 0;
				for (var i = 0; i < sValue.length; i++) {
					iSum += sValue[i] * this._weightingFactors[i];
				}

				/* Step 3: Get the remainder after diving by 89 */
				return ( iSum % 89 ) === 0;

			},

			_setErrText(oResult) {
				oResult.errMsg = this._oBundle.getText(this._oBundle.errKey);
			}

	});

});
