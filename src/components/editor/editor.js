import React, { useRef, useState, useEffect } from "react";
import { withRouter } from "react-router-dom";

import Editor from "@monaco-editor/react";
import { FillSpinner as Loader } from "react-spinners-kit";
import Toggle from "react-toggle";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Submit from "../submit/submit";
import Cookie from "react-cookies";

import "./editor.css";

/**
 * The component responsible for rendering the code editor, and it's configurable options. It's a stateless component.
 */

export default withRouter(function(props) {
	//Hooks for editor configuration.
	const [theme, setTheme] = useState("dark");
	const [language, setLanguage] = useState("cpp");
	const [isEditorReady, setIsEditorReady] = useState(false);

	//Hooks for testing, running and submitting for the current problem
	const [testInput, setTestInput] = useState("");
	const [testOutput, setTestOutput] = useState("");
	const [isWaiting, setIsWaiting] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	//Hooks for tracking and changing the full screen modes for problem statement and editor.
	const [fullscreen, setFullscreen] = useState(props.fullscreen);
	const [curCode, setCurCode] = useState("");

	//Hook for showingand hiding the modal (pop-up)
	const [show, setShow] = useState(false);

	//Set the default code to show in the editor
	const default_code_to_show = "//Code your heart out here!";

	//Stores an instance of the Editor, for utility reasons like, getting the code written etc.
	const valueGetter = useRef();

	/**
	 * React hook; invoked when the component gets mounted, and unmonted. Equivalent to ComponentDidMount and componentWillUnmount for stateful components.
	 */
	useEffect(() => {
		//called when component mounts
		fetchPreviousCode_api();

		return () => {
			//called when component unmounts
			saveCode();
		};
	}, []);

	/**
	 * Changes the full screen state
	 */
	const toggleScreen = () => {
		saveCode();
		setFullscreen(!fullscreen);
		props.toggleScreen();
	};

	/**
	 * Hook called on component update. Equivalent to ComponentDidUpdate.
	 */
	useEffect(() => {
		fetchPreviousCode();
		let full_screen_icon = (
			<div className="f-icon-container" onClick={toggleScreen}>
				<i className="fas fa-compress"></i>
			</div>
		);

		if (!fullscreen) {
			full_screen_icon = (
				<div className="f-icon-container" onClick={toggleScreen}>
					<i className="fas fa-expand"></i>
				</div>
			);
		}
	});

	// Stores the initial JSX to be rendered for the full screen icon, based on the current state
	/*******************************************************/
	let full_screen_icon = (
		<div className="f-icon-container" onClick={toggleScreen}>
			<i className="fas fa-compress"></i>
		</div>
	);

	if (!fullscreen) {
		full_screen_icon = (
			<div className="f-icon-container" onClick={toggleScreen}>
				<i className="fas fa-expand"></i>
			</div>
		);
	}
	/******************************************************/

	//Initializes the JSX in to be displayed for output on test run.
	/**********************************************************************/
	let output_content = null;

	if (submitted && isWaiting) {
		output_content = (
			<div className="text-center">
				<img src={require("../../imgs/spi.svg")}></img>
			</div>
		);
	} else if (submitted && !isWaiting) {
		output_content = (
			<div className="mt-4">
				<h3>Output:</h3>
				<div className="mt-2 output-container">{testOutput}</div>
			</div>
		);
	}
	/*********************************************************************/

	//A dictionary of the currently set editor language vs the acceptable language code for test run using codechef API
	/*********************************************************************/
	const codechef_language_mapper = {
		cpp: "C++17",
		java: "JAVA",
		javascript: "JS",
		python: "PYTH 3.6",
		c: "C"
	};
	/********************************************************************/

	/**
	 * Responsible for saving my code to the backend server database.
	 */
	const saveCode_api = () => {
		const username = Cookie.load("user_name");
		if (username && valueGetter.current() != default_code_to_show) {
			const cur_code = valueGetter.current();

			fetch("https://13.232.146.140/code", {
				method: "POST",
				headers: {
					"content-Type": "application/json"
				},
				body: JSON.stringify({
					pcode: props.problem_code,
					ccode: props.contest_code,
					uid: username,
					code: cur_code
				})
			})
				.then(response => response.text())
				.then(() => {
					saveCode();
				})
				.catch(error => console.log("error", error));
		}
	};

	/**
	 * Save the current code in a cookie.
	 */
	const saveCode = () => {
		const username = Cookie.load("user_name");
		if (valueGetter.current() != default_code_to_show) {
			Cookie.save(
				username + " " + props.problem_code,
				valueGetter.current(),
				{
					path: "/",
					maxAge: 6048000,
					expires: 0
				}
			);
		}
	};

	/**
	 * Fetch the code from my backend server database if it's not available in a cookie.
	 */
	const fetchPreviousCode_api = () => {
		const username = Cookie.load("user_name");
		if (username) {
			//First check if the cookie for the current user and problem code is already available
			const cur_code = Cookie.load(username + " " + props.problem_code);

			if (
				cur_code &&
				cur_code != "" &&
				cur_code.trim() != default_code_to_show
			) {
				setCurCode(cur_code);
			} else {
				fetch(
					`https://13.232.146.140/code/${props.contest_code}/${props.problem_code}/${username}`,
					{
						method: "GET",
						headers: {
							Accept: "application/json"
						}
					}
				)
					.then(res => {
						if (res.ok) {
							return res.json();
						} else {
							throw new Error(res.status);
						}
					})
					.then(result => {
						if (result.result.body) {
							Cookie.save(
								username + " " + props.problem_code,
								result.result.body,
								{
									path: "/",
									maxAge: 6048000,
									expires: 0
								}
							);
							setCurCode(result.result.body);
						}
					})
					.catch(error => console.log("error", error));
			}
		}
	};

	/**
	 * Fetch the code from cookie
	 */
	const fetchPreviousCode = () => {
		const username = Cookie.load("user_name");
		const prev_code = Cookie.load(username + " " + props.problem_code);
		if (prev_code) {
			setCurCode(prev_code);
		}
	};

	//Event handlers for showing and closing the modal.
	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	/**
	 * Callback method which is used to save an instance of the editor, once it is mounted.
	 *
	 * @param {Object} _valueGetter An instance of the code editor
	 */
	function handleEditorDidMount(_valueGetter) {
		setIsEditorReady(true);
		valueGetter.current = _valueGetter;
	}

	/**
	 * Event handler for changing the theme of the editor (light or dark)
	 */
	function handleThemeChange() {
		setTheme(theme === "light" ? "dark" : "light");
	}

	/**
	 * Event handler for changing the current language of the editor.
	 *
	 * @param {Object} event An event object which contains a reference to the element on which the event has occured.
	 */
	function changeLanguage(event) {
		setLanguage(event.target.value);
	}

	/**
	 * Event handler method; responsible for test running the current code based on the input(if any).
	 */
	function handleOnRun() {
		//Set the current state of the output section
		setIsWaiting(true);
		setSubmitted(true);

		fetch(`https://api.codechef.com/ide/run`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				Authorization: "Bearer " + props.user_session.access_token,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				sourceCode: valueGetter.current(),
				language: codechef_language_mapper[language],
				input: testInput
			})
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
					//A timeout is added to make sure that the submitted has finished running on the online judge and the output is generated.
					setTimeout(() => {
						getOutputFromLink(result.result.data.link);
					}, 20000);
				},
				error => {
					console.log(error.message);
					if (error.message == 401) {
						props.refresh_token();
					}
				}
			);
	}

	/**
	 * Fetches the output result from the server.
	 *
	 * @param {string} link The link returned by codechef API which is used to fetch the output result.
	 */
	const getOutputFromLink = link => {
		fetch(`https://api.codechef.com/ide/status?link=${link}`, {
			method: "GET",
			headers: {
				Accept: "application/json",
				Authorization: "Bearer " + props.user_session.access_token
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
					//Extract the test result data
					let compile_info = result.result.data.cmpinfo;
					let stderr_info = result.result.data.stderr;
					let output = result.result.data.output;

					if (compile_info != "") {
						setTestOutput(compile_info);
					} else if (stderr_info != "") {
						setTestOutput(stderr_info);
					} else if (output != "") {
						setTestOutput(output);
					} else {
						setTestOutput(
							"Some error occured. Try again after sometime."
						);
					}

					setIsWaiting(false);
					setSubmitted(true);
				},
				error2 => {
					console.log(error2.message);
					if (error2.message == 401) {
						props.refresh_token();
					}
				}
			);
	};

	//Return the JSX to be rendered
	return (
		<>
			<div className="editor-container">
				<div className="row options-container">
					<div className="col-sm-6">
						<div className="test-container">
							<Button
								onClick={handleShow}
								className="btn btn-success mr-5"
								disabled={!isEditorReady}
							>
								Run <i className="fas fa-play"></i>
							</Button>

							<Modal show={show} onHide={handleClose}>
								<Modal.Header closeButton>
									<Modal.Title>Test run</Modal.Title>
								</Modal.Header>
								<Modal.Body>
									<div
										className="alert alert-primary"
										role="alert"
									>
										Check your code with custom testcases.
									</div>
									<div className="form-group">
										<div className="form-group">
											<label htmlFor="run-input">
												Input
											</label>
											<textarea
												className="form-control"
												id="run-input"
												rows="3"
												value={testInput}
												onChange={event =>
													setTestInput(
														event.target.value
													)
												}
											></textarea>
										</div>
									</div>
									<div className="text-left">
										<button
											className="btn btn-primary"
											onClick={handleOnRun}
										>
											Test{" "}
											<i className="fas fa-clipboard-list"></i>
										</button>
									</div>
									{output_content}
								</Modal.Body>
								<Modal.Footer>
									<Button
										variant="secondary"
										onClick={handleClose}
									>
										Close
									</Button>
								</Modal.Footer>
							</Modal>
							<Submit disabled={!isEditorReady}></Submit>
						</div>
					</div>
					<div className="col-sm-6">
						<div className="config-container">
							<div className="theme-container">
								<label
									className="theme-label"
									htmlFor="theme-status"
								>
									Dark Mode
								</label>
								<Toggle
									id="theme-status"
									defaultChecked={theme == "dark"}
									onChange={handleThemeChange}
								/>
							</div>

							<select
								className="select-css"
								onChange={event => changeLanguage(event)}
								disabled={!isEditorReady}
							>
								<option value="cpp">C++ 17</option>
								<option value="java">Java</option>
								<option value="javascript">Javascript</option>
								<option value="python">Python 3.6</option>
								<option value="c">C</option>
							</select>
							<div className="save-btn" onClick={saveCode_api}>
								<i className="fas fa-save"></i>
							</div>
							{full_screen_icon}
							<div>{}</div>
						</div>
					</div>
				</div>

				<div style={{ border: "1px solid grey", borderRadius: "8px" }}>
					<Editor
						height="100vh" // By default, it fully fits with its parent
						theme={theme}
						language={language}
						loading={<Loader />}
						value={curCode ? curCode : default_code_to_show}
						editorDidMount={handleEditorDidMount}
						options={{ lineNumbers: "on" }}
					/>
				</div>
			</div>
		</>
	);
});
