'use strict';
(function () {
    const URL = 'https://studika.ru/api/areas';
    // let locations = [];
    let locations = [{name: 'Россия', type: 'country', id: 'all', class: ''},
        {
            name: 'Алтайский край', id: 24, type: 'area', class: '', cities: [
                {name: 'Барнаул', id: 15, state_id: 24, class: ''},
                {name: 'Бийск', id: 16, state_id: 24, class: ''},
                {name: 'Благовещенка', id: 1595, state_id: 24, class: ''},
                {name: 'Волчиха', id: 1659, state_id: 24, class: ''},
                {name: 'Камень-на-Оби', id: 631, state_id: 24, class: ''},
            ]
        }
    ];
    let locationList = [];

    let locationListElement = document.querySelector('.location__list')
    let locationElement = document.querySelector('.location__city');
    let modalElement = document.querySelector('.modal');
    let selectedLocationsElement = document.querySelector('.selected-locations');
    let availableLocationsElement = document.querySelector('.available-locations');
    let loaderElement = document.querySelector('.loader');
    let locationTemplate = document.querySelector('#location-template')
        .content
        .querySelector('.available-location__item');
    let selectedLocationTemplate = document.querySelector('#location-template')
        .content
        .querySelector('.selected-locations__item');

    const getLocations = async function (URL) {
        const responce = await fetch(URL, {method: 'POST'});
        return responce.json();
    };

    const renderLocation = function (location, area) {
        let locationElement = locationTemplate.cloneNode(true);
        locationElement.dataset.locationId = location.id;
        locationElement.querySelector('.available-location__item-name').textContent = location.name;
        if (area) {
            locationElement.querySelector('.available-location__item-region').textContent = area;
            locationElement.querySelector('.available-location__item-region').style.display = 'block';
        }
        return locationElement;
    };

    const renderLocations = function () {
        var fragment = document.createDocumentFragment();
        locations.forEach(location => {
            fragment.appendChild(renderLocation(location));
            if (location.type && location.cities) {
                location.cities.forEach(city => {
                    fragment.appendChild(renderLocation(city, location.name));
                })
            }
        })
        availableLocationsElement.appendChild(fragment);
    };

    const renderSelectedLocation = function (locationId, locationName) {
        let newElement = selectedLocationTemplate.cloneNode(true);
        newElement.dataset.id = locationId;
        newElement.querySelector('.selected-location__item-name').textContent = locationName;
        selectedLocationsElement.appendChild(newElement);
        return newElement;
    };

    const changeLocationsList = function (locationName, flag) {
        if (flag) {
            locationList.push(locationName);
        } else {
            locationName
            //TODO удаление локации из массива локаций, ререндер списка
        }

    };

    const deselectLocation = function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        let locationToRemove = evt.currentTarget.parentNode;
        let id = locationToRemove.dataset.id;
        locationToRemove.remove();
        let locationToDeselect = availableLocationsElement.querySelector(`.available-location__item[data-location-id="${id}"]`);
        locationToDeselect.classList.remove('available-location__item_selected');
    };

    const addLocation = function (locationId, locationName) {
        let newSelectedLocation = renderSelectedLocation(locationId, locationName);
        newSelectedLocation.querySelector('.close-icon').addEventListener('click', deselectLocation);
        changeLocationsList(locationName, true);
    };

    const removeLocation = function (locationId, locationName) {
        selectedLocationsElement.querySelector(`.selected-locations__item[data-id="${locationId}"]`).remove();
        changeLocationsList(locationName, false);
    };

    const toggleLocation = function (evt) {
        let locationId = evt.currentTarget.dataset.locationId;
        let locationName = evt.currentTarget.querySelector('.available-location__item-name').textContent;
        if (evt.currentTarget.classList.contains('available-location__item_selected')) {
            evt.currentTarget.classList.remove('available-location__item_selected');
            removeLocation(locationId, locationName);
        } else {
            addLocation(locationId, locationName);
            evt.currentTarget.classList.add('available-location__item_selected');
        }
    }

    const addLocationsHandlers = function () {
        let locationElements = document.querySelectorAll('.available-location__item');
        locationElements.forEach(el => {
            el.addEventListener('click', toggleLocation);
        })
    };

    const handleData = function () {
        selectedLocationsElement.classList.remove('visually-hidden');
        availableLocationsElement.classList.remove('visually-hidden');
        loaderElement.classList.add('visually-hidden');
        renderLocations();
        addLocationsHandlers();
    };

    const closeModal = function (evt) {
        if (!evt.target.closest('.modal')) {
            modalElement.classList.add('visually-hidden');
            document.removeEventListener('click', closeModal);
        }
    };

    const openModal = function () {
        modalElement.classList.remove('visually-hidden');
        document.addEventListener('click', closeModal);
        if (!locations.length) {
            console.log('fetch start')
            getLocations(URL).then(data => {
                locations = data;
                handleData();
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

    locationElement.addEventListener('click', toggleModal);
})();
