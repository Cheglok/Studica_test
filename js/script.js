'use strict';
(function(){
    const URL = 'https://studika.ru/api/areas';
    let locations = [];
    let selectedLocations = [];
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
        locationElement.id = location.id;
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

    const renderSelectedLocation = function (location) {
        let selectedLocationElement = selectedLocationTemplate.cloneNode(true);
        selectedLocationElement.dataset.id = location.id;
        selectedLocationElement.querySelector('.selected-location__item-name').textContent = location.name;
        return selectedLocationElement;
    };

    const renderSelectedLocations = function () {
        selectedLocationsElement.innerHTML = '';
        var fragment = document.createDocumentFragment();
        selectedLocations.forEach(location => {
            fragment.appendChild(renderSelectedLocation(location));
        });
        selectedLocationsElement.appendChild(fragment);
    };

    const addLocation = function (locationId, locationName) {
        let selectedLocation = {
            id: locationId,
            name: locationName
        };
        selectedLocations.push(selectedLocation);
        renderSelectedLocations();
    };

    const toggleLocation = function (evt) {
        let locationId = evt.currentTarget.id;
        let locationName = evt.currentTarget.querySelector('.available-location__item-name').textContent;
        if (evt.currentTarget.classList.contains('available-location__item_selected')) {
            evt.currentTarget.classList.remove('available-location__item_selected');
            // removeLocation(locationId, locationName);
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
        console.log(locations);
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
