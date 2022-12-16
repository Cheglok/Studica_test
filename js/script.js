'use strict';
(function () {
    const URL = 'https://studika.ru/api/areas';
    let locations = [];
    // let locations = [{name: 'Россия', type: 'country', id: 'all', class: ''},
    //     {
    //         name: 'Алтайский край', id: 24, type: 'area', class: '', cities: [
    //             {name: 'Барнаул', id: 15, state_id: 24, class: ''},
    //             {name: 'Бийск', id: 16, state_id: 24, class: ''},
    //             {name: 'Благовещенка', id: 1595, state_id: 24, class: ''},
    //             {name: 'Родина', id: 1659, state_id: 24, class: ''},
    //             {name: 'Камень-на-Оро', id: 631, state_id: 24, class: ''},
    //         ]
    //     }
    // ];

    let preparedLocations = [];
    let selectedLocationList = [];

    let locationListElement = document.querySelector('.location__list');
    let modalElement = document.querySelector('.modal');
    let selectedLocationsElement = document.querySelector('.selected-locations');
    let availableLocationsElement = document.querySelector('.available-locations');
    let loaderElement = document.querySelector('.loader');
    let searchElement = document.querySelector('.location-form__search-input');
    let clearSearchElement = document.querySelector('.clear-icon');
    let saveButtonElement = document.querySelector('.location-form__button');
    let locationTemplate = document.querySelector('#location-template')
        .content
        .querySelector('.available-location__item');
    let selectedLocationTemplate = document.querySelector('#location-template')
        .content
        .querySelector('.selected-locations__item');

    const getLocations = async function (URL) {
        const response = await fetch(URL, {method: 'POST'});
        return response.json();
    };

    const renderLocation = function (location) {
        let locationListElement = locationTemplate.cloneNode(true);
        locationListElement.dataset.locationId = location.id;
        locationListElement.querySelector('.available-location__item-name').innerHTML = location.name;
        if (location.state_name) {
            locationListElement.querySelector('.available-location__item-region').textContent = location.state_name;
            locationListElement.querySelector('.available-location__item-region').style.display = 'block';
        }
        return locationListElement;
    };

    const renderSelectedLocation = function (locationId, locationName) {
        let newElement = selectedLocationTemplate.cloneNode(true);
        newElement.dataset.id = locationId;
        newElement.dataset.name = locationName;
        newElement.querySelector('.selected-location__item-name').textContent = locationName;
        selectedLocationsElement.appendChild(newElement);
        return newElement;
    };

    const renderLocationsList = function () {
        if (!selectedLocationList.length) {
            locationListElement.textContent = 'Любой регион';
        } else {
             let namesList = [];
            selectedLocationList.forEach(el => {
                 namesList.push(el.name);
             });
            locationListElement.textContent = namesList.join(', ');
        }
    };

    const changeLocationsList = function (locationId, locationName, flag) {
        if (flag) {
            selectedLocationList.push({id: locationId, name: locationName});
        } else {
            selectedLocationList = selectedLocationList.filter(el => {
                return el.name !== locationName;
            })
        }
        renderLocationsList();
    };

    const deselectLocation = function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        let selectedLocation = evt.currentTarget.parentNode;
        let locationId = selectedLocation.dataset.id;
        let locationName = selectedLocation.dataset.name;
        let locationToDeselect = availableLocationsElement.querySelector(`.available-location__item[data-location-id="${locationId}"]`);
        removeLocation(locationToDeselect, locationId, locationName);
    };

    const addLocation = function (target, locationId, locationName) {
        target.classList.add('available-location__item_selected');
        let newSelectedLocation = renderSelectedLocation(locationId, locationName);
        newSelectedLocation.querySelector('.close-icon').addEventListener('click', deselectLocation);
        changeLocationsList(locationId, locationName, true);
    };

    const removeLocation = function (target, locationId, locationName) {
        target.classList.remove('available-location__item_selected');
        selectedLocationsElement.querySelector(`.selected-locations__item[data-id="${locationId}"]`).remove();
        changeLocationsList(locationId, locationName, false);
    };

    const toggleLocation = function (evt) {
        let locationId = evt.currentTarget.dataset.locationId;
        let locationName = evt.currentTarget.querySelector('.available-location__item-name').textContent;
        if (evt.currentTarget.classList.contains('available-location__item_selected')) {
            removeLocation(evt.currentTarget, locationId, locationName);
        } else {
            addLocation(evt.currentTarget, locationId, locationName);
        }
    }

    const addLocationsHandlers = function () {
        let locationListElements = document.querySelectorAll('.available-location__item');
        locationListElements.forEach(el => {
            el.addEventListener('click', toggleLocation);
        });
    };

    const makeSearch = function (str) {
        let regExp = new RegExp(str, 'i');
        let data = preparedLocations.slice();
        let filteredData = data.filter(el => {
            return el.name.toLowerCase().includes(str);
        });
        let markedUpData = filteredData.map(el => {
            let newEl = {};
            newEl.name = el.name.replace(regExp, '<span class="searched-substring">$&</span>');
            newEl.id = el.id;
            newEl.state_name = el.state_name;
            return newEl;
        });
        renderLocations(markedUpData);
    };

    const handleCleanElement = function (str) {
        if (str.length) {
            clearSearchElement.classList.remove('visually-hidden');
        } else {
            clearSearchElement.classList.add('visually-hidden');
        }
    };

    const  saveSelected = function () {
        //TODO охранение в куки
    };

    const addSearchHandlers = function () {
        searchElement.addEventListener('input', function (e) {
            handleCleanElement(e.target.value);
            makeSearch(e.target.value.toLowerCase());
        });
        clearSearchElement.addEventListener('click', function () {
            searchElement.value = '';
            makeSearch('');
            clearSearchElement.classList.add('visually-hidden');
        });
        saveButtonElement.addEventListener('click', saveSelected);
    }

    const prepareData = function () {
        locations.forEach(location => {
            preparedLocations.push(location);
            if (location.type && location.cities) {
                location.cities.forEach(city => {
                    city.state_name = location.name;
                    preparedLocations.push(city);
                })
            }
        });
    };

    const showSelectedLocations = function () {
        selectedLocationList.forEach(el => {
            let locationId = el.id;
            let locationToSelect = document.querySelector(`.available-location__item[data-location-id="${locationId}"]`);
            if (locationToSelect) {
                locationToSelect.classList.add('available-location__item_selected');
            }
        })
    };

    const renderLocations = function (data) {
        availableLocationsElement.innerHTML = '';
        let renderData = data ? data : preparedLocations;
        let fragment = document.createDocumentFragment();
        renderData.forEach(location => {
            fragment.appendChild(renderLocation(location));
        })
        availableLocationsElement.appendChild(fragment);
        showSelectedLocations();
        addLocationsHandlers();
    };

    const handleData = function () {
        if (!preparedLocations.length) {
            prepareData();
        }
        selectedLocationsElement.classList.remove('visually-hidden');
        availableLocationsElement.classList.remove('visually-hidden');
        loaderElement.classList.add('visually-hidden');
        renderLocations();
        addSearchHandlers();
    };

    const closeModal = function (evt) {
        if (!evt.target.closest('.modal')) {
            modalElement.classList.add('visually-hidden');
            document.removeEventListener('click', closeModal);
        }
    };

    const readCookie = function () {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + 'selected' + "=([^;]*)"
        ));
        let selectedCookie = matches ? decodeURIComponent(matches[1]) : undefined;
        console.log('selectedCookie', selectedCookie);
    }

    const openModal = function () {
        modalElement.classList.remove('visually-hidden');
        document.addEventListener('click', closeModal);
        if (!locations.length) {
            getLocations(URL).then(data => {
                locations = data;
                handleData();
                readCookie();
            });
        } else {
            handleData();
            //TODO remove mock
        }
    };

    const toggleModal = function (evt) {
        evt.stopPropagation();
        if (modalElement.classList.contains('visually-hidden')) {
            openModal();
        } else {
            closeModal(evt);
        }
    };

    locationListElement.addEventListener('click', toggleModal);
})();
