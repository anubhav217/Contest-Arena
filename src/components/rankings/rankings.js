import React, { Component } from "react";

import ReactCountryFlag from "react-country-flag";
import Pagination from "react-js-pagination";

import "./ranklist.css";

/**
 * Fetches the ranklist of the current contest.
 */
export default class Rankings extends Component {
	/**
	 * The first method to be called on instantiating the component. Responsible for initializing the various states of the component.
	 * rankings: The list of rankings data
	 * isWaiting: Tracks if component is in waiting state or not
	 * activePage: Tracks the current page number.
	 * search_param: The type of query term for searching the ranklist.
	 * search_query: The query term for searching the ranklist.
	 *
	 * @param {Object} props Arguements that are passed as attributes to the component
	 */
	constructor(props) {
		super(props);

		this.rankings = []; //Stores the whole ranklist

		this.rankings_to_be_shown = []; //Stores the ranklist items to be shown

		this.state = {
			rankings: [],
			is_waiting: false,
			activePage: 1,
			search_param: "",
			search_query: ""
		};
	}

	/**
	 * Fetch the ranklist data for the selected contest
	 *
	 * @param {boolean} firstTime Used to check whether the request is made for the first time. If at fitst a 401 is thrown due to access token expiry, the token is refreshed and a second request is made.
	 */
	fetchRanklistData = firstTime => {
		this.setState({
			is_waiting: true
		});

		let too_many = false;

		fetch(`http://api.contest-arena/rankings/${this.props.contestCode}`, {
			method: "GET",
			headers: {
				Accept: "application/json",
				Authorization: this.props.user_session.access_token
			}
		})
			.then(res => {
				if (res.ok) {
					return res.json();
				} else {
					throw new Error(res.status);
				}
			})
			.then(
				result => {
					if (result.result.status == "Ok") {
						this.rankings = result.result.body;
						this.rankings_to_be_shown = result.result.body;
						if (this.rankings_to_be_shown) {
							this.setState({
								rankings: this.rankings_to_be_shown.slice(
									0,
									10
								),
								is_waiting: false
							});
						}
					} else {
						alert("Opps! Error " + result.result.body);
						this.setState({
							rankings: [],
							isWaiting: false
						});
					}
				},
				error => {
					if (error.message == 401 && firstTime) {
						this.props.refresh_token();
						this.fetchRanklistData(!firstTime);
					}
					if (error.message == 429 && !too_many) {
						alert("Too many requests!");
						too_many = !too_many;
						this.setState({
							rankings: [],
							isWaiting: false
						});
					}
					if (error.message == 404) {
						alert("Page not found! 404 :(");
						this.setState({
							rankings: [],
							isWaiting: false
						});
					}
				}
			);
	};

	/**
	 * Event handler for page number change
	 *
	 * @param {Integer} pageNumber The current page number
	 */
	handlePageChange = pageNumber => {
		this.setState({
			activePage: pageNumber,
			rankings: this.rankings_to_be_shown.slice(
				(pageNumber - 1) * 10,
				(pageNumber - 1) * 10 + 10
			)
		});
	};

	/**
	 * Set the current search parameter query
	 *
	 * @param {String} param The selected parameter
	 */
	handleSearchParamChange = param => {
		this.setState({
			search_param: param
		});
	};

	/**
	 * Event handler to set the current search query
	 *
	 * @param {Object} event The event object corresponding to the ranklist search bar
	 */
	handleSearch = event => {
		//Check if a search parameter is selected. If not prompt an alert
		if (this.state.search_param != "") {
			const q = event.target.value;
			let trimmed_query = q.trim();

			let suggestions = this.rankings;
			if (trimmed_query.length > 0) {
				suggestions = this.rankings.filter(item => {
					let c =
						this.state.search_param == "Institution"
							? item.institution.toLowerCase()
							: item.username.toLowerCase();

					let search_query = q.toLowerCase();
					search_query = search_query.trim();

					return c.indexOf(search_query) > -1;
				});
			}
			this.rankings_to_be_shown = suggestions;
			this.setState({
				search_query: q,
				rankings: this.rankings_to_be_shown.slice(0, 10)
			});
		} else {
			alert("Please select a search parameter!");
		}
	};

	/**
	 * Called when component is successfully mounted.
	 */
	componentDidMount() {
		if (this.props.contestCode != "") {
			this.fetchRanklistData(true);
		}
	}

	/**
	 * Callen on component update
	 *
	 * @param {Object} prevProps Previous instance of props
	 * @param {Object} prevState Previous instance of component state
	 */
	componentDidUpdate(prevProps, prevState) {
		if (this.props.contestCode != prevProps.contestCode) {
			this.fetchRanklistData(true);
		}
	}

	/**
	 * Render JSX
	 */
	render() {
		let ranklist = (
			<div className="ranklist-title">No rankings to fetch!</div>
		);

		if (this.state.is_waiting) {
			ranklist = <img src={require("../../imgs/spi.svg")}></img>;
		} else if (this.rankings.length > 0) {
			ranklist = (
				<>
					<div className="container mb-5">
						<div className="row">
							<div className="col-md-4">
								<div className="btn-group">
									<button
										type="button"
										className="btn btn-info dropdown-toggle"
										data-toggle="dropdown"
										aria-haspopup="true"
										aria-expanded="false"
									>
										{this.state.search_param == ""
											? "Search Parameter"
											: this.state.search_param}
									</button>
									<div className="dropdown-menu">
										<button
											className="dropdown-item"
											href="#"
											onClick={() =>
												this.handleSearchParamChange(
													"Institution"
												)
											}
											style={{ cursor: "pointer" }}
										>
											Institution
										</button>
										<button
											className="dropdown-item"
											href="#"
											onClick={() =>
												this.handleSearchParamChange(
													"Username"
												)
											}
											style={{ cursor: "pointer" }}
										>
											Username
										</button>
									</div>
								</div>
							</div>
							<div className="col-md-8">
								<input
									value={this.state.search_query}
									onChange={event => {
										this.handleSearch(event);
									}}
									className="form-control mx-auto ranklist-search"
									placeholder="Search..."
								></input>
							</div>
						</div>
					</div>
					{this.state.rankings.length > 0 ? (
						<table className="table table-hover">
							<thead className="thead-dark">
								<tr>
									<th scope="col">Rank</th>
									<th scope="col">Username</th>
									<th scope="col">Total Score</th>
									<th scope="col">Country</th>
									<th scope="col">Institution</th>
								</tr>
							</thead>
							<tbody>
								{this.state.rankings.map((item, index) => {
									return (
										<tr key={item.username}>
											<td scope="row">{item.rank}</td>
											<td>{item.username}</td>
											<td>{item.totalScore}</td>
											<td>
												<ReactCountryFlag
													countryCode={
														item.countryCode
													}
													svg
													cdnSuffix="svg"
													aria-label={item.country}
													title={item.country}
													cdnUrl="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/1x1/"
												/>
											</td>
											<td>{item.institution}</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					) : (
						<div className="ranklist-title">
							No ranklist item matching the criteria.
						</div>
					)}
				</>
			);
		}

		let pagination = null;

		if (!this.state.is_waiting && this.state.rankings.length > 0) {
			pagination = (
				<Pagination
					activePage={this.state.activePage}
					itemsCountPerPage={10}
					totalItemsCount={this.rankings_to_be_shown.length}
					pageRangeDisplayed={5}
					onChange={this.handlePageChange.bind(this)}
					innerClass="pagination"
					itemClass="page-item"
					activeClass="active"
					activeLinkClass="active"
					linkClass="page-link"
				></Pagination>
			);
		}
		return (
			<div className="ranklist-container">
				{ranklist}
				{pagination}
			</div>
		);
	}
}
