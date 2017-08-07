
export default function restorableStateStorePlugin(StoreClass) {
    StoreClass.serialize = function(state) {
        return JSON.stringify(state);
    };
    StoreClass.deserialize = function(storeStateString) {
        return JSON.parse(storeStateString);
    };

    return StoreClass;
}
