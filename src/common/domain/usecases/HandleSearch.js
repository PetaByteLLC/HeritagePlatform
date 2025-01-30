export const handleSearch = (newValue, setValue, onSearch, setShowNoData, isFocused) => {
    setValue(newValue);
    if (onSearch) {
        onSearch(newValue);
    }
    setShowNoData(isFocused && newValue.trim().length === 0);
};