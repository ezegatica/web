/**
 * Mock localStorage getItem
 * @param {string} key - Key to get from localStorage
 * @param {any} value - Value to return
 */
function mockLocalStorageGetItem(key, value) {
    global.localStorage.getItem = jest.fn((k) => (k === key ? value : null));
}

/**
 * Mock localStorage setItem
 * @param {string} key - Key to set in localStorage
 */
function mockLocalStorageSetItem(key) {
    global.localStorage.setItem = jest.fn();
}

/**
 * Mock localStorage removeItem
 */
function mockLocalStorageRemoveItem() {
    global.localStorage.removeItem = jest.fn();
}

/**
 * Mock navigator.geolocation.getCurrentPosition
 * @param {number} latitude - Latitude to return
 * @param {number} longitude - Longitude to return
 */
function mockGeolocation(latitude, longitude) {
    global.navigator.geolocation = {
        getCurrentPosition: jest.fn((success) => success({
            coords: {
                latitude,
                longitude,
            },
        })),
    };
}

/**
 * Mock navigator.geolocation.getCurrentPosition error
 * @param {number} code - Error code to return
 */
function mockGeolocationError(code) {
    global.navigator.geolocation = {
        getCurrentPosition: jest.fn((success, error) => error({
            code,
        })),
    };
}

export {
    mockLocalStorageGetItem,
    mockLocalStorageSetItem,
    mockLocalStorageRemoveItem,
    mockGeolocation,
    mockGeolocationError
};
