import React, { Component } from "react";
import Cookie from "react-cookies";

import "./problem-list.css";

export default class ProblemList extends Component {
	/**
	 * The method called first when a component is instantiated.
	 * contest_code: contest code of the selected contest
	 * problem_code: problem code of the currently viewing problem
	 *
	 * @param {Object} props Arguments passed as attributes to the component
	 */
	constructor(props) {
		super(props);
		this.problem_info = {};
		this.state = {
			contest_code: this.props.contest_code,
			problem_code: this.props.problem_code,
			virtual: this.props.virtual
		};
	}

	render() {
		let contents = (
			<div className="alert alert-info">Contest not selected.</div>
		);
		if (this.props.virtual && this.props.virtual != "virtual") {
			//implement virtual
		} else {
			const data = Cookie.load("contest");
			if (data && data.contest_code == this.state.contest_code) {
				//load other problems of the contest
				contents = (
					<div className="list-group mt-4 mx-auto problem-list-group">
						{data.problem_details.map(item => {
							return (
								<a
									href={`/problems/${item.problemCode}/${item.contestCode}`}
									className={`list-group-item list-group-item-action ${
										this.state.problem_code ==
										item.problemCode
											? "active"
											: ""
									}`}
									key={item.problemCode}
								>
									{item.name}
								</a>
							);
						})}
					</div>
				);
			}
		}
		return <div>{contents}</div>;
	}
}
