import React from "react";
import "../App.css";
import * as AppConstants from "../constants";

import { ReactBingmaps } from 'react-bingmaps';

export default class ZipDetails extends React.Component {
	constructor(props) {
		super(props);

		this.boundary = { north: null, south: null, east: null, west: null }

		this.state = {			
			data_weather: {},
			isWeatherLoaded: false,
			isWeatherError: false,
			data_places: [],
			isPlacesError: false,
			data_incidents_traffic: [],
			isTrafficError: false,
			data_crime_number: null,
			isCrimeError: false,
		};
	}

	componentDidMount() {
		this.getWeather();
		this.getPlaces();
		this.getTrafficIncidents();
		this.getCrimeData();
	}

	getCrimeData() {
		const url_weather =AppConstants.URL_CRIME + this.boundary.north + "," + this.boundary.west + "," + this.boundary.south + "," + this.boundary.east +")&$$app_token=" + AppConstants.CRIME_API_KEY;
		fetch(url_weather)
			.then(res => res.json())
			.then(
				result => {
					this.setState({
						data_crime_number: result.length
					});
				},
				error => {
					this.setState({
						isCrimeError: true
					});
				}
			);
	}

	getTrafficIncidents() {
		const coordinates = this.props.location.state.coordinates;
		const lats = []
		const longs = []
		for (var i = coordinates.length - 1; i >= 0; i--) {
			longs.push(coordinates[i][0]);
			lats.push(coordinates[i][1]);
		}
		const lat_north = Math.max(...lats);
		const lat_south = Math.min(...lats);
		const long_west = Math.min(...longs);
		const long_east = Math.max(...longs);
		this.boundary = { north: lat_north, south: lat_south, east: long_east, west: long_west };
		console.log(lat_north);
		console.log(this.boundary);
		const url_traffic =	AppConstants.URL_TRAFFIC + lat_south + "," + long_west + "," + lat_north + "," + long_east + "?key=" + AppConstants.TRAFFIC_API_KEY;
		fetch(url_traffic)
			.then(res => res.json())
			.then(
				result => {
					this.setState({						
						data_incidents_traffic: result.resourceSets[0].resources
					});
				},
				error => {
					this.setState({
						isTrafficError: true
					});
				}
			);
	}

	getPlaces() {
		const cors_api_url = `https://cors-anywhere.herokuapp.com/`;
		const categories = AppConstants.KEYWORDS_HEALTH;
		const url_places =
			cors_api_url +
			AppConstants.URL_PLACES +
			this.props.location.state.zip +
			"&categories=" +
			categories +
			"&sort_by=distance";
		const bearer = "Bearer " + AppConstants.PLACES_API_KEY;
		fetch(url_places, {
			method: "GET",
			headers: {
				Authorization: bearer
			}
		})
			.then(res => res.json())
			.then(
				result => {
					this.setState({
						data_places: result.businesses
					});
				},
				error => {
					this.setState({
						isPlacesError: true
					});
				}
			);
	}

	getWeather() {
		const url_weather =
			AppConstants.URL_WEATHER +
			this.props.location.state.zip +
			",us&appid=" +
			AppConstants.WEATHER_API_KEY;
		fetch(url_weather)
			.then(res => res.json())
			.then(
				result => {
					this.setState({
						isWeatherLoaded: true,
						data_weather: result
					});
				},
				error => {
					this.setState({
						isWeatherError: true
					});
				}
			);
	}

	render() {
		return (
			<div className="container">
				<div className="inner-container">
					<div className="card">
						<div className="card-content">
							<h1>Zipcode {this.props.location.state.zip}</h1>
							<h4>
								State - New York, County -{" "}
								{this.props.location.state.county}
							</h4>
						</div>
					</div>
					<div className="card">
						<div className="card-content">
							<h2>Census information</h2>
							<h4>
								Population -{" "}
								{this.props.location.state.population}
							</h4>
						</div>
					</div>
					<div className="card">
						<div className="card-content">
							<h2>Weather</h2>
							{this.state.isWeatherLoaded && (
								<p>
									{" "}
									{
										this.state.data_weather.weather[0]
											.description
									}
									, Humidity -{" "}
									{this.state.data_weather.main.humidity}{" "}
								</p>
							)}
							{this.state.isWeatherLoaded && (
								<strong>
									{" "}
									{(this.state.data_weather.main.temp -
										273.15) *
										1.8 +
										32}{" "}
								</strong>
							)}
							{this.state.isWeatherError && <p>Not avaiable!</p>}
						</div>
					</div>
				</div>
				<div className="inner-container">
					<div className="card">
						<div className="card-content">
							<h2>Nearby Places</h2>
							<ul className="card list-place">
								{this.state.data_places.length > 0 &&
									this.state.data_places.map(place => (
										<li key={place.id}>
											<span>{place.name}</span>
										</li>
									))}
							</ul>
						</div>
					</div>
					<div className="inner-container-child">
						<div className="card">
							<div className="card-content">
								<h2>Traffic Incidents</h2>
								<ul className="card">
									{this.state.data_incidents_traffic.length > 0 &&
										this.state.data_incidents_traffic.map(incidents => (
											<li key={incidents.incidentId}>
												<span>{incidents.description}</span>
											</li>
										))}
								</ul>
							</div>							
						</div>
						<div className="card">
							<h2>Crime Rates, Property Rates</h2>
							<div className="card-content">
								<span>Number of Felonies Reported - { this.state.data_crime_number }</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}