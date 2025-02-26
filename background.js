chrome.action.onClicked.addListener(async (tab) => {
    let diTab = await findDITab();

    if (diTab) {
        // Step 1: Execute the script to get trade data
        let result = await chrome.scripting.executeScript({
            target: { tabId: diTab.id },
            func: extractTradeData,
        });

        // Step 2: Access the result from the script execution
        let tradeData = result[0].result;

        if (tradeData) {
            let fidelityTab = await findFidelityTab();
            if (fidelityTab) {
                await chrome.scripting.executeScript({
                    target: { tabId: fidelityTab.id },
                    func: inputTradeData,
                    args: [tradeData],
                });
            }
        }
    }
});

function extractTradeData() {
    let iframe = document.querySelector(
        '#RadWindowWrapper_RadWindowsAddOrder > div.rwContent.rwExternalContent > iframe'
    ).contentDocument;

    let buyShares = iframe.querySelector("#txtShares").value;
    let sellShares = iframe.querySelector("#txtShares2").value;
    let buyPrice = iframe.querySelector(
        "#placeorderfidelity_RadAjaxPanel3 > div:nth-child(6) > div > div > div:nth-child(11) > div:nth-child(1) > div > div"
    ).textContent;
    let sellPrice = iframe.querySelector("#txtSellPrice").value;
    let symbol = iframe.querySelector(
        "#placeorderfidelity_RadAjaxPanel3 > div:nth-child(6) > div > div > div:nth-child(4) > div > div > div"
    ).textContent;

    let resp = {
        buyShares,
        sellShares,
        buyPrice,
        sellPrice,
        symbol,
    };

    console.log(resp);
    return resp;
}

async function findFidelityTab() {
    let tabs = await chrome.tabs.query({});
    return tabs.find((tab) => tab.url.includes("fidelity.com"));
}

async function findDITab() {
    let tabs = await chrome.tabs.query({});
    return tabs.find((tab) => tab.url.includes("decisiveinvestor.com"));
}

function inputTradeData(data) {
    // Simulate typing one character at a time with a delay
    function simulateTyping(inputElement, newValue, pressEnter, delay = 1) {
        if (!inputElement) return;

        // Clear the input field if necessary
        inputElement.value = '';

        // Trigger the 'focus' event to make sure the input is active
        if (!pressEnter) {
			inputElement.focus();
		}

        // Simulate typing one character at a time
        let index = 0;

        function typeCharacter() {
            if (index < newValue.length) {
                // Set the character
                inputElement.value += newValue.charAt(index);

                // Dispatch input event to simulate typing
                const inputEvent = new Event('input', { bubbles: true });
                inputElement.dispatchEvent(inputEvent);

                // Optionally dispatch keydown and keypress events (to mimic keyboard actions)
                const keydownEvent = new KeyboardEvent('keydown', {
                    key: newValue.charAt(index),
                    keyCode: newValue.charCodeAt(index),
                    code: `Key${newValue.charAt(index).toUpperCase()}`,
                    which: newValue.charCodeAt(index),
                    bubbles: true,
                });
                inputElement.dispatchEvent(keydownEvent);

                const keypressEvent = new KeyboardEvent('keypress', {
                    key: newValue.charAt(index),
                    keyCode: newValue.charCodeAt(index),
                    code: `Key${newValue.charAt(index).toUpperCase()}`,
                    which: newValue.charCodeAt(index),
                    bubbles: true,
                });
                inputElement.dispatchEvent(keypressEvent);

                // Move to the next character
                index++;
                setTimeout(typeCharacter, delay); // Call recursively with delay between each character
            } else {
                // Trigger change event when typing is complete
				const changeEvent = new Event('change', { bubbles: true });
				inputElement.dispatchEvent(changeEvent);

				if (pressEnter) {
					let input = document.querySelector('#eq-ticket-dest-symbol');
					if (input) {
						// Dispatch input events so Angular detects changes
						input.dispatchEvent(new Event('input', { bubbles: true }));
						input.dispatchEvent(new Event('change', { bubbles: true }));

						// Fire the blur event
						input.dispatchEvent(new Event('blur', { bubbles: true }));
					} else {
						console.error('Input field not found');
					}
				}
            }
        }

        typeCharacter(); // Start typing
    }

    console.log('Called with', data);
    document.querySelector('#dest-dropdownlist-button-trade').click();

    setTimeout(() => {
        let tradeOption = document.querySelector('#Trade6'); // "Conditional"
        if (tradeOption) {
            let event = new MouseEvent('mousedown', { bubbles: true });
            tradeOption.dispatchEvent(event); // Simulate mouse down
            tradeOption.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            tradeOption.dispatchEvent(new MouseEvent('click', { bubbles: true }));

            const symbolInput = document.querySelector('#eq-ticket-dest-symbol');
            setTimeout(()=>{
				simulateTyping(symbolInput, data.symbol, true);
				setTimeout(() => {
					document.querySelector('#dest-dropdownlist-button-conditionaltype').click();

					let otoOption = document.querySelector('#Conditional-type2'); // OTO option
					if (otoOption) {
						let event = new MouseEvent('mousedown', { bubbles: true });
						otoOption.dispatchEvent(event); // Simulate mouse down
						otoOption.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
						otoOption.dispatchEvent(new MouseEvent('click', { bubbles: true }));
					}

					setTimeout(() => {
						// Input trade data into the fields
						const quantityInput1 = document.querySelectorAll(
							'#quantity-element > quantity-field > div > pvd3-ett-input > s-root > div > input'
						)[0];
						const limitPriceInput = document.querySelectorAll(
							'#limit-price-element > limit-price-field > pvd3-ett-input > s-root > div > input'
						)[0];
						const timeInForceSelect1 = document.querySelectorAll(
							'#time-in-force-element > time-in-force-field > pvd3-ett-select > div > div > select'
						)[0];

						const quantityInput2 = document.querySelectorAll(
							'#quantity-element > quantity-field > div > pvd3-ett-input > s-root > div > input'
						)[1];
						const orderTypeSelect2 = document.querySelectorAll(
							'#order-type-element > order-type-field > pvd3-ett-select > div > div > select'
						)[1];
						const stopPriceInput2 = document.querySelectorAll(
							'#limit-price-element > limit-price-field > pvd3-ett-input > s-root > div > input'
						)[1];
						const timeInForceSelect2 = document.querySelectorAll(
							'#time-in-force-element > time-in-force-field > pvd3-ett-select > div > div > select'
						)[1];

						simulateTyping(quantityInput1, data.buyShares, false);
						simulateTyping(limitPriceInput, data.buyPrice, false);
						simulateTyping(timeInForceSelect1, 'G', false);

						simulateTyping(quantityInput2, data.sellShares, false);
						simulateTyping(orderTypeSelect2, 'L', false);
						simulateTyping(stopPriceInput2, data.sellPrice, false);
						simulateTyping(timeInForceSelect2, 'G', false);
					}, 600);
				}, 500);
			}, 100);
        } else {
            console.log("Trade6 option not found!");
        }
    }, 500);
}
