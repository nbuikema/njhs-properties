import React, {useState, useEffect, useLayoutEffect} from 'react';
import {Link} from 'react-router-dom';
import {readAllProperties, readPropertiesWithQuery} from './apiProperties';
import ReactMapGL, {Marker} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const street = 'mapbox://styles/nbuikema/ck29yonjr2o4i1clek9xxypis';
const satellite = 'mapbox://styles/nbuikema/ck29ykm355ffd1cqvb26q1fjv';

const Properties = () => {
    const [properties, setProperties] = useState([]);
    const [filteredProperties, setFilteredProperties] = useState([]);
    const [selected, setSelected] = useState(null);
    const [mapType, setMapType] = useState(street)
    const [viewport, setViewport] = useState({
        longitude: -97.1331,
        latitude: 33.2148,
        width: '100%',
        height: 'calc(100vh - 60px)',
        zoom: 11
    });
    const [filters, setFilters] = useState({
        rentMin: '',
        rentMax: '',
        beds: '',
        baths: '',
        sort: ''
    });
    const [expandedFilters, setExpandedFilters] = useState(true);
    const [size, setSize] = useState([0, 0]);

    const getWindowSize = () => {
        setSize([window.innerWidth, window.innerHeight]);
        if(window.innerWidth >= 2000) {
            setViewport({...viewport, zoom: 13});
        } else if(window.innerWidth < 2000 && window.innerWidth >= 1400) {
            setViewport({...viewport, zoom: 12});
        }
    }

    const useWindowSize = () => {
        useLayoutEffect(() => {
            function updateSize() {
                setSize([window.innerWidth, window.innerHeight]);
            }
            window.addEventListener('resize', updateSize);
            setViewport({...viewport, width: '100%', height: 'calc(100vh - 60px)'});
            return () => window.removeEventListener('resize', updateSize);
        }, [size]);
    }

    const getAllProperties = () => {
        readAllProperties().then(data => {
            setProperties(data);
        });
    };

    useEffect(() => {
        getAllProperties();
        getWindowSize();
    }, []);

    const changeSelected = (id, long, lat) => event => {
        event.preventDefault();
        const numLong = Number(long);
        const numLat = Number(lat);
        setSelected(id, long, lat);
        if(id) {
            setViewport({
                ...viewport,
                longitude: numLong,
                latitude: numLat,
                zoom: 16
            });
        } else {
            setViewport({
                ...viewport, 
                longitude: -97.1331,
                latitude: 33.2148,
                zoom: 11
            });
        }
    };

    const changeMapType = event => {
        event.preventDefault();
        if(mapType === street) {
            setMapType(satellite);
        } else {
            setMapType(street);
        }
    };

    const changeFilters = selected => event => {
        setFilters({...filters, [selected]: event.target.value});
    };

    const submitFilters = event => {
        event.preventDefault();
        let queryString = '';
        for(let filter in filters) {
            if(filters[filter]) {
                if(queryString.length > 0) {
                    if(filter === 'sort') {
                        queryString += `&sortBy=${filters[filter].split(' ')[0]}&order=${filters[filter].split(' ')[1]}`;
                    } else {
                        queryString += `&${filter}=${filters[filter]}`;
                    }
                } else {
                    if(filter === 'sort') {
                        queryString += `sortBy=${filters[filter].split(' ')[0]}&order=${filters[filter].split(' ')[1]}`;
                    } else {
                        queryString += `${filter}=${filters[filter]}`;
                    }
                }
            }
        }
        readPropertiesWithQuery(queryString).then(data => {
            if(data.length === 0) {
                setFilters({
                    rentMin: '',
                    rentMax: '',
                    beds: '',
                    baths: '',
                    sort: ''
                });
            }
            setFilteredProperties(data);
        });
    };

    const resetFilters = event => {
        event.preventDefault();
        setFilters({
            rentMin: '',
            rentMax: '',
            beds: '',
            baths: '',
            sort: ''
        });
        setFilteredProperties([]);
    };

    const zoomMap = direction => event => {
        direction === 'in' ? setViewport({...viewport, zoom: (viewport.zoom + 1)}) : setViewport({...viewport, zoom: (viewport.zoom - 1)})
    };

    const handleFilterToggle = event => {
        let isExpanded = document.getElementById('filter-toggle').getAttribute('aria-expanded');
        if(isExpanded === 'true') {
            setExpandedFilters(true);
        } else {
            setExpandedFilters(false);
        }
    };

    return (
        <div>
            {useWindowSize()}
            <div className='row reset-margin text-primary'>
                <div className='col-xs-12 col-sm-8 d-none d-sm-block p-0 order-2 order-sm-1'>
                    <div className='fixed-top fixed-map'>
                        <button onClick={handleFilterToggle} className="btn btn-primary toggleBtn" id='filter-toggle' type="button" data-toggle="collapse" data-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
                            {expandedFilters === true ? 'Hide' : 'Show'} Filters
                        </button>
                        <div className="collapse show bg-light" id="collapseExample">
                            <form>
                                <div>
                                    <div className="col-12 my-2">
                                        <h4>Filter Properties</h4>
                                    </div>
                                    <div className="form-group col-12 mb-2">
                                        <select value={filters.rentMin} className="form-control text-primary" onChange={changeFilters('rentMin')} id="rentMin" name="rentMin">
                                            <option value=''>Min Rent</option>
                                            <option value='100'>$100</option>
                                            <option value='200'>$200</option>
                                            <option value='300'>$300</option>
                                            <option value='400'>$400</option>
                                            <option value='500'>$500</option>
                                            <option value='600'>$600</option>
                                            <option value='700'>$700</option>
                                            <option value='800'>$800</option>
                                            <option value='900'>$900</option>
                                            <option value='1000'>$1000</option>
                                            <option value='1100'>$1100</option>
                                            <option value='1200'>$1200</option>
                                            <option value='1300'>$1300</option>
                                            <option value='1400'>$1400</option>
                                            <option value='1500'>$1500</option>
                                        </select>
                                    </div>
                                    <div className="form-group col-12 mb-2">
                                        <select value={filters.rentMax} className="form-control text-primary" onChange={changeFilters('rentMax')} id="rentMax" name="rentMax">
                                            <option value=''>Max Rent</option>
                                            <option value='100'>$100</option>
                                            <option value='200'>$200</option>
                                            <option value='300'>$300</option>
                                            <option value='400'>$400</option>
                                            <option value='500'>$500</option>
                                            <option value='600'>$600</option>
                                            <option value='700'>$700</option>
                                            <option value='800'>$800</option>
                                            <option value='900'>$900</option>
                                            <option value='1000'>$1000</option>
                                            <option value='1100'>$1100</option>
                                            <option value='1200'>$1200</option>
                                            <option value='1300'>$1300</option>
                                            <option value='1400'>$1400</option>
                                            <option value='1500'>$1500</option>
                                        </select>
                                    </div>
                                    <div className="form-group col-12 mb-2">
                                        <select value={filters.beds} className="form-control text-primary" onChange={changeFilters('beds')} id="beds" name="beds">
                                            <option value=''>Beds</option>
                                            <option value='1'>1</option>
                                            <option value='2'>2</option>
                                            <option value='3'>3</option>
                                            <option value='4'>4</option>
                                        </select>
                                    </div>
                                    <div className="form-group col-12 mb-2">
                                        <select value={filters.baths} className="form-control text-primary" onChange={changeFilters('baths')} id="baths" name="baths">
                                            <option value=''>Baths</option>
                                            <option value='1'>1</option>
                                            <option value='2'>2</option>
                                            <option value='3'>3</option>
                                            <option value='4'>4</option>
                                        </select>
                                    </div>
                                    <div className="form-group col-12 mb-2">
                                        <select value={filters.sort} className="form-control text-primary" onChange={changeFilters('sort')} id="sort" name="sort">
                                            <option value=''>Sort By</option>
                                            <option value='rent desc'>Rent (High to Low)</option>
                                            <option value='rent asc'>Rent (Low to High)</option>
                                            <option value='beds desc'>Beds (High to Low)</option>
                                            <option value='beds asc'>Beds (Low to High)</option>
                                        </select>
                                    </div>
                                    <div className="col-12 mb-2">
                                        <button onClick={submitFilters} className="btn btn-primary w-100">Search Properties</button>
                                    </div>
                                    <div className="col-12 mb-2">
                                        <button onClick={resetFilters} className="btn btn-outline-primary w-100">Reset Filters</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <button className='btn btn-primary map-view' onClick={changeMapType}>{mapType === street ? 'Satellite View' : 'Street View'}</button>
                        <button className='btn btn-primary map-reset' onClick={changeSelected(null)}>Reset Map</button>
                        <button className='btn btn-primary map-zoomIn' onClick={zoomMap('in')}>+</button>
                        <button className='btn btn-primary map-zoomOut' onClick={zoomMap('out')}>-</button>
                        <ReactMapGL {...viewport} mapStyle={mapType} mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_KEY} onViewportChange={viewport => {setViewport(viewport)}}>
                            {!selected && filteredProperties.length === 0 && properties.map(property => (
                                <Marker key={property._id} latitude={Number(property.lat)} longitude={Number(property.long)}>
                                    <button className='markerbtn' onClick={changeSelected(`${property._id}`, `${property.long}`, `${property.lat}`)}>
                                        <div className='marker'></div>
                                    </button>
                                </Marker>
                            ))}
                            {!selected && filteredProperties.length > 0 && filteredProperties.map(property => (
                                <Marker key={property._id} latitude={Number(property.lat)} longitude={Number(property.long)}>
                                    <button className='markerbtn' onClick={changeSelected(`${property._id}`, `${property.long}`, `${property.lat}`)}>
                                        <div className='marker'></div>
                                    </button>
                                </Marker>
                            ))}
                            {selected && properties.map(property => {
                                if(selected === property._id) {
                                    return (
                                        <Marker key={property._id} latitude={Number(property.lat)} longitude={Number(property.long)}>
                                            <button className='markerbtn'>
                                                <div className='marker'></div>
                                            </button>
                                        </Marker>
                                    );
                                } else {
                                    return null;
                                }
                            })}
                        </ReactMapGL>
                    </div>
                </div>
                <div className='col-xs-12 col-sm-4 p-0 order-1 order-sm-2'>
                    {!selected && filteredProperties.length === 0 && properties.map(property => (
                        <div key={property._id} className="card bg-light">
                            <div className="row no-gutters">
                                <h5 className="card-title w-100 text-center mt-2"><strong>{property.address}, {property.city}, {property.state}, {property.zip}</strong></h5>
                                <div className="col-6 col-sm-12 col-lg-7">
                                    {property.images.length > 0 && <img src={`${property.images[0].url}`} className="card-img" alt={`${property.address}`} />}
                                </div>
                                <div className="col-6 col-sm-12 col-lg-5 px-2 mt-2">
                                    <h6><strong>{property.available === true ? 'Available' : 'Not Available'}</strong></h6>
                                    <h6><strong>Rent: </strong>{property.available === true ? `$${property.rent}` : 'N/A'}</h6>
                                    <h6><strong>Size: </strong>{property.size} Sq Ft</h6>
                                    <h6><strong>Beds: </strong>{property.beds}</h6>
                                    <h6><strong>Baths: </strong>{property.baths}</h6>
                                    {size[0] >= 1700 && (
                                        <div className='xxl-btns'>
                                            <Link className='btn btn-primary w-100 col-12' to={`/properties/${property._id}`}>More Info</Link>
                                            <button className='markerbtn outline mt-2 w-100 col-12' onClick={changeSelected(`${property._id}`, `${property.long}`, `${property.lat}`)}>
                                                <div className='marker'></div>
                                                <div className='marker-card-text'>Locate</div>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {size[0] < 1700 && (
                                <div className='row form-row'>
                                    <button className='markerbtn mt-1 outline w-100 col-6 col-sm-12 col-md-6 d-none d-sm-block' onClick={changeSelected(`${property._id}`, `${property.long}`, `${property.lat}`)}>
                                        <div className='marker'></div>
                                        <div className='marker-card-text'>Locate</div>
                                    </button>
                                    <Link className='btn btn-primary mt-1 w-100 col-12 col-md-6' to={`/properties/${property._id}`}>More Info</Link>   
                                </div>
                            )}
                        </div>
                    ))}
                    {!selected && filteredProperties.length > 0 && filteredProperties.map(property => (
                        <div key={property._id} className="card bg-light">
                            <div className="row no-gutters">
                                <h5 className="card-title w-100 text-center mt-2"><strong>{property.address}, {property.city}, {property.state}, {property.zip}</strong></h5>
                                <div className="col-6 col-sm-12 col-lg-7">
                                    {property.images.length > 0 && <img src={`${property.images[0].url}`} className="card-img" alt={`${property.address}`} />}
                                </div>
                                <div className="col-6 col-sm-12 col-lg-5 px-2 mt-2">
                                    <h6><strong>{property.available === true ? 'Available' : 'Not Available'}</strong></h6>
                                    <h6><strong>Rent: </strong>{property.available === true ? `$${property.rent}` : 'N/A'}</h6>
                                    <h6><strong>Size: </strong>{property.size} Sq Ft</h6>
                                    <h6><strong>Beds: </strong>{property.beds}</h6>
                                    <h6><strong>Baths: </strong>{property.baths}</h6>
                                    {size[0] >= 1700 && (
                                        <div className='xxl-btns'>
                                            <Link className='btn btn-primary w-100 col-12' to={`/properties/${property._id}`}>More Info</Link>
                                            <button className='markerbtn outline mt-2 w-100 col-12' onClick={changeSelected(`${property._id}`, `${property.long}`, `${property.lat}`)}>
                                                <div className='marker'></div>
                                                <div className='marker-card-text'>Locate</div>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {size[0] < 1700 && (
                                <div className='row form-row'>
                                    <button className='markerbtn mt-1 outline w-100 col-6 col-sm-12 col-md-6 d-none d-sm-block' onClick={changeSelected(`${property._id}`, `${property.long}`, `${property.lat}`)}>
                                        <div className='marker'></div>
                                        <div className='marker-card-text'>Locate</div>
                                    </button>
                                    <Link className='btn btn-primary mt-1 w-100 col-12 col-md-6' to={`/properties/${property._id}`}>More Info</Link>   
                                </div>
                            )}
                        </div>
                    ))}
                    {selected && properties.map(property => {
                        if(selected === property._id) {
                            return (
                                <div key={property._id} className="card bg-light">
                                    <div className="row no-gutters">
                                        <h5 className="card-title w-100 text-center mt-2"><strong>{property.address}, {property.city}, {property.state}, {property.zip}</strong></h5>
                                        <div className="col-6 col-sm-12 col-lg-7">
                                            {property.images.length > 0 && <img src={`${property.images[0].url}`} className="card-img" alt={`${property.address}`} />}
                                        </div>
                                        <div className="col-6 col-sm-12 col-lg-5 px-2 mt-2">
                                            <h6><strong>{property.available === true ? 'Available' : 'Not Available'}</strong></h6>
                                            <h6><strong>Rent: </strong>{property.available === true ? `$${property.rent}` : 'N/A'}</h6>
                                            <h6><strong>Size: </strong>{property.size} Sq Ft</h6>
                                            <h6><strong>Beds: </strong>{property.beds}</h6>
                                            <h6><strong>Baths: </strong>{property.baths}</h6>
                                            {size[0] >= 1700 && (
                                                <div className='xxl-btns'>
                                                    <Link className='btn btn-primary w-100 col-12' to={`/properties/${property._id}`}>More Info</Link>
                                                    <button className='btn mt-2 outline col-12' onClick={changeSelected(null)}>Reset Selected</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {size[0] < 1700 && (
                                        <div className='row form-row'>
                                            <button className='btn outline mt-1 col-6 col-sm-12 col-md-6' onClick={changeSelected(null)}>Reset Selected</button>
                                            <Link className='btn btn-primary mt-1 w-100 col-6 col-sm-12 col-md-6' to={`/properties/${property._id}`}>More Info</Link>   
                                        </div>
                                    )}
                                </div>
                            );
                        } else {
                            return null;
                        }
                    })}
                </div>
            </div>
        </div>
    );
};

export default Properties;