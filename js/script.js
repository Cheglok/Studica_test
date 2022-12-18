'use strict';
(function () {
    const URL = 'https://studika.ru/api/areas';
    let locations = [];
    let preparedLocations = [];
    let selectedLocationList = [];

    //Dom-элементы для взаимодействия
    let locationListElement = document.querySelector('.location__list');
    let modalElement = document.querySelector('.modal');
    let selectedLocationsElement = document.querySelector('.selected-locations');
    let availableLocationsElement = document.querySelector('.available-locations');
    let loaderElement = document.querySelector('.loader');
    let searchElement = document.querySelector('.location-form__search-input');
    let clearSearchElement = document.querySelector('.clear-icon');
    let saveButtonElement = document.querySelector('.location-form__button');
    //Шаблоны для создания новых элементов
    let locationTemplate = document.querySelector('#location-template')
        .content
        .querySelector('.available-location__item');
    let selectedLocationTemplate = document.querySelector('#location-template')
        .content
        .querySelector('.selected-locations__item');

    //Получение данных с сервера
    const getLocations = async function (URL) {
        const response = await fetch(URL, {method: 'POST'});
        return response.json();
    };

    //Сохранение на заглушку
    const saveOnServer = async function (data) {
        const response = await fetch('https://httpbin.org/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: data,
        });
        return response.json();
    };

    //Рендер элемента списка
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

    //Рендер бейджика выбранной локации
    const renderSelectedLocation = function (locationId, locationName) {
        let newElement = selectedLocationTemplate.cloneNode(true);
        newElement.dataset.id = locationId;
        newElement.dataset.name = locationName;
        newElement.querySelector('.selected-location__item-name').textContent = locationName;
        selectedLocationsElement.appendChild(newElement);
        return newElement;
    };

    //Рендер строки перечисления локаций
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

    //Изменение строки перечисления выбранных локаций
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

    //Убрать локацию из выбранных при клике по бейджику
    const deselectLocation = function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        let selectedLocation = evt.currentTarget.parentNode;
        let locationId = selectedLocation.dataset.id;
        let locationName = selectedLocation.dataset.name;
        let locationToDeselect = availableLocationsElement.querySelector(`.available-location__item[data-location-id="${locationId}"]`);
        removeLocation(locationToDeselect, locationId, locationName);
    };

    //Выбрать локацию
    const addLocation = function (target, locationId, locationName) {
        target.classList.add('available-location__item_selected');
        let newSelectedLocation = renderSelectedLocation(locationId, locationName);
        newSelectedLocation.querySelector('.close-icon').addEventListener('click', deselectLocation);
        changeLocationsList(locationId, locationName, true);
    };

    //Снять выбор локации
    const removeLocation = function (target, locationId, locationName) {
        target.classList.remove('available-location__item_selected');
        selectedLocationsElement.querySelector(`.selected-locations__item[data-id="${locationId}"]`).remove();
        changeLocationsList(locationId, locationName, false);
    };

    //Обработка клика по локации
    const toggleLocation = function (evt) {
        let locationId = evt.currentTarget.dataset.locationId;
        let locationName = evt.currentTarget.querySelector('.available-location__item-name').textContent;
        if (evt.currentTarget.classList.contains('available-location__item_selected')) {
            removeLocation(evt.currentTarget, locationId, locationName);
        } else {
            addLocation(evt.currentTarget, locationId, locationName);
        }
    }

    //Навешиваем обработчики событий на все локации
    const addLocationsHandlers = function () {
        let locationListElements = document.querySelectorAll('.available-location__item');
        locationListElements.forEach(el => {
            el.addEventListener('click', toggleLocation);
        });
    };

    //Выполнить поиск по введённой подстроке
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

    //Очистить строку поиска
    const cleanSearch = function (str) {
        if (str.length) {
            clearSearchElement.classList.remove('visually-hidden');
        } else {
            clearSearchElement.classList.add('visually-hidden');
        }
    };

    //Сохранить выбранное на сервере и в куки
    const saveSelected = function () {
        let data = JSON.stringify(selectedLocationList);
        document.cookie = 'selected=' + data;
        saveOnServer(data).then(() => alert('Успешно сохранено на сервере'));
    };

    //Обработчики строки поиска
    const addSearchHandlers = function () {
        searchElement.addEventListener('input', function (e) {
            cleanSearch(e.target.value);
            makeSearch(e.target.value.toLowerCase());
        });
        clearSearchElement.addEventListener('click', function () {
            searchElement.value = '';
            makeSearch('');
            clearSearchElement.classList.add('visually-hidden');
        });
        saveButtonElement.addEventListener('click', saveSelected);
    }

    //Развернуть полученный многоуровневый список областей и городов в одноуровневый для простого поиска
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

    //Показать бейджики выбранных локаций
    const showSelectedLocations = function () {
        selectedLocationsElement.innerHTML = '';
        selectedLocationList.forEach(el => {
            let locationToSelect = document.querySelector(`.available-location__item[data-location-id="${el.id}"]`);
            if (locationToSelect) {
                locationToSelect.classList.add('available-location__item_selected');
            }
            let newSelectedLocation = renderSelectedLocation(el.id, el.name);
            newSelectedLocation.querySelector('.close-icon').addEventListener('click', deselectLocation);
        });
    };

    //Отрисовать весь список локаций
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

    //После получения данных с сервера запускается рендер модального окна и установка обработчиков событий
    const handleData = function () {
        if (!preparedLocations.length) {
            prepareData();
            renderLocations();
            addSearchHandlers();
        }
        selectedLocationsElement.classList.remove('visually-hidden');
        availableLocationsElement.classList.remove('visually-hidden');
        loaderElement.classList.add('visually-hidden');
    };

    //Закрытие модального окна
    const closeModal = function (evt) {
        if (!evt.target.closest('.modal')) {
            modalElement.classList.add('visually-hidden');
            modalElement.classList.remove('modal-animated');
            document.removeEventListener('click', closeModal);
        }
    };

    //Достать сохраненный выбор пользователя из куки
    const readCookie = function () {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + 'selected' + "=([^;]*)"
        ));
        let selectedCookie = matches ? JSON.parse(matches[1]) : undefined;
        if (selectedCookie) {
            selectedLocationList = selectedCookie;
        }
    }

    //Открытие модального окна
    const openModal = function () {
        modalElement.classList.remove('visually-hidden');
        modalElement.classList.add('modal-animated');
        document.addEventListener('click', closeModal);
        if (!locations.length) {
            getLocations(URL).then(data => {
                locations = data;
                readCookie();
                handleData();
            });
        } else {
            handleData();
        }
    };

    //Обработчик модального окна
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
